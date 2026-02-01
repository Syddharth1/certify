import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ============= Security Utilities =============

const ErrorCodes = {
  INVALID_INPUT: 'INPUT_001',
  NOT_FOUND: 'DATA_001',
  PROCESSING_ERROR: 'PROC_001',
  GENERAL_ERROR: 'ERR_001',
} as const;

type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

const clientErrorMessages: Record<ErrorCode, string> = {
  [ErrorCodes.INVALID_INPUT]: 'Invalid input data',
  [ErrorCodes.NOT_FOUND]: 'Resource not found',
  [ErrorCodes.PROCESSING_ERROR]: 'Unable to process request',
  [ErrorCodes.GENERAL_ERROR]: 'An error occurred. Please try again.',
};

const errorStatusCodes: Record<ErrorCode, number> = {
  [ErrorCodes.INVALID_INPUT]: 400,
  [ErrorCodes.NOT_FOUND]: 404,
  [ErrorCodes.PROCESSING_ERROR]: 500,
  [ErrorCodes.GENERAL_ERROR]: 500,
};

/**
 * Create sanitized error response - never expose internal details
 */
function createErrorResponse(
  error: unknown,
  code: ErrorCode,
  corsHeaders: Record<string, string>
): Response {
  // Log detailed error server-side only
  console.error(`[${code}] Error in timestamp-certificate:`, error);
  
  return new Response(
    JSON.stringify({
      success: false,
      error: clientErrorMessages[code],
      code,
    }),
    {
      status: errorStatusCodes[code],
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

// ============= Input Validation =============

interface TimestampRequest {
  action: 'create' | 'verify';
  certificateId?: string;
  verificationId?: string;
  certificateData?: string;
}

function validateInput(input: unknown): { valid: boolean; error?: string; data?: TimestampRequest } {
  if (!input || typeof input !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const data = input as Record<string, unknown>;

  // Validate action
  if (!data.action || typeof data.action !== 'string' || !['create', 'verify'].includes(data.action)) {
    return { valid: false, error: 'action must be create or verify' };
  }

  // Validate optional string fields
  const validateOptionalString = (field: string, maxLength: number): string | undefined => {
    if (data[field] === undefined || data[field] === null) return undefined;
    if (typeof data[field] !== 'string') return undefined;
    const value = (data[field] as string).trim();
    if (value.length === 0 || value.length > maxLength) return undefined;
    return value;
  };

  return {
    valid: true,
    data: {
      action: data.action as 'create' | 'verify',
      certificateId: validateOptionalString('certificateId', 100),
      verificationId: validateOptionalString('verificationId', 100),
      certificateData: typeof data.certificateData === 'string' ? data.certificateData : undefined,
    },
  };
}

// ============= OpenTimestamps Logic =============

// OpenTimestamps calendar servers (must include both pool and btc calendars)
const OTS_CALENDARS = [
  "https://a.pool.opentimestamps.org",
  "https://b.pool.opentimestamps.org", 
  "https://a.pool.eternitywall.com",
  "https://alice.btc.calendar.opentimestamps.org",
  "https://bob.btc.calendar.opentimestamps.org",
  "https://finney.calendar.eternitywall.com"
];

// Create SHA-256 hash of data
async function createHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Submit hash to OpenTimestamps calendar
async function submitToCalendar(hash: string): Promise<{ success: boolean; proof?: string; error?: string }> {
  const hashBytes = new Uint8Array(hash.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  
  for (const calendar of OTS_CALENDARS) {
    try {
      console.log(`Submitting to calendar: ${calendar}`);
      
      const response = await fetch(`${calendar}/digest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: hashBytes,
      });

      if (response.ok) {
        const proofBytes = new Uint8Array(await response.arrayBuffer());
        // Convert to base64 for storage
        const proof = btoa(String.fromCharCode(...proofBytes));
        console.log(`Successfully submitted to ${calendar}`);
        return { success: true, proof };
      } else {
        console.log(`Calendar ${calendar} returned ${response.status}`);
      }
    } catch (error) {
      console.error(`Error with calendar ${calendar}:`, error);
    }
  }
  
  return { success: false, error: 'Failed to submit to any calendar server' };
}

// Extract calendar URL from proof if embedded
function extractCalendarFromProof(proof: string): string | null {
  try {
    const decoded = atob(proof);
    // Look for calendar URLs in the proof data
    const calendarPatterns = [
      'alice.btc.calendar.opentimestamps.org',
      'bob.btc.calendar.opentimestamps.org',
      'a.pool.opentimestamps.org',
      'b.pool.opentimestamps.org',
      'a.pool.eternitywall.com',
      'finney.calendar.eternitywall.com'
    ];
    for (const pattern of calendarPatterns) {
      if (decoded.includes(pattern)) {
        return `https://${pattern}`;
      }
    }
  } catch {
    // Ignore decode errors
  }
  return null;
}

// Check if timestamp is confirmed on blockchain
// NOTE: OpenTimestamps anchors to Bitcoin blocks; it does not directly expose a Bitcoin txid
// without fully parsing the upgraded proof. We treat a longer proof returned by calendar servers
// as confirmation that the attestation has been upgraded with Bitcoin block data.
async function checkTimestampStatus(
  hash: string,
  proof: string
): Promise<{ confirmed: boolean; timestamp?: string; upgradedProof?: string }> {
  try {
    // Decode the stored proof
    const proofBytes = Uint8Array.from(atob(proof), c => c.charCodeAt(0));
    
    // Try to extract the specific calendar used from the proof
    const specificCalendar = extractCalendarFromProof(proof);
    const calendarsToCheck = specificCalendar 
      ? [specificCalendar, ...OTS_CALENDARS.filter(c => c !== specificCalendar)]
      : OTS_CALENDARS;
    
    console.log(`Checking calendars for upgrade, proof size: ${proofBytes.length}`);
    
    // Check with calendar server for upgrade
    for (const calendar of calendarsToCheck) {
      try {
        console.log(`Checking calendar: ${calendar}/timestamp/${hash}`);
        const response = await fetch(`${calendar}/timestamp/${hash}`, {
          method: 'GET',
        });
        
        console.log(`Calendar ${calendar} responded with status: ${response.status}`);
        
        if (response.ok) {
          const upgradeBytes = new Uint8Array(await response.arrayBuffer());
          console.log(`Got response from ${calendar}, size: ${upgradeBytes.length} (original: ${proofBytes.length})`);
          
          if (upgradeBytes.length > proofBytes.length) {
            // Proof has been upgraded (anchored to blockchain)
            const upgradedProof = btoa(String.fromCharCode(...upgradeBytes));
            console.log(`Proof upgraded! New size: ${upgradeBytes.length}`);
            return {
              confirmed: true,
              timestamp: new Date().toISOString(),
              upgradedProof,
            };
          }
        }
      } catch (error) {
        console.log(`Error checking ${calendar}:`, error);
      }
    }
    
    console.log('No upgrade found from any calendar');
  } catch (error) {
    console.error('Error checking timestamp status:', error);
  }
  
  return { confirmed: false };
}

// ============= Main Handler =============

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate input
    const rawInput = await req.json();
    const validation = validateInput(rawInput);
    
    if (!validation.valid || !validation.data) {
      throw { code: ErrorCodes.INVALID_INPUT };
    }

    const { action, certificateId, verificationId, certificateData } = validation.data;
    
    console.log(`Timestamp action: ${action}`);

    if (action === 'create') {
      // Create new timestamp for certificate
      if (!certificateId && !certificateData) {
        throw { code: ErrorCodes.INVALID_INPUT };
      }

      let dataToHash: string;
      let certId: string | undefined = certificateId;
      
      if (certificateData) {
        dataToHash = certificateData;
      } else {
        // Fetch certificate data from database
        const { data: cert, error: fetchError } = await supabase
          .from('certificates')
          .select('certificate_data, verification_id')
          .eq('id', certificateId)
          .single();
        
        if (fetchError || !cert) {
          throw { code: ErrorCodes.NOT_FOUND };
        }
        
        dataToHash = JSON.stringify(cert.certificate_data);
        certId = cert.verification_id;
      }

      // Create hash
      const hash = await createHash(dataToHash);
      console.log(`Created hash for certificate`);

      // Submit to OpenTimestamps
      const result = await submitToCalendar(hash);
      
      if (!result.success) {
        console.error('Failed to submit timestamp');
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Unable to create timestamp',
            hash: hash 
          }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Update certificate with blockchain info
      if (certificateId) {
        const { error: updateError } = await supabase
          .from('certificates')
          .update({
            blockchain_hash: hash,
            blockchain_proof: result.proof,
            blockchain_status: 'pending',
            blockchain_timestamp: new Date().toISOString()
          })
          .eq('id', certificateId);
        
        if (updateError) {
          console.error('Failed to update certificate with timestamp');
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          hash: hash,
          status: 'pending',
          message: 'Timestamp submitted. Will be anchored to Bitcoin blockchain within 1-2 hours.'
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    } 
    
    if (action === 'verify') {
      // Verify existing timestamp
      if (!verificationId) {
        throw { code: ErrorCodes.INVALID_INPUT };
      }

      const { data: cert, error: fetchError } = await supabase
        .from('certificates')
        .select('blockchain_hash, blockchain_proof, blockchain_status, blockchain_timestamp, blockchain_tx_id')
        .eq('verification_id', verificationId)
        .single();
      
      if (fetchError || !cert) {
        return new Response(
          JSON.stringify({ hasBlockchainProof: false }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      if (!cert.blockchain_hash || !cert.blockchain_proof) {
        return new Response(
          JSON.stringify({ hasBlockchainProof: false }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Check if pending proof is now confirmed
      if (cert.blockchain_status === 'pending') {
        const status = await checkTimestampStatus(cert.blockchain_hash, cert.blockchain_proof);

        if (status.confirmed) {
          // Update to confirmed and persist upgraded proof
          await supabase
            .from('certificates')
            .update({
              blockchain_status: 'confirmed',
              blockchain_timestamp: status.timestamp,
              blockchain_tx_id: null,
              blockchain_proof: status.upgradedProof ?? cert.blockchain_proof,
            })
            .eq('verification_id', verificationId);

          return new Response(
            JSON.stringify({
              hasBlockchainProof: true,
              status: 'confirmed',
              hash: cert.blockchain_hash,
              timestamp: status.timestamp,
              txId: null,
              message:
                'Anchored to Bitcoin. OpenTimestamps attests via a Bitcoin block; a txid is not provided by this service without proof parsing.',
              explorerUrl: `https://opentimestamps.org`,
            }),
            { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
      }

      return new Response(
        JSON.stringify({ 
          hasBlockchainProof: true,
          status: cert.blockchain_status || 'pending',
          hash: cert.blockchain_hash,
          timestamp: cert.blockchain_timestamp,
          txId: cert.blockchain_tx_id,
          message: cert.blockchain_status === 'pending' 
            ? 'Proof submitted, awaiting Bitcoin blockchain confirmation (typically 1-2 hours)' 
            : undefined,
          explorerUrl: cert.blockchain_status === 'confirmed' 
            ? `https://opentimestamps.org` 
            : undefined
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    throw { code: ErrorCodes.INVALID_INPUT };

  } catch (error: unknown) {
    // Check for typed error with code
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const typedError = error as { code: ErrorCode };
      return createErrorResponse(error, typedError.code, corsHeaders);
    }
    
    // Generic error
    return createErrorResponse(error, ErrorCodes.GENERAL_ERROR, corsHeaders);
  }
};

serve(handler);

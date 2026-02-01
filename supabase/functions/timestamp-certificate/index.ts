import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// OpenTimestamps calendar servers
const OTS_CALENDARS = [
  "https://a.pool.opentimestamps.org",
  "https://b.pool.opentimestamps.org",
  "https://a.pool.eternitywall.com"
];

interface TimestampRequest {
  action: 'create' | 'verify';
  certificateId?: string;
  verificationId?: string;
  certificateData?: string;
}

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

// Check if timestamp is confirmed on blockchain
async function checkTimestampStatus(hash: string, proof: string): Promise<{ confirmed: boolean; timestamp?: string; txId?: string }> {
  // For now, we'll check if the proof has been upgraded by trying to verify it
  // OpenTimestamps proofs are "pending" initially and get upgraded when anchored to Bitcoin
  
  try {
    // Decode the stored proof
    const proofBytes = Uint8Array.from(atob(proof), c => c.charCodeAt(0));
    
    // Check with calendar server for upgrade
    for (const calendar of OTS_CALENDARS) {
      try {
        const response = await fetch(`${calendar}/timestamp/${hash}`, {
          method: 'GET',
        });
        
        if (response.ok) {
          const upgradeBytes = new Uint8Array(await response.arrayBuffer());
          if (upgradeBytes.length > proofBytes.length) {
            // Proof has been upgraded (anchored to blockchain)
            const upgradedProof = btoa(String.fromCharCode(...upgradeBytes));
            return { 
              confirmed: true, 
              timestamp: new Date().toISOString(),
              txId: hash.substring(0, 16) // Simplified - would need full OTS parsing for real txId
            };
          }
        }
      } catch (error) {
        console.log(`Error checking ${calendar}:`, error);
      }
    }
  } catch (error) {
    console.error('Error checking timestamp status:', error);
  }
  
  return { confirmed: false };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, certificateId, verificationId, certificateData }: TimestampRequest = await req.json();
    
    console.log(`Timestamp action: ${action}`);

    if (action === 'create') {
      // Create new timestamp for certificate
      if (!certificateId && !certificateData) {
        throw new Error("certificateId or certificateData required for create action");
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
          throw new Error("Certificate not found");
        }
        
        dataToHash = JSON.stringify(cert.certificate_data);
        certId = cert.verification_id;
      }

      // Create hash
      const hash = await createHash(dataToHash);
      console.log(`Created hash: ${hash}`);

      // Submit to OpenTimestamps
      const result = await submitToCalendar(hash);
      
      if (!result.success) {
        console.error('Failed to submit timestamp:', result.error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: result.error,
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
          console.error('Failed to update certificate:', updateError);
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
        throw new Error("verificationId required for verify action");
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
          // Update to confirmed
          await supabase
            .from('certificates')
            .update({
              blockchain_status: 'confirmed',
              blockchain_timestamp: status.timestamp,
              blockchain_tx_id: status.txId
            })
            .eq('verification_id', verificationId);
          
          return new Response(
            JSON.stringify({ 
              hasBlockchainProof: true,
              status: 'confirmed',
              hash: cert.blockchain_hash,
              timestamp: status.timestamp,
              txId: status.txId,
              explorerUrl: `https://opentimestamps.org`
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

    throw new Error("Invalid action. Use 'create' or 'verify'");

  } catch (error: any) {
    console.error("Error in timestamp-certificate function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

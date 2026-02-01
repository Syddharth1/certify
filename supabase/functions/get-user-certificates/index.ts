import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============= Security Utilities =============

const ErrorCodes = {
  AUTH_REQUIRED: 'AUTH_001',
  PROCESSING_ERROR: 'PROC_001',
  GENERAL_ERROR: 'ERR_001',
} as const;

type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

const clientErrorMessages: Record<ErrorCode, string> = {
  [ErrorCodes.AUTH_REQUIRED]: 'Authentication required',
  [ErrorCodes.PROCESSING_ERROR]: 'Unable to process request',
  [ErrorCodes.GENERAL_ERROR]: 'An error occurred. Please try again.',
};

const errorStatusCodes: Record<ErrorCode, number> = {
  [ErrorCodes.AUTH_REQUIRED]: 401,
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
  console.error(`[${code}] Error in get-user-certificates:`, error);
  
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

// ============= Main Handler =============

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user is authenticated
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw { code: ErrorCodes.AUTH_REQUIRED };
    }

    // Execute both queries in parallel for performance
    const [createdResult, receivedResult] = await Promise.all([
      // Fetch certificates created by the user
      supabaseClient
        .from('certificates')
        .select('*')
        .eq('user_id', user.id),
      
      // Fetch certificates received by the user (by email)
      supabaseClient
        .from('certificates')
        .select('*')
        .eq('recipient_email', user.email)
        .neq('user_id', user.id)
    ]);

    if (createdResult.error) {
      console.error('Error fetching created certificates:', createdResult.error);
      throw { code: ErrorCodes.PROCESSING_ERROR };
    }
    if (receivedResult.error) {
      console.error('Error fetching received certificates:', receivedResult.error);
      throw { code: ErrorCodes.PROCESSING_ERROR };
    }

    return new Response(JSON.stringify({
      success: true,
      created: createdResult.data || [],
      received: receivedResult.data || [],
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    // Check for typed error with code
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const typedError = error as { code: ErrorCode };
      return createErrorResponse(error, typedError.code, corsHeaders);
    }
    
    // Generic error
    return createErrorResponse(error, ErrorCodes.GENERAL_ERROR, corsHeaders);
  }
});

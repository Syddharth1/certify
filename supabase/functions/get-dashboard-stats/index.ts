import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============= Security Utilities =============

/**
 * Error codes for client responses - never expose internal details
 */
const ErrorCodes = {
  AUTH_REQUIRED: 'AUTH_001',
  ACCESS_DENIED: 'AUTH_002',
  PROCESSING_ERROR: 'PROC_001',
  GENERAL_ERROR: 'ERR_001',
} as const;

type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

const clientErrorMessages: Record<ErrorCode, string> = {
  [ErrorCodes.AUTH_REQUIRED]: 'Authentication required',
  [ErrorCodes.ACCESS_DENIED]: 'Access denied',
  [ErrorCodes.PROCESSING_ERROR]: 'Unable to process request',
  [ErrorCodes.GENERAL_ERROR]: 'An error occurred. Please try again.',
};

const errorStatusCodes: Record<ErrorCode, number> = {
  [ErrorCodes.AUTH_REQUIRED]: 401,
  [ErrorCodes.ACCESS_DENIED]: 403,
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
  console.error(`[${code}] Error in get-dashboard-stats:`, error);
  
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

/**
 * SECURITY: Server-side admin verification
 * This is the authoritative check - client-side checks in useAuth/AdminRoute are UI-only
 */
async function requireAdmin(supabaseClient: ReturnType<typeof createClient>) {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) {
    throw { code: ErrorCodes.AUTH_REQUIRED };
  }

  console.log('Checking admin role for user:', user.id);

  const { data: userRoles, error: roleError } = await supabaseClient
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);

  if (roleError) {
    console.error('Role verification failed:', roleError);
    throw { code: ErrorCodes.PROCESSING_ERROR };
  }

  if (!userRoles || userRoles.length === 0) {
    console.error('No role found for user:', user.id);
    throw { code: ErrorCodes.ACCESS_DENIED };
  }

  const hasAdminRole = userRoles.some(r => r.role === 'admin');
  if (!hasAdminRole) {
    console.error('User is not admin. Roles:', userRoles.map(r => r.role));
    throw { code: ErrorCodes.ACCESS_DENIED };
  }

  console.log('Admin verification successful');
  return user;
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

    // Verify user is admin (server-side validation)
    await requireAdmin(supabaseClient);

    // Execute all queries in parallel for performance
    const [
      certificatesResult,
      templatesResult,
      usersResult,
      elementsResult,
      recentCertificatesResult
    ] = await Promise.all([
      supabaseClient.from('certificates').select('*', { count: 'exact', head: true }),
      supabaseClient.from('templates').select('*', { count: 'exact', head: true }),
      supabaseClient.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseClient.from('elements').select('*', { count: 'exact', head: true }),
      supabaseClient
        .from('certificates')
        .select('id, title, recipient_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5)
    ]);

    return new Response(JSON.stringify({
      success: true,
      stats: {
        totalCertificates: certificatesResult.count || 0,
        totalTemplates: templatesResult.count || 0,
        totalUsers: usersResult.count || 0,
        totalElements: elementsResult.count || 0,
      },
      recentCertificates: recentCertificatesResult.data || [],
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

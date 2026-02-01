/**
 * Shared security utilities for edge functions
 * 
 * IMPORTANT: All admin-only functions MUST use requireAdmin() for server-side validation.
 * Client-side role checks (useAuth, AdminRoute) are for UI purposes only and provide no security.
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

/**
 * Error codes for client responses - never expose internal details
 */
export const ErrorCodes = {
  AUTH_REQUIRED: 'AUTH_001',
  ACCESS_DENIED: 'AUTH_002',
  RATE_LIMITED: 'AUTH_003',
  INVALID_INPUT: 'INPUT_001',
  NOT_FOUND: 'DATA_001',
  PROCESSING_ERROR: 'PROC_001',
  GENERAL_ERROR: 'ERR_001',
} as const;

type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

/**
 * Safe error messages for clients - never expose internal details
 */
const clientErrorMessages: Record<ErrorCode, string> = {
  [ErrorCodes.AUTH_REQUIRED]: 'Authentication required',
  [ErrorCodes.ACCESS_DENIED]: 'Access denied',
  [ErrorCodes.RATE_LIMITED]: 'Rate limit exceeded. Please try again later.',
  [ErrorCodes.INVALID_INPUT]: 'Invalid input data',
  [ErrorCodes.NOT_FOUND]: 'Resource not found',
  [ErrorCodes.PROCESSING_ERROR]: 'Unable to process request',
  [ErrorCodes.GENERAL_ERROR]: 'An error occurred. Please try again.',
};

/**
 * HTTP status codes for error types
 */
const errorStatusCodes: Record<ErrorCode, number> = {
  [ErrorCodes.AUTH_REQUIRED]: 401,
  [ErrorCodes.ACCESS_DENIED]: 403,
  [ErrorCodes.RATE_LIMITED]: 429,
  [ErrorCodes.INVALID_INPUT]: 400,
  [ErrorCodes.NOT_FOUND]: 404,
  [ErrorCodes.PROCESSING_ERROR]: 500,
  [ErrorCodes.GENERAL_ERROR]: 500,
};

/**
 * Create a sanitized error response that doesn't leak internal details
 * Logs the full error server-side for debugging
 */
export function createErrorResponse(
  error: Error | unknown,
  code: ErrorCode,
  corsHeaders: Record<string, string>,
  context?: string
): Response {
  // Log detailed error server-side only
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`[${code}]${context ? ` ${context}:` : ''} ${errorMessage}`);
  
  // Return sanitized response to client
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
 * Require authenticated user - throws if not authenticated
 */
export async function requireAuth(supabaseClient: SupabaseClient) {
  const { data: { user }, error } = await supabaseClient.auth.getUser();
  
  if (error || !user) {
    throw { code: ErrorCodes.AUTH_REQUIRED, message: 'Not authenticated' };
  }
  
  return user;
}

/**
 * Require admin role - validates server-side, throws if not admin
 * 
 * SECURITY: This is the authoritative admin check. Client-side checks
 * in useAuth.tsx and AdminRoute.tsx are for UI purposes only.
 */
export async function requireAdmin(supabaseClient: SupabaseClient) {
  const user = await requireAuth(supabaseClient);
  
  const { data: userRoles, error: roleError } = await supabaseClient
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);

  if (roleError) {
    console.error('Error fetching user role:', roleError);
    throw { code: ErrorCodes.PROCESSING_ERROR, message: 'Failed to verify role' };
  }

  if (!userRoles || userRoles.length === 0) {
    throw { code: ErrorCodes.ACCESS_DENIED, message: 'No role assigned' };
  }

  const hasAdminRole = userRoles.some(r => r.role === 'admin');
  if (!hasAdminRole) {
    throw { code: ErrorCodes.ACCESS_DENIED, message: 'Admin access required' };
  }

  return user;
}

/**
 * Categorize error for appropriate response code
 */
export function categorizeError(error: unknown): ErrorCode {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code: string }).code;
    if (Object.values(ErrorCodes).includes(code as ErrorCode)) {
      return code as ErrorCode;
    }
  }
  
  const message = error instanceof Error ? error.message : String(error);
  
  if (message.includes('Unauthorized') || message.includes('Not authenticated')) {
    return ErrorCodes.AUTH_REQUIRED;
  }
  if (message.includes('Admin') || message.includes('Access denied')) {
    return ErrorCodes.ACCESS_DENIED;
  }
  if (message.includes('not found')) {
    return ErrorCodes.NOT_FOUND;
  }
  if (message.includes('Invalid') || message.includes('validation')) {
    return ErrorCodes.INVALID_INPUT;
  }
  
  return ErrorCodes.GENERAL_ERROR;
}

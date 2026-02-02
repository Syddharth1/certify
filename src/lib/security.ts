/**
 * Client-side Security Utilities
 * 
 * This module provides security utilities for input validation, sanitization,
 * and safe logging practices. These are defense-in-depth measures that complement
 * server-side validation (which is the authoritative security layer).
 */

import { z } from 'zod';

// =============================================================================
// SECURE LOGGER - Strips console logs in production
// =============================================================================

const isDevelopment = import.meta.env.DEV;

/**
 * Secure logger that only outputs in development mode.
 * In production, all log calls are no-ops to prevent information leakage.
 */
export const secureLogger = {
  log: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.log('[DEV]', ...args);
    }
  },
  warn: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.warn('[DEV]', ...args);
    }
  },
  error: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.error('[DEV]', ...args);
    }
  },
  info: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.info('[DEV]', ...args);
    }
  },
  debug: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.debug('[DEV]', ...args);
    }
  },
};

// =============================================================================
// INPUT VALIDATION SCHEMAS
// =============================================================================

/**
 * Email validation schema with strict rules
 */
export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .max(254, 'Email must be less than 254 characters')
  .email('Invalid email address')
  .refine(
    (email) => !email.includes('..') && !email.startsWith('.') && !email.endsWith('.'),
    'Invalid email format'
  );

/**
 * Password validation schema with security requirements
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .refine(
    (password) => /[A-Z]/.test(password),
    'Password must contain at least one uppercase letter'
  )
  .refine(
    (password) => /[a-z]/.test(password),
    'Password must contain at least one lowercase letter'
  )
  .refine(
    (password) => /[0-9]/.test(password),
    'Password must contain at least one number'
  );

/**
 * Display name validation - prevents XSS and injection
 */
export const displayNameSchema = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .max(100, 'Name must be less than 100 characters')
  .regex(
    /^[a-zA-Z0-9\s\-'.]+$/,
    'Name can only contain letters, numbers, spaces, hyphens, apostrophes, and periods'
  );

/**
 * Certificate title validation
 */
export const certificateTitleSchema = z
  .string()
  .trim()
  .min(1, 'Title is required')
  .max(200, 'Title must be less than 200 characters')
  .refine(
    (title) => !/<script|javascript:|on\w+=/i.test(title),
    'Invalid characters in title'
  );

/**
 * Certificate message/content validation
 */
export const certificateMessageSchema = z
  .string()
  .trim()
  .max(2000, 'Message must be less than 2000 characters')
  .refine(
    (msg) => !/<script|javascript:|on\w+=/i.test(msg),
    'Invalid characters in message'
  );

/**
 * Verification code validation - alphanumeric with hyphens only
 */
export const verificationCodeSchema = z
  .string()
  .trim()
  .min(1, 'Verification code is required')
  .max(100, 'Verification code is too long')
  .regex(
    /^[a-zA-Z0-9\-_]+$/,
    'Verification code can only contain letters, numbers, hyphens, and underscores'
  );

/**
 * URL validation for safe external links
 */
export const safeUrlSchema = z
  .string()
  .trim()
  .url('Invalid URL')
  .refine(
    (url) => url.startsWith('https://') || url.startsWith('http://'),
    'URL must use HTTP or HTTPS protocol'
  )
  .refine(
    (url) => !url.includes('javascript:') && !url.includes('data:'),
    'Invalid URL protocol'
  );

/**
 * File upload validation
 */
export const fileUploadSchema = z.object({
  name: z.string().max(255, 'Filename too long'),
  size: z.number().max(5 * 1024 * 1024, 'File must be less than 5MB'),
  type: z.string().refine(
    (type) => ['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif', 'image/webp'].includes(type),
    'Only JPEG, PNG, SVG, GIF, and WebP images are allowed'
  ),
});

// =============================================================================
// SANITIZATION FUNCTIONS
// =============================================================================

/**
 * Escape HTML entities to prevent XSS
 */
export function escapeHtml(text: string): string {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  };
  return text.replace(/[&<>"'`=/]/g, (char) => escapeMap[char] || char);
}

/**
 * Sanitize string for use in SQL-like contexts (defense in depth - always use parameterized queries)
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>'"`;]/g, '') // Remove potentially dangerous characters
    .trim()
    .slice(0, 1000); // Limit length
}

/**
 * Validate and sanitize base64 image data
 */
export function validateBase64Image(dataUrl: string): boolean {
  // Check for valid data URL format
  const base64Regex = /^data:image\/(png|jpeg|jpg|gif|webp|svg\+xml);base64,[A-Za-z0-9+/=]+$/;
  
  if (!base64Regex.test(dataUrl)) {
    return false;
  }
  
  // Check for script injection attempts
  if (/<script|javascript:|on\w+=/i.test(dataUrl)) {
    return false;
  }
  
  // Check size (max 10MB base64 = ~7.5MB file)
  if (dataUrl.length > 10 * 1024 * 1024) {
    return false;
  }
  
  return true;
}

/**
 * Sanitize filename to prevent path traversal
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.\-_]/g, '_') // Replace unsafe chars with underscore
    .replace(/\.{2,}/g, '.') // Prevent path traversal via ..
    .slice(0, 100); // Limit length
}

// =============================================================================
// CSRF PROTECTION
// =============================================================================

/**
 * Generate a CSRF token for forms
 * Note: Supabase Auth uses JWTs which are less susceptible to CSRF,
 * but this provides additional protection for sensitive operations.
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Store CSRF token in session storage
 */
export function storeCsrfToken(token: string): void {
  sessionStorage.setItem('csrf_token', token);
}

/**
 * Validate CSRF token
 */
export function validateCsrfToken(token: string): boolean {
  const storedToken = sessionStorage.getItem('csrf_token');
  if (!storedToken || !token) {
    return false;
  }
  // Constant-time comparison to prevent timing attacks
  if (storedToken.length !== token.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < storedToken.length; i++) {
    result |= storedToken.charCodeAt(i) ^ token.charCodeAt(i);
  }
  return result === 0;
}

// =============================================================================
// RATE LIMITING (Client-side tracking - server-side is authoritative)
// =============================================================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check if an action is rate limited (client-side check for UX)
 * Server-side rate limiting is still required and authoritative
 */
export function isRateLimited(
  action: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(action);
  
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(action, { count: 1, resetTime: now + windowMs });
    return false;
  }
  
  if (entry.count >= limit) {
    return true;
  }
  
  entry.count++;
  return false;
}

/**
 * Reset rate limit for an action
 */
export function resetRateLimit(action: string): void {
  rateLimitStore.delete(action);
}

// =============================================================================
// SECURITY HEADERS CHECK
// =============================================================================

/**
 * Log security warnings for missing headers (development only)
 */
export function checkSecurityHeaders(): void {
  if (!isDevelopment) return;
  
  // These checks run in the browser and can help during development
  const warnings: string[] = [];
  
  // Check for HTTPS in production
  if (window.location.protocol !== 'https:' && !window.location.hostname.includes('localhost')) {
    warnings.push('⚠️ Site not served over HTTPS');
  }
  
  if (warnings.length > 0) {
    console.warn('Security header checks:', warnings);
  }
}

// =============================================================================
// SAFE ERROR MESSAGES
// =============================================================================

/**
 * Map internal errors to safe user-facing messages
 * Never expose internal details to users
 */
export function getSafeErrorMessage(error: unknown): string {
  // Log full error in development only
  secureLogger.error('Error details:', error);
  
  // Check for known error patterns and return safe messages
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'Connection error. Please check your internet and try again.';
    }
    if (message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    if (message.includes('unauthorized') || message.includes('401')) {
      return 'Please sign in to continue.';
    }
    if (message.includes('forbidden') || message.includes('403')) {
      return 'You don\'t have permission to perform this action.';
    }
    if (message.includes('not found') || message.includes('404')) {
      return 'The requested resource was not found.';
    }
    if (message.includes('rate limit') || message.includes('429')) {
      return 'Too many requests. Please wait a moment and try again.';
    }
    if (message.includes('validation')) {
      return 'Please check your input and try again.';
    }
  }
  
  // Default safe message
  return 'An error occurred. Please try again.';
}

// =============================================================================
// CONTENT SECURITY
// =============================================================================

/**
 * Check if a URL is from a trusted domain
 */
export function isTrustedDomain(url: string): boolean {
  try {
    const parsed = new URL(url);
    const trustedDomains = [
      'localhost',
      'lovable.app',
      'lovable.dev',
      'supabase.co',
      'supabase.com',
      window.location.hostname,
    ];
    return trustedDomains.some(domain => 
      parsed.hostname === domain || parsed.hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
}

/**
 * Safely open a URL in a new tab with security protections
 */
export function safeOpenUrl(url: string): void {
  // Validate URL
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      secureLogger.warn('Blocked unsafe protocol:', parsed.protocol);
      return;
    }
  } catch {
    secureLogger.warn('Invalid URL:', url);
    return;
  }
  
  // Open with security attributes
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
  if (newWindow) {
    newWindow.opener = null;
  }
}

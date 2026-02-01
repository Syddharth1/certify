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
  RATE_LIMITED: 'AUTH_003',
  INVALID_INPUT: 'INPUT_001',
  PROCESSING_ERROR: 'PROC_001',
  GENERAL_ERROR: 'ERR_001',
} as const;

type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

const clientErrorMessages: Record<ErrorCode, string> = {
  [ErrorCodes.AUTH_REQUIRED]: 'Authentication required',
  [ErrorCodes.RATE_LIMITED]: 'Rate limit exceeded. You can make up to 10 AI requests per hour. Please try again later.',
  [ErrorCodes.INVALID_INPUT]: 'Invalid input data',
  [ErrorCodes.PROCESSING_ERROR]: 'Unable to process request',
  [ErrorCodes.GENERAL_ERROR]: 'An error occurred. Please try again.',
};

const errorStatusCodes: Record<ErrorCode, number> = {
  [ErrorCodes.AUTH_REQUIRED]: 401,
  [ErrorCodes.RATE_LIMITED]: 429,
  [ErrorCodes.INVALID_INPUT]: 400,
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
  console.error(`[${code}] Error in ai-assistant:`, error);
  
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

interface AIRequest {
  prompt: string;
  type: 'title' | 'message' | 'general';
}

function validateInput(input: unknown): { valid: boolean; error?: string; data?: AIRequest } {
  if (!input || typeof input !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const data = input as Record<string, unknown>;

  // Validate prompt
  if (!data.prompt || typeof data.prompt !== 'string') {
    return { valid: false, error: 'prompt is required' };
  }
  const prompt = data.prompt.trim();
  if (prompt.length === 0 || prompt.length > 2000) {
    return { valid: false, error: 'prompt must be 1-2000 characters' };
  }

  // Validate type
  const validTypes = ['title', 'message', 'general'];
  if (!data.type || typeof data.type !== 'string' || !validTypes.includes(data.type)) {
    return { valid: false, error: 'type must be title, message, or general' };
  }

  return {
    valid: true,
    data: { prompt, type: data.type as 'title' | 'message' | 'general' },
  };
}

// ============= Main Handler =============

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      throw { code: ErrorCodes.AUTH_REQUIRED };
    }

    // Check rate limit (10 requests per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentRequests, error: countError } = await supabaseClient
      .from('ai_assistant_usage')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', oneHourAgo);

    if (countError) {
      console.error('Rate limit check failed:', countError);
    } else if (recentRequests && recentRequests.length >= 10) {
      throw { code: ErrorCodes.RATE_LIMITED };
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.error('Gemini API key not configured');
      throw { code: ErrorCodes.PROCESSING_ERROR };
    }

    // Validate input
    const rawInput = await req.json();
    const validation = validateInput(rawInput);
    
    if (!validation.valid || !validation.data) {
      throw { code: ErrorCodes.INVALID_INPUT };
    }

    const { prompt, type } = validation.data;

    let systemPrompt = '';
    switch (type) {
      case 'title':
        systemPrompt = 'You are a professional certificate title generator. Create concise, formal, and impressive certificate titles. Focus on achievement, recognition, and professionalism. Return only the title, no additional text.';
        break;
      case 'message':
        systemPrompt = 'You are a professional certificate message writer. Create congratulatory and formal messages for certificates. Keep it professional, warm, and appropriate for formal recognition. Return only the message text, no additional formatting.';
        break;
      default:
        systemPrompt = 'You are a helpful assistant for creating professional certificate content. Provide clear, concise, and professional responses.';
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt}\n\nUser request: ${prompt}`
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
        thinkingConfig: {
          thinkingMode: "NONE"
        }
      }),
    });

    if (!response.ok) {
      console.error('Gemini API returned status:', response.status);
      throw { code: ErrorCodes.PROCESSING_ERROR };
    }

    const data = await response.json();
    console.log('AI response received successfully');
    
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (!generatedText) {
      console.error('No text generated from AI model');
      throw { code: ErrorCodes.PROCESSING_ERROR };
    }

    // Log successful request
    await supabaseClient
      .from('ai_assistant_usage')
      .insert({
        user_id: user.id,
        request_type: type
      });

    return new Response(JSON.stringify({ 
      success: true, 
      text: generatedText 
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

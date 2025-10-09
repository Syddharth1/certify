import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
      throw new Error('Unauthorized');
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

    if (createdResult.error) throw createdResult.error;
    if (receivedResult.error) throw receivedResult.error;

    return new Response(JSON.stringify({
      success: true,
      created: createdResult.data || [],
      received: receivedResult.data || [],
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-user-certificates function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: error.message === 'Unauthorized' ? 403 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

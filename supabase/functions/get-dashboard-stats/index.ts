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

    // Verify user is admin
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    console.log('Checking admin role for user:', user.id);

    const { data: userRoles, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    console.log('User roles query result:', { userRoles, roleError });

    if (roleError) {
      console.error('Error fetching user role:', roleError);
      throw new Error('Failed to verify user role');
    }

    if (!userRoles || userRoles.length === 0) {
      console.error('No role found for user:', user.id);
      throw new Error('User has no role assigned. Please contact an administrator.');
    }

    const hasAdminRole = userRoles.some(r => r.role === 'admin');
    if (!hasAdminRole) {
      console.error('User is not admin. Roles:', userRoles);
      throw new Error('Admin access required');
    }

    console.log('Admin verification successful');

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

  } catch (error) {
    console.error('Error in get-dashboard-stats function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: error.message === 'Unauthorized' || error.message === 'Admin access required' ? 403 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

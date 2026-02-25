import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function sanitize(str: string): string {
  return str.replace(/[<>\"'`]/g, '').trim().slice(0, 1000);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body = await req.json();
    const { artist_user_id, supervisor_name, supervisor_email, company, project_description, track_id, budget_range } = body;

    // Validate required fields
    if (!artist_user_id || !supervisor_name || !supervisor_email || !project_description) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!supervisor_email.includes('@') || !supervisor_email.includes('.')) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Rate limit: 3 requests per email per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('licensing_requests')
      .select('id', { count: 'exact', head: true })
      .eq('supervisor_email', supervisor_email.toLowerCase())
      .gte('created_at', oneHourAgo);

    if ((count || 0) >= 3) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please wait before submitting again.' }), {
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { error: insertError } = await supabase
      .from('licensing_requests')
      .insert({
        artist_user_id,
        supervisor_name: sanitize(supervisor_name).slice(0, 100),
        supervisor_email: supervisor_email.toLowerCase().slice(0, 255),
        company: company ? sanitize(company).slice(0, 200) : null,
        project_description: sanitize(project_description).slice(0, 2000),
        track_id: track_id || null,
        budget_range: budget_range ? sanitize(budget_range).slice(0, 100) : null,
        status: 'pending'
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to submit request' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, message: 'Licensing request submitted successfully.' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Licensing request error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

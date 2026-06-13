import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { track_id } = await req.json().catch(() => ({}));
    if (!track_id || typeof track_id !== 'string' || !/^[0-9a-f-]{36}$/i.test(track_id)) {
      return new Response(JSON.stringify({ error: 'Invalid track_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Only published, landing-player tracks are streamable to the public.
    const { data: track, error } = await supabase
      .from('artist_tracks')
      .select('id, is_published, show_in_landing_player, mp3_storage_paths')
      .eq('id', track_id)
      .maybeSingle();

    if (error || !track || !track.is_published || !track.show_in_landing_player) {
      return new Response(JSON.stringify({ error: 'Track not available' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const paths = (track.mp3_storage_paths || []) as Array<{
      version_name?: string;
      version_tag?: string;
      storage_path: string;
    }>;

    const main =
      paths.find((p) => p.version_tag === 'MAIN') ||
      paths.find((p) => (p.version_name || '').toLowerCase() === 'main') ||
      paths[0];

    if (!main?.storage_path) {
      return new Response(JSON.stringify({ error: 'No audio available' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: signed, error: signErr } = await supabase.storage
      .from('track-audio')
      .createSignedUrl(main.storage_path, 60 * 10); // 10 minutes

    if (signErr || !signed?.signedUrl) {
      return new Response(JSON.stringify({ error: 'Failed to create stream URL' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ url: signed.signedUrl, expires_in: 600 }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('get-track-stream-url error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

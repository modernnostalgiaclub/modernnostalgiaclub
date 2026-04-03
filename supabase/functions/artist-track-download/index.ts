import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGINS = [
  'https://modernnostalgiaclub.lovable.app',
  'https://modernnostalgia.club',
  'https://www.modernnostalgia.club',
  'http://localhost:5173',
  'http://localhost:8080',
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed = origin && ALLOWED_ORIGINS.some(allowed =>
    origin === allowed || origin.endsWith('.lovable.app') || origin.endsWith('.lovableproject.com')
  );
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  };
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body = await req.json();
    const { track_id, email, version_index = 0 } = body;

    if (!track_id) {
      return new Response(JSON.stringify({ error: 'track_id is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch the full track record using service role
    const { data: track, error: trackError } = await supabase
      .from('artist_tracks')
      .select('id, title, is_email_gated, price, track_type, versions, sections, disco_url, is_published, mp3_storage_paths')
      .eq('id', track_id)
      .eq('is_published', true)
      .single();

    if (trackError || !track) {
      return new Response(JSON.stringify({ error: 'Track not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ─── Email gate check ──────────────────────────────────────────────────
    if (track.is_email_gated) {
      if (!email || !email.includes('@')) {
        return new Response(JSON.stringify({ error: 'Email required to download this track', requires_email: true }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      await supabase.from('artist_track_access').insert({
        track_id,
        email: email.toLowerCase(),
        access_type: 'email_gate'
      });
    }

    // ─── Payment check ──────────────────────────────────────────────────────
    if (track.price > 0) {
      return new Response(JSON.stringify({
        error: 'Paid downloads require Stripe setup (coming soon)',
        requires_payment: true,
        price: track.price
      }), {
        status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ─── Try storage paths first — return a short-lived signed URL ───────────
    const storagePaths = (track.mp3_storage_paths as { version_name: string; version_tag: string; storage_path: string }[]) || [];

    if (storagePaths.length > 0) {
      const targetPath = storagePaths[version_index] || storagePaths[0];

      const { data: signedData, error: signError } = await supabase.storage
        .from('track-audio')
        .createSignedUrl(targetPath.storage_path, 3600); // 1-hour expiry

      if (!signError && signedData?.signedUrl) {
        return new Response(JSON.stringify({ signed_url: signedData.signedUrl }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      console.warn('Signed URL creation failed, falling back to DISCO CDN:', signError);
    }

    // ─── Fall back to public MP3 URL from stored versions ───────────────────
    let mp3Url: string | null = null;

    if (track.track_type === 'single') {
      const versions = track.versions as { mp3_url?: string; name: string }[];
      if (versions && versions.length > 0) {
        const targetVersion = versions[version_index] || versions[0];
        mp3Url = targetVersion?.mp3_url || null;
      }
    } else if (track.track_type === 'playlist') {
      return new Response(JSON.stringify({
        error: 'Playlist downloads are not yet supported',
        message: 'Please use the DISCO embed player to listen.'
      }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!mp3Url) {
      return new Response(JSON.stringify({
        error: 'No downloadable file found',
        fallback_url: track.disco_url
      }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Return the DISCO CDN URL directly so the browser can stream it natively
    return new Response(JSON.stringify({ signed_url: mp3Url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Download error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

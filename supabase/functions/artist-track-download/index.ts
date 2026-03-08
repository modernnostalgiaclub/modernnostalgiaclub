import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
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

      // Record the access
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

    // ─── Try storage paths first (ingested MP3s) ─────────────────────────────
    const storagePaths = (track.mp3_storage_paths as { version_name: string; version_tag: string; storage_path: string }[]) || [];

    if (storagePaths.length > 0) {
      const targetPath = storagePaths[version_index] || storagePaths[0];

      // Download from private storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('track-audio')
        .download(targetPath.storage_path);

      if (!downloadError && fileData) {
        const arrayBuffer = await fileData.arrayBuffer();
        const filename = `${track.title.replace(/[^a-z0-9]/gi, '_')}_${targetPath.version_name.replace(/[^a-z0-9]/gi, '_')}.mp3`;

        return new Response(arrayBuffer, {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'audio/mpeg',
            'Content-Disposition': `inline; filename="${filename}"`,
            'Cache-Control': 'no-store',
            'Accept-Ranges': 'bytes',
          }
        });
      }
      // Fall through to DISCO CDN if storage fails
      console.warn('Storage download failed, falling back to DISCO CDN:', downloadError);
    }

    // ─── Fall back to parsing MP3 URL from stored versions ──────────────────
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

    // ─── Proxy the MP3 file from DISCO CDN ───────────────────────────────────
    const fileResponse = await fetch(mp3Url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MNCBot/1.0)' }
    });

    if (!fileResponse.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch audio file' }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const filename = `${track.title.replace(/[^a-z0-9]/gi, '_')}.mp3`;

    return new Response(fileResponse.body, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store'
      }
    });

  } catch (err) {
    console.error('Download error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

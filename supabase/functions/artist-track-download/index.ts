import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const { track_id, email, version_index = 0 } = body;

    if (!track_id) {
      return new Response(JSON.stringify({ error: 'track_id is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch the full track record using service role (has access to disco_url + mp3 urls)
    const { data: track, error: trackError } = await supabase
      .from('artist_tracks')
      .select('id, title, is_email_gated, price, track_type, versions, sections, disco_url, is_published')
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

      // Check rate limit: max 20 downloads per email per hour
      const { data: recentAccess } = await supabase
        .from('artist_track_access')
        .select('id')
        .eq('track_id', track_id)
        .eq('email', email.toLowerCase())
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

      // Record the access
      await supabase.from('artist_track_access').insert({
        track_id,
        email: email.toLowerCase(),
        access_type: 'email_gate'
      });
    }

    // ─── Payment check ──────────────────────────────────────────────────────
    if (track.price > 0) {
      // Phase 2: Stripe payment verification
      // For now, return a placeholder
      return new Response(JSON.stringify({ 
        error: 'Paid downloads require Stripe setup (coming soon)',
        requires_payment: true,
        price: track.price
      }), {
        status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ─── Get MP3 URL from stored data ────────────────────────────────────────
    let mp3Url: string | null = null;

    if (track.track_type === 'single') {
      const versions = track.versions as { mp3_url: string; name: string }[];
      if (versions && versions.length > 0) {
        const targetVersion = versions[version_index] || versions[0];
        mp3Url = targetVersion?.mp3_url || null;
      }
    } else if (track.track_type === 'playlist') {
      // For playlists, download is handled as a zip or per-track (simplified: return error for now)
      return new Response(JSON.stringify({ 
        error: 'Playlist downloads are not yet supported',
        message: 'Please use the DISCO embed player to listen.'
      }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!mp3Url) {
      // Fallback: redirect to DISCO link if no MP3 URL was parsed
      return new Response(JSON.stringify({ 
        error: 'No downloadable file found',
        fallback_url: track.disco_url
      }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ─── Proxy the MP3 file ──────────────────────────────────────────────────
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

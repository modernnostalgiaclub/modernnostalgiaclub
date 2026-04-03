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

// Accept any disco.ac URL variant
function isDiscoUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname.endsWith('disco.ac') || parsed.hostname === 'disco.ac';
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, serviceRoleKey);
    const token = authHeader.replace('Bearer ', '');

    let userId: string;

    if (token === serviceRoleKey) {
      // Internal/admin call — use the track owner's user_id from the body if provided
      const body = await req.json();
      userId = body.user_id || '00000000-0000-0000-0000-000000000000';
      // Re-attach body for later use
      Object.defineProperty(req, '_parsedBody', { value: body, writable: false });
    } else {
      // Get user from JWT
      const anonClient = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!
      );
      const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
      if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      userId = user.id;
    }

    // Body may have been consumed already in the service-role branch; use _parsedBody if set
    const body = (req as unknown as { _parsedBody?: Record<string, unknown> })._parsedBody ?? await req.json();
    const { disco_url } = body as { disco_url?: string };

    if (!disco_url || !isDiscoUrl(disco_url)) {
      return new Response(JSON.stringify({ error: 'Invalid DISCO URL. Must be a disco.ac link (e.g. s.disco.ac/..., artist.disco.ac/e/p/..., or disco.ac/...).' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch the DISCO page server-side
    const response = await fetch(disco_url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MNCBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml'
      }
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch DISCO link. Make sure it is a valid public share link.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const html = await response.text();

    // ─── Parse metadata ──────────────────────────────────────────────────────

    // Title: look for og:title first, then h1
    const ogTitle = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i)?.[1]
      || html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:title"/i)?.[1];
    const h1Title = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)?.[1]?.trim();
    const title = ogTitle || h1Title || 'Untitled';

    // Cover art: og:image first
    const coverArtUrl = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)?.[1]
      || html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i)?.[1]
      || null;

    // Artist name: look for artist/subtitle patterns
    const artistName = html.match(/class="[^"]*artist[^"]*"[^>]*>([^<]+)</i)?.[1]?.trim()
      || html.match(/class="[^"]*subtitle[^"]*"[^>]*>([^<]+)</i)?.[1]?.trim()
      || null;

    // Duration: look for time elements or duration text
    const durationMatch = html.match(/<time[^>]*>([^<]+)<\/time>/i)?.[1]
      || html.match(/(\d+:\d+)/)?.[1]
      || null;

    // Detect track type: playlists usually have multiple tracks/sections
    // Single track pages have "versions" (Instrumental, Clean, etc.)
    const hasVersions = /instrumental|clean|tv track|version/i.test(html);
    const hasPlaylistStructure = (html.match(/class="[^"]*track[^"]*"/gi) || []).length > 3;
    const trackType = hasPlaylistStructure && !hasVersions ? 'playlist' : 'single';

    // ─── Parse versions (for single tracks) ────────────────────────────────
    // MP3 URLs are captured here but stripped before returning to client
    const versionsMp3: { name: string; version_tag: string; duration: string; mp3_url: string }[] = [];
    const versionsPublic: { name: string; version_tag: string; duration: string }[] = [];

    if (trackType === 'single') {
      // Extract all MP3 download URLs
      const mp3Urls: string[] = [];
      const dlRegex = /href="(https?:\/\/[^"]*(?:trackfile|download)[^"]*\.mp3[^"]*)"/gi;
      let dlMatch;
      while ((dlMatch = dlRegex.exec(html)) !== null) {
        mp3Urls.push(dlMatch[1]);
      }

      // Also look for data-url or src attributes pointing to audio
      const audioUrlRegex = /(?:data-url|data-src)="(https?:\/\/[^"]*\.mp3[^"]*)"/gi;
      let audioMatch;
      while ((audioMatch = audioUrlRegex.exec(html)) !== null) {
        mp3Urls.push(audioMatch[1]);
      }

      // Parse version names from the page
      const versionNameRegex = /(?:Instrumental|Clean|TV Track|Explicit|Vocal|Acapella|Radio Edit|Extended|Short Cut|Full)[^<]*/gi;
      const versionNames: string[] = [];
      let vnMatch;
      while ((vnMatch = versionNameRegex.exec(html)) !== null) {
        const name = vnMatch[0].trim();
        if (name && !versionNames.includes(name)) {
          versionNames.push(name);
        }
      }

      // Build version list
      versionNames.slice(0, 10).forEach((name, i) => {
        const versionTag = name.toLowerCase().includes('instrumental') ? 'INSTRUMENTAL'
          : name.toLowerCase().includes('clean') ? 'CLEAN'
          : name.toLowerCase().includes('tv') ? 'TV_TRACK'
          : name.toLowerCase().includes('explicit') ? 'EXPLICIT'
          : 'OTHER';

        const mp3Url = mp3Urls[i] || '';
        if (mp3Url) {
          versionsMp3.push({ name, version_tag: versionTag, duration: durationMatch || '', mp3_url: mp3Url });
        }
        versionsPublic.push({ name, version_tag: versionTag, duration: durationMatch || '' });
      });

      // If no named versions found but we have MP3 URLs, add the main track
      if (versionsPublic.length === 0 && mp3Urls.length > 0) {
        versionsMp3.push({ name: 'Main', version_tag: 'MAIN', duration: durationMatch || '', mp3_url: mp3Urls[0] });
        versionsPublic.push({ name: 'Main', version_tag: 'MAIN', duration: durationMatch || '' });
      }
    }

    // ─── Parse sections (for playlists) ────────────────────────────────────
    const sectionsPublic: { section_name: string; track_count: number; tracks: { title: string; artist: string; duration: string }[] }[] = [];
    const sectionsMp3: { section_name: string; tracks: { title: string; artist: string; duration: string; mp3_url: string }[] }[] = [];

    if (trackType === 'playlist') {
      // Parse tracks from HTML — look for repeated track-like elements
      const trackTitleRegex = /class="[^"]*track[^"]*title[^"]*"[^>]*>([^<]+)</gi;
      const trackTitles: string[] = [];
      let ttMatch;
      while ((ttMatch = trackTitleRegex.exec(html)) !== null) {
        trackTitles.push(ttMatch[1].trim());
      }

      // Extract all MP3 URLs for the playlist
      const playlistMp3s: string[] = [];
      const mp3Regex = /href="(https?:\/\/[^"]*(?:trackfile|download)[^"]*\.mp3[^"]*)"/gi;
      let mp3Match;
      while ((mp3Match = mp3Regex.exec(html)) !== null) {
        playlistMp3s.push(mp3Match[1]);
      }

      if (trackTitles.length > 0) {
        const tracks = trackTitles.map((t, i) => ({
          title: t,
          artist: artistName || '',
          duration: '',
          mp3_url: playlistMp3s[i] || ''
        }));
        sectionsPublic.push({
          section_name: 'Tracks',
          track_count: tracks.length,
          tracks: tracks.map(({ title, artist, duration }) => ({ title, artist, duration }))
        });
        sectionsMp3.push({ section_name: 'Tracks', tracks });
      }
    }

    // ─── Store in database (with MP3 URLs) ──────────────────────────────────
    const insertData = {
      user_id: userId,
      title: title.slice(0, 255),
      artist_name: artistName?.slice(0, 255) || null,
      disco_url: disco_url,
      cover_art_url: coverArtUrl || null,
      duration: durationMatch || null,
      track_type: trackType,
      // Store MP3 URLs in versions/sections (only accessible server-side via service role)
      versions: trackType === 'single' ? versionsMp3 : [],
      sections: trackType === 'playlist' ? sectionsMp3 : [],
      price: 0,
      is_email_gated: false,
      is_for_licensing: false,
      is_published: true,
      sort_order: 0,
      show_in_landing_player: false,
      show_add_to_disco_button: false,
      mp3_storage_paths: [],
    };

    const { data: track, error: insertError } = await supabase
      .from('artist_tracks')
      .insert(insertData)
      .select('id')
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to save track data.' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Return metadata WITHOUT MP3 URLs or disco_url
    const publicMetadata = {
      id: track.id,
      title: title.slice(0, 255),
      artist_name: artistName || null,
      cover_art_url: coverArtUrl || null,
      duration: durationMatch || null,
      track_type: trackType,
      versions: versionsPublic,
      sections: sectionsPublic,
      version_count: versionsPublic.length,
      track_count: sectionsPublic.reduce((sum, s) => sum + s.track_count, 0),
      // Inform admin whether MP3 URLs were found
      has_mp3_urls: versionsMp3.some(v => v.mp3_url) || sectionsMp3.some(s => s.tracks.some(t => t.mp3_url)),
    };

    return new Response(JSON.stringify({ success: true, track: publicMetadata }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Parse DISCO link error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

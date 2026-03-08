import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ONE-TIME SEED FUNCTION — will be deleted after use
// No auth required — protected by being deployed only temporarily

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function isDiscoUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname.endsWith('disco.ac') || parsed.hostname === 'disco.ac';
  } catch { return false; }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    const { disco_url, user_id, show_in_landing_player = true } = await req.json();

    if (!disco_url || !isDiscoUrl(disco_url)) {
      return new Response(JSON.stringify({ error: 'Invalid disco_url' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ── Fetch DISCO page ──────────────────────────────────────────────────────
    const response = await fetch(disco_url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
      }
    });
    if (!response.ok) {
      return new Response(JSON.stringify({ error: `DISCO fetch failed: ${response.status}` }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const html = await response.text();

    // ── Parse metadata ────────────────────────────────────────────────────────
    const ogTitle = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i)?.[1]
      || html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:title"/i)?.[1];
    const h1Title = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)?.[1]?.trim();
    const title = ogTitle || h1Title || 'Untitled';

    const coverArtUrl = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)?.[1]
      || html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i)?.[1]
      || null;

    const artistName = html.match(/class="[^"]*artist[^"]*"[^>]*>([^<]+)</i)?.[1]?.trim()
      || html.match(/class="[^"]*subtitle[^"]*"[^>]*>([^<]+)</i)?.[1]?.trim()
      || null;

    const durationMatch = html.match(/<time[^>]*>([^<]+)<\/time>/i)?.[1]
      || html.match(/(\d+:\d+)/)?.[1]
      || null;

    // ── Extract MP3 URLs ──────────────────────────────────────────────────────
    const mp3Urls: string[] = [];
    const dlRegex = /href="(https?:\/\/[^"]*(?:trackfile|download)[^"]*\.mp3[^"]*)"/gi;
    let dlMatch;
    while ((dlMatch = dlRegex.exec(html)) !== null) mp3Urls.push(dlMatch[1]);

    // ── Parse version names ───────────────────────────────────────────────────
    const versionNameRegex = /(?:Instrumental|Clean|TV Track|Explicit|Vocal|Acapella|Radio Edit|Extended|Short Cut|Full)[^<]*/gi;
    const versionNames: string[] = [];
    let vnMatch;
    while ((vnMatch = versionNameRegex.exec(html)) !== null) {
      const name = vnMatch[0].trim();
      if (name && !versionNames.includes(name)) versionNames.push(name);
    }

    const versions = versionNames.slice(0, 10).map((name, i) => {
      const version_tag = name.toLowerCase().includes('instrumental') ? 'INSTRUMENTAL'
        : name.toLowerCase().includes('clean') ? 'CLEAN'
        : name.toLowerCase().includes('tv') ? 'TV_TRACK'
        : name.toLowerCase().includes('explicit') ? 'EXPLICIT' : 'OTHER';
      return { name, version_tag, duration: durationMatch || '', mp3_url: mp3Urls[i] || '' };
    });

    if (versions.length === 0 && mp3Urls.length > 0) {
      versions.push({ name: 'Main', version_tag: 'MAIN', duration: durationMatch || '', mp3_url: mp3Urls[0] });
    }

    // ── Insert track ──────────────────────────────────────────────────────────
    const { data: track, error: insertError } = await supabase
      .from('artist_tracks')
      .insert({
        user_id: user_id,
        title: title.slice(0, 255),
        artist_name: artistName?.slice(0, 255) || null,
        disco_url,
        cover_art_url: coverArtUrl || null,
        duration: durationMatch || null,
        track_type: 'single',
        versions,
        sections: [],
        mp3_storage_paths: [],
        price: 0,
        is_email_gated: false,
        is_for_licensing: false,
        is_published: true,
        sort_order: 0,
        show_in_landing_player,
        show_add_to_disco_button: false,
      })
      .select('id, title')
      .single();

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ── Ingest MP3s ───────────────────────────────────────────────────────────
    const storagePaths: { version_name: string; version_tag: string; storage_path: string }[] = [];
    let successCount = 0;
    let failCount = 0;

    for (const version of versions) {
      if (!version.mp3_url) { failCount++; continue; }
      try {
        const fileResp = await fetch(version.mp3_url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MNCBot/1.0)' }
        });
        if (!fileResp.ok) { failCount++; continue; }

        const arrayBuffer = await fileResp.arrayBuffer();
        const uint8 = new Uint8Array(arrayBuffer);
        const safeName = version.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const storagePath = `${track.id}/${safeName}.mp3`;

        const { error: uploadError } = await supabase.storage
          .from('track-audio')
          .upload(storagePath, uint8, { contentType: 'audio/mpeg', upsert: true });

        if (uploadError) { failCount++; continue; }

        storagePaths.push({ version_name: version.name, version_tag: version.version_tag, storage_path: storagePath });
        successCount++;
      } catch { failCount++; }
    }

    if (storagePaths.length > 0) {
      await supabase.from('artist_tracks').update({ mp3_storage_paths: storagePaths }).eq('id', track.id);
    }

    return new Response(JSON.stringify({
      success: true,
      track_id: track.id,
      title: track.title,
      parsed_title: title,
      artist_name: artistName,
      cover_art_url: coverArtUrl,
      versions_found: versions.length,
      mp3_urls_found: mp3Urls.length,
      ingested: successCount,
      failed: failCount,
      storage_paths: storagePaths,
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('Seed error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

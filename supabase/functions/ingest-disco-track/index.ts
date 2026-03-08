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
    // Verify admin JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const userId = claimsData.claims.sub;

    // Use service role for all DB/storage ops
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Check admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json();
    const { track_id } = body;

    if (!track_id) {
      return new Response(JSON.stringify({ error: 'track_id is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch the full track record including private disco_url and versions with mp3_url
    const { data: track, error: trackError } = await supabase
      .from('artist_tracks')
      .select('id, title, disco_url, track_type, versions, sections')
      .eq('id', track_id)
      .single();

    if (trackError || !track) {
      return new Response(JSON.stringify({ error: 'Track not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const storagePaths: { version_name: string; version_tag: string; storage_path: string }[] = [];
    let successCount = 0;
    let failCount = 0;

    // ─── Helper: download MP3 and upload to storage ──────────────────────────
    async function ingestMp3(mp3Url: string, versionName: string, versionTag: string): Promise<boolean> {
      try {
        const fileResp = await fetch(mp3Url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MNCBot/1.0)' }
        });

        if (!fileResp.ok) {
          console.error(`Failed to fetch MP3 for ${versionName}: ${fileResp.status}`);
          return false;
        }

        const arrayBuffer = await fileResp.arrayBuffer();
        const uint8 = new Uint8Array(arrayBuffer);

        // Sanitize version name for file path
        const safeName = versionName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const storagePath = `${track_id}/${safeName}.mp3`;

        const { error: uploadError } = await supabase.storage
          .from('track-audio')
          .upload(storagePath, uint8, {
            contentType: 'audio/mpeg',
            upsert: true,
          });

        if (uploadError) {
          console.error(`Storage upload error for ${versionName}:`, uploadError);
          return false;
        }

        storagePaths.push({ version_name: versionName, version_tag: versionTag, storage_path: storagePath });
        return true;
      } catch (err) {
        console.error(`Ingest error for ${versionName}:`, err);
        return false;
      }
    }

    // ─── Process single tracks ───────────────────────────────────────────────
    if (track.track_type === 'single') {
      const versions = (track.versions as { name: string; version_tag: string; mp3_url?: string; duration?: string }[]) || [];

      if (versions.length === 0) {
        // No versions parsed — try to re-fetch and parse the DISCO page
        const discoResp = await fetch(track.disco_url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MNCBot/1.0)', 'Accept': 'text/html' }
        });

        if (discoResp.ok) {
          const html = await discoResp.text();
          const mp3Urls: string[] = [];
          const dlRegex = /href="(https?:\/\/[^"]*(?:trackfile|download)[^"]*\.mp3[^"]*)"/gi;
          let dlMatch;
          while ((dlMatch = dlRegex.exec(html)) !== null) {
            mp3Urls.push(dlMatch[1]);
          }

          if (mp3Urls.length > 0) {
            const ok = await ingestMp3(mp3Urls[0], 'Main', 'MAIN');
            if (ok) successCount++; else failCount++;
          }
        }
      } else {
        for (const version of versions) {
          if (version.mp3_url) {
            const ok = await ingestMp3(version.mp3_url, version.name, version.version_tag);
            if (ok) successCount++; else failCount++;
          } else {
            failCount++;
          }
        }
      }
    }

    // ─── Process playlists ───────────────────────────────────────────────────
    if (track.track_type === 'playlist') {
      const sections = (track.sections as { section_name: string; tracks: { title: string; mp3_url?: string }[] }[]) || [];
      for (const section of sections) {
        for (let i = 0; i < section.tracks.length; i++) {
          const t = section.tracks[i];
          if (t.mp3_url) {
            const ok = await ingestMp3(t.mp3_url, `${section.section_name}_${i + 1}_${t.title}`, 'PLAYLIST_TRACK');
            if (ok) successCount++; else failCount++;
          } else {
            failCount++;
          }
        }
      }
    }

    // ─── Update the track record with storage paths ──────────────────────────
    if (storagePaths.length > 0) {
      await supabase
        .from('artist_tracks')
        .update({ mp3_storage_paths: storagePaths })
        .eq('id', track_id);
    }

    return new Response(JSON.stringify({
      success: true,
      track_id,
      ingested: successCount,
      failed: failCount,
      storage_paths: storagePaths,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Ingest error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});


## Full Picture

The request has 4 interconnected parts:

1. **Landing page**: Replace the DISCO link card with a real audio player that streams MP3s from `artist_tracks`
2. **Ingest pipeline**: When a DISCO link is submitted with download enabled, parse it AND actually download/proxy the MP3 files to Supabase Storage so we own the audio
3. **Admin UI**: Add a `show_for_supervisors` checkbox to the `artist_tracks` upload form in the TracksManager — when checked, the track appears in the public landing player **and** shows an "Add to DISCO" button to music supervisors
4. **`artist_tracks` schema**: Add 2 new columns:
   - `show_in_landing_player` (boolean) — drives the custom landing page player
   - `show_add_to_disco_button` (boolean) — shows DISCO button on artist profile for supervisors

---

## Architecture Decisions

**MP3 storage**: DISCO CDN URLs are temporary/expiring. We'll create a Supabase Storage bucket `track-audio` (private), and a new edge function `ingest-disco-track` that:
- Takes a DISCO share URL
- Fetches the HTML server-side
- Extracts MP3 download URLs for all versions/variations
- Downloads each MP3 binary and uploads to `track-audio/{track_id}/{version_name}.mp3`
- Stores the private storage path (not CDN URL) in the `versions` JSONB field
- Updates the `artist_tracks` row with populated metadata + storage paths

**Audio playback on landing page**: A `MNCPlayer` React component that:
- Queries `artist_tracks` where `show_in_landing_player = true` and `is_published = true` via an edge function (since RLS blocks anon)
- Uses an HTML5 `<audio>` element
- Gets a signed URL on demand via `supabase.storage.from('track-audio').createSignedUrl(...)` — but since anon can't do that, playback goes through the existing `artist-track-download` edge function which streams the file
- Shows track title, artist, cover art, prev/next controls, a progress scrubber

**"Add to DISCO" button**: Rendered on `ArtistProfile.tsx` track cards when `show_add_to_disco_button = true` — it's an icon button linking to the track's `disco_url` with a `ListPlus` icon and tooltip "Add to your DISCO library"

---

## Database Migration

New columns on `artist_tracks`:
```sql
ALTER TABLE public.artist_tracks
  ADD COLUMN IF NOT EXISTS show_in_landing_player boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_add_to_disco_button boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS mp3_storage_paths jsonb DEFAULT '[]'::jsonb;
```

New storage bucket `track-audio` (private, no public access).

Update `get_public_artist_tracks()` security definer function to also return `show_add_to_disco_button` so the artist profile page can render the button without exposing the raw `disco_url`.

---

## New Edge Function: `ingest-disco-track`

Admin-only. Takes `{ track_id }` and:
1. Uses service role to fetch the full `artist_tracks` row (has `disco_url` and `versions` with `mp3_url` fields already populated by `parse-disco-link`)
2. For each version that has an `mp3_url` already, downloads the binary and uploads to storage
3. If `mp3_url` is missing (common — parsing is imperfect), re-fetches the DISCO HTML and re-parses
4. Updates `artist_tracks.mp3_storage_paths` with `{ version_name, storage_path, version_tag }`
5. Returns a summary of what was ingested

---

## Updated `parse-disco-link` Edge Function

Enhance to accept `allow_variations: true` as a flag (default already parses all named variations). The key fix: DISCO share links come in several formats:
- `https://s.disco.ac/...` (share links)
- `https://geohworks.disco.ac/e/p/...` (embed links)
- `https://disco.ac/...` (direct)

Currently the function only accepts `s.disco.ac`. Extend to accept any `disco.ac` subdomain.

---

## Files Changed

| File | Change |
|---|---|
| `supabase/migrations/new.sql` | Add 3 new columns to `artist_tracks`, create storage bucket, update `get_public_artist_tracks` function |
| `supabase/functions/ingest-disco-track/index.ts` | New — downloads MP3s from DISCO to storage |
| `supabase/functions/parse-disco-link/index.ts` | Accept all `disco.ac` URL formats |
| `supabase/functions/artist-track-download/index.ts` | Update to read from storage paths first, fall back to DISCO url |
| `supabase/config.toml` | Register `ingest-disco-track` with `verify_jwt = false` |
| `src/pages/LandingPage.tsx` | Replace `MNCPlaylist` with `MNCPlayer` custom audio player component |
| `src/pages/Admin.tsx` | Add `show_in_landing_player` + `show_add_to_disco_button` checkboxes to TracksManager form + "Ingest from DISCO" button per track |
| `src/pages/ArtistProfile.tsx` | Render "Add to DISCO" button on tracks where `show_add_to_disco_button = true` |

---

## Landing Page Player UI

```text
┌─────────────────────────────────────────────────┐
│ [cover art 48px]  Track Title          [♥] [⋮]  │
│                   Artist Name                    │
│ ────────────────────────────── 1:23 / 3:47      │
│ [|◄] [►] [►|]                   [────────○────] │
│ ← prev track                        vol slider  │
│ ─────────────────────────────────────────────── │
│ [track 2 thumbnail]  Track 2   [track 3...]     │
└─────────────────────────────────────────────────┘
```

The player queries published tracks with `show_in_landing_player = true` via a new security-definer DB function `get_landing_player_tracks()` (so anon users can see it). Playback streams via the existing `artist-track-download` edge function which is already public.

---

## Admin TracksManager Additions

The existing `TracksManager` in Admin.tsx manages `example_tracks`. The `artist_tracks` table is managed separately (on the artist profile page). We need to add a **new `ArtistTracksManager`** tab in Admin (or augment the existing "Tracks" tab with a sub-toggle) that:
- Lists all `artist_tracks` across all users (service role via RLS admin policy)
- Shows "Ingest from DISCO" button per track that calls `ingest-disco-track`
- Has `show_in_landing_player` and `show_add_to_disco_button` toggles inline
- Shows MP3 ingest status (how many versions stored)

This becomes a new `AdminArtistTracks` component.

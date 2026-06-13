## Goal

Restore the card grid in **Latest Tracks** and make every Play button hand the song off to a single persistent player docked at the bottom of every public page. The player has full transport, a progress bar, and a queue you can expand into a full‑height panel.

## What you'll see

1. **Latest Tracks (homepage)** — back to the previous horizontal scroll of square track cards (cover art, title, artist, hover‑reveal play overlay). No DISCO iframe.
2. **Bottom player bar** — appears the first time you hit Play. Shows artwork, title/artist, prev / play‑pause / next, scrubber, volume, and a queue icon. Stays on screen and keeps playing as you move between Home, Blog, Artists, Store, Connect, etc.
3. **Queue panel** — clicking the queue icon slides up a full‑height panel listing every track in the current queue, with the playing track highlighted and click‑to‑jump.
4. **Workspace pages unchanged** — `/lab`, `/studio-floor`, `/classroom`, `/admin`, etc. do not show the player.

## How the audio gets there (one‑time ingest)

The DISCO playlist URL itself can't be streamed inline. We ingest it once into your existing `artist_tracks` table + `track-audio` storage bucket, then everything else reads from the DB like a normal catalog.

```text
DISCO playlist URL
   │ parse-disco-link  (existing)  → 1 row in artist_tracks (track_type=playlist)
   │ ingest-disco-track (existing) → downloads each child MP3 into storage bucket
   ▼
artist_tracks rows (one per song)  ← new normalization step
   ▼
get_public_playable_tracks RPC     ← homepage cards read this
   ▼
get-track-stream-url edge fn       ← player asks for a short‑lived signed URL when it hits play
```

If DISCO's playlist HTML doesn't expose per‑track titles to the parser, the fallback splits the captured MP3s into individual `artist_tracks` rows using the playlist's cover art + playlist title as the fallback artwork/credit (per your "use the main logo for anything you don't have a picture for" rule — handled at the UI layer too).

## Build steps

### Backend
1. **Admin ingest action** — small admin button (or a one‑off scripted call) that invokes `parse-disco-link` then `ingest-disco-track` on `https://s.disco.ac/irqnegjjvrtb`, then normalizes the result into one publishable `artist_tracks` row per song with `is_published = true`, `show_in_landing_player = true`.
2. **New RPC `get_public_playable_tracks(p_limit int)`** — returns `id, title, artist_name, cover_art_url, duration, audio_path` (the main version's storage path). Security‑definer, public‑safe, no DISCO URL leaked.
3. **New edge function `get-track-stream-url`** — public (no JWT), input `{ track_id }`, returns a 5‑minute signed URL for that track's main MP3 in the private `track-audio` bucket. Rate‑limited via the existing `check_rate_limit` helper.

### Frontend
4. **`PlayerContext`** (`src/contexts/PlayerContext.tsx`) — holds `queue`, `currentIndex`, `isPlaying`, `progress`, `volume`. Methods: `playQueue(tracks, startIndex)`, `togglePlay()`, `next()`, `prev()`, `seek()`, `jumpTo(i)`. Owns a singleton `HTMLAudioElement`. On `play()` it calls `get-track-stream-url` for the current track and assigns the signed URL to the audio element.
5. **`PersistentPlayer`** (`src/components/PersistentPlayer.tsx`) — fixed bottom bar (z‑50), styled to match the magazine aesthetic (white bar on public pages, MNC blue accents). Includes a queue icon that toggles a full‑height `Sheet` listing the queue.
6. **Public layout mount** — wrap public routes with `<PlayerProvider>` and render `<PersistentPlayer />` once, so it survives navigation. Workspace routes (`LabLayout`, etc.) are explicitly excluded.
7. **`LatestTracks` restored** — revert to the previous card grid, fed by `get_public_playable_tracks`. Each card's Play button calls `playQueue(tracks, i)`. Missing cover art falls back to `mnc-logo.png`.
8. **TrackCard reuse** — any other surface that lists tracks (artist profiles, etc.) can call the same `playQueue` hook later. Out of scope for this change but the API is built for it.

### Cleanup
- Remove the DISCO iframe block currently in `LatestTracks`.
- Body padding‑bottom adjusted on public layout when the player is visible so nothing sits behind the bar.

## Out of scope (call out if you want them)

- Per‑user "like" / save‑to‑queue.
- Persisting playback across reloads (queue resets on full reload; navigation within the SPA preserves it).
- Showing the player inside the authenticated workspace.
- Auto‑refreshing the catalog when DISCO playlist changes (manual re‑ingest for now).
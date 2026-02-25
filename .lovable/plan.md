
# Artist Profile Pages — Full Build Plan

## What We're Building

A public artist profile system at `/artist/[username]` that operates as a Linktree + Bandcamp alternative. Every member gets a profile page they can customize. The DISCO link is used only on the backend — never exposed publicly — to parse metadata and serve music. A dedicated section lets music supervisors request licensing.

---

## DISCO Link Behavior (Based on Your Examples)

Two link types detected from parsing:

**Single Track** (`s.disco.ac/jalswkudtarv`):
- Metadata: title, artist, duration, cover art
- Nested VERSIONS: each has a version name (Instrumental, Clean, TV Track), duration, version tag
- Direct MP3 download URL per version (hidden from public; backend proxies the file)

**Playlist** (`s.disco.ac/okdyqtizlhnl`):
- Metadata: playlist title, cover image
- Sections (genres): each has a name, track count
- Tracks per section: title, artist, duration, direct MP3 download URL

When an artist pastes a DISCO link into their dashboard:
1. Backend edge function fetches the DISCO page, parses the HTML
2. Extracts and stores: title, artist, duration, cover art URL, track versions, MP3 download URLs
3. MP3 URLs are stored **server-side only** — never returned to the public-facing page
4. Public page shows the track card with waveform preview via the DISCO embed `<iframe>` (the `s.disco.ac` URL itself is the embed source)

**Important:** The raw DISCO link and MP3 download URLs are stored in the database but only accessible by the owning artist or admin. Public visitors see the embedded player and a "Download" button that triggers a server-side proxy (or email-gate).

---

## Phase 1 — What Gets Built Now

### 1. Database Schema Changes (Migration)

**Add to `profiles` table:**
```sql
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS username text UNIQUE,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS discord text,
  ADD COLUMN IF NOT EXISTS profile_visibility text DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS tip_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS tip_message text,
  ADD COLUMN IF NOT EXISTS hero_image_url text,
  ADD COLUMN IF NOT EXISTS youtube text,
  ADD COLUMN IF NOT EXISTS soundcloud text,
  ADD COLUMN IF NOT EXISTS spotify text;
```

**New `artist_tracks` table:**
```sql
CREATE TABLE public.artist_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  artist_name text,
  disco_url text NOT NULL,          -- stored privately, never exposed
  cover_art_url text,               -- parsed from DISCO, safe to show
  duration text,
  track_type text DEFAULT 'single', -- 'single' | 'playlist'
  versions jsonb DEFAULT '[]',      -- [{name, version_tag, duration}] - no mp3 urls
  sections jsonb DEFAULT '[]',      -- for playlists: [{section_name, track_count, tracks: [{title,artist,duration}]}]
  price numeric DEFAULT 0,          -- 0 = free
  is_email_gated boolean DEFAULT false,
  is_for_licensing boolean DEFAULT false, -- shows in music supervisor section
  is_published boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**New `artist_track_access` table** (email gate captures):
```sql
CREATE TABLE public.artist_track_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid REFERENCES public.artist_tracks(id) ON DELETE CASCADE,
  email text NOT NULL,
  access_type text DEFAULT 'email_gate', -- 'email_gate' | 'purchase' | 'free'
  created_at timestamptz DEFAULT now()
);
```

**New `licensing_requests` table** (music supervisor contact form):
```sql
CREATE TABLE public.licensing_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_user_id uuid NOT NULL,
  supervisor_name text NOT NULL,
  supervisor_email text NOT NULL,
  company text,
  project_description text NOT NULL,
  track_id uuid REFERENCES public.artist_tracks(id) ON DELETE SET NULL,
  budget_range text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);
```

**RLS Policies:**
- `artist_tracks`: Owner can CRUD their own. Public can SELECT published tracks but **only safe columns** (no `disco_url`). A security-definer function returns the public view.
- `artist_track_access`: Insert allowed via edge function (service role). Owner can SELECT their own captures.
- `licensing_requests`: Insert allowed via edge function. Artist can SELECT requests directed to them. Admin can SELECT all.

---

### 2. New Edge Function: `parse-disco-link`

File: `supabase/functions/parse-disco-link/index.ts`

**What it does:**
- Accepts `{ disco_url, user_id }` (JWT-authenticated)
- Fetches the DISCO page HTML server-side
- Parses out: title, artist, cover art, duration, track type (single vs playlist), versions list, sections list
- Strips all MP3 download URLs from the versions/sections before returning to client
- Stores full data (including MP3 URLs) in `artist_tracks` row
- Returns parsed metadata (without MP3 URLs) for the frontend form preview

**Parsing logic based on observed DISCO HTML structure:**

For single tracks (`s.disco.ac/[id]`):
- Title: `<h1>` or main heading
- Artist: subtitle text
- Duration: time element
- Versions: each `.version` row → `{name, version_tag (INSTRUMENTAL/CLEAN/OTHER), duration}`
- MP3 URLs: anchor tags with `download2/trackfiles/` in href — stored but not returned

For playlists:
- Playlist title: main heading
- Cover: `<img>` in header
- Sections: collapsible section headers with track counts
- Tracks per section: title, artist, duration rows, MP3 URL per row — MP3s stored but not returned

---

### 3. New Edge Function: `artist-track-download`

File: `supabase/functions/artist-track-download/index.ts`

**What it does:**
- Accepts `{ track_id, email? }` 
- Checks if track requires email gate → if yes, validates email was submitted and records it in `artist_track_access`
- Checks if track requires payment → redirect to payment if not paid
- If free or access verified: fetches stored MP3 URL from DB (service role) and proxies the file as a download response
- The MP3 URL from DISCO never touches the browser directly

---

### 4. New Public Page: `/artist/[username]`

File: `src/pages/ArtistProfile.tsx`

**Page layout (inspired by the Linktree reference):**

```
┌─────────────────────────────────┐
│  Hero Banner (custom or default)│
│  Avatar + Stage Name            │
│  Bio text                       │
│  Social icons row               │
│  [Instagram] [TikTok] [X]       │
│  [YouTube] [SoundCloud] [Spotify]│
│  [Discord] [Email]              │
├─────────────────────────────────┤
│  FEATURED MUSIC                 │
│  ┌─────────────────────────┐    │
│  │ Cover Art | Title        │    │
│  │ Artist    | Duration     │    │
│  │ DISCO embed player       │    │
│  │ [Free Download] or       │    │
│  │ [Enter Email to Download]│    │
│  │ [Buy - $X]               │    │
│  └─────────────────────────┘    │
├─────────────────────────────────┤
│  TIP JAR (if enabled)           │
│  "Support [Artist Name]"        │
│  [Tip $3] [Tip $5] [Tip $10]    │
│  [Custom amount]                │
├─────────────────────────────────┤
│  MUSIC SUPERVISOR LICENSING     │
│  "Looking to license this music?"│
│  [Contact for Licensing] →      │
│  Form: Name, Email, Company,    │
│  Project Description, Budget    │
│  Track selector (from published │
│  tracks marked for licensing)   │
└─────────────────────────────────┘
```

**Key behaviors:**
- DISCO link never appears in page source or network requests
- DISCO iframe embed is used for playback (the `s.disco.ac` URL is a public embed — safe to use)
- Download button triggers the `artist-track-download` edge function
- If email-gated: modal appears asking for email before download
- If paid: Stripe integration (Phase 2)
- Tip jar: Stripe integration (Phase 2, placeholder UI now)

---

### 5. Artist Dashboard: Track Upload Page

This will be a new tab called "My Music" inside the Account page (not a separate page, to keep navigation simple).

**"My Music" Tab in Account:**

```
┌────────────────────────────────────────┐
│ My Music                               │
│                                        │
│ How to add music:                      │
│ 1. Go to your DISCO account            │
│ 2. Create a public share link          │
│    for a track or playlist             │
│ 3. Paste the s.disco.ac link below     │
│                                        │
│ WHY DISCO? This platform uses DISCO    │
│ for professional audio delivery —      │
│ the same workflow used in real sync    │
│ licensing. Your files stay on DISCO;   │
│ we never store your audio.             │
│                                        │
│ ┌──────────────────────────────────┐   │
│ │ DISCO Share Link                 │   │
│ │ https://s.disco.ac/...           │   │
│ │ [Preview Metadata]               │   │
│ └──────────────────────────────────┘   │
│                                        │
│ [Metadata preview card appears here]   │
│  Title, Artist, Type, Track count      │
│                                        │
│ Access Settings:                       │
│ ○ Free download                        │
│ ○ Email gate (collect emails first)    │
│ ○ Paid ($_____)                        │
│                                        │
│ ☐ Available for sync licensing         │
│   (shows in Music Supervisor section)  │
│                                        │
│ [Add to Profile]                       │
│                                        │
│ ─────── Your Tracks ───────            │
│ [Track list with edit/remove]          │
└────────────────────────────────────────┘
```

---

### 6. Username Setup

When a member first visits their Account page and has no username set, a banner prompts:
> "Set your artist username to unlock your public profile page at modernnostalgiaclub.lovable.app/artist/[username]"

Username rules: lowercase letters, numbers, hyphens only. Enforced via a regex validator in the form and a UNIQUE constraint in the DB.

---

### 7. Route Registration

Add to `src/App.tsx`:
```tsx
<Route path="/artist/:username" element={<ArtistProfile />} />
```

This route is **public** — no ProtectedRoute wrapper.

---

## Files to Create / Modify

### New Files
1. `src/pages/ArtistProfile.tsx` — Public artist profile page
2. `supabase/functions/parse-disco-link/index.ts` — DISCO metadata parser (server-side)
3. `supabase/functions/artist-track-download/index.ts` — Secure download proxy

### Modified Files
1. `src/pages/Account.tsx` — Add "My Music" tab + username field + bio + hero image + tip toggle
2. `src/App.tsx` — Add `/artist/:username` route
3. `supabase/config.toml` — Register new edge functions with `verify_jwt = true`

### Database Migration
- Add columns to `profiles`
- Create `artist_tracks`, `artist_track_access`, `licensing_requests` tables
- RLS policies for all new tables
- Security-definer function `get_public_artist_tracks(username)` that returns track data without `disco_url`

---

## What's Intentionally Deferred (Phase 2)

- **Stripe tip jar** — UI placeholder built now, payment wiring after Stripe is connected
- **Paid track purchases + revenue splits** — after Stripe Connect
- **Google Sign-In** — a separate PR (straightforward managed OAuth addition)
- **Patreon migration system** — separate PR

---

## Security Notes

- `disco_url` column is excluded from all public-facing SELECT policies via a security-definer function
- Download proxy edge function validates access before fetching MP3 from DISCO
- Licensing request form goes through edge function (rate-limited) — not direct DB insert
- `artist_track_access` email captures stored server-side only; not readable by public

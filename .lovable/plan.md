
## Plan: Landing Page Updates

Here's what I'll change in `src/pages/LandingPage.tsx`:

### 1. Center everything
- Hero text: add `text-center` and center the CTA buttons (`items-center` instead of `items-start`)
- All section headers in Feed, ArtistGrid, WhatsInside, PricingSection: center-align
- Logo centered in hero

### 2. Artist Grid → Members-only blur with 40+ count
- Replace the live profile grid with a **locked/blurred preview** for non-members
- Show a 4-col grid of blurred placeholder cards (or blurred avatars)
- Overlay with a lock panel: **"40+ Patreon Members"** count badge + "Members Only" copy + CTA to `/login`
- Since the RLS already limits `artist_tracks` to authenticated users, we should just show a static teaser for public visitors

### 3. Add "Songs by MN.C Members" playlist embed
- Add a new section between The Feed and Artist Grid (or inside the Artist section)
- Embed the DISCO playlist already used elsewhere: `https://geohworks.disco.ac/e/p/26502910`
- Wrap it in a music player-styled card: dark bg, waveform-style header bar with a `Music` icon, track title "Songs by MN.C Members", play indicator dots — essentially a styled iframe container that looks like a player HUD
- If the iframe renders well, keep the music player wrapper; if it looks off in preview, fall back to a simple video-player card style

### 4. Update Pricing Tiers — add Artist Incubator ($150 one-time)
- Replace "Creative Economy Lab" ($30/mo) tier with **"Artist Incubator"** ($150 one-time)
- CTA: **"Apply Now"** → links to `https://pci.jotform.com/form/253309376850058` (external link, opens in new tab)
- Update features list to match the incubator positioning (application-based, by-approval)
- Keep "Creator Accelerator" as the highlighted/popular tier

### Files changed
- `src/pages/LandingPage.tsx` — all changes in one file

### Technical notes
- The `ArtistGrid` component will no longer query Supabase (public profiles RLS requires `profile_visibility = 'public'` and `username IS NOT NULL`, so it may already return nothing for anon users). Instead render a static blurred grid + overlay
- The DISCO embed playlist ID `26502910` already exists in `BeatLibrary.tsx` and `BeatLicense.tsx` — reusing same src URL
- No new DB migrations needed


## Restructuring Plan: MNC as a Music Blog + Separate Creator Economy Lab

### Overview

Three main tasks:
1. **New public homepage** (`/`) — music blog style, à la pigsandplanes.com, with editorial posts, playlists, and a clean masthead. No Lab marketing here.
2. **Move current landing page** to `/lab` — "The Creator Economy Lab" page, preserving all current content exactly (hero, TheFeed, MNCPlayer, ArtistGrid, WhatsInside, PricingSection).
3. **New About page** (`/about`) — standalone page explaining MNC as a Creative Firm with three pillars: Curate, Create, Educate.

---

### New Architecture

```
/             → New MusicBlogHome (magazine front, posts + playlists)
/lab          → CreatorEconomyLab (current LandingPage, moved intact)
/about        → AboutPage (new — Creative Firm identity)
/login        → Login (unchanged)
/dashboard    → Dashboard (unchanged, authenticated)
```

---

### Page 1: New Homepage `/` — Music Blog Front

Inspired by pigsandplanes.com: big editorial masthead, story-first layout, discovery-focused.

**Sections:**
- **Masthead** — Logo, tagline "Music for Active Listeners", minimal nav links (About, The Lab, Store, Log In)
- **Featured Post** — Hero-sized latest blog post card (full-width, big cover image, title overlaid)
- **Latest Posts Grid** — 3-column card grid of recent blog posts with cover art, title, author, date
- **Playlists Section** — The MNCPlayer (DISCO embed) with intro copy "Curated Playlists for Active Listeners"
- **Latest Tracks** — Horizontal scroll row of recently published artist tracks (from `artist_tracks` table) with DISCO links
- **Footer CTA strip** — "Independent artist? Join the Creator Economy Lab →" with link to `/lab`

**Navigation for non-members:** About | The Lab | Artists | Store | Log In | Join Now

---

### Page 2: `/lab` — Creator Economy Lab (Current Landing, Moved)

- Exact copy of current `LandingPage.tsx` content, just at a new route
- The `user ? <Navigate to="/dashboard">` redirect stays here
- Header `#what-this-is` anchor link updated to point to `/lab#what-this-is` in nav

---

### Page 3: `/about` — About MNC

Three-pillar layout, clean editorial design:

**Sections:**
- **Hero** — "ModernNostalgia.club is a Creative Firm." Big serif type, no image background
- **Three Pillars (with icons):**
  1. **Curate** — "We curate human music for active listeners." (editorial taste, playlists, blog)
  2. **Create** — "We create music with Closed Audience Playlists and Sync Licensing in mind." (the lab members, catalog building)
  3. **Educate** — "We educate independent musicians on how to monetize their music beyond streaming." (classroom, resources, lab)
- **CTA strip** — "Explore the music → / Join the Lab →"

---

### Header Updates

**Public (logged-out) nav:**
- About → `/about`
- The Lab → `/lab`
- Artists → `/artists`
- Is Your Music Sync Ready? → `/sync-quiz`
- Artist Resources → `/reference`
- Log In / Join Now (unchanged)

Remove the `href="#what-this-is"` anchor link (it was pointing to a section that will move to `/lab`). Replace with `/about`.

---

### Routing (App.tsx)

```
<Route path="/"      → MusicBlogHome (new)
<Route path="/lab"   → LandingPage (renamed/moved, existing file)
<Route path="/about" → AboutPage (new)
```

---

### Files to Create/Modify

| File | Action |
|------|--------|
| `src/pages/MusicBlogHome.tsx` | Create — new blog-style homepage |
| `src/pages/AboutPage.tsx` | Create — new Creative Firm about page |
| `src/pages/LandingPage.tsx` | Edit — change `<Navigate to="/dashboard">` to stay, but the route changes to `/lab` |
| `src/App.tsx` | Edit — reroute `/` to MusicBlogHome, add `/lab` and `/about` routes |
| `src/components/Header.tsx` | Edit — update public nav links (About → `/about`, add The Lab → `/lab`) |
| `src/components/Footer.tsx` | Edit — add About and The Lab links |

The existing `LandingPage.tsx` is **not deleted** — it just moves to the `/lab` route. All its internal logic stays untouched, preserving the architectural constraint noted in memory.

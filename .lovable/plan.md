
# Landing Page Redesign: Front of House + Discover + Blog

## What You're Building

The site should serve three simultaneous purposes — matching the physical Creative Economy Lab vision from the pitch deck:

1. **Front of House (Public Discovery)** — Like Complex.com for indie music from the Club. Your curated YouTube Music playlists, artist spotlights, blog posts.
2. **The Lab Explained** — Mission, the four pillars, and the sponsor pitch (mirroring the deck digitally).
3. **Artist Resources + Member Portal** — The existing classroom, community, studio floor all stay intact. The landing page just becomes a better front door.

No existing lessons, courses, or member features are removed.

---

## Key Additions

### 1. YouTube Music Playlist Embeds (NEW Section)
Your two playlists embedded directly on the homepage:
- `https://music.youtube.com/playlist?list=PL8vMWEFhhyIIDZ8xoN-2jM0UbXxLUFgKZ`
- `https://music.youtube.com/playlist?list=PL8vMWEFhhyIL7pHJSKNzrqS3mq0OC5InH`

YouTube Music playlists **do not support iframe embeds** (YouTube Music blocks third-party embeds). The solution is to render them as **editorial playlist cards** — styled cards that link out to the playlist with a "Listen on YouTube Music" button, plus a note about what the playlist contains. This is actually better for the aesthetic: it looks like a music blog feature, not a widget.

If you also have standard YouTube playlist IDs (the same playlists on regular youtube.com), those CAN be embedded as iframes. You can add those at any time.

### 2. Blog Posts Section (NEW — replaces current PatreonBlog)
The current `PatreonBlog` component fetches from Patreon. The problem: it requires Patreon connection + the posts may not always load for public visitors.

The plan is to create a **`blog_posts` database table** to house editorial posts you write directly through the admin panel, AND keep the Patreon feed as a secondary source. The landing page will show the blog posts prominently.

**New `blog_posts` table:**
- `id`, `title`, `slug`, `excerpt`, `content` (markdown), `cover_image_url`, `published_at`, `is_published`, `author_name`, `tags`

Admin can create posts. Public can read them. The landing page shows the 3 most recent published posts in a magazine/editorial card layout.

### 3. Artists of the Club Grid (NEW Section)
Live grid of public member profiles from the existing `profiles` table where `stage_name IS NOT NULL`. Each card shows avatar, stage name, and links to `/artist/[username]`. This gives the "discover indie music" feel.

Note: The profiles table has `profile_visibility` column. The existing `get_public_profiles()` DB function already handles this securely.

### 4. Hero Image Clarified (visual fix)
Current opacity: `opacity-25`. Updated to `opacity-50` with a sharper gradient. The photo will actually read.

### 5. Color Palette: Shift to Cool Blue
Change the CSS variables from maroon to a deep electric blue:
- `--primary`: `220 70% 45%` 
- `--maroon` (alias kept): `220 70% 45%`
- `--maroon-glow`: `220 80% 60%`  
- `--accent`: `220 60% 35%`

This affects all buttons, accents, highlights, and borders site-wide via CSS variables — a single change in `src/index.css`.

---

## New Landing Page Section Order

```text
1. HERO  ← clearer image, dual CTA (Join the Lab + Discover Music)
2. DISCOVER: SOUNDS FROM THE CLUB  ← YouTube Music playlist cards + artists grid  [NEW]
3. BLOG: FROM THE LAB  ← 3 recent blog posts  [NEW]
4. WHAT THIS IS  ← existing accordion (kept as-is)
5. HOW IT WORKS  ← existing steps (kept as-is)
6. FREE RESOURCES  ← existing 3-card row (kept as-is)
7. THE STORE  ← existing products (kept as-is)
8. PRICING  ← existing tiers (kept as-is)
9. WHY THIS EXISTS  ← existing pillars (kept as-is)
10. EVENTS  ← existing (kept as-is)
11. PARTNERS & SPONSORS  ← refined with deck language (kept as-is)
12. BOTTOM CTA
```

The current `SyncReadinessQuiz` inline section is removed from the landing page (it still exists at `/sync-quiz` in the nav). This keeps the page from being too deep.

---

## Files to Change

### `src/index.css`
- Update `:root`, `.light`, `.dark` CSS color variables to shift maroon → blue

### `src/pages/LandingPage.tsx`
- Hero opacity bump: `opacity-25` → `opacity-50`
- Hero tagline: add listener-facing secondary line
- Add dual CTA: "Join the Lab" + "Discover Music" (scrolls to discover section)
- **NEW Section 2**: `DiscoverSection` — playlist cards + artist grid
- **NEW Section 3**: `BlogSection` — 3 recent posts from `blog_posts` table
- Remove inline `<SyncReadinessQuiz />` (still accessible at `/sync-quiz`)
- Keep everything else

### `src/components/Header.tsx`
- Add `Discover` nav link (public) pointing to `/#discover`

### Database migration
- New `blog_posts` table with RLS:
  - Public can `SELECT` where `is_published = true`
  - Admins can do all operations

### `src/pages/Admin.tsx`
- Add a "Blog Posts" admin tab to create/edit/delete posts

---

## Technical Notes

**Why not iframe YouTube Music?**
YouTube Music (`music.youtube.com`) does not allow embedding via iframe — it returns a permission error. The standard YouTube embed player (`youtube.com/embed/videoseries?list=...`) uses a different URL format. I can embed standard YouTube playlist URLs if you have those. For now the playlist cards will link out cleanly.

**Blog vs Patreon Blog:**
The `PatreonBlog` component stays on the page but moves below the new blog section. The new blog posts are hosted natively and don't depend on Patreon API connectivity. Over time you can use the native blog as your primary editorial voice and let Patreon be secondary.

**Artist grid RLS:**
The existing `get_public_profiles()` security definer function safely exposes only `stage_name`, `avatar_url`, `username` for profiles with a stage name set. No RLS changes needed for the grid.

**Blue color choice:**
`220 70% 45%` is a rich medium blue — deep enough to feel editorial and premium, bright enough to read on both dark and light backgrounds. All current `text-maroon`, `bg-maroon`, `border-maroon` Tailwind classes in the codebase reference the CSS variable, so they all shift automatically.

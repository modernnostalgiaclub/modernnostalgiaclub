
## Redesign /connect as a Personal Bio Link Page (Linktree-style)

### What's changing
The `/connect` page becomes a full personal bio link hub — a single destination from the QR code that surfaces all public-facing funnel content, social links, a newsletter signup, and a "Join the Club" CTA. The networking contact capture form moves to the bottom as a secondary action (still valuable for in-person use).

### Layout (top to bottom, single column, max-w-md centered)

```text
┌─────────────────────────────┐
│  Logo (h-20)                │
│  Ge Oh                      │
│  modernnostalgia.club       │
│  Tagline (italic)           │
├─────────────────────────────┤
│  SOCIAL ICONS ROW           │
│  (Instagram, Twitter,       │
│   TikTok, YouTube,          │
│   Spotify, SoundCloud)      │
├─────────────────────────────┤
│  FUNNEL LINKS (full-width)  │
│  ┌───────────────────────┐  │
│  │ 🎵 Free Artist Guide  │  │  → /free-guide
│  ├───────────────────────┤  │
│  │ 🎯 Sync Readiness Quiz│  │  → /sync-quiz
│  ├───────────────────────┤  │
│  │ 🏪 The Store          │  │  → /store
│  ├───────────────────────┤  │
│  │ 📚 Artist Resources   │  │  → /reference
│  ├───────────────────────┤  │
│  │ 🎵 MN.C Music (DISCO) │  │  → external DISCO profile
│  └───────────────────────┘  │
├─────────────────────────────┤
│  JOIN THE CLUB (maroon btn) │  → /login?tab=signup
│  Already a member? Log in   │  → /login
├─────────────────────────────┤
│  NEWSLETTER SECTION         │
│  "Stay in the loop."        │
│  [email input] [Subscribe]  │
│  (reuses capture-download-  │
│   email edge function with  │
│   trackId='newsletter')     │
├─────────────────────────────┤
│  ─────── DIVIDER ────────── │
│  "Met in person?"           │
│  [Drop your info form]      │
│  (existing contact form,    │
│   collapsed/accordion style)│
├─────────────────────────────┤
│  Footer quote               │
└─────────────────────────────┘
```

### Social links
The social handles are stored on the user's profile in the database (`instagram`, `twitter`, `tiktok`, `youtube`, `spotify`, `soundcloud`). Rather than hardcode them, we fetch the **admin's profile** (or simply hardcode as static constants for the business owner's known handles — this is a personal bio link, not user-generated). Given this is Ge Oh's personal bio link, we hardcode the known social URLs as constants and add them as static links. The admin can update the `networking_links` table for the dynamic funnel links or we can hardcode them — since the funnel links are fixed pages, hardcoding is cleaner and avoids DB dependency.

### Newsletter
We reuse the existing `capture-download-email` edge function with `trackId: 'newsletter'` and `trackTitle: 'Newsletter Signup'`. This stores the email in `download_email_captures` which is already viewable in the admin panel under "Email Captures." No new infrastructure needed.

### Funnel links (hardcoded, full-width stacked buttons)
| Label | Destination | Icon |
|---|---|---|
| Free Artist Survival Guide | /free-guide | Download |
| Are You Sync Ready? | /sync-quiz | Target |
| The Store | /store | ShoppingBag |
| Artist Resources | /reference | BookOpen |
| Listen on DISCO | https://geohworks.disco.ac | Music |

### Networking contact form
Kept intact at the bottom. Wrapped in a subtle "Met me in person?" collapsible section so it doesn't dominate the page for people who arrived via social media (where it's less relevant).

### Files changed
- `src/pages/Connect.tsx` — full rewrite with new layout structure

No DB changes, no new edge functions, no route changes.

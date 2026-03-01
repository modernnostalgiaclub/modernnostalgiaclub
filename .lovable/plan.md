
## Combined Plan: UI Restructure + Auth Bug Fixes (Already Done)

### Status Check: What's Already Done

The two auth bug fixes from the previous plan are **already implemented** in the codebase:
- `src/pages/MigrateToGoogle.tsx` — magic link fallback for existing accounts is live
- `src/pages/ResetPassword.tsx` — MFA gate (AAL2 check + TOTP challenge) is live

What follows is the **unapproved UI restructure** plan, which we now execute on top of the working codebase.

---

### Task 1 — The Public Magazine (`/`)

**What changes in `src/pages/LandingPage.tsx`:**

Replace the hero `bgHero` local asset with a high-quality Unsplash studio photo:
`https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1800&q=80`

Add two new data-driven sections **below** the existing Pricing section, before the FAQ/footer:

**"Sounds from the Club"** — queries `artist_tracks` where `is_published = true`, ordered by `created_at desc`, limit 6. Renders a horizontal scroll of glassmorphism cards. Each card shows: track title, artist name (joined from profiles), and a DISCO embed link or external link button.

**"From the Lab"** — queries `blog_posts` where `is_published = true`, ordered by `published_at desc`, limit 3. Renders editorial cards with: title, excerpt (first 120 chars of content), author, and date.

Glassmorphism classes to add to `src/index.css`:
```css
.glass-card {
  @apply backdrop-blur-md bg-white/5 border border-white/10 rounded-xl;
}
.light .glass-card {
  @apply bg-white/60 border-black/10;
}
```

The existing redirect (`if (!loading && user) return <Navigate to="/dashboard" />`) stays untouched.

---

### Task 2 — The Artist Marketplace (`/artists`)

**New file: `src/pages/Artists.tsx`**

Queries `profiles` where `profile_visibility = 'public'` and `username IS NOT NULL`. The `profile_visibility` column already exists in the DB.

Each card displays:
- Avatar from `avatar_url` with fallback initials badge
- `stage_name` or `name`
- `@username`
- `bio` truncated to 2 lines
- Social icon buttons (instagram, spotify, soundcloud) — columns already in profiles
- **"View Profile"** button → links to `/artist/[username]` (existing public profile route)

A narrow RLS `SELECT` policy for anonymous users is needed. Currently profiles are blocked to anon. We add:
```sql
CREATE POLICY "Public profiles viewable by all"
ON public.profiles FOR SELECT
USING (profile_visibility = 'public' AND username IS NOT NULL);
```
This is a one-migration, additive-only change. Existing data and RLS policies are unaffected.

**Route added to `src/App.tsx`** as a public route (no `ProtectedRoute` wrapper):
```tsx
<Route path="/artists" element={<Artists />} />
```

**`src/components/Header.tsx`** — Add "Artists" link to the public nav (visible when not logged in, alongside the existing links).

---

### Task 3 — The Member Lab Sidebar

**New files:**
- `src/components/LabLayout.tsx` — wraps authenticated pages with `SidebarProvider` + `AppSidebar` + a slim top bar (notification bell, user avatar, `SidebarTrigger`)
- `src/components/AppSidebar.tsx` — the 4-pillars sidebar

**Sidebar structure:**

```text
[ Logo ]

OVERVIEW
  Dashboard            /dashboard

4 PILLARS
  Workforce Dev        /classroom
  Distribution         /studio
  Financial Literacy   /reference
  Creative Tools       /community

WORKSPACE
  My Music             /beats
  Members              /members
  Events               /events

ACCOUNT
  Settings             /account
  Notifications        /notifications
  [ Admin Panel ]      /admin  (admin-role only)
```

Uses `collapsible="icon"` — collapses to a 56px icon strip on narrow screens, full Sheet on mobile (built into the existing Sidebar component already in the project at `src/components/ui/sidebar.tsx`).

Active route highlighting uses `useLocation()` from react-router-dom to match `pathname` against each link's `url`.

**`src/App.tsx`** — All authenticated routes wrapped with `<LabLayout>` instead of rendering standalone. Public routes (`/`, `/artists`, `/events`, `/reference`, `/login`, `/reset-password`, `/migrate`, `/apply`, etc.) continue using the `Header` + `Footer` layout as-is.

The `<Header>` is **not rendered** inside `LabLayout` — the sidebar replaces it for authenticated users.

---

### Files Summary

| File | Action | Change |
|---|---|---|
| `src/pages/LandingPage.tsx` | Modify | Replace hero image; add Sounds + From the Lab sections |
| `src/index.css` | Modify | Add `.glass-card` utility class |
| `src/pages/Artists.tsx` | Create | Public artist marketplace |
| `src/components/AppSidebar.tsx` | Create | 4-pillars sidebar nav |
| `src/components/LabLayout.tsx` | Create | Authenticated layout wrapper |
| `src/App.tsx` | Modify | Add `/artists` route; wrap auth routes in `LabLayout` |
| `src/components/Header.tsx` | Modify | Add "Artists" link to public nav |
| DB migration | Add | RLS SELECT policy for public profiles |

### What Is NOT Changed
- `AuthContext.tsx`, `ProtectedRoute.tsx` — zero changes
- Patreon OAuth flow, `user_has_tier_access` — zero changes
- `MigrateToGoogle.tsx`, `ResetPassword.tsx` — already fixed, untouched
- All edge functions and DB tables (except one additive RLS policy)

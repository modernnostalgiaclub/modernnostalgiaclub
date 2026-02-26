
## Reworking the Patreon Migration Flow + Profile-First Dashboard

### What's Broken Today
1. The `/migrate` page only offers Google sign-in — there's no email/password option, so members who don't want Google are stuck.
2. When a Patreon member signs in via Google (a **different** account), the `claim-migration-upgrade` edge function looks for a `patreon_id` on **that new Google user's profile** — which doesn't exist yet. The link between the old Patreon account and the new Google/email account is never made, so the upgrade silently fails.
3. The dashboard "Getting Started" checklist shows generic items first. Profile setup is item #1 but doesn't feel urgent. The artist profile (`/artist/[username]`) is a real link-in-bio tool that members aren't being guided to set up.

---

### Part 1 — Fix the Migration Flow

#### 1a. Redesign `/migrate` page
Add an email/password option alongside Google so members have two paths:
- **Continue with Google** (existing)
- **Sign up / Sign in with email + password** (new tab, same as `/login` signup form)

Both paths land on the same "claim upgrade" logic. The message on the page will be clearer: *"Sign in or create a new account — we'll link it to your Patreon membership automatically."*

#### 1b. Fix the backend linking logic (`claim-migration-upgrade` edge function)
The current flow assumes the new account already has `patreon_id` set. That only works if they sign in with the **same Patreon-linked account**, not a new Google/email one.

**New logic:**
1. The `/migrate` page will pass the old Patreon session token (stored in `localStorage` during the migration redirect) alongside the new auth token.
2. The edge function will accept an optional `patreon_user_id` body param — the ID of the **original Patreon-linked account**.
3. It looks up the Patreon profile by that ID, verifies it has a `patreon_id`, upgrades the **new** account's tier, and marks migration as complete in `patreon_migration`.

**Simpler alternative (chosen):** When the banner is clicked, we store the current user's `user_id` (the Patreon account) in `sessionStorage`. The `/migrate` page reads this, passes it to the edge function, which cross-references to verify the Patreon membership and apply the upgrade to the new account.

#### 1c. Admin tracking — add "auth method" column
Add an `auth_method` column (`patreon | google | email`) to `patreon_migration` so the admin table shows what each member switched to. This is populated when `claim-migration-upgrade` runs.

---

### Part 2 — Profile-First Dashboard

#### 2a. Profile completion banner on Dashboard
When a member has **no `stage_name`** (i.e., profile not set up), show a prominent hero card at the top of the dashboard:

> **Your artist profile is your link in bio.**
> Set your stage name, add your music, and get a shareable URL at `modernnostalgia.club/artist/[username]`.
> [Set Up Your Profile →]

This replaces the generic checklist item with an urgent, contextual CTA.

#### 2b. Reorder Getting Started checklist
Move "Set up your profile" to item #1 with a note about the link-in-bio feature. If `stage_name` and `username` are both set, show a "View your public profile →" link instead.

#### 2c. Show public profile link on Dashboard (post-setup)
Once the profile is set up (has `username`), add a small card with a copyable link: `modernnostalgia.club/artist/[username]` — so it's always visible and shareable from the dashboard.

---

### Technical Changes

**Database migration:**
- Add `auth_method text` column to `patreon_migration` table

**Files modified:**
- `supabase/functions/claim-migration-upgrade/index.ts` — accept `patreon_source_user_id` from request body; look up original Patreon profile; apply upgrade to the calling user
- `src/pages/MigrateToGoogle.tsx` — rename to a more generic "Migrate" page; add email sign-up option; read `patreon_source_user_id` from `sessionStorage`; pass it to edge function
- `src/pages/Dashboard.tsx` — add profile completion banner; add public profile link card; reorder checklist
- `src/components/AdminPatreonMigration.tsx` — show `auth_method` column in the table

**No new pages needed** — the `/migrate` route just gets email option added.

---

### Migration Banner Click → Flow

```text
Dashboard banner ("Claim Your Free Upgrade →")
  → Store current user.id in sessionStorage as "patreon_source_user_id"
  → Navigate to /migrate

/migrate page
  → Shows: Google button + Email signup form
  → User signs in / signs up with new account
  → On SIGNED_IN event: call claim-migration-upgrade with {patreon_source_user_id}
  → Edge function: looks up source profile, verifies patreon_id, upgrades new account, records migration
  → Redirect to /dashboard with success toast
```

This works even if the user is already signed in on the new account (e.g., they already have a Google account) — we pass the source ID explicitly rather than relying on the new account having the Patreon connection.

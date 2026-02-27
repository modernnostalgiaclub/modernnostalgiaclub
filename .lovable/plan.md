
## Fix: Patreon Migration Flow — Sign Out First, Then Set Password

### Root Cause

The `/migrate` page has a fatal race condition: when a Patreon member clicks "Claim Your Free Upgrade" on the dashboard, their Patreon session is still active. The page's `useEffect` runs `getSession()` immediately, finds the active Patreon session, and tries to call `claimUpgrade()` on that same account — not a new one. The upgrade either silently no-ops (same account) or errors out. The user never gets to create a password.

For `ge@modernnostalgia.club` specifically: no Google account exists, so the email tab is needed, but the flow never allows reaching it before auto-firing the claim on the existing Patreon session.

### The Fix — 3 Changes

#### 1. Sign out BEFORE navigating to /migrate (Dashboard banner)

When the user clicks "Claim Your Free Upgrade," we need to:
1. Save the `patreon_source_user_id` to `sessionStorage`
2. **Sign the user out of their Patreon session**
3. Navigate to `/migrate`

This ensures the `/migrate` page loads with no active session, so `getSession()` returns null and the upgrade form is shown properly.

#### 2. Make the Email tab the DEFAULT when there's no Google (Migrate page)

Currently the Google tab is shown first. For members like you who don't have/use Google, they have to notice and click the "Use Email" tab. We'll default to the email tab and make the UX clearer — the page should lead with:

> **Create a password for your account** — your email is already `ge@modernnostalgia.club`, just set a password below.

Since the Patreon email is known before they leave the dashboard, we'll pass it as a URL param (`/migrate?email=ge@modernnostalgia.club`) so the email field is pre-filled and read-only. They only need to enter a password.

#### 3. Fix the `claimUpgrade` guard — only fire on NEW sign-in, not on page load

The `useEffect` currently calls `claimUpgrade` on `getSession()` if a session exists. After the sign-out fix, `getSession()` will return null — so this guard becomes correct. But we'll add an additional check: only call `claimUpgrade` on the `SIGNED_IN` auth event, not on an existing session check. This prevents any future regression.

### Revised Flow

```text
Dashboard → "Claim Upgrade" click:
  1. sessionStorage.setItem('patreon_source_user_id', user.id)
  2. sessionStorage.setItem('patreon_source_email', user.email)
  3. await supabase.auth.signOut()
  4. navigate('/migrate')

/migrate page loads:
  - No active session (signed out)
  - Email tab shown by default
  - Email field pre-filled from sessionStorage (read-only)
  - User types a password and clicks "Create Account & Claim Upgrade"
  - OR clicks "Continue with Google" if they prefer

  On signUp success:
  - Auth sends a confirmation email (or auto-confirms)
  - onAuthStateChange fires SIGNED_IN
  - claimUpgrade() runs with patreon_source_user_id from sessionStorage
  - Upgrade applied to new account, migration recorded
  - Redirect to /dashboard with success toast

  On signInWithPassword success (returning user):
  - Same SIGNED_IN flow
```

### Files to Change

**`src/pages/Dashboard.tsx`** — The "Claim Upgrade" button handler:
- Add `supabase.auth.signOut()` before `navigate('/migrate')`
- Store the user's email in `sessionStorage` alongside the user ID

**`src/pages/MigrateToGoogle.tsx`** — The migration page:
- Default tab to `'email'` instead of `'google'`
- Read email from `sessionStorage` and pre-fill the email input (read-only)
- Remove the `getSession()` auto-claim on page load — only fire on `SIGNED_IN` event
- Add clearer copy: "Set a password for your account — we'll use your existing Patreon email"
- Show a note explaining Google is also an option if they have a Gmail

### What Does NOT Change
- The `claim-migration-upgrade` edge function logic is correct — it accepts `patreon_source_user_id` and upgrades the new account. No backend changes needed.
- The email confirmation flow stays as-is (user signs up → confirms email → SIGNED_IN fires → upgrade claimed).
- The admin `patreon_migration` table tracking remains intact.

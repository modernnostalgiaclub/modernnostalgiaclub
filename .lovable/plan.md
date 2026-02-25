
# Patreon Migration System + Stripe Tip Jar + Login Flow Verification

This plan covers three things:
1. Patreon migration system (admin tab + `/migrate` page)
2. Stripe connection for the tip jar on artist profiles (and future paid downloads)
3. Login flow audit — everything is already correctly wired from the previous implementation

---

## Scope Breakdown

### Part 1: Login Flow Audit (No Changes Needed)
After reviewing the code:
- `src/pages/Login.tsx` already has Google OAuth via `lovable.auth.signInWithOAuth('google')` as the primary button, email/password in tabs below, and Patreon in a collapsed "Legacy Access" section
- `src/pages/LandingPage.tsx` CTAs already route to `/login?tab=signup` and `/login` — no Patreon links remain
- The `handle_new_user` DB trigger assigns `lab-pass` tier to all new signups including Google
- **No code changes needed here** — confirmed working as designed

---

### Part 2: Patreon Migration System

#### 2A. Database Migration
New `patreon_migration` table:
```sql
CREATE TABLE public.patreon_migration (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patreon_user_id uuid NOT NULL,  -- links to profiles.user_id
  google_user_id uuid,            -- set after migration
  migration_status text DEFAULT 'pending', -- pending | notified | migrated
  notified_at timestamptz,
  migrated_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.patreon_migration ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write this table
CREATE POLICY "Admins can manage patreon_migration"
  ON public.patreon_migration FOR ALL
  USING (has_role(auth.uid(), 'admin'));
```

#### 2B. New Component: `AdminPatreonMigration.tsx`
A self-contained component added as a new tab in the Admin panel. It shows:

**Stats bar at top:**
- Total Patreon members (where `patreon_id IS NOT NULL`)
- Notified count
- Migrated count
- Pending count

**Member table columns:**
- Name / Stage Name
- Email (fetched via admin edge function — not directly queryable from client)
- Tier (current)
- Migration Status badge (Pending / Notified / Migrated)
- Notified At date
- Action: "Send Invite" button (individual) or a bulk "Notify All Pending" button

**Notification content sent (via existing `AdminNotificationSender` approach using notifications table):**
> Title: "🎉 You're Getting a Free Upgrade"
> Message: "As a founding Patreon member, you're being upgraded to Creative Economy Lab — our highest tier — for free. Sign in with Google to claim your upgrade at [domain]/migrate."
> Link: `/migrate`

Since we already have the `notifications` table and the admin can bulk-send notifications, the migration flow will:
1. Admin clicks "Notify All Pending"
2. System inserts a notification row for each Patreon member with `patreon_id IS NOT NULL`
3. Sets their `patreon_migration` status to `notified`

**Claim flow:**
When users click the notification link → `/migrate` page → sign in with Google → backend edge function `claim-migration-upgrade` runs → sets tier to `creative-economy-lab` → marks migration as `migrated`

#### 2C. New Page: `src/pages/MigrateToGoogle.tsx`
Public page (no auth required to view):

```
┌─────────────────────────────────────┐
│  [Logo]                             │
│                                     │
│  You've Been Here Since Day One.    │
│  Here's Your Reward.                │
│                                     │
│  As a founding Patreon member,      │
│  we're upgrading you to             │
│  Creative Economy Lab tier          │
│  — for free, permanently.           │
│                                     │
│  What you get:                      │
│  ✓ All features unlocked            │
│  ✓ Priority review                  │
│  ✓ Strategy sessions                │
│  ✓ All future upgrades included     │
│                                     │
│  To claim:                          │
│  [Continue with Google →]           │
│                                     │
│  Note: Your Patreon account must    │
│  match the email you use for Google │
│  for us to verify your membership.  │
└─────────────────────────────────────┘
```

After Google sign-in on this page, the `claim-migration-upgrade` edge function:
1. Gets the authenticated user's email
2. Looks up their profile to check `patreon_id IS NOT NULL`
3. If verified, sets `patreon_tier = 'creative-economy-lab'` on their profile
4. Inserts/updates row in `patreon_migration` table with status `migrated`
5. Redirects to `/dashboard` with a success notification

#### 2D. New Edge Function: `claim-migration-upgrade`
- Requires JWT auth
- Checks if calling user has `patreon_id IS NOT NULL` in their profile
- If yes: upgrades tier, marks migration complete, returns success
- If no: returns `{ error: 'No Patreon account found' }` with a helpful message

#### 2E. Admin Panel: Add Migration Tab
Add a new `TabsTrigger` and `TabsContent` for `"migration"` in `src/pages/Admin.tsx`:
- Import `AdminPatreonMigration` component
- Add icon: `<Users2 />` from lucide-react

---

### Part 3: Stripe Tip Jar on Artist Profiles

Stripe will be enabled via the `stripe--enable_stripe` tool which collects the secret key from the user.

After Stripe is enabled, the implementation adds:

#### 3A. New Edge Function: `create-tip-payment`
- Accepts `{ artist_user_id, amount, currency = 'usd', tipper_email? }`
- Creates a Stripe Checkout Session with `payment_intent_data.metadata` linking to the artist
- Returns `{ checkout_url }` — client redirects to Stripe Checkout
- For future Stripe Connect (artist direct payouts): once Connect is enabled, this will use `transfer_data.destination`

#### 3B. Update `ArtistProfile.tsx` Tip Jar Section
The page already has a tip jar UI placeholder. This update wires the tip buttons to call `create-tip-payment` and redirect to Stripe Checkout.

**Tip amounts UI:**
- Preset: $3, $5, $10
- Custom: number input
- Button: "Support [Artist Name]" → triggers `create-tip-payment`
- Loading state while Stripe session is being created

**Return URLs:**
- Success: `/artist/[username]?tip=success` — shows a toast "Thanks for your support!"
- Cancel: `/artist/[username]` — user lands back silently

#### 3C. Stripe Connect for Artist Direct Payouts (Phase Setup)
This phase sets up the **infrastructure** for artist-direct payouts without requiring all artists to connect Stripe immediately. The `profiles` table will get two new columns (via migration):
- `stripe_account_id text` — their connected Stripe Express account ID
- `stripe_onboarding_complete boolean DEFAULT false`

A new "Connect Stripe" button in the Account → My Music tab allows artists to start onboarding via the `create-stripe-connect-account` edge function which returns a Stripe Connect onboarding URL.

**Note**: Until an artist completes Stripe Connect onboarding, all tips go to the platform's main Stripe account. Once they connect, `transfer_data.destination` is added to the payment session.

---

## Files to Create / Modify

### New Files
1. `src/pages/MigrateToGoogle.tsx` — Public migration claim page
2. `src/components/AdminPatreonMigration.tsx` — Admin migration management
3. `supabase/functions/claim-migration-upgrade/index.ts` — Upgrade verification
4. `supabase/functions/create-tip-payment/index.ts` — Stripe tip checkout session
5. `supabase/functions/create-stripe-connect-account/index.ts` — Artist Stripe Connect onboarding

### Modified Files
1. `src/pages/Admin.tsx` — Add "Migration" tab
2. `src/pages/ArtistProfile.tsx` — Wire tip jar to Stripe
3. `src/components/MyMusicTab.tsx` — Add "Connect Stripe" button for artists
4. `src/App.tsx` — Add `/migrate` route
5. `supabase/config.toml` — Register new edge functions

### Database Migrations
1. `patreon_migration` table with RLS (admin-only)
2. `profiles.stripe_account_id` column (new, nullable)
3. `profiles.stripe_onboarding_complete` column (new, boolean, default false)

---

## Technical Notes

- **Stripe secret key** is required to proceed — the `stripe--enable_stripe` tool will prompt the user to input it. This is stored as a Lovable Cloud secret and used only in edge functions.
- The `claim-migration-upgrade` function uses JWT auth to verify the user is who they claim to be — no client-side tier manipulation possible.
- Migration status is tracked in the `patreon_migration` table, separate from the `profiles` table, to maintain a clean audit trail.
- The tip jar uses Stripe Checkout (hosted page) — no PCI compliance concerns on our end.
- Roles remain in `user_roles` table only — tier upgrades modify `profiles.patreon_tier` only, which is already how the system works.

---

## Step Order

1. Run DB migration (patreon_migration table + stripe columns on profiles)
2. Call `stripe--enable_stripe` to collect and store Stripe key
3. Create edge functions: `claim-migration-upgrade`, `create-tip-payment`, `create-stripe-connect-account`
4. Build `AdminPatreonMigration` component + `MigrateToGoogle` page
5. Wire `ArtistProfile.tsx` tip buttons to `create-tip-payment`
6. Add Stripe Connect onboarding to `MyMusicTab.tsx`
7. Add migration tab + route to `Admin.tsx` and `App.tsx`

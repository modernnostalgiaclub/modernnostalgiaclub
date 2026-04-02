## Membership Checkout Flow Implementation

### Problem
The /join page currently links Club Pass to a login page, Accelerator to Patreon, and Artist Incubator to JotForm. There's no unified checkout flow that takes users from tier selection → account creation → payment → membership provisioning.

### Solution

#### 1. Update /join Page CTAs
- All three tiers should use internal checkout flow (not external Patreon/JotForm links)
- When an unauthenticated user clicks a tier, store the selected `plan` in URL params and redirect to `/login?redirect=/checkout&plan=club-pass`
- When an authenticated user clicks, go directly to `/checkout?plan=club-pass`

#### 2. Create `/checkout` Page
- Protected route that shows the selected plan summary
- Calls `create-membership-checkout` edge function to generate a Stripe session
- Redirects user to Stripe Checkout
- Handles loading/error states

#### 3. Update Login Page
- Support `redirect` query param so after login/signup, users are sent back to the checkout page with their plan selection preserved

#### 4. Create Stripe Products & Prices
- Verify/create Stripe products for each tier:
  - Club Pass: $10/mo (subscription)
  - Accelerator: $50/mo (subscription)  
  - Artist Incubator: $300 one-time (payment)
- Store the Stripe price IDs in the `membership_plans` table

#### 5. Handle Post-Payment Provisioning
- After successful Stripe checkout, the user lands on `/dashboard?membership=success`
- Create a `stripe-membership-webhook` edge function to handle `checkout.session.completed`:
  - Update `member_subscriptions` status from "pending" → "active"
  - Sync the `patreon_tier` on the `profiles` table to match the purchased plan
  - This ensures the tier tag is visible in admin user management

#### 6. Admin Visibility
- The existing admin Users tab already shows tier info — ensure it pulls from `member_subscriptions` for accurate tier display

### Flow Summary
```
/join → Select Tier → /login (if not auth'd) → /checkout → Stripe → /dashboard?membership=success
```

No new database tables needed. Uses existing `membership_plans`, `member_subscriptions`, and `profiles` tables.

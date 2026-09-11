# Purchase alerts to ge@modernnostalgia.club

Send an admin email every time someone completes a purchase, including the buyer's email address.

## What you'll get

An email to ge@modernnostalgia.club within seconds of any completed payment, showing:
- What was bought (store products, membership plan, or tip)
- Buyer email address
- Amount paid and currency
- Time of purchase and the payment reference

## Coverage

Three payment paths exist today and all three will be covered:
- Store checkout (split sheet, templates, bundles, catalog audit)
- Membership checkout (Club Pass, Accelerator, Artist Incubator)
- Artist tips

Today only membership payments are received back from Stripe; store and tip payments complete without the site being told. That gap gets closed as part of this work.

## How it works

1. Turn on the built-in email system for the project. The sender domain (notify.www.modernnostalgia.club) is already verified, so no DNS work is needed.
2. Add a branded purchase-alert email template with the buyer email, items, and total.
3. Extend the existing Stripe webhook so it also handles store and tip payments instead of rejecting them, and have every completed payment queue one alert email.
4. Tag store and tip checkout sessions with purchase type and item details, and ask Stripe to collect the buyer's email at checkout so it is always available.

Alerts are queued and retried automatically, so a temporary email failure never blocks or breaks a purchase.

## Technical notes

- `email_domain--setup_email_infra` + `scaffold_transactional_email`, then a new template `purchase-alert` in `supabase/functions/_shared/transactional-email-templates/` registered in `registry.ts`.
- `supabase/functions/stripe-membership-webhook/index.ts`: stop returning 400 when membership metadata is absent; branch on `metadata.purchase_type` (`membership` | `store` | `tip`) and always invoke `send-transactional-email` with an idempotency key of the Stripe session id.
- `supabase/functions/create-store-checkout/index.ts`: add `metadata: { purchase_type: "store", items }` and `customer_creation`/email collection; same for `create-tip-payment` with `purchase_type: "tip"`.
- Buyer email read from `session.customer_details.email` with fallback to `customer_email`.
- Requires the store/tip checkout sessions to be delivered to the same Stripe webhook endpoint already configured for memberships.

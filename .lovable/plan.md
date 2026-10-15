# Lab updates email signup

## Goal
Give visitors who are not ready for Patreon a simple way to leave their email and hear about upcoming Lab events and resources.

## What visitors will see
- A compact signup card titled "Not ready for Patreon yet? Get Lab events and resources by email." One email field, a Subscribe button, a one-line note ("Events and resources only. Unsubscribe anytime.").
- Placement:
  - Homepage, between the Events section and Artist Resources (the page most visitors land on).
  - Footer, as a slim one-line version so it appears on every page.
- After submitting: "You're on the list" message in place of the form.

## What happens behind the scenes
- The email is saved to the existing email capture list, tagged `lab-updates` so it is separate from the panel guide and the Connect newsletter signups.
- You get an owner alert at ge@modernnostalgia.club for each new signup (same as the panel guide).
- The new subscriber gets a short automatic "You're on the list" confirmation (a one-to-one reply to their own action, like the panel guide thank-you). Duplicates never send twice.
- Same spam protection as your other forms: hidden trap field, 2 second minimum, rate limit.
- Signups appear in the existing Email Captures admin tab.

## Important limit
Collecting signups and confirming each one works inside the app. Sending an announcement to the whole list later (for example "Lab event on Nov 12") counts as a campaign email, which the app's email system does not support. For those, export the list as CSV from the admin tab and use Mailchimp, ConvertKit or similar. I can add a one-click filter or export for the `lab-updates` signups if you want it.

## Technical details
- New reusable `src/components/LabUpdatesSignup.tsx` (card and compact variants) using `useAntiSpam` (storageKey `lab_updates_cooldown`) and zod email validation; calls the existing `capture-download-email` function with `trackId: 'lab-updates'`.
- `capture-download-email`: add a `lab-updates` branch (insert already works for any trackId) that sends the owner alert via `sendAndLogEmail` and the confirmation to the signer, with idempotency keys `lab-updates-confirm-<email>` and `lab-updates-alert-<email>`, wrapped in try/catch so email failure never breaks the capture. Handle the 23505 duplicate path without re-alerting.
- New email template `lab-updates-confirmation` in `_shared/transactional-email-templates/` (white body, brand blue accents, no promotional content), registered in `registry.ts`. Redeploy `capture-download-email` and `preview-transactional-email`.
- Mount in `MusicBlogHome.tsx` after `<UpcomingEvents />` and in `Footer.tsx`.
- No database changes needed; `download_email_captures` already has admin-only RLS and a unique email + track constraint.
- Not testable from the local preview (origin blocked on forms, same as the others); works on the real domain after publish.

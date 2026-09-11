# Move the last two outside forms onto the site

Two forms still live on other services. Both get rebuilt as native pages that match the site's look, save into the database, show up in the admin area, and email ge@modernnostalgia.club the moment someone submits.

## 1. Sponsors form (currently JotForm)

New page at `/sponsors`. Draft questions (edit freely after you see it):

- Your name (required)
- Email (required)
- Company or brand (required)
- Website or social link
- Role/title
- What kind of partnership are you interested in? (choices: event sponsorship, playlist/content sponsorship, product placement, artist support, other)
- Estimated budget range (choices: under $500, $500-$2,500, $2,500-$10,000, $10,000+, not sure yet)
- Timeline (choices: this month, next 1-3 months, later this year, flexible)
- Tell us about your goals (required, long answer)
- How did you hear about us?

The Connect page "Sponsors" link is switched from the JotForm address to `/sponsors`.

## 2. Playlist submission (currently Google Form)

New page at `/playlist-submit`. Draft questions:

- Your name (required)
- Email (required)
- Artist name (required)
- Song title (required)
- Link to the song (required: Spotify, DISCO, SoundCloud, private link)
- Genre / mood (choices plus free text)
- Is the song fully cleared and owned by you? (yes / partly / not sure)
- Is it instrumental, vocal, or both?
- Release status (unreleased, released, coming soon)
- Anything we should know about the song?
- Consent checkbox: you may share this with supervisors and playlist partners (required)

The homepage "Submit" button and the footer link both point to the new page instead of Google Forms.

## Admin and alerts

- Every submission is saved and visible in the admin area with search and status marking (new / reviewed / archived), same style as the existing application and contact lists.
- Each submission triggers an instant email to ge@modernnostalgia.club with every answer and the sender's email, sent from your own verified address.
- The privacy policy line that mentions JotForm is updated to say forms are handled on-site.

## Spam protection

Both forms use the same protection as your other native forms: a hidden trap field, a minimum time-on-page check, per-address rate limiting, and server-side validation of every field.

## Technical notes

- New tables `sponsor_inquiries` and `playlist_submissions` with created/updated timestamps, status column, RLS that allows public insert only through the submit function and admin-only reads, plus the required grants.
- Two edge functions (`sponsor-inquiry-submit`, `playlist-submission-submit`) following the existing `networking-contact-submit` pattern: honeypot, 2s delay, `check_rate_limit`, strict validation, then insert with the service role.
- Two app email templates registered in `_shared/transactional-email-templates/registry.ts`, sent via `send-transactional-email` with an idempotency key based on the row id.
- New pages `src/pages/Sponsors.tsx` and `src/pages/PlaylistSubmission.tsx` with Helmet metadata, routed in `App.tsx`; `PlaylistSubmit.tsx` and `Footer.tsx` link updates; Connect link row updated in the database.
- Admin views `AdminSponsorInquiries.tsx` and `AdminPlaylistSubmissions.tsx` added to the admin page tabs.

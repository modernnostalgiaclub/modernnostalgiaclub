# Filipino Artist Songwriting Camps: landing page + two applications

## What visitors see

**Landing page at `/camps`** (one link to share everywhere)
- Headline and your pitch: looking for Filipino artists, producers and instrumentalists for two upcoming songwriting camps.
- Two side-by-side cards (stacked on phones):
  1. **Sync Compilation Album**: a compilation built to land TV and film placements for Filipino artists. Button: "Apply for the Sync Album Camp" -> `/camps/sync-album`
  2. **OPM Loop Pack**: a custom loop pack featuring Filipino musicians and native instruments, fixing the lack of sampleable OPM. Button: "Apply for the Loop Pack Camp" -> `/camps/loop-pack`
- Short note that people can apply to both.

**Shared questions on both forms**
- Name, email, artist/stage name (required)
- Role: artist/vocalist, songwriter, producer, instrumentalist (pick any)
- Filipino heritage / connection (short answer)
- City and whether you can attend in person in San Diego, remote only, or either
- Links to your music (required)
- Why you want to be part of this (required)
- How did you hear about us?

**Sync Album form extras**
- Genres you write in
- Have you had a sync placement before? (yes / no) + details
- Do you own or control your masters and publishing? (yes / partly / not sure)
- PRO affiliation

**Loop Pack form extras**
- Instruments you play (including native instruments like kulintang, rondalla/bandurria, kubing, gangsa, etc.)
- Can you record at home in good quality? (yes / no / with help)
- Comfortable with your loops being licensed royalty-free to producers? (yes / want to discuss)

## After someone applies
- Saved and shown in a new "Camps" admin tab (search, filter by camp, status: new / reviewed / accepted / declined), plus in the Inbox and daily counter.
- You get an instant email at ge@modernnostalgia.club with every answer.
- The applicant gets a confirmation email ("Thanks for applying to the [camp] camp, we'll be in touch").

## Where it's linked
- First item in the Connect list ("Apply: Filipino Songwriting Camps")
- A card on the homepage
- A footer link

## Spam protection
Same as your other forms: hidden trap field, time-on-page check, rate limiting, server-side validation.

## Technical details
- New table `camp_applications` (camp enum-like text `sync-album` | `loop-pack`, shared columns, `details jsonb` for camp-specific answers, status, timestamps); GRANTs + RLS: admin-only select/update, no public insert (edge function inserts with service role).
- Edge function `camp-application-submit` following `interview-request-submit`: honeypot, 2s check, `check_rate_limit`, zod validation per camp, insert, then `sendAndLogEmail` for `form-submission-alert` (owner) and new template `camp-application-confirmation` (applicant), idempotency keyed on row id. Own `deno.json`, config entry `verify_jwt = false`, deploy with `preview-transactional-email`.
- Pages `src/pages/Camps.tsx`, `CampApplication.tsx` (one component, parameterized by camp) with Helmet metadata; routes in `App.tsx`; `pt-20` header offset.
- `AdminCampApplications.tsx` tab in `Admin.tsx`; added to `AdminFormActivity` and `AdminDailyFormCounter`.
- Links: Connect `FUNNEL_LINKS` first entry, homepage card in `MusicBlogHome.tsx`, `Footer.tsx`; add `/camps` to sitemap.

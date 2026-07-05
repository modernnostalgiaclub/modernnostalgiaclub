
## Goal
Add an admin-only "Newsletter" section to the Admin panel that lets you send a newsletter to your Mailchimp audience using a saved template from your Mailchimp account.

## Setup (one-time)
1. You generate a Mailchimp API key (Mailchimp → Account → Extras → API keys). The key includes a server prefix like `-us21`.
2. I request three secrets via the secure form:
   - `MAILCHIMP_API_KEY`
   - `MAILCHIMP_SERVER_PREFIX` (e.g. `us21`)
   - `MAILCHIMP_AUDIENCE_ID` (your list ID — Audience → Settings → Audience name and defaults)

## Backend: 2 edge functions (admin-only, JWT verified + `has_role('admin')` check)

**`mailchimp-list-templates`** — GET
- Calls `GET https://{dc}.api.mailchimp.com/3.0/templates?type=user&count=100&fields=templates.id,templates.name,templates.thumbnail`
- Returns the list of your saved templates so the UI can render a dropdown with thumbnails.

**`mailchimp-send-campaign`** — POST
Input (validated with Zod): `{ templateId: number, subject: string, previewText?: string, fromName: string, replyTo: string, sendTest?: boolean, testEmail?: string }`

Flow:
1. `POST /campaigns` with `type: "regular"`, `recipients.list_id = MAILCHIMP_AUDIENCE_ID`, `settings: { subject_line, preview_text, from_name, reply_to, template: { id: templateId } }`.
2. If `sendTest` → `POST /campaigns/{id}/actions/test` with `{ test_emails: [testEmail], send_type: "html" }` and return.
3. Otherwise → `POST /campaigns/{id}/actions/send` and return `{ campaignId, webId }`.

Auth to Mailchimp: `Authorization: Basic base64("anystring:" + MAILCHIMP_API_KEY)`.

## Frontend: `src/components/AdminNewsletter.tsx`
Added as a new tab/section in `src/pages/Admin.tsx` (behind the existing admin gate + MFA gate you already use).

UI:
- Template picker: grid of your Mailchimp templates (thumbnail + name), loaded from `mailchimp-list-templates`.
- Fields: Subject line, Preview text, From name (default "Modern Nostalgia Club"), Reply-to email (default your contact address).
- Buttons: **Send test to me** (uses signed-in user's email) and **Send to audience** (with a confirmation dialog showing audience name).
- Success toast links to the campaign report in Mailchimp (`https://{dc}.admin.mailchimp.com/campaigns/show?id={webId}`).

No new database tables. No member sync. No scheduling. Rich-text composing is done inside Mailchimp when you design the template — the dashboard just picks it and sends.

## Out of scope (say the word if you want any of these later)
- Scheduling sends
- Campaign history / open + click stats view
- Syncing your site members into a Mailchimp audience
- Editing template content from the dashboard (Mailchimp templates with `*|MERGE|*` variables can be filled from our side — happy to add if useful)

## Technical notes
- Base URL: `https://{MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0`
- All Mailchimp calls happen server-side in edge functions — the API key never touches the browser.
- Both functions return CORS headers and 4xx on validation failure.

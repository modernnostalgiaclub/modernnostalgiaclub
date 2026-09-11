# Discovery call booking and form links

## What will change
- Add the native Discovery Call booking link to the Connect page alongside the existing Sponsorship and Playlist Submission links.
- Keep the full `/book-call` landing page as the on-site booking experience, with contact details, discussion topic, preferred time, backup time, timezone, and notes.
- Add a branded booking confirmation email sent to the person who submitted the form.
- Keep the owner alert to `ge@modernnostalgia.club`, including the booker’s email and all booking details.
- Treat the owner message as a booking alert rather than a purchase receipt, since no payment occurs in this flow.

## Technical details
- Register a dedicated booking confirmation email template with the existing app-email sender.
- Trigger the customer confirmation and owner alert only after the booking is saved.
- Use separate idempotency keys so retries cannot duplicate either email.
- Deploy the updated email sender and booking function, then test the booking flow and email records.

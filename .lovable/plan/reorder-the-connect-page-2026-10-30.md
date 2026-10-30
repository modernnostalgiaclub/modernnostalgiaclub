# Reorder the Connect page

New order under your name and social icons:

1. **Featured button: Roll N Lumpia** — a highlighted, eye-catching button linking to https://rollnlumpia.com (opens in a new tab).
2. **Latest Patreon Post** card (unchanged, auto-updates).
3. **Email capture** — the "Download the PDF Breakdown" panel guide signup.
4. **Playlists** — the two Spotify players (R&B(aboy), SA(RAP)), followed by the Spotify Playlist Network list.
5. **Everything else** in its current order: link list (Get Interviewed first), Join the Club, Stay in the loop newsletter, contact form, footer.

## Technical details
- `src/pages/Connect.tsx` only: add a featured anchor block using the existing primary blue styling, then move JSX blocks (Latest Patreon card out of the Featured Playlists block, Panel Guide above, Spotify players + Playlist Network together).
- No logic, data or form changes. Verify with a Playwright screenshot.

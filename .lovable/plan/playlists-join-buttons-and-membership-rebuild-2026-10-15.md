# Playlists, Join buttons, and membership rebuild

## Part 1: Quick site changes (do now)

1. **"Listen to our Playlist" section**: replace the two YouTube players (Day Party, MNC Artists) with your Spotify players for R&B(aboy) and SA(RAP). They sit side by side on computers and stack on phones. Heading becomes "Listen to our Playlists".
   - Your homepage also has a separate "Featured Playlists" section with the same two players. To avoid showing them twice, that section gets removed, so the dark "Listen" section is the one home for them.
2. **Join the Club buttons go to Patreon** (www.patreon.com/modernnostalgiaclub, opens in a new tab):
   - Top menu link and button (desktop and phone menu)
   - Homepage, About, Blog, and Connect page Join buttons
   - Footer link
   - The /join page stays where it is but isn't linked anywhere. Checkout's "Back to plans" links stay because only someone who already reached checkout sees them.

## Part 2: Membership rebuild (plan first, build after you review)

You keep the Skool-style classroom and fill it with lessons drawn from your "90 Days of Patreon" series.

1. I pull every "90 Days of Patreon" post (Day 1 to the latest) and group them into courses by topic. Examples might be rights and splits, sync readiness, release strategy, and the creative economy and AI.
2. I send you a draft outline of course names, lesson order, and which day becomes which lesson, before anything changes in the classroom.
3. Once you approve it, each lesson gets a title, a short summary in your voice, key takeaways, and a link to the full Patreon post. Lessons are not full copies of the posts.
4. Old lessons are hidden instead of deleted, so member progress history is kept.

Membership stays unpromoted until you say it's ready.

## Technical details

- `MNCPlayer.tsx`: swap the YouTube iframes for Spotify embeds (352px, R&B(aboy) with theme=0, SA(RAP)). Remove the `FeaturedPlaylists` usage from `MusicBlogHome.tsx`.
- Use a shared `PATREON_URL` from `usePatreonPosts.ts`. Replace `/join` links in Header (nav item, button, mobile handler), MusicBlogHome, AboutPage, BlogIndex, Connect, and Footer with external `<a target="_blank" rel="noopener noreferrer">`.
- Curriculum: read posts with the existing `patreon-posts` function and filter titles that contain "Day N". Write a draft outline file for review. After approval, insert into the existing `courses` and `lessons` tables and set old rows unpublished. No schema changes are expected; this gets confirmed before building.

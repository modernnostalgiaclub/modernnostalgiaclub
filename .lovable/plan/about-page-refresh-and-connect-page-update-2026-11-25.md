# About page refresh and Connect page update

## 1. Menu

Add "Who We Are" to the main menu (desktop and phone), under Club & Media, linking to the About page. The footer link stays.

## 2. About page

New order of the page:

1. Photo banner (unchanged)
2. Who We Are (existing text, unchanged)
3. What We Stand For (new, replaces Meet the Founder)
4. Quote band (unchanged)
5. Contact (new)
6. Join the Club (unchanged)

Meet the Founder is removed, along with the founder photo.

### What We Stand For: draft pillars

Shown as four numbered rows in the same black, white and khaki editorial look as the homepage. Draft wording, based on what the site already says about the club. Edit any of it before or after approval.

- **Human First Music.** Music made by people, for people. We are open about how songs get made and we back artists who document their process.
- **Ownership.** Know what you own, register it properly and collect what you are owed. Publishing, splits and rights come before promotion.
- **Income Beyond Streams.** Sync licensing, direct to fan support and services that pay. Streaming is one channel, not the plan.
- **Community Over Competition.** Camps, workshops and playlists that put independent artists in the same room, with a focus on lifting Filipino and API creators.

### Contact section

A short block with the support email, a blue "Contact Us" button that opens the existing Contact page, and a second link to the Connect page. No new form, so messages keep going through the one existing contact form and its spam protection.

## 3. Connect page

### New order

1. Logo, name and social icons
2. Work With Me: three links, one per service
   - Mogul Publishing Audit
   - 1-on-1 Sync Consult
   - Combined Bundle
3. Roll N Lumpia (featured)
4. PitchClub
5. MixtapeClub (new, right after PitchClub, same description as the homepage)
6. Latest Patreon post
7. Featured playlists and the Spotify playlist network
8. The rest of the link list
9. Fil Am CreatorCon panel PDF signup (moved way down)
10. Join the Club, newsletter, contact form, footer

Each Work With Me link opens the matching service request form with that service already selected, the same as the homepage buttons. Each shows the Black Friday price next to the crossed out regular price ($99 instead of $149, $99 instead of $149, $179 instead of $249). When the sale ends at midnight Pacific on December 1, the links switch back to regular prices and the Black Friday label disappears on its own.

### Bringing the link list in line with the site

- Add "Bi-Weekly Artist Workshops" (opens the workshops page).
- Remove "Book a Catalog Audit", since the three Work With Me links now cover it.
- Keep everything else: camps, interview, discovery call, Patreon, quiz, store, resources, playlist submissions, sponsors and the partner links.

### Look

Restyle Connect to match the homepage: black background, white and khaki text, blue (#1194ff) for the Work With Me links and main buttons in place of the current maroon. Also remove the dash from "Join the Club — It's Free" to follow the site's no dashes rule.

## Technical details

- `src/lib/siteNavigation.ts`: add `{ label: 'Who We Are', url: '/about' }` to the Club & Media lane (shared by desktop and mobile).
- `src/pages/AboutPage.tsx`: delete the founder section and the `founderImg` import; add pillars and contact sections using existing editorial classes and semantic tokens.
- `src/pages/Connect.tsx`: render service links from `HOME_SERVICES`, `getBlackFridayPhase` and `displayedServicePrice` in `src/lib/homepageOffers.ts` so prices and sale dates stay in one place; add MixtapeClub card; move the guide capture block below the funnel links; edit `FUNNEL_LINKS`; swap maroon and cream utility classes for the public editorial tokens.
- No database, email or checkout changes. Existing offer tests already cover prices and sale boundaries; run them after the change.
- Verify in the browser at desktop and phone widths: menu link, About page order, Connect order and service links landing on the right preselected form.

# Feature PitchClub (pitch.modernnostalgia.club)

All links open pitch.modernnostalgia.club in a new tab.

1. **Menu:** add "PitchClub" to the top menu (desktop and phone), for both signed-out visitors and signed-in members, next to Store.
2. **/connect:** add a "PitchClub by modernnostalgia.club" button right under the featured Roll N Lumpia button, with a one-line description.
3. **Homepage:** add a PitchClub card right after the blog section (before Events), styled like the existing Camps card, with a short description and a "Visit PitchClub" button.

Description copy (placeholder until you tell me otherwise): "Pitch your music for sync and placement opportunities, curated by modernnostalgia.club."

## Technical details
- `Header.tsx` nav arrays: add `{ label: 'PitchClub', url: 'https://pitch.modernnostalgia.club' }` (external URLs already render as new-tab anchors).
- Connect page links list: new entry after the Roll N Lumpia block.
- `MusicBlogHome.tsx`: new `PitchClubCTA` section after `<EditorialArticles />`, using existing tokens.

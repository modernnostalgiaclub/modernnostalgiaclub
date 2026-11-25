export const PATREON_PAGE_URL = 'https://www.patreon.com/modernnostalgiaclub';
export const PLAYLIST_SUBMISSION_URL = 'https://playlistpanda.com/c/modernnostalgiaclub?ref=cmufw676g00050agm7i23a7au';

export const SITE_NAVIGATION = [
  {
    label: 'Services',
    links: [
      { label: 'Mogul Publishing Audit', url: '/#book-audit' },
      { label: 'Sync Consult', url: '/#book-consult' },
      { label: 'Combined Bundle', url: '/#book-bundle' },
    ],
  },
  {
    label: 'Events',
    links: [
      { label: 'Songwriting Camps', url: '/#events' },
      { label: 'Bi-Weekly Workshops', url: '/#workshops' },
    ],
  },
  {
    label: 'Tools & Kits',
    links: [
      { label: 'PitchClub', url: 'https://pitch.modernnostalgia.club' },
      { label: 'MixtapeClub', url: 'https://mixtape.modernnostalgia.club' },
      { label: 'Field Guides & Kits', url: '/#field-kits' },
      { label: 'Sync-Ready Quiz', url: '/sync-quiz' },
    ],
  },
  {
    label: 'Club & Media',
    links: [
      { label: 'Who We Are', url: '/about' },
      { label: 'Join the Club / Patreon', url: PATREON_PAGE_URL },
      { label: 'Playlists', url: '/#playlists' },
      { label: 'Blog', url: '/blog' },
      { label: 'Artist Resources', url: '/artistresources' },
    ],
  },
] as const;
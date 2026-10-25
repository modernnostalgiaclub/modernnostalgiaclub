export type CampSlug = 'sync-album' | 'loop-pack';

export const CAMPS: Record<CampSlug, { name: string; short: string; pitch: string }> = {
  'sync-album': {
    name: 'Sync Compilation Album Camp',
    short: 'Sync Compilation Album',
    pitch: 'A dedicated compilation album built to secure TV and film placements specifically for Filipino artists.',
  },
  'loop-pack': {
    name: 'OPM Loop Pack Camp',
    short: 'OPM Loop Pack',
    pitch: 'A custom loop pack featuring Filipino musicians and native instruments. There is an absolute lack of sampleable OPM in the production space right now, and we are building our own resource to fix that.',
  },
};

export const CAMP_ROLES = ['Artist / vocalist', 'Songwriter', 'Producer', 'Instrumentalist'];
export const CAMP_ATTENDANCE = ['In person in San Diego', 'Remote only', 'Either'];

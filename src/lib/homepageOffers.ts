// Pacific dates are explicit so the promotion ends at midnight in California.
export const BLACK_FRIDAY_START = '2026-11-27T00:00:00-08:00';
export const BLACK_FRIDAY_END = '2026-12-01T00:00:00-08:00';

export function getBlackFridayPhase(now: Date = new Date()): 'upcoming' | 'active' | 'ended' {
  if (now.getTime() < new Date(BLACK_FRIDAY_START).getTime()) return 'upcoming';
  if (now.getTime() < new Date(BLACK_FRIDAY_END).getTime()) return 'active';
  return 'ended';
}

export const HOME_SERVICES = [
  {
    id: 'book-audit',
    name: 'Mogul Publishing Audit',
    regularPrice: 149,
    blackFridayPrice: 99,
    description: 'Find out where your publishing money is going and what might be missing.',
    details: ['MLC, PRO and Songview checks', 'Split mismatches and uncollected royalties', 'A written action report with next steps'],
    action: 'Book the Audit',
    bookingUrl: '#book-audit',
  },
  {
    id: 'book-consult',
    name: '1-on-1 Sync Consult',
    regularPrice: 149,
    blackFridayPrice: 99,
    durationMinutes: 60,
    minimumTracks: 3,
    maximumTracks: 5,
    description: 'A 60-minute live review of 3 to 5 tracks, with a clear plan for pitching your music.',
    details: ['One-stop clearance and rights review', 'Stems, instrumentals and metadata', 'Pitch targets that fit your tracks'],
    action: 'Book the Consult',
    bookingUrl: '#book-consult',
  },
  {
    id: 'book-bundle',
    name: 'Audit + Consult Bundle',
    regularPrice: 249,
    blackFridayPrice: 179,
    separateValue: 298,
    description: 'Start with the paperwork, then work through the music. Both services in one booking.',
    details: ['The full Mogul Publishing Audit', 'The 60-minute 1-on-1 Sync Consult', 'One plan for your catalog and next pitches'],
    action: 'Book the Bundle',
    bookingUrl: '#book-bundle',
  },
] as const;

export const WORKSHOP_PRICING = { regular: 25, blackFriday: 15, patreonMember: 0, durationMinutes: 60 };
export const BLACK_FRIDAY_DISCOUNTS = { decemberCampDepositPercent: 20, fieldKitsPercent: 40, bundleIncludesFieldKits: true };

export function displayedServicePrice(service: typeof HOME_SERVICES[number], now: Date = new Date()) {
  return getBlackFridayPhase(now) === 'ended' ? service.regularPrice : service.blackFridayPrice;
}
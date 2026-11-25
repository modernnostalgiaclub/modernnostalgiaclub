import { z } from 'zod';

export const WORKSHOP_TOPICS = ['Sync pitching', 'Publishing', 'Independent rollouts', 'Other'] as const;
export const WORKSHOP_ATTENDANCE = ['In person', 'Online', 'Either'] as const;
export const workshopSchema = z.object({
  name: z.string().trim().min(1, 'Your name is required').max(100),
  email: z.string().trim().email('Enter a valid email address').max(255).transform((v) => v.toLowerCase()),
  artist_name: z.string().trim().max(100).default(''),
  city: z.string().trim().max(120).default(''),
  topics: z.array(z.enum(WORKSHOP_TOPICS)).min(1, 'Choose at least one topic').max(4),
  attendance: z.enum(WORKSHOP_ATTENDANCE),
  links: z.string().trim().max(1000).default(''),
  notes: z.string().trim().max(3000).default(''),
});

export function passesWorkshopSpamCheck(body: { _hp?: unknown; _ts?: unknown }, now = Date.now()) {
  return typeof body._hp === 'string' && body._hp.trim() === '' &&
    typeof body._ts === 'number' && Number.isFinite(body._ts) && now - body._ts >= 2000;
}
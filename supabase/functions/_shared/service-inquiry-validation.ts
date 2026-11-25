import { z } from 'zod';

export const SERVICE_IDS = ['book-audit', 'book-consult', 'book-bundle'] as const;
export const SERVICE_NAMES = {
  'book-audit': 'Mogul Publishing Audit',
  'book-consult': '1-on-1 Sync Consult',
  'book-bundle': 'Audit + Consult Bundle',
} as const;
export const SERVICE_REQUEST_STATUSES = ['new', 'reviewing', 'contacted', 'closed'] as const;

export const serviceInquirySchema = z.object({
  service: z.enum(SERVICE_IDS, { error: 'Please choose a service' }),
  name: z.string().trim().min(1, 'Your name is required').max(100),
  email: z.string().trim().email('Enter a valid email address').max(255).transform((v) => v.toLowerCase()),
  artist_name: z.string().trim().max(100).default(''),
  needs: z.string().trim().min(1, 'Tell us what you need help with').max(3000),
  links: z.string().trim().max(1000).default(''),
  preferred_timing: z.string().trim().max(500).default(''),
});

export function selectedService(value: string | null): typeof SERVICE_IDS[number] | '' {
  return SERVICE_IDS.find((id) => id === value) ?? '';
}

export function passesServiceSpamCheck(body: { _hp?: unknown; _ts?: unknown }, now = Date.now()) {
  return typeof body._hp === 'string' && body._hp.trim() === '' &&
    typeof body._ts === 'number' && Number.isFinite(body._ts) && now - body._ts >= 2000;
}
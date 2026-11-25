import { describe, test, expect } from 'bun:test';
import { serviceInquirySchema, selectedService, passesServiceSpamCheck, SERVICE_NAMES } from '../../supabase/functions/_shared/service-inquiry-validation';
import { HOME_SERVICES } from './homepageOffers';

const valid = { service: 'book-audit', name: 'Artist', email: 'artist@example.com', needs: 'Help reviewing my publishing registrations.' };
describe('service booking inquiries', () => {
  for (const [id, name] of Object.entries(SERVICE_NAMES)) {
    test(`${name} is selectable and the service button opens its inquiry`, () => {
      expect(serviceInquirySchema.parse({ ...valid, service: id }).service).toBe(id);
      expect(selectedService(id)).toBe(id);
      const offer = HOME_SERVICES.find((item) => item.id === id);
      expect(offer?.bookingUrl).toBe(`/service-inquiry?service=${id}`);
    });
  }
  test('unrecognized services cannot be submitted or preselected', () => {
    expect(serviceInquirySchema.safeParse({ ...valid, service: 'unlisted-service' }).success).toBe(false);
    expect(selectedService('unlisted-service')).toBe('');
    expect(selectedService(null)).toBe('');
  });
  test('visitors must share their needs', () => {
    expect(serviceInquirySchema.safeParse({ ...valid, needs: '  ' }).success).toBe(false);
  });
  test('requires a contact name and valid email', () => {
    expect(serviceInquirySchema.safeParse({ ...valid, name: '' }).success).toBe(false);
    expect(serviceInquirySchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false);
  });
  test('a request does not accept payment or confirmed reservation state from visitors', () => {
    const request = serviceInquirySchema.parse({ ...valid, status: 'confirmed', paid: true, amount: 0 });
    expect(request).not.toHaveProperty('status');
    expect(request).not.toHaveProperty('paid');
    expect(request).not.toHaveProperty('amount');
  });
  test('requires two seconds and an empty honeypot before submission', () => {
    expect(passesServiceSpamCheck({ _hp: '', _ts: 1000 }, 2999)).toBe(false);
    expect(passesServiceSpamCheck({ _hp: '', _ts: 1000 }, 3000)).toBe(true);
    expect(passesServiceSpamCheck({ _hp: 'spam', _ts: 1000 }, 3000)).toBe(false);
    expect(passesServiceSpamCheck({ _hp: '' }, 3000)).toBe(false);
  });
});
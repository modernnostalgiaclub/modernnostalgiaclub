import { describe, expect, test } from 'bun:test';
import { workshopSchema, passesWorkshopSpamCheck } from '../../supabase/functions/_shared/workshop-validation';
import { eventbriteId, isUpcomingEvent } from '../../supabase/functions/_shared/eventbrite-listings';

describe('workshop signup rules', () => {
  const valid = { name: 'Artist', email: 'artist@example.com', topics: ['Publishing'], attendance: 'Either' };
  test('requires a topic instead of accepting an empty interest signup', () => {
    expect(workshopSchema.safeParse({ ...valid, topics: [] }).success).toBe(false);
    expect(workshopSchema.safeParse(valid).success).toBe(true);
  });
  test('rejects invalid email addresses', () => {
    expect(workshopSchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false);
  });
  test('enforces the two second form delay', () => {
    expect(passesWorkshopSpamCheck({ _hp: '', _ts: 10000 }, 11999)).toBe(false);
    expect(passesWorkshopSpamCheck({ _hp: '', _ts: 10000 }, 12000)).toBe(true);
  });
  test('rejects filled honeypots and missing timestamps', () => {
    expect(passesWorkshopSpamCheck({ _hp: 'spam', _ts: 10000 }, 13000)).toBe(false);
    expect(passesWorkshopSpamCheck({ _hp: '' }, 13000)).toBe(false);
  });
});

describe('Eventbrite import rules', () => {
  test('extracts the event ID from a ticket link', () => {
    expect(eventbriteId('https://www.eventbrite.com/e/artist-workshop-tickets-1992831491637?aff=share')).toBe('1992831491637');
  });
  test('rejects non-Eventbrite or insecure URLs', () => {
    expect(eventbriteId('https://eventbrite.com.attacker.com/e/123')).toBeNull();
    expect(eventbriteId('http://eventbrite.com/e/123')).toBeNull();
    expect(eventbriteId('https://eventbrite.com@attacker.com/e/123')).toBeNull();
  });
  test('past, draft and cancelled events do not replace open applications', () => {
    const now = new Date('2026-12-01T12:00:00Z').getTime();
    expect(isUpcomingEvent({ status: 'live', end_utc: '2026-12-01T12:00:00Z' }, now)).toBe(false);
    expect(isUpcomingEvent({ status: 'draft', end_utc: '2026-12-02T12:00:00Z' }, now)).toBe(false);
    expect(isUpcomingEvent({ status: 'canceled', end_utc: '2026-12-02T12:00:00Z' }, now)).toBe(false);
    expect(isUpcomingEvent({ status: 'live', end_utc: '2026-12-02T12:00:00Z' }, now)).toBe(true);
  });
});
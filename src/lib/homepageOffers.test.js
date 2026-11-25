import { describe, expect, test } from 'bun:test';
import { BLACK_FRIDAY_DISCOUNTS, displayedServicePrice, getBlackFridayPhase, HOME_SERVICES, WORKSHOP_PRICING } from './homepageOffers';

describe('Home service prices', () => {
  test('Mogul audit is $149 regular and $99 Black Friday', () => {
    expect(HOME_SERVICES[0].regularPrice).toBe(149);
    expect(HOME_SERVICES[0].blackFridayPrice).toBe(99);
  });
  test('Sync consult is $149 regular and $99 Black Friday', () => {
    expect(HOME_SERVICES[1].regularPrice).toBe(149);
    expect(HOME_SERVICES[1].blackFridayPrice).toBe(99);
  });
  test('Bundle is $249 regular and $179 Black Friday with a $298 separate value', () => {
    expect(HOME_SERVICES[2].regularPrice).toBe(249);
    expect(HOME_SERVICES[2].blackFridayPrice).toBe(179);
    expect(HOME_SERVICES[2].separateValue).toBe(298);
  });
  test('Sync consult reviews 3 to 5 tracks in 60 minutes', () => {
    expect(HOME_SERVICES[1].durationMinutes).toBe(60);
    expect(HOME_SERVICES[1].minimumTracks).toBe(3);
    expect(HOME_SERVICES[1].maximumTracks).toBe(5);
  });
  test('Workshop is $25 regular and $15 Black Friday', () => {
    expect(WORKSHOP_PRICING.regular).toBe(25);
    expect(WORKSHOP_PRICING.blackFriday).toBe(15);
  });
  test('Workshop is free for Patreon Club members', () => {
    expect(WORKSHOP_PRICING.patreonMember).toBe(0);
  });
  test('Workshop is a 60-minute working session', () => {
    expect(WORKSHOP_PRICING.durationMinutes).toBe(60);
  });
  test('December camp deposit gets 20% off', () => {
    expect(BLACK_FRIDAY_DISCOUNTS.decemberCampDepositPercent).toBe(20);
  });
  test('Field kits get 40% off', () => {
    expect(BLACK_FRIDAY_DISCOUNTS.fieldKitsPercent).toBe(40);
  });
  test('Field kits are included in the Black Friday bundle', () => {
    expect(BLACK_FRIDAY_DISCOUNTS.bundleIncludesFieldKits).toBe(true);
  });
  test('Black Friday opens November 27 in Pacific time, with a dated preview beforehand', () => {
    expect(getBlackFridayPhase(new Date('2026-11-27T07:59:59Z'))).toBe('upcoming');
    expect(getBlackFridayPhase(new Date('2026-11-27T08:00:00Z'))).toBe('active');
  });
  test('Black Friday closes after November 30 at 11:59 PM Pacific and restores regular prices', () => {
    const lastMinute = new Date('2026-12-01T07:59:59Z');
    const ended = new Date('2026-12-01T08:00:00Z');
    expect(getBlackFridayPhase(lastMinute)).toBe('active');
    expect(getBlackFridayPhase(ended)).toBe('ended');
    expect(HOME_SERVICES.map(service => displayedServicePrice(service, lastMinute))).toEqual([99, 99, 179]);
    expect(HOME_SERVICES.map(service => displayedServicePrice(service, ended))).toEqual([149, 149, 249]);
  });
});
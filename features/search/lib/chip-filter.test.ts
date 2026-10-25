import { describe, expect, it } from 'vitest';
import { matchesChip, matchesChips, type ChipCandidate, type ChipContext } from './chip-filter';

const branchId = 'b1';
const item: ChipCandidate = {
  diet: 'nonveg',
  pricePaise: 28_000,
  categorySlug: 'biryani',
  branchId,
  branchTags: ['rainy-day'],
  branchLocation: { lat: 17.3616, lng: 78.4747 },
};
// Open daily 12:00–23:30 IST.
const hours = Array.from({ length: 7 }, (_, dayOfWeek) => ({
  dayOfWeek,
  opensAt: '12:00',
  closesAt: '23:30',
}));
// 2026-10-25 is a Sunday; 14:00 IST = 08:30 UTC.
const afternoon = new Date('2026-10-25T08:30:00Z');
const morning = new Date('2026-10-25T04:30:00Z');
const context: ChipContext = {
  hours: { [branchId]: hours },
  timezone: 'Asia/Kolkata',
  now: afternoon,
  location: null,
};

describe('matchesChip', () => {
  it('filters open now and after 11 pm by the branch hours', () => {
    expect(matchesChip(item, 'open-now', context)).toBe(true);
    expect(matchesChip(item, 'open-now', { ...context, now: morning })).toBe(false);
    expect(matchesChip(item, 'late-night', context)).toBe(true);
    const early = { [branchId]: hours.map((row) => ({ ...row, closesAt: '22:00' })) };
    expect(matchesChip(item, 'late-night', { ...context, hours: early })).toBe(false);
  });

  it('waits for the client clock before applying time chips', () => {
    expect(matchesChip(item, 'open-now', { ...context, now: null, hours: {} })).toBe(true);
  });

  it('filters price, diet and the biryani category', () => {
    expect(matchesChip(item, 'under-300', context)).toBe(true);
    expect(matchesChip({ ...item, pricePaise: 30_001 }, 'under-300', context)).toBe(false);
    expect(matchesChip({ ...item, pricePaise: null }, 'under-300', context)).toBe(false);
    expect(matchesChip(item, 'veg', context)).toBe(false);
    expect(matchesChip({ ...item, diet: 'veg' }, 'veg', context)).toBe(true);
    expect(matchesChip(item, 'biryani', context)).toBe(true);
    expect(matchesChip({ ...item, categorySlug: 'haleem' }, 'biryani', context)).toBe(false);
  });

  it('filters occasions by branch tags', () => {
    expect(matchesChip(item, 'rainy-day', context)).toBe(true);
    expect(matchesChip(item, 'date-night', context)).toBe(false);
  });

  it('filters within 3 km only once location is known', () => {
    expect(matchesChip(item, 'within-3km', context)).toBe(true);
    const charminar = { lat: 17.3616, lng: 78.4747 };
    const hitec = { lat: 17.4435, lng: 78.3772 };
    expect(matchesChip(item, 'within-3km', { ...context, location: charminar })).toBe(true);
    expect(matchesChip(item, 'within-3km', { ...context, location: hitec })).toBe(false);
  });
});

it('requires every selected chip', () => {
  expect(matchesChips(item, ['open-now', 'under-300', 'biryani'], context)).toBe(true);
  expect(matchesChips(item, ['open-now', 'veg'], context)).toBe(false);
  expect(matchesChips(item, [], context)).toBe(true);
});

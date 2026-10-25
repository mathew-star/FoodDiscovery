import { describe, expect, it } from 'vitest';
import { hasActiveFilters, matchesFilters, type FilterableDish } from './search-filters';

const dish: FilterableDish = {
  localitySlug: 'old-city',
  cuisineSlug: 'hyderabadi',
  diet: 'egg',
  branchPriceBand: 2,
  branchLocation: { lat: 17.3616, lng: 78.4747 },
};
const nearby = { lat: 17.37, lng: 78.48 };

describe('matchesFilters', () => {
  it('passes with no filters', () => {
    expect(matchesFilters(dish, {}, null)).toBe(true);
    expect(hasActiveFilters({})).toBe(false);
  });

  it('applies area, cuisine, diet and price band', () => {
    expect(matchesFilters(dish, { area: 'old-city' }, null)).toBe(true);
    expect(matchesFilters(dish, { area: 'madhapur' }, null)).toBe(false);
    expect(matchesFilters(dish, { cuisine: 'arabian' }, null)).toBe(false);
    expect(matchesFilters(dish, { diet: 'egg' }, null)).toBe(true);
    expect(matchesFilters(dish, { diet: 'veg' }, null)).toBe(false);
    expect(matchesFilters(dish, { price: 2 }, null)).toBe(true);
    expect(matchesFilters(dish, { price: 1 }, null)).toBe(false);
  });

  it('applies distance only with a location', () => {
    expect(matchesFilters(dish, { km: 1 }, null)).toBe(true);
    expect(matchesFilters(dish, { km: 3 }, nearby)).toBe(true);
    expect(matchesFilters(dish, { km: 1 }, { lat: 17.44, lng: 78.38 })).toBe(false);
  });
});

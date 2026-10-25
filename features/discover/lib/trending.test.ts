import { describe, expect, it } from 'vitest';
import { rankingConfigDefaults } from '@/features/ratings/schemas/ranking-config';
import type { RankableDish } from '@/features/search/lib/rank-results';
import { pickTrending } from './trending';

const config = rankingConfigDefaults.discovery_ranking;
const oldCity = { lat: 17.3616, lng: 78.4747 };
const madhapur = { lat: 17.4483, lng: 78.3915 };
const context = { hours: {}, timezone: 'Asia/Kolkata', now: null, location: null };

function dish(n: number, branch: string, location = oldCity, saves = 0): RankableDish {
  return {
    id: `d${String(n).padStart(2, '0')}`,
    diet: 'nonveg',
    pricePaise: 20_000,
    categorySlug: null,
    branchId: branch,
    branchTags: [],
    branchLocation: location,
    score: 0.7,
    textRank: 0,
    popularity: { saves, ratings: 0, directions: 0 },
    daysSinceLastRating: 5,
    cuisineSlug: null,
  };
}

describe('pickTrending', () => {
  it('keeps at most two per branch and the top twelve, popular first', () => {
    const dishes = [
      ...Array.from({ length: 5 }, (_, n) => dish(n, 'busy', oldCity, 50)),
      ...Array.from({ length: 20 }, (_, n) => dish(10 + n, `b${n}`)),
    ];
    const { scope, items } = pickTrending(dishes, context, config);
    expect(scope).toBe('city');
    expect(items).toHaveLength(12);
    expect(items.slice(0, 2).map((entry) => entry.dish.branchId)).toEqual(['busy', 'busy']);
    expect(items.filter((entry) => entry.dish.branchId === 'busy')).toHaveLength(2);
  });

  it('stays near the guest when enough dishes are within 5 km', () => {
    const dishes = [
      ...Array.from({ length: 4 }, (_, n) => dish(n, `near${n}`, oldCity)),
      ...Array.from({ length: 4 }, (_, n) => dish(10 + n, `far${n}`, madhapur, 99)),
    ];
    const { scope, items } = pickTrending(dishes, { ...context, location: oldCity }, config);
    expect(scope).toBe('near');
    expect(items.every((entry) => entry.dish.branchId.startsWith('near'))).toBe(true);
  });

  it('widens to the city when fewer than four are nearby', () => {
    const dishes = [
      dish(1, 'near', oldCity),
      ...Array.from({ length: 6 }, (_, n) => dish(10 + n, `far${n}`, madhapur)),
    ];
    const { scope, items } = pickTrending(dishes, { ...context, location: oldCity }, config);
    expect(scope).toBe('city');
    expect(items).toHaveLength(7);
  });
});

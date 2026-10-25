import { describe, expect, it } from 'vitest';
import { rankingConfigDefaults } from '@/features/ratings/schemas/ranking-config';
import { rankDishes, type RankableDish } from './rank-results';

const config = { discovery: rankingConfigDefaults.discovery_ranking, search: rankingConfigDefaults.search };
const near = { lat: 17.3616, lng: 78.4747 };
const far = { lat: 17.4435, lng: 78.3772 };

function dish(overrides: Partial<RankableDish> & Pick<RankableDish, 'id'>): RankableDish {
  return {
    diet: 'nonveg',
    pricePaise: 25_000,
    categorySlug: 'biryani',
    branchId: overrides.id,
    branchTags: [],
    branchLocation: near,
    score: 0.7,
    textRank: 0.5,
    popularity: { saves: 0, ratings: 0, directions: 0 },
    daysSinceLastRating: 10,
    cuisineSlug: 'hyderabadi',
    ...overrides,
  };
}

const context = { hours: {}, timezone: 'Asia/Kolkata', now: null, location: null };

describe('rankDishes', () => {
  it('orders by text relevance first when there is a query', () => {
    const ranked = rankDishes(
      [dish({ id: 'weak', textRank: 0.5, score: 0.9 }), dish({ id: 'strong', textRank: 1 })],
      {
        chips: [],
        context,
        hasQuery: true,
        config,
      },
    );
    expect(ranked.map((entry) => entry.dish.id)).toEqual(['strong', 'weak']);
  });

  it('orders by R alone when browsing', () => {
    const ranked = rankDishes(
      [dish({ id: 'weak', textRank: 0, score: 0.9 }), dish({ id: 'strong', textRank: 0 })],
      {
        chips: [],
        context,
        hasQuery: false,
        config,
      },
    );
    expect(ranked.map((entry) => entry.dish.id)).toEqual(['weak', 'strong']);
  });

  it('lifts nearby dishes and reports distance once location is known', () => {
    const dishes = [dish({ id: 'far', branchLocation: far }), dish({ id: 'near' })];
    const ranked = rankDishes(dishes, {
      chips: [],
      context: { ...context, location: near },
      hasQuery: false,
      config,
    });
    expect(ranked.map((entry) => entry.dish.id)).toEqual(['near', 'far']);
    expect(ranked[0]?.distanceKm).toBe(0);
    expect(ranked[1]?.distanceKm).toBeGreaterThan(12);
  });

  it('drops dishes that fail a chip', () => {
    const ranked = rankDishes([dish({ id: 'meat' }), dish({ id: 'veg', diet: 'veg' })], {
      chips: ['veg'],
      context,
      hasQuery: false,
      config,
    });
    expect(ranked.map((entry) => entry.dish.id)).toEqual(['veg']);
  });
});

import { describe, expect, it } from 'vitest';
import { rankingConfigDefaults } from '@/features/ratings/schemas/ranking-config';
import {
  capPerKey,
  discoveryScore,
  distanceScore,
  freshnessScore,
  matchScore,
  popularityScore,
  searchScore,
} from './ranking';

const config = rankingConfigDefaults.discovery_ranking;
const none = { saves: 0, ratings: 0, directions: 0 };

describe('§6.5 components', () => {
  it('decays distance with a 3 km scale and is 0.5 when unknown', () => {
    expect(distanceScore(0, config)).toBe(1);
    expect(distanceScore(3, config)).toBeCloseTo(Math.exp(-1));
    expect(distanceScore(null, config)).toBe(0.5);
  });

  it('caps popularity at 1 on a log10 scale with ratings weighted double', () => {
    expect(popularityScore(none, config)).toBe(0);
    expect(popularityScore({ saves: 4, ratings: 2, directions: 1 }, config)).toBeCloseTo(Math.log10(10) / 2);
    expect(popularityScore({ saves: 500, ratings: 0, directions: 0 }, config)).toBe(1);
  });

  it('halves freshness every 30 days and is 0 for never-rated dishes', () => {
    expect(freshnessScore(0, config)).toBe(1);
    expect(freshnessScore(30, config)).toBeCloseTo(0.5);
    expect(freshnessScore(null, config)).toBe(0);
  });

  it('scores preference match 1/0 for members and 0.5 for guests', () => {
    expect(matchScore('hyderabadi', ['hyderabadi'], config)).toBe(1);
    expect(matchScore('arabian', ['hyderabadi'], config)).toBe(0);
    expect(matchScore('arabian', null, config)).toBe(0.5);
  });
});

describe('discoveryScore', () => {
  it('applies the spec weights', () => {
    const r = discoveryScore(
      {
        score: 0.8,
        distanceKm: 3,
        popularity: { saves: 9, ratings: 0, directions: 0 },
        daysSinceLastRating: 30,
        cuisineSlug: 'x',
        preferredCuisines: null,
      },
      config.weights,
      config,
    );
    expect(r).toBeCloseTo(0.35 * 0.8 + 0.2 * Math.exp(-1) + 0.15 * 0.5 + 0.15 * 0.5 + 0.15 * 0.5);
  });

  it('lets trending weights favour popularity', () => {
    const popular = {
      score: 0.5,
      distanceKm: null,
      popularity: { saves: 99, ratings: 0, directions: 0 },
      daysSinceLastRating: null,
      cuisineSlug: null,
      preferredCuisines: null,
    };
    const quiet = { ...popular, score: 1, popularity: none };
    expect(discoveryScore(popular, config.weights, config)).toBeLessThan(
      discoveryScore(quiet, config.weights, config),
    );
    expect(discoveryScore(popular, config.trendingWeights, config)).toBeGreaterThan(
      discoveryScore(quiet, config.trendingWeights, config),
    );
  });

  it('uses the unscored quality for dishes without a score', () => {
    const base = {
      distanceKm: null,
      popularity: none,
      daysSinceLastRating: null,
      cuisineSlug: null,
      preferredCuisines: null,
    };
    expect(discoveryScore({ ...base, score: null }, config.weights, config)).toBeCloseTo(
      discoveryScore({ ...base, score: 0.5 }, config.weights, config),
    );
  });
});

it('blends text rank and R 0.6/0.4 and clamps text rank', () => {
  expect(searchScore(1, 0.5, rankingConfigDefaults.search)).toBeCloseTo(0.8);
  expect(searchScore(2, 0, rankingConfigDefaults.search)).toBeCloseTo(0.6);
});

it('caps items per key in order', () => {
  const items = ['a1', 'a2', 'a3', 'b1', 'a4', 'b2'];
  expect(capPerKey(items, (item) => item[0] ?? '', 2)).toEqual(['a1', 'a2', 'b1', 'b2']);
});

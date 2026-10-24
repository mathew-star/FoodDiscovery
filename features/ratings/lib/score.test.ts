import { describe, expect, it } from 'vitest';
import { rankingConfigDefaults } from '@/features/ratings/schemas/ranking-config';
import { computeDishScore, computeFoodScore, ratingTimeWeight } from './score';

const config = rankingConfigDefaults.dish_scoring;

describe('computeDishScore', () => {
  it('returns the prior when there are no ratings', () => {
    expect(computeDishScore({ loved: 0, good: 0, okay: 0, skip: 0 }, 0.65, config)).toEqual({
      score: 0.65,
      lovedPct: null,
      weightSum: 0,
    });
  });

  it('shrinks a small sample toward the prior', () => {
    const { score } = computeDishScore({ loved: 2, good: 0, okay: 0, skip: 0 }, 0.65, config);
    expect(score).toBeCloseTo((5 * 0.65 + 2) / 7, 10);
  });

  it('approaches the sample mean as weight grows', () => {
    const { score } = computeDishScore({ loved: 500, good: 0, okay: 0, skip: 500 }, 0.65, config);
    expect(score).toBeCloseTo(0.5, 2);
  });

  it('applies spec sentiment values', () => {
    const { score } = computeDishScore({ loved: 1, good: 1, okay: 1, skip: 1 }, 0, {
      priorStrength: 0.000001,
      minWeightForDisplay: 3,
    });
    expect(score).toBeCloseTo((1 + 0.7 + 0.4 + 0) / 4, 5);
  });

  it('hides loved % below the display threshold', () => {
    expect(computeDishScore({ loved: 2, good: 0.5, okay: 0, skip: 0 }, 0.65, config).lovedPct).toBeNull();
    expect(computeDishScore({ loved: 3, good: 1, okay: 0, skip: 0 }, 0.65, config).lovedPct).toBe(75);
  });
});

describe('ratingTimeWeight', () => {
  it('halves every 270 days', () => {
    expect(ratingTimeWeight(0)).toBe(1);
    expect(ratingTimeWeight(270)).toBeCloseTo(0.5, 10);
    expect(ratingTimeWeight(540)).toBeCloseTo(0.25, 10);
  });
});

describe('computeFoodScore', () => {
  it('needs at least two displayable dishes', () => {
    expect(computeFoodScore([{ score: 0.9, weightSum: 10 }], config)).toBeNull();
    expect(
      computeFoodScore(
        [
          { score: 0.9, weightSum: 10 },
          { score: 0.8, weightSum: 2 },
        ],
        config,
      ),
    ).toBeNull();
  });

  it('weights the top five dishes by weight sum', () => {
    const dishes = [
      { score: 0.9, weightSum: 40 },
      { score: 0.7, weightSum: 10 },
      { score: 0.8, weightSum: 3 },
      { score: 0.6, weightSum: 5 },
      { score: 0.5, weightSum: 5 },
      { score: 0.1, weightSum: 100 },
      { score: null, weightSum: 0 },
    ];
    const expected = (0.9 * 40 + 0.8 * 3 + 0.7 * 10 + 0.6 * 5 + 0.5 * 5) / (40 + 3 + 10 + 5 + 5);
    expect(computeFoodScore(dishes, config)).toBeCloseTo(expected, 10);
  });
});

import { describe, expect, it } from 'vitest';
import { rankingConfigDefaults } from '../schemas/ranking-config';
import {
  aggregateAspects,
  aggregateDishRatings,
  aspectLabel,
  aspectScores,
  cityPrior,
  countsInScore,
  ratingWeight,
  type AspectRow,
  type DishRatingRow,
} from './aggregate';

const weights = rankingConfigDefaults.rating_weights;
const aspects = rankingConfigDefaults.aspect_scoring;
const counted = {
  isCurrent: true,
  suspect: false,
  disclosed: false,
  affiliated: false,
  dishActive: true,
  branchListed: true,
};
const row = (overrides: Partial<DishRatingRow> = {}): DishRatingRow => ({
  ...counted,
  sentiment: 'loved',
  trust: 't1',
  ageDays: 0,
  ...overrides,
});

describe('counting rule', () => {
  it('counts only current, clean, undisclosed ratings on active dishes at listed branches', () => {
    expect(countsInScore(counted)).toBe(true);
    for (const key of ['isCurrent', 'dishActive', 'branchListed'] as const) {
      expect(countsInScore({ ...counted, [key]: false })).toBe(false);
    }
    for (const key of ['suspect', 'disclosed', 'affiliated'] as const) {
      expect(countsInScore({ ...counted, [key]: true })).toBe(false);
    }
  });
});

describe('ratingWeight (spec §6.1)', () => {
  it('multiplies trust by a 270-day half-life', () => {
    expect(ratingWeight('t0', 0, weights)).toBe(0.5);
    expect(ratingWeight('t2', 0, weights)).toBe(1.2);
    expect(ratingWeight('t1', 270, weights)).toBeCloseTo(0.5);
  });
});

describe('aggregateDishRatings', () => {
  it('weighs counted ratings and counts visible ones', () => {
    const result = aggregateDishRatings(
      [
        row(),
        row({ sentiment: 'skip', trust: 't0', ageDays: 3 }),
        row({ sentiment: 'good', disclosed: true, ageDays: 1 }),
        row({ sentiment: 'okay', isCurrent: false }),
        row({ sentiment: 'skip', suspect: true }),
      ],
      weights,
    );
    expect(result.ratingCount).toBe(3);
    expect(result.newestAgeDays).toBe(0);
    expect(result.weights.loved).toBe(1);
    expect(result.weights.skip).toBeCloseTo(0.5 * 0.5 ** (3 / 270));
    expect(result.weights.good).toBe(0);
    expect(result.weights.okay).toBe(0);
  });

  it('keeps ratings of a pending dish visible but uncounted', () => {
    const result = aggregateDishRatings([row({ dishActive: false })], weights);
    expect(result).toMatchObject({ ratingCount: 1, weights: { loved: 0 } });
  });
});

it('uses the city mean as prior only with enough ratings', () => {
  expect(cityPrior({ weightedValue: 16, weight: 20, count: 25 }, 20, 0.65)).toBeCloseTo(0.8);
  expect(cityPrior({ weightedValue: 16, weight: 20, count: 19 }, 20, 0.65)).toBe(0.65);
});

describe('aspects (spec §6.2)', () => {
  const aspectRow = (overrides: Partial<AspectRow> = {}): AspectRow => ({
    isCurrent: true,
    suspect: false,
    disclosed: false,
    affiliated: false,
    branchListed: true,
    answers: { value: 'good', service: 'okay', ambience: null },
    wouldReturn: true,
    trust: 't1',
    ageDays: 0,
    ...overrides,
  });
  const priors = { value: 0.6, service: 0.6, ambience: 0.6 };

  it('shrinks toward the city prior and hides thin aspects', () => {
    const totals = aggregateAspects(
      Array.from({ length: 5 }, () => aspectRow()),
      weights,
    );
    const scores = aspectScores(totals, priors, aspects);
    expect(scores.value).toBeCloseTo((5 * 0.6 + 5) / 10);
    expect(scores.service).toBeCloseTo((5 * 0.6 + 2.5) / 10);
    expect(scores.ambience).toBeNull();
    expect(scores.wouldReturnPct).toBe(100);
  });

  it('needs five would-return answers', () => {
    const totals = aggregateAspects(
      Array.from({ length: 4 }, () => aspectRow()),
      weights,
    );
    expect(aspectScores(totals, priors, aspects).wouldReturnPct).toBeNull();
  });

  it('ignores disclosed answers', () => {
    const totals = aggregateAspects([aspectRow({ disclosed: true })], weights);
    expect(totals.respondents).toBe(0);
  });

  it('labels scores Great / Good / Mixed / Poor', () => {
    expect([0.85, 0.65, 0.45, 0.2].map((score) => aspectLabel(score, aspects.labels))).toEqual([
      'great',
      'good',
      'mixed',
      'poor',
    ]);
  });
});

import type { AspectScoringConfig, RatingWeightsConfig } from '@/features/ratings/schemas/ranking-config';
import { sentimentValue, type Sentiment } from '@/features/ratings/schemas/sentiment';
import type { SentimentWeights } from './score';

export type TrustLevel = 't0' | 't1' | 't2' | 'founding';
export type AspectAnswer = 'good' | 'okay' | 'poor';

/** Everything the counting rule needs (docs/CONTRIBUTIONS.md §1). */
export type CountingFacts = {
  isCurrent: boolean;
  suspect: boolean;
  disclosed: boolean;
  affiliated: boolean;
  dishActive: boolean;
  branchListed: boolean;
};

/** Visible: the current, non-suspect ratings people see counted ("42 ratings"), disclosed ones included. */
export const isVisibleRating = (facts: Pick<CountingFacts, 'isCurrent' | 'suspect'>) =>
  facts.isCurrent && !facts.suspect;

/** Counted: what moves a score. Disclosed and affiliated ratings show but weigh 0 (spec §6.1, §7.6). */
export const countsInScore = (facts: CountingFacts) =>
  isVisibleRating(facts) && !facts.disclosed && !facts.affiliated && facts.dishActive && facts.branchListed;

/** Spec §6.1: w = trust × 0.5^(age / half-life). The disclosure factor is the counting rule above. */
export function ratingWeight(trust: TrustLevel, ageDays: number, config: RatingWeightsConfig): number {
  return config.trust[trust] * 0.5 ** (Math.max(0, ageDays) / config.halfLifeDays);
}

export type DishRatingRow = CountingFacts & { sentiment: Sentiment; trust: TrustLevel; ageDays: number };

export function aggregateDishRatings(rows: readonly DishRatingRow[], config: RatingWeightsConfig) {
  const weights: SentimentWeights = { loved: 0, good: 0, okay: 0, skip: 0 };
  let ratingCount = 0;
  let newestAgeDays: number | null = null;
  for (const row of rows) {
    if (!isVisibleRating(row)) continue;
    ratingCount += 1;
    newestAgeDays = newestAgeDays === null ? row.ageDays : Math.min(newestAgeDays, row.ageDays);
    if (countsInScore(row)) weights[row.sentiment] += ratingWeight(row.trust, row.ageDays, config);
  }
  return { weights, ratingCount, newestAgeDays };
}

/** Prior m for a canonical dish: its weighted city mean once it has enough ratings (spec §6.1). */
export function cityPrior(
  totals: { weightedValue: number; weight: number; count: number },
  minCount: number,
  fallback: number,
): number {
  return totals.count >= minCount && totals.weight > 0 ? totals.weightedValue / totals.weight : fallback;
}

export const weightedValue = (weights: SentimentWeights) =>
  (Object.keys(weights) as Sentiment[]).reduce((sum, key) => sum + weights[key] * sentimentValue[key], 0);

const aspectValue: Record<AspectAnswer, number> = { good: 1, okay: 0.5, poor: 0 };
export const aspectKeys = ['value', 'service', 'ambience'] as const;
export type AspectKey = (typeof aspectKeys)[number];

export type AspectRow = Omit<CountingFacts, 'dishActive'> & {
  answers: Partial<Record<AspectKey, AspectAnswer | null>>;
  wouldReturn: boolean | null;
  trust: TrustLevel;
  ageDays: number;
};

export type AspectTotals = Record<AspectKey, { weightedValue: number; weight: number }> & {
  wouldReturn: { yes: number; weight: number; answers: number };
  respondents: number;
};

export function aggregateAspects(rows: readonly AspectRow[], config: RatingWeightsConfig): AspectTotals {
  const totals: AspectTotals = {
    value: { weightedValue: 0, weight: 0 },
    service: { weightedValue: 0, weight: 0 },
    ambience: { weightedValue: 0, weight: 0 },
    wouldReturn: { yes: 0, weight: 0, answers: 0 },
    respondents: 0,
  };
  for (const row of rows) {
    if (!countsInScore({ ...row, dishActive: true })) continue;
    totals.respondents += 1;
    const weight = ratingWeight(row.trust, row.ageDays, config);
    for (const key of aspectKeys) {
      const answer = row.answers[key];
      if (!answer) continue;
      totals[key].weightedValue += weight * aspectValue[answer];
      totals[key].weight += weight;
    }
    if (row.wouldReturn !== null) {
      totals.wouldReturn.answers += 1;
      totals.wouldReturn.weight += weight;
      if (row.wouldReturn) totals.wouldReturn.yes += weight;
    }
  }
  return totals;
}

/** Spec §6.2: each aspect shrunk toward the city mean for that aspect; null below the display weight. */
export function aspectScores(
  totals: AspectTotals,
  priors: Record<AspectKey, number>,
  config: AspectScoringConfig,
): Record<AspectKey, number | null> & { wouldReturnPct: number | null } {
  const score = (key: AspectKey) => {
    const { weightedValue: value, weight } = totals[key];
    if (weight < config.minWeightForDisplay) return null;
    return (config.priorStrength * priors[key] + value) / (config.priorStrength + weight);
  };
  const { yes, weight, answers } = totals.wouldReturn;
  return {
    value: score('value'),
    service: score('service'),
    ambience: score('ambience'),
    wouldReturnPct: answers >= config.minWouldReturnAnswers && weight > 0 ? (yes / weight) * 100 : null,
  };
}

export type AspectLabel = 'great' | 'good' | 'mixed' | 'poor';

export function aspectLabel(score: number, labels: AspectScoringConfig['labels']): AspectLabel {
  if (score >= labels.great) return 'great';
  if (score >= labels.good) return 'good';
  if (score >= labels.mixed) return 'mixed';
  return 'poor';
}

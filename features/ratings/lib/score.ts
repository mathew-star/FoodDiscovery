import type {
  DishScoringConfig,
  RatingWeightsConfig,
  TrustLevel,
} from '@/features/ratings/schemas/ranking-config';
import { sentimentValue, type Sentiment } from '@/features/ratings/schemas/sentiment';

export type SentimentWeights = Record<Sentiment, number>;

export type DishScore = {
  score: number;
  lovedPct: number | null;
  weightSum: number;
};

export function sumWeights(weights: SentimentWeights): number {
  return weights.loved + weights.good + weights.okay + weights.skip;
}

export function computeDishScore(
  weights: SentimentWeights,
  prior: number,
  config: Pick<DishScoringConfig, 'priorStrength' | 'minWeightForDisplay'>,
): DishScore {
  const weightSum = sumWeights(weights);
  const weightedValue = (Object.keys(weights) as Sentiment[]).reduce(
    (total, sentiment) => total + weights[sentiment] * sentimentValue[sentiment],
    0,
  );
  const score = (config.priorStrength * prior + weightedValue) / (config.priorStrength + weightSum);
  const lovedPct = weightSum >= config.minWeightForDisplay ? (weights.loved / weightSum) * 100 : null;
  return { score, lovedPct, weightSum };
}

export function ratingTimeWeight(ageDays: number, halfLifeDays = 270): number {
  return 0.5 ** (Math.max(0, ageDays) / halfLifeDays);
}

export type WeighableRating = {
  trust: TrustLevel;
  ageDays: number;
  /** Hosted, paid partnership or "I work here" (spec §7.6). */
  disclosed: boolean;
  /** Suspect and held for review (spec §7.3). */
  held: boolean;
};

/** Spec §6.1 rating weight. Disclosed and held ratings stay visible but count for nothing. */
export function ratingWeight(rating: WeighableRating, config: RatingWeightsConfig): number {
  if (rating.disclosed || rating.held) return 0;
  return config.trust[rating.trust] * ratingTimeWeight(rating.ageDays, config.halfLifeDays);
}

export type ScoredDish = { score: number | null; weightSum: number };

export function computeFoodScore(
  dishes: readonly ScoredDish[],
  config: Pick<DishScoringConfig, 'foodScoreTopDishes' | 'foodScoreMinDishes' | 'minWeightForDisplay'>,
): number | null {
  const scored = dishes
    .filter(
      (dish): dish is { score: number; weightSum: number } =>
        dish.score !== null && dish.weightSum >= config.minWeightForDisplay,
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, config.foodScoreTopDishes);
  if (scored.length < config.foodScoreMinDishes) return null;
  const totalWeight = scored.reduce((total, dish) => total + dish.weightSum, 0);
  return scored.reduce((total, dish) => total + dish.score * dish.weightSum, 0) / totalWeight;
}

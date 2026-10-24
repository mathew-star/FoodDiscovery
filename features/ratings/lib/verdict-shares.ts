import { sentiments, type Sentiment } from '@/features/ratings/schemas/sentiment';
import type { SentimentWeights } from './score';

export type VerdictShares = Record<Sentiment, number>;

/**
 * Whole-number percentages that always add up to 100 (largest remainder), so a legend never reads
 * "Loved 78% Good 16% Okay 4% Skip 1%". All zero when there is no weight.
 */
export function verdictShares(weights: SentimentWeights): VerdictShares {
  const total = sentiments.reduce((sum, sentiment) => sum + Math.max(0, weights[sentiment]), 0);
  const shares: VerdictShares = { loved: 0, good: 0, okay: 0, skip: 0 };
  if (total <= 0) return shares;

  const exact = sentiments.map((sentiment) => ({
    sentiment,
    value: (Math.max(0, weights[sentiment]) / total) * 100,
  }));
  let remaining = 100;
  for (const { sentiment, value } of exact) {
    shares[sentiment] = Math.floor(value);
    remaining -= shares[sentiment];
  }
  const byRemainder = [...exact].sort((a, b) => (b.value % 1) - (a.value % 1));
  for (const { sentiment } of byRemainder.slice(0, remaining)) shares[sentiment] += 1;
  return shares;
}

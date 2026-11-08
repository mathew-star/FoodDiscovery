import type { DishActivationConfig, RatingWeightsConfig } from '../schemas/ranking-config';
import type { TrustLevel } from './aggregate';

/**
 * D47: a pending dish is corroborated when enough distinct members currently rate it and their
 * trust weights add up; two brand-new accounts (0.5 + 0.5) are not enough on their own.
 */
export function isCorroborated(
  raters: readonly { userId: string; trust: TrustLevel }[],
  activation: DishActivationConfig,
  weights: RatingWeightsConfig,
): boolean {
  const distinct = new Map(raters.map((rater) => [rater.userId, rater.trust]));
  const trustSum = [...distinct.values()].reduce((sum, trust) => sum + weights.trust[trust], 0);
  return distinct.size >= activation.minDistinctRaters && trustSum >= activation.minTrustWeight;
}

/** D47 third route: a regular member adds, at a listed branch, a dish that is a known canonical dish. */
export const activatesOnCreate = (input: {
  trust: TrustLevel;
  branchListed: boolean;
  canonicalMatch: boolean;
}) => input.trust !== 't0' && input.branchListed && input.canonicalMatch;

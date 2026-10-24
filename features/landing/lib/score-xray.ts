import { ratingTimeWeight } from '@/features/ratings/lib/score';

/*
  Demo constants for the landing Score X-Ray, copied from spec §2.2 and §6.1. They are illustration
  only: the landing page never reads ranking configuration or the database (ARCHITECTURE D28).
*/

export type TrustLevel = 'T0' | 'T1' | 'T2' | 'FOUNDING';

export const demoScoring = {
  trust: { T0: 0.5, T1: 1, T2: 1.2, FOUNDING: 1.2 } satisfies Record<TrustLevel, number>,
  halfLifeDays: 270,
  priorStrength: 5,
  minWeightForDisplay: 3,
} as const;

export const maxTrustWeight = Math.max(...Object.values(demoScoring.trust));

export type DemoRating = { trust: TrustLevel; ageDays: number; disclosed?: boolean; held?: boolean };

/** Spec §6.1 weight: trust × time decay; disclosed and held ratings stay visible but count as 0. */
export function demoWeight(rating: DemoRating): number {
  if (rating.disclosed || rating.held) return 0;
  return demoScoring.trust[rating.trust] * ratingTimeWeight(rating.ageDays, demoScoring.halfLifeDays);
}

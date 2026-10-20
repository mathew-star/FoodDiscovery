import { z } from 'zod';

export const dishScoringConfigSchema = z.object({
  priorStrength: z.number().positive(),
  defaultPrior: z.number().min(0).max(1),
  minRatingsForCityPrior: z.number().int().nonnegative(),
  minWeightForDisplay: z.number().nonnegative(),
  minWeightForWhatToOrder: z.number().nonnegative(),
  whatToOrderLimit: z.number().int().positive(),
  whatToOrderMinQualified: z.number().int().nonnegative(),
  leaderboardMinWeight: z.number().nonnegative(),
  foodScoreTopDishes: z.number().int().positive(),
  foodScoreMinDishes: z.number().int().positive(),
});

export const factFreshnessConfigSchema = z.object({
  hours: z.number().int().positive(),
  price_range: z.number().int().positive(),
  phone: z.number().int().positive(),
  address: z.number().int().positive(),
  payment_modes: z.number().int().positive(),
  veg_only: z.number().int().positive(),
});

export const nearbyConfigSchema = z.object({
  radiusMeters: z.number().positive(),
  limit: z.number().int().positive(),
});

export type DishScoringConfig = z.infer<typeof dishScoringConfigSchema>;
export type FactFreshnessConfig = z.infer<typeof factFreshnessConfigSchema>;
export type NearbyConfig = z.infer<typeof nearbyConfigSchema>;

export const rankingConfigDefaults = {
  dish_scoring: {
    priorStrength: 5,
    defaultPrior: 0.65,
    minRatingsForCityPrior: 20,
    minWeightForDisplay: 3,
    minWeightForWhatToOrder: 2,
    whatToOrderLimit: 5,
    whatToOrderMinQualified: 3,
    leaderboardMinWeight: 5,
    foodScoreTopDishes: 5,
    foodScoreMinDishes: 2,
  } satisfies DishScoringConfig,
  fact_freshness_days: {
    hours: 60,
    price_range: 90,
    phone: 180,
    address: 365,
    payment_modes: 180,
    veg_only: 365,
  } satisfies FactFreshnessConfig,
  nearby_alternatives: { radiusMeters: 2000, limit: 6 } satisfies NearbyConfig,
} as const;

export const rankingConfigSchemas = {
  dish_scoring: dishScoringConfigSchema,
  fact_freshness_days: factFreshnessConfigSchema,
  nearby_alternatives: nearbyConfigSchema,
} as const;

export type RankingConfigKey = keyof typeof rankingConfigSchemas;

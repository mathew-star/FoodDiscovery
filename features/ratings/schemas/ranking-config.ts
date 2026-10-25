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

const rankingWeightsSchema = z.object({
  quality: z.number().nonnegative(),
  distance: z.number().nonnegative(),
  popularity: z.number().nonnegative(),
  freshness: z.number().nonnegative(),
  match: z.number().nonnegative(),
});

export const discoveryRankingConfigSchema = z.object({
  weights: rankingWeightsSchema,
  trendingWeights: rankingWeightsSchema,
  distanceScaleKm: z.number().positive(),
  unknownDistanceScore: z.number().min(0).max(1),
  popularityLogDivisor: z.number().positive(),
  popularityWindowDays: z.number().int().positive(),
  freshnessHalfLifeDays: z.number().positive(),
  guestMatchScore: z.number().min(0).max(1),
  unscoredQuality: z.number().min(0).max(1),
  trendingRadiusKm: z.number().positive(),
  trendingLimit: z.number().int().positive(),
  trendingMaxPerBranch: z.number().int().positive(),
  sectionMinItems: z.number().int().positive(),
});

export const searchConfigSchema = z.object({
  textWeight: z.number().nonnegative(),
  rankWeight: z.number().nonnegative(),
  wordSimilarityThreshold: z.number().min(0).max(1),
  spellingSimilarity: z.number().min(0).max(1),
  dishLimit: z.int().positive(),
  branchLimit: z.int().positive(),
  groupLimit: z.int().positive(),
  suggestLimit: z.int().positive(),
  browseLimit: z.int().positive(),
});

export type DishScoringConfig = z.infer<typeof dishScoringConfigSchema>;
export type FactFreshnessConfig = z.infer<typeof factFreshnessConfigSchema>;
export type NearbyConfig = z.infer<typeof nearbyConfigSchema>;
export type RankingWeights = z.infer<typeof rankingWeightsSchema>;
export type DiscoveryRankingConfig = z.infer<typeof discoveryRankingConfigSchema>;
export type SearchConfig = z.infer<typeof searchConfigSchema>;

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
  // Spec §6.5. Trending raises popularity to 0.35 and lowers quality to 0.25, other weights unchanged.
  discovery_ranking: {
    weights: { quality: 0.35, distance: 0.2, popularity: 0.15, freshness: 0.15, match: 0.15 },
    trendingWeights: { quality: 0.25, distance: 0.2, popularity: 0.35, freshness: 0.15, match: 0.15 },
    distanceScaleKm: 3,
    unknownDistanceScore: 0.5,
    popularityLogDivisor: 2,
    popularityWindowDays: 7,
    freshnessHalfLifeDays: 30,
    guestMatchScore: 0.5,
    unscoredQuality: 0.5,
    trendingRadiusKm: 5,
    trendingLimit: 12,
    trendingMaxPerBranch: 2,
    sectionMinItems: 4,
  } satisfies DiscoveryRankingConfig,
  search: {
    textWeight: 0.6,
    rankWeight: 0.4,
    wordSimilarityThreshold: 0.45,
    spellingSimilarity: 0.3,
    dishLimit: 60,
    branchLimit: 10,
    groupLimit: 6,
    suggestLimit: 8,
    browseLimit: 200,
  } satisfies SearchConfig,
} as const;

export const rankingConfigSchemas = {
  dish_scoring: dishScoringConfigSchema,
  fact_freshness_days: factFreshnessConfigSchema,
  nearby_alternatives: nearbyConfigSchema,
  discovery_ranking: discoveryRankingConfigSchema,
  search: searchConfigSchema,
} as const;

export type RankingConfigKey = keyof typeof rankingConfigSchemas;

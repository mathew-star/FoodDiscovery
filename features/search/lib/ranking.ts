import type {
  DiscoveryRankingConfig,
  RankingWeights,
  SearchConfig,
} from '@/features/ratings/schemas/ranking-config';

export type PopularityCounts = { saves: number; ratings: number; directions: number };

export type RankInputs = {
  score: number | null;
  distanceKm: number | null;
  popularity: PopularityCounts;
  daysSinceLastRating: number | null;
  cuisineSlug: string | null;
  // null for guests; a member's preferred cuisines once profiles land (P3).
  preferredCuisines: readonly string[] | null;
};

type Config = Pick<
  DiscoveryRankingConfig,
  | 'distanceScaleKm'
  | 'unknownDistanceScore'
  | 'popularityLogDivisor'
  | 'freshnessHalfLifeDays'
  | 'guestMatchScore'
  | 'unscoredQuality'
>;

export function distanceScore(km: number | null, config: Config): number {
  return km === null ? config.unknownDistanceScore : Math.exp(-Math.max(0, km) / config.distanceScaleKm);
}

export function popularityScore({ saves, ratings, directions }: PopularityCounts, config: Config): number {
  return Math.min(1, Math.log10(1 + saves + 2 * ratings + directions) / config.popularityLogDivisor);
}

export function freshnessScore(days: number | null, config: Config): number {
  return days === null ? 0 : 0.5 ** (Math.max(0, days) / config.freshnessHalfLifeDays);
}

export function matchScore(
  cuisine: string | null,
  preferred: readonly string[] | null,
  config: Config,
): number {
  if (preferred === null) return config.guestMatchScore;
  return cuisine !== null && preferred.includes(cuisine) ? 1 : 0;
}

/** Spec §6.5: R = wQ·Q + wD·D + wP·P + wF·F + wM·M. */
export function discoveryScore(input: RankInputs, weights: RankingWeights, config: Config): number {
  return (
    weights.quality * (input.score ?? config.unscoredQuality) +
    weights.distance * distanceScore(input.distanceKm, config) +
    weights.popularity * popularityScore(input.popularity, config) +
    weights.freshness * freshnessScore(input.daysSinceLastRating, config) +
    weights.match * matchScore(input.cuisineSlug, input.preferredCuisines, config)
  );
}

/** Spec §6.5: final = 0.6 × normalised text rank + 0.4 × R. */
export function searchScore(
  textRank: number,
  rank: number,
  config: Pick<SearchConfig, 'textWeight' | 'rankWeight'>,
) {
  return config.textWeight * Math.min(1, Math.max(0, textRank)) + config.rankWeight * rank;
}

/** Keeps at most `perKey` items per key, preserving order (Trending: max 2 per branch). */
export function capPerKey<T>(items: readonly T[], key: (item: T) => string, perKey: number): T[] {
  const seen = new Map<string, number>();
  return items.filter((item) => {
    const count = seen.get(key(item)) ?? 0;
    if (count >= perKey) return false;
    seen.set(key(item), count + 1);
    return true;
  });
}

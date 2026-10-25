import type { DiscoveryRankingConfig } from '@/features/ratings/schemas/ranking-config';
import type { ChipContext } from '@/features/search/lib/chip-filter';
import { capPerKey } from '@/features/search/lib/ranking';
import { rankDishes, type RankableDish, type RankedDish } from '@/features/search/lib/rank-results';
import { distanceMeters } from '@/shared/lib/geo';

export type TrendingScope = 'near' | 'city';

/**
 * Spec §6.5 "Trending near you": trending weights, radius, max per branch, top N. Fewer than the
 * section minimum nearby (or no location) widens to the whole city, labelled as such.
 */
export function pickTrending<T extends RankableDish>(
  dishes: readonly T[],
  context: ChipContext,
  config: DiscoveryRankingConfig,
): { scope: TrendingScope; items: RankedDish<T>[] } {
  const rank = (candidates: readonly T[]) =>
    capPerKey(
      rankDishes(candidates, {
        chips: [],
        context,
        hasQuery: false,
        weights: config.trendingWeights,
        config: { discovery: config, search: { textWeight: 0, rankWeight: 1 } },
      }),
      (entry) => entry.dish.branchId,
      config.trendingMaxPerBranch,
    ).slice(0, config.trendingLimit);

  const { location } = context;
  if (location) {
    const radiusMeters = config.trendingRadiusKm * 1_000;
    const nearby = rank(
      dishes.filter((dish) => distanceMeters(location, dish.branchLocation) <= radiusMeters),
    );
    if (nearby.length >= config.sectionMinItems) return { scope: 'near', items: nearby };
  }
  return { scope: 'city', items: rank(dishes) };
}

import type {
  DiscoveryRankingConfig,
  RankingWeights,
  SearchConfig,
} from '@/features/ratings/schemas/ranking-config';
import { distanceMeters, type LatLng } from '@/shared/lib/geo';
import type { ContextChipId } from '../schemas/context-chips';
import { matchesChips, type ChipCandidate, type ChipContext } from './chip-filter';
import { discoveryScore, searchScore, type PopularityCounts } from './ranking';

export type RankableDish = ChipCandidate & {
  id: string;
  score: number | null;
  textRank: number;
  popularity: PopularityCounts;
  daysSinceLastRating: number | null;
  cuisineSlug: string | null;
};

export type RankedDish<T> = { dish: T; distanceKm: number | null; rank: number };

export function rankDishes<T extends RankableDish>(
  dishes: readonly T[],
  options: {
    chips: readonly ContextChipId[];
    context: ChipContext;
    hasQuery: boolean;
    /** Defaults to the §6.5 search weights; Trending passes its own. */
    weights?: RankingWeights;
    config: { discovery: DiscoveryRankingConfig; search: Pick<SearchConfig, 'textWeight' | 'rankWeight'> };
  },
): RankedDish<T>[] {
  const { chips, context, hasQuery, config } = options;
  const weights = options.weights ?? config.discovery.weights;
  const location: LatLng | null = context.location;
  return dishes
    .filter((dish) => matchesChips(dish, chips, context))
    .map((dish) => {
      const distanceKm = location ? distanceMeters(location, dish.branchLocation) / 1000 : null;
      const r = discoveryScore({ ...dish, distanceKm, preferredCuisines: null }, weights, config.discovery);
      return { dish, distanceKm, rank: hasQuery ? searchScore(dish.textRank, r, config.search) : r };
    })
    .sort((a, b) => b.rank - a.rank || a.dish.id.localeCompare(b.dish.id));
}

import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';
import { getHoursForBranches } from '@/features/places/queries/branches';
import { getRankingConfig } from '@/features/ratings/queries/ranking-config';
import { daysBetween } from '@/shared/lib/time';
import type { Suggestion } from '../schemas/suggestion';
import {
  countRecentActions,
  findSpellingSuggestion,
  listBrowseCandidates,
  searchCatalogue,
} from '../server/repo';

type CandidateRow = Awaited<ReturnType<typeof listBrowseCandidates>>[number];

export type SearchDish = Omit<CandidateRow, 'lastRatedAt'> & {
  popularity: { saves: number; ratings: number; directions: number };
  daysSinceLastRating: number | null;
};

type Catalogue = Awaited<ReturnType<typeof searchCatalogue>>;
export type SearchBranch = Catalogue['branches'][number];
export type SearchGroupItem = { slug: string; name: string };

async function withPopularity(rows: CandidateRow[], windowDays: number): Promise<SearchDish[]> {
  const branchIds = [...new Set(rows.map((row) => row.branchId))];
  const counts = await countRecentActions(
    rows.map((row) => row.id),
    branchIds,
    windowDays,
  );
  const saves = new Map(counts.saves.map((row) => [row.branchDishId, row.count]));
  const directions = new Map(counts.directions.map((row) => [row.branchId, row.count]));
  const now = new Date();
  return rows.map(({ lastRatedAt, ...row }) => ({
    ...row,
    // Ratings land in P3; until then the 7-day ratings term is zero.
    popularity: { saves: saves.get(row.id) ?? 0, ratings: 0, directions: directions.get(row.branchId) ?? 0 },
    daysSinceLastRating: lastRatedAt ? daysBetween(lastRatedAt, now) : null,
  }));
}

/**
 * Text-matched candidates for a query, or the city's best dishes when only chips are set.
 * Chips, open status and distance are applied on the client so toggling never refetches.
 */
export async function getSearchResults(cityId: string, query: string | null) {
  'use cache';
  cacheLife('search');
  cacheTag('search', 'branch-dishes', 'branches');
  const [search, discovery, scoring] = await Promise.all([
    getRankingConfig('search'),
    getRankingConfig('discovery_ranking'),
    getRankingConfig('dish_scoring'),
  ]);

  const catalogue: Catalogue = query
    ? await searchCatalogue(cityId, query, search.wordSimilarityThreshold, search)
    : {
        rankings: [],
        dishes: await listBrowseCandidates(cityId, search.browseLimit),
        branches: [],
        areas: [],
        cuisines: [],
      };

  const empty = [
    catalogue.rankings,
    catalogue.dishes,
    catalogue.branches,
    catalogue.areas,
    catalogue.cuisines,
  ].every((group) => group.length === 0);
  const [dishes, didYouMean] = await Promise.all([
    withPopularity(catalogue.dishes, discovery.popularityWindowDays),
    query && empty ? findSpellingSuggestion(cityId, query, search.spellingSimilarity) : null,
  ]);
  const hours = await getHoursForBranches([
    ...new Set([...dishes.map((dish) => dish.branchId), ...catalogue.branches.map((branch) => branch.id)]),
  ]);

  return {
    query,
    didYouMean: didYouMean && didYouMean.toLowerCase() !== query ? didYouMean : null,
    rankings: catalogue.rankings.map(({ slug, name }): SearchGroupItem => ({ slug, name })),
    dishes,
    branches: catalogue.branches,
    areas: catalogue.areas.map(({ slug, name }): SearchGroupItem => ({ slug, name })),
    cuisines: catalogue.cuisines.map(({ slug, name }): SearchGroupItem => ({ slug, name })),
    hours,
    config: { discovery, search: { textWeight: search.textWeight, rankWeight: search.rankWeight } },
    minWeightForDisplay: scoring.minWeightForDisplay,
  };
}

export type SearchResults = Awaited<ReturnType<typeof getSearchResults>>;

/** Typeahead: a short, mixed list in the order a guest scans it (spec E4-2). */
export async function getSuggestions(cityId: string, citySlug: string, query: string): Promise<Suggestion[]> {
  'use cache';
  cacheLife('search');
  cacheTag('search', 'branch-dishes', 'branches');
  const search = await getRankingConfig('search');
  const result = await searchCatalogue(cityId, query, search.wordSimilarityThreshold, {
    dishLimit: 3,
    branchLimit: 3,
    groupLimit: 3,
  });
  const suggestions: Suggestion[] = [
    ...result.rankings.map((item) => ({
      kind: 'ranking' as const,
      label: item.name,
      detail: null,
      href: `/${citySlug}/dish/${item.slug}`,
    })),
    ...result.dishes.map((dish) => ({
      kind: 'dish' as const,
      label: dish.name,
      detail: `${dish.branchName} · ${dish.localityName}`,
      href: `/r/${dish.branchSlug}/dish/${dish.slug}`,
    })),
    ...result.branches.map((branch) => ({
      kind: 'branch' as const,
      label: branch.name,
      detail: branch.localityName,
      href: `/r/${branch.slug}`,
    })),
    ...result.areas.map((area) => ({
      kind: 'area' as const,
      label: area.name,
      detail: null,
      href: `/${citySlug}/area/${area.slug}`,
    })),
    ...result.cuisines.map((cuisine) => ({
      kind: 'cuisine' as const,
      label: cuisine.name,
      detail: null,
      href: `/${citySlug}/cuisine/${cuisine.slug}`,
    })),
  ];
  return suggestions.slice(0, search.suggestLimit);
}

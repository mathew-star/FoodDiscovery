import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';
import { getRankingConfig } from '@/features/ratings/queries/ranking-config';
import { daysBetween } from '@/shared/lib/time';
import {
  findBranchDish,
  findCanonicalDish,
  listBranchDishesForCanonical,
  listBestBranchDishPerCanonical,
  listBranchDishParams,
  listCanonicalDishSlugs,
  listDishesForBranch,
  listTopDishesForCuisine,
  listTopDishesInLocality,
} from '../server/repo';

type MenuRow = Awaited<ReturnType<typeof listDishesForBranch>>[number];
export type BranchMenuDish = MenuRow & { lastRatedDays: number | null };
export type PlacedDish = Awaited<ReturnType<typeof listBranchDishesForCanonical>>[number];
export type BranchDishDetail = NonNullable<Awaited<ReturnType<typeof findBranchDish>>>;

export type BranchMenu<T extends MenuRow = BranchMenuDish> = {
  whatToOrder: { dish: T; knownFor: boolean }[];
  sections: { name: string; dishes: T[] }[];
};

export function buildBranchMenu<T extends MenuRow>(
  dishes: T[],
  config: { minWeightForWhatToOrder: number; whatToOrderLimit: number; whatToOrderMinQualified: number },
): BranchMenu<T> {
  const qualified = dishes
    .filter((dish) => dish.score !== null && dish.weightSum >= config.minWeightForWhatToOrder)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || b.ratingCount - a.ratingCount)
    .slice(0, config.whatToOrderLimit);
  const whatToOrder = qualified.map((dish) => ({ dish, knownFor: false }));
  if (qualified.length < config.whatToOrderMinQualified) {
    const chosen = new Set(qualified.map((dish) => dish.id));
    for (const dish of dishes) {
      if (whatToOrder.length >= config.whatToOrderLimit) break;
      if (dish.isSignature && !chosen.has(dish.id)) whatToOrder.push({ dish, knownFor: true });
    }
  }

  const bySection = new Map<string, T[]>();
  for (const dish of dishes)
    bySection.set(dish.menuSection, [...(bySection.get(dish.menuSection) ?? []), dish]);
  const sections = [...bySection.entries()].map(([name, sectionDishes]) => ({
    name,
    dishes: sectionDishes.sort((a, b) => {
      const aRated = a.weightSum >= config.minWeightForWhatToOrder ? 1 : 0;
      const bRated = b.weightSum >= config.minWeightForWhatToOrder ? 1 : 0;
      return bRated - aRated || (b.score ?? 0) - (a.score ?? 0) || a.name.localeCompare(b.name);
    }),
  }));
  return { whatToOrder, sections };
}

export async function getBranchMenu(branchId: string) {
  'use cache';
  cacheLife('branch');
  cacheTag(`branch:${branchId}`, `branch-menu:${branchId}`);
  const [rows, config] = await Promise.all([listDishesForBranch(branchId), getRankingConfig('dish_scoring')]);
  const now = new Date();
  const dishes = rows.map((row) => ({
    ...row,
    lastRatedDays: row.lastRatedAt ? daysBetween(row.lastRatedAt, now) : null,
  }));
  return buildBranchMenu(dishes, config);
}

export async function getBranchDish(branchSlug: string, dishSlug: string) {
  'use cache';
  cacheLife('branch');
  cacheTag(`branch-slug:${branchSlug}`, `branch-dish-slug:${branchSlug}/${dishSlug}`);
  const dish = await findBranchDish(branchSlug, dishSlug);
  if (dish) cacheTag(`branch-dish:${dish.id}`, `branch:${dish.branchId}`);
  return dish;
}

export async function getBranchDishParams() {
  'use cache';
  cacheLife('branch');
  cacheTag('branches', 'branch-dishes');
  return listBranchDishParams();
}

export async function getCanonicalDish(slug: string) {
  'use cache';
  cacheLife('catalog');
  cacheTag(`dish-slug:${slug}`);
  const dish = await findCanonicalDish(slug);
  if (dish) cacheTag(`dish:${dish.id}`);
  return dish;
}

export async function getCanonicalDishSlugs() {
  'use cache';
  cacheLife('catalog');
  cacheTag('canonical-dishes');
  return listCanonicalDishSlugs();
}

export async function getCityDishRanking(canonicalDishId: string, cityId: string) {
  'use cache';
  cacheLife('catalog');
  cacheTag(`dish:${canonicalDishId}`, 'branch-dishes');
  const config = await getRankingConfig('dish_scoring');
  const dishes = await listBranchDishesForCanonical(canonicalDishId, cityId, config.minWeightForDisplay);
  return { dishes, minWeightForDisplay: config.minWeightForDisplay };
}

export async function getLocalityTopDishes(localityId: string) {
  'use cache';
  cacheLife('catalog');
  cacheTag(`locality:${localityId}`, 'branch-dishes');
  const config = await getRankingConfig('dish_scoring');
  return listTopDishesInLocality(localityId, config.minWeightForDisplay, 10);
}

export async function getCuisineTopDishes(cityId: string, cuisineId: string) {
  'use cache';
  cacheLife('cuisine');
  cacheTag(`cuisine:${cuisineId}`, 'branch-dishes');
  const config = await getRankingConfig('dish_scoring');
  return listTopDishesForCuisine(cityId, cuisineId, config.minWeightForDisplay, 10);
}

export type CategoryShelf = {
  slug: string;
  name: string;
  dishes: (PlacedDish & { canonicalSlug: string; canonicalName: string })[];
};

export async function getCityShelves(cityId: string) {
  'use cache';
  cacheLife('city');
  cacheTag('branch-dishes', 'canonical-dishes');
  const config = await getRankingConfig('dish_scoring');
  const rows = await listBestBranchDishPerCanonical(cityId, config.minWeightForDisplay);
  const shelves = new Map<string, CategoryShelf & { sort: number }>();
  for (const row of rows) {
    const { categorySlug, categoryName, categorySort, ...dish } = row;
    const shelf = shelves.get(categorySlug) ?? {
      slug: categorySlug,
      name: categoryName,
      sort: categorySort,
      dishes: [],
    };
    shelf.dishes.push(dish);
    shelves.set(categorySlug, shelf);
  }
  const ordered = [...shelves.values()]
    .sort((a, b) => a.sort - b.sort)
    .map((shelf): CategoryShelf => ({
      slug: shelf.slug,
      name: shelf.name,
      dishes: shelf.dishes.sort((a, b) => (b.score ?? 0) - (a.score ?? 0)),
    }));
  const topOverall = rows
    .slice()
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 6);
  return { shelves: ordered, topOverall, minWeightForDisplay: config.minWeightForDisplay };
}

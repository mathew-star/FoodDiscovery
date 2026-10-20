import 'server-only';

import { and, asc, desc, eq, gte, ne, sql } from 'drizzle-orm';
import { getDb } from '@/db/client';
import {
  branchCuisines,
  branchDishes,
  branches,
  canonicalDishes,
  dishCategories,
  localities,
} from '@/db/schema';

const dishFields = {
  id: branchDishes.id,
  slug: branchDishes.slug,
  name: branchDishes.name,
  description: branchDishes.description,
  menuSection: branchDishes.menuSection,
  pricePaise: branchDishes.pricePaise,
  diet: branchDishes.diet,
  isJain: branchDishes.isJain,
  isSignature: branchDishes.isSignature,
  score: branchDishes.score,
  lovedPct: branchDishes.lovedPct,
  ratingCount: branchDishes.ratingCount,
  weightSum: branchDishes.weightSum,
  lastRatedAt: branchDishes.lastRatedAt,
  canonicalDishId: branchDishes.canonicalDishId,
};

const placedDishFields = {
  ...dishFields,
  branchId: branches.id,
  branchSlug: branches.slug,
  branchName: branches.name,
  branchLocation: branches.location,
  branchPriceBand: branches.priceBand,
  localityName: localities.name,
  localitySlug: localities.slug,
};

const rankedByScore = (minWeight: number) =>
  [
    desc(sql`${branchDishes.weightSum} >= ${minWeight}`),
    sql`${branchDishes.score} desc nulls last`,
    desc(branchDishes.ratingCount),
  ] as const;

export async function listDishesForBranch(branchId: string) {
  return getDb()
    .select(dishFields)
    .from(branchDishes)
    .where(and(eq(branchDishes.branchId, branchId), eq(branchDishes.isActive, true)))
    .orderBy(asc(branchDishes.menuSection), asc(branchDishes.name));
}

export async function findBranchDish(branchSlug: string, dishSlug: string) {
  const [dish] = await getDb()
    .select({
      ...placedDishFields,
      lovedWeight: branchDishes.lovedWeight,
      goodWeight: branchDishes.goodWeight,
      okayWeight: branchDishes.okayWeight,
      skipWeight: branchDishes.skipWeight,
      cityId: branches.cityId,
      canonicalSlug: canonicalDishes.slug,
      canonicalName: canonicalDishes.name,
    })
    .from(branchDishes)
    .innerJoin(branches, eq(branches.id, branchDishes.branchId))
    .innerJoin(localities, eq(localities.id, branches.localityId))
    .leftJoin(canonicalDishes, eq(canonicalDishes.id, branchDishes.canonicalDishId))
    .where(
      and(
        eq(branches.slug, branchSlug),
        eq(branchDishes.slug, dishSlug),
        eq(branchDishes.isActive, true),
        ne(branches.status, 'permanently_closed'),
      ),
    );
  return dish ?? null;
}

export async function listBranchDishParams() {
  return getDb()
    .select({ branch: branches.slug, dish: branchDishes.slug })
    .from(branchDishes)
    .innerJoin(branches, eq(branches.id, branchDishes.branchId))
    .where(and(eq(branchDishes.isActive, true), ne(branches.status, 'permanently_closed')))
    .orderBy(asc(branches.slug), asc(branchDishes.slug));
}

export async function findCanonicalDish(slug: string) {
  const [dish] = await getDb()
    .select({
      id: canonicalDishes.id,
      slug: canonicalDishes.slug,
      name: canonicalDishes.name,
      description: canonicalDishes.description,
      defaultDiet: canonicalDishes.defaultDiet,
      categorySlug: dishCategories.slug,
      categoryName: dishCategories.name,
    })
    .from(canonicalDishes)
    .innerJoin(dishCategories, eq(dishCategories.id, canonicalDishes.categoryId))
    .where(eq(canonicalDishes.slug, slug));
  return dish ?? null;
}

export async function listCanonicalDishSlugs() {
  const rows = await getDb()
    .select({ slug: canonicalDishes.slug })
    .from(canonicalDishes)
    .orderBy(asc(canonicalDishes.slug));
  return rows.map((row) => row.slug);
}

export async function listBranchDishesForCanonical(
  canonicalDishId: string,
  cityId: string,
  minWeight: number,
) {
  return getDb()
    .select(placedDishFields)
    .from(branchDishes)
    .innerJoin(branches, eq(branches.id, branchDishes.branchId))
    .innerJoin(localities, eq(localities.id, branches.localityId))
    .where(
      and(
        eq(branchDishes.canonicalDishId, canonicalDishId),
        eq(branchDishes.isActive, true),
        eq(branches.cityId, cityId),
        eq(branches.status, 'active'),
      ),
    )
    .orderBy(...rankedByScore(minWeight));
}

export async function listTopDishesInLocality(localityId: string, minWeight: number, limit: number) {
  return getDb()
    .select(placedDishFields)
    .from(branchDishes)
    .innerJoin(branches, eq(branches.id, branchDishes.branchId))
    .innerJoin(localities, eq(localities.id, branches.localityId))
    .where(
      and(
        eq(branches.localityId, localityId),
        eq(branches.status, 'active'),
        eq(branchDishes.isActive, true),
        gte(branchDishes.weightSum, minWeight),
      ),
    )
    .orderBy(...rankedByScore(minWeight))
    .limit(limit);
}

export async function listTopDishesForCuisine(
  cityId: string,
  cuisineId: string,
  minWeight: number,
  limit: number,
) {
  return getDb()
    .select(placedDishFields)
    .from(branchDishes)
    .innerJoin(branches, eq(branches.id, branchDishes.branchId))
    .innerJoin(localities, eq(localities.id, branches.localityId))
    .innerJoin(
      branchCuisines,
      and(eq(branchCuisines.branchId, branches.id), eq(branchCuisines.isPrimary, true)),
    )
    .where(
      and(
        eq(branches.cityId, cityId),
        eq(branchCuisines.cuisineId, cuisineId),
        eq(branches.status, 'active'),
        eq(branchDishes.isActive, true),
        gte(branchDishes.weightSum, minWeight),
      ),
    )
    .orderBy(...rankedByScore(minWeight))
    .limit(limit);
}

export async function listCanonicalDishesByCategory() {
  return getDb()
    .select({
      slug: canonicalDishes.slug,
      name: canonicalDishes.name,
      categorySlug: dishCategories.slug,
      categoryName: dishCategories.name,
    })
    .from(canonicalDishes)
    .innerJoin(dishCategories, eq(dishCategories.id, canonicalDishes.categoryId))
    .orderBy(asc(dishCategories.sortOrder), asc(canonicalDishes.name));
}

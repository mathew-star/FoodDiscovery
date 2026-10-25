import 'server-only';

import { and, desc, eq, gte, inArray, or, sql, type SQL } from 'drizzle-orm';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { getDb, withTransaction, type Database } from '@/db/client';
import {
  analyticsEvents,
  branchCuisines,
  branchDishes,
  branches,
  canonicalDishAliases,
  canonicalDishes,
  cuisines,
  dishCategories,
  localities,
} from '@/db/schema';

// Same expression as the trigram indexes in the search_trigram migration, so the planner can use them.
const normalized = (column: AnyPgColumn) => sql`public.f_unaccent(lower(${column}))`;
const normalizedQuery = (query: string) => sql`public.f_unaccent(lower(${query}))`;
const wordMatch = (query: string, column: AnyPgColumn) =>
  sql<boolean>`${normalizedQuery(query)} <% ${normalized(column)}`;
const wordSimilarity = (query: string, column: AnyPgColumn) =>
  sql<number>`word_similarity(${normalizedQuery(query)}, ${normalized(column)})`;

export type SearchLimits = { dishLimit: number; branchLimit: number; groupLimit: number };

const candidateFields = {
  id: branchDishes.id,
  slug: branchDishes.slug,
  name: branchDishes.name,
  pricePaise: branchDishes.pricePaise,
  diet: branchDishes.diet,
  isJain: branchDishes.isJain,
  score: branchDishes.score,
  lovedPct: branchDishes.lovedPct,
  ratingCount: branchDishes.ratingCount,
  weightSum: branchDishes.weightSum,
  lastRatedAt: branchDishes.lastRatedAt,
  canonicalSlug: canonicalDishes.slug,
  categorySlug: dishCategories.slug,
  branchId: branches.id,
  branchSlug: branches.slug,
  branchName: branches.name,
  branchLocation: branches.location,
  branchPriceBand: branches.priceBand,
  branchTags: branches.tags,
  localityName: localities.name,
  localitySlug: localities.slug,
  cuisineSlug: cuisines.slug,
};

function candidateQuery(db: Database, textRank: SQL<number>) {
  return db
    .select({ ...candidateFields, textRank: textRank.mapWith(Number).as('text_rank') })
    .from(branchDishes)
    .innerJoin(branches, eq(branches.id, branchDishes.branchId))
    .innerJoin(localities, eq(localities.id, branches.localityId))
    .leftJoin(canonicalDishes, eq(canonicalDishes.id, branchDishes.canonicalDishId))
    .leftJoin(dishCategories, eq(dishCategories.id, canonicalDishes.categoryId))
    .leftJoin(
      branchCuisines,
      and(eq(branchCuisines.branchId, branches.id), eq(branchCuisines.isPrimary, true)),
    )
    .leftJoin(cuisines, eq(cuisines.id, branchCuisines.cuisineId));
}

const liveDish = (cityId: string) =>
  and(eq(branches.cityId, cityId), eq(branches.status, 'active'), eq(branchDishes.isActive, true));

/*
  One transaction so SET LOCAL scopes the trigram threshold to these statements; the default 0.6
  misses common misspellings ("biriyani", "haleem" typed "haleam").
*/
export async function searchCatalogue(
  cityId: string,
  query: string,
  threshold: number,
  limits: SearchLimits,
) {
  return withTransaction(async (tx) => {
    await tx.execute(sql`select set_config('pg_trgm.word_similarity_threshold', ${String(threshold)}, true)`);

    const canonicalRankSql = sql<number>`max(greatest(${wordSimilarity(query, canonicalDishes.name)}, coalesce(${wordSimilarity(query, canonicalDishAliases.alias)}, 0)))`;
    const canonicalMatches = await tx
      .select({
        id: canonicalDishes.id,
        slug: canonicalDishes.slug,
        name: canonicalDishes.name,
        textRank: canonicalRankSql.mapWith(Number),
      })
      .from(canonicalDishes)
      .leftJoin(canonicalDishAliases, eq(canonicalDishAliases.canonicalDishId, canonicalDishes.id))
      .where(or(wordMatch(query, canonicalDishes.name), wordMatch(query, canonicalDishAliases.alias)))
      .groupBy(canonicalDishes.id)
      .orderBy(desc(canonicalRankSql))
      .limit(limits.groupLimit * 2);

    const canonicalRank = new Map(canonicalMatches.map((match) => [match.id, match.textRank]));
    const canonicalIds = [...canonicalRank.keys()];
    const ownRank = wordSimilarity(query, branchDishes.name);
    const dishTextRank = canonicalIds.length
      ? sql<number>`greatest(${ownRank}, case ${sql.join(
          canonicalMatches.map(
            (match) => sql`when ${branchDishes.canonicalDishId} = ${match.id} then ${match.textRank}::real`,
          ),
          sql` `,
        )} else 0::real end)`
      : ownRank;

    const [dishes, branchRows, areas, cuisineRows] = await Promise.all([
      candidateQuery(tx, dishTextRank)
        .where(
          and(
            liveDish(cityId),
            canonicalIds.length
              ? or(wordMatch(query, branchDishes.name), inArray(branchDishes.canonicalDishId, canonicalIds))
              : wordMatch(query, branchDishes.name),
          ),
        )
        .orderBy(desc(sql`text_rank`), sql`${branchDishes.score} desc nulls last`)
        .limit(limits.dishLimit),
      tx
        .select({
          id: branches.id,
          slug: branches.slug,
          name: branches.name,
          priceBand: branches.priceBand,
          vegOnly: branches.vegOnly,
          foodScore: branches.foodScore,
          tags: branches.tags,
          location: branches.location,
          localityName: localities.name,
          localitySlug: localities.slug,
          textRank: wordSimilarity(query, branches.name).mapWith(Number),
        })
        .from(branches)
        .innerJoin(localities, eq(localities.id, branches.localityId))
        .where(
          and(eq(branches.cityId, cityId), eq(branches.status, 'active'), wordMatch(query, branches.name)),
        )
        .orderBy(desc(wordSimilarity(query, branches.name)), sql`${branches.foodScore} desc nulls last`)
        .limit(limits.branchLimit),
      tx
        .select({
          slug: localities.slug,
          name: localities.name,
          textRank: wordSimilarity(query, localities.name).mapWith(Number),
        })
        .from(localities)
        .where(and(eq(localities.cityId, cityId), wordMatch(query, localities.name)))
        .orderBy(desc(wordSimilarity(query, localities.name)))
        .limit(limits.groupLimit),
      tx
        .select({
          slug: cuisines.slug,
          name: cuisines.name,
          textRank: wordSimilarity(query, cuisines.name).mapWith(Number),
        })
        .from(cuisines)
        .where(wordMatch(query, cuisines.name))
        .orderBy(desc(wordSimilarity(query, cuisines.name)))
        .limit(limits.groupLimit),
    ]);

    return {
      rankings: canonicalMatches.slice(0, limits.groupLimit),
      dishes,
      branches: branchRows,
      areas,
      cuisines: cuisineRows,
    };
  });
}

/** Browse mode (chips without a query): the city's live dishes, best first. */
export async function listBrowseCandidates(cityId: string, limit: number) {
  return candidateQuery(getDb(), sql<number>`0`)
    .where(liveDish(cityId))
    .orderBy(sql`${branchDishes.score} desc nulls last`, desc(branchDishes.ratingCount))
    .limit(limit);
}

/** 7-day popularity inputs for §6.5 P: distinct devices that saved a dish or asked for directions. */
export async function countRecentActions(branchDishIds: string[], branchIds: string[], windowDays: number) {
  if (branchDishIds.length === 0) return { saves: [], directions: [] };
  const since = sql`now() - make_interval(days => ${windowDays})`;
  const db = getDb();
  const devices = sql<number>`count(distinct ${analyticsEvents.deviceId})`.mapWith(Number);
  const [saves, directions] = await Promise.all([
    db
      .select({ branchDishId: analyticsEvents.branchDishId, count: devices })
      .from(analyticsEvents)
      .where(
        and(
          eq(analyticsEvents.name, 'save'),
          sql`${analyticsEvents.props}->>'on' = 'true'`,
          inArray(analyticsEvents.branchDishId, branchDishIds),
          gte(analyticsEvents.occurredAt, since),
        ),
      )
      .groupBy(analyticsEvents.branchDishId),
    db
      .select({ branchId: analyticsEvents.branchId, count: devices })
      .from(analyticsEvents)
      .where(
        and(
          eq(analyticsEvents.name, 'directions_click'),
          inArray(analyticsEvents.branchId, branchIds),
          gte(analyticsEvents.occurredAt, since),
        ),
      )
      .groupBy(analyticsEvents.branchId),
  ]);
  return { saves, directions };
}

import 'server-only';

import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import { getDb, type Database, type Transaction } from '@/db/client';
import {
  brandAffiliations,
  branchDishAliases,
  branchAspectRatings,
  branchDishes,
  branches,
  dishRatings,
  localities,
  profiles,
  rankingConfig,
  reviewTasks,
} from '@/db/schema';
import type { RatingWeightsConfig } from '../schemas/ranking-config';
import type { Sentiment } from '../schemas/sentiment';

type Executor = Database | Transaction;
type Trust = 't0' | 't1' | 't2' | 'founding';
type Aspect = 'good' | 'okay' | 'poor';

export async function findRankingConfigValue(key: string): Promise<unknown> {
  const [row] = await getDb()
    .select({ value: rankingConfig.value })
    .from(rankingConfig)
    .where(eq(rankingConfig.key, key));
  return row?.value;
}

export async function findMemberTrust(db: Executor, userId: string): Promise<Trust | null> {
  const [row] = await db
    .select({ trust: profiles.trustLevel, onboardedAt: profiles.onboardedAt })
    .from(profiles)
    .where(eq(profiles.userId, userId));
  return row?.onboardedAt ? row.trust : null;
}

export async function findRateTarget(db: Executor, branchId: string) {
  const [branch] = await db
    .select({
      id: branches.id,
      slug: branches.slug,
      brandId: branches.brandId,
      listing: branches.listing,
      status: branches.status,
    })
    .from(branches)
    .where(eq(branches.id, branchId));
  return branch ?? null;
}

/** Dish cards a member may rate at this branch (pending ones too: docs/CONTRIBUTIONS.md §5). */
export async function listRateableDishes(db: Executor, branchId: string) {
  return db
    .select({
      id: branchDishes.id,
      slug: branchDishes.slug,
      name: branchDishes.name,
      diet: branchDishes.diet,
      status: branchDishes.status,
      pricePaise: branchDishes.pricePaise,
      menuSection: branchDishes.menuSection,
      ratingCount: branchDishes.ratingCount,
      weightSum: branchDishes.weightSum,
      score: branchDishes.score,
      canonicalDishId: branchDishes.canonicalDishId,
    })
    .from(branchDishes)
    .where(and(eq(branchDishes.branchId, branchId), inArray(branchDishes.status, ['pending', 'active'])))
    .orderBy(desc(branchDishes.ratingCount), asc(branchDishes.name));
}

export async function findCurrentDishRatings(db: Executor, userId: string, branchId: string) {
  return db
    .select({ branchDishId: dishRatings.branchDishId, sentiment: dishRatings.sentiment })
    .from(dishRatings)
    .innerJoin(branchDishes, eq(branchDishes.id, dishRatings.branchDishId))
    .where(
      and(
        eq(dishRatings.userId, userId),
        eq(dishRatings.isCurrent, true),
        eq(branchDishes.branchId, branchId),
      ),
    );
}

export async function findCurrentAspects(db: Executor, userId: string, branchId: string) {
  const [row] = await db
    .select({
      value: branchAspectRatings.value,
      service: branchAspectRatings.service,
      ambience: branchAspectRatings.ambience,
      wouldReturn: branchAspectRatings.wouldReturn,
    })
    .from(branchAspectRatings)
    .where(
      and(
        eq(branchAspectRatings.userId, userId),
        eq(branchAspectRatings.branchId, branchId),
        eq(branchAspectRatings.isCurrent, true),
      ),
    );
  return row ?? null;
}

/** Re-rating keeps history: the current row is retired before the new one goes in (E6-1). */
export async function replaceDishRatings(
  db: Executor,
  userId: string,
  trust: Trust,
  ratings: { branchDishId: string; sentiment: Sentiment }[],
) {
  if (ratings.length === 0) return;
  await db
    .update(dishRatings)
    .set({ isCurrent: false })
    .where(
      and(
        eq(dishRatings.userId, userId),
        eq(dishRatings.isCurrent, true),
        inArray(
          dishRatings.branchDishId,
          ratings.map((rating) => rating.branchDishId),
        ),
      ),
    );
  await db.insert(dishRatings).values(ratings.map((rating) => ({ ...rating, userId, trustAtTime: trust })));
}

export async function replaceAspects(
  db: Executor,
  userId: string,
  branchId: string,
  trust: Trust,
  answers: {
    value: Aspect | null;
    service: Aspect | null;
    ambience: Aspect | null;
    wouldReturn: boolean | null;
  },
) {
  await db
    .update(branchAspectRatings)
    .set({ isCurrent: false })
    .where(
      and(
        eq(branchAspectRatings.userId, userId),
        eq(branchAspectRatings.branchId, branchId),
        eq(branchAspectRatings.isCurrent, true),
      ),
    );
  await db.insert(branchAspectRatings).values({ userId, branchId, trustAtTime: trust, ...answers });
}

const affiliated = (userColumn: typeof dishRatings.userId | typeof branchAspectRatings.userId) =>
  sql<boolean>`exists (select 1 from ${brandAffiliations} where ${brandAffiliations.userId} = ${userColumn} and ${brandAffiliations.brandId} = ${branches.brandId})`;
const ageDays = (column: typeof dishRatings.createdAt | typeof branchAspectRatings.createdAt) =>
  sql<number>`extract(epoch from (now() - ${column})) / 86400`.mapWith(Number);
// Scores use the member's trust today, so bans and promotions apply to old ratings too (D45).
const currentTrust = sql<Trust>`coalesce(${profiles.trustLevel}, 't0')`;

/** Current ratings of these dishes with everything the counting rule needs. */
export async function loadDishScoringRows(db: Executor, dishIds: string[]) {
  if (dishIds.length === 0) return [];
  return db
    .select({
      branchDishId: dishRatings.branchDishId,
      sentiment: dishRatings.sentiment,
      suspect: dishRatings.suspect,
      disclosure: dishRatings.disclosure,
      trust: currentTrust,
      ageDays: ageDays(dishRatings.createdAt),
      affiliated: affiliated(dishRatings.userId),
      dishStatus: branchDishes.status,
      branchListing: branches.listing,
    })
    .from(dishRatings)
    .innerJoin(branchDishes, eq(branchDishes.id, dishRatings.branchDishId))
    .innerJoin(branches, eq(branches.id, branchDishes.branchId))
    .leftJoin(profiles, eq(profiles.userId, dishRatings.userId))
    .where(and(inArray(dishRatings.branchDishId, dishIds), eq(dishRatings.isCurrent, true)));
}

export async function findDishScoringTargets(db: Executor, dishIds: string[]) {
  if (dishIds.length === 0) return [];
  return db
    .select({
      id: branchDishes.id,
      branchId: branchDishes.branchId,
      canonicalDishId: branchDishes.canonicalDishId,
    })
    .from(branchDishes)
    .where(inArray(branchDishes.id, dishIds));
}

/** Spec §6.1 prior inputs: weighted city totals of counted ratings per canonical dish. */
export async function canonicalTotals(db: Executor, canonicalIds: string[], weights: RatingWeightsConfig) {
  if (canonicalIds.length === 0) return [];
  const weight = sql`(case ${currentTrust} when 't0' then ${weights.trust.t0}::real when 't1' then ${weights.trust.t1}::real when 't2' then ${weights.trust.t2}::real else ${weights.trust.founding}::real end) * power(0.5, extract(epoch from (now() - ${dishRatings.createdAt})) / 86400 / ${weights.halfLifeDays}::real)`;
  const value = sql`(case ${dishRatings.sentiment} when 'loved' then 1.0 when 'good' then 0.7 when 'okay' then 0.4 else 0.0 end)`;
  return db
    .select({
      canonicalDishId: branchDishes.canonicalDishId,
      weightedValue: sql<number>`coalesce(sum(${weight} * ${value}), 0)`.mapWith(Number),
      weight: sql<number>`coalesce(sum(${weight}), 0)`.mapWith(Number),
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(dishRatings)
    .innerJoin(branchDishes, eq(branchDishes.id, dishRatings.branchDishId))
    .innerJoin(branches, eq(branches.id, branchDishes.branchId))
    .leftJoin(profiles, eq(profiles.userId, dishRatings.userId))
    .where(
      and(
        inArray(branchDishes.canonicalDishId, canonicalIds),
        eq(dishRatings.isCurrent, true),
        eq(dishRatings.suspect, false),
        eq(dishRatings.disclosure, 'none'),
        eq(branchDishes.status, 'active'),
        eq(branches.listing, 'listed'),
        sql`not ${affiliated(dishRatings.userId)}`,
      ),
    )
    .groupBy(branchDishes.canonicalDishId);
}

export type DishScoreUpdate = {
  id: string;
  score: number;
  lovedPct: number | null;
  weightSum: number;
  ratingCount: number;
  lovedWeight: number;
  goodWeight: number;
  okayWeight: number;
  skipWeight: number;
  lastRatedAt: Date | null;
};

export async function updateDishScore(db: Executor, update: DishScoreUpdate) {
  const { id, ...fields } = update;
  await db
    .update(branchDishes)
    .set({ ...fields, scoredAt: new Date() })
    .where(eq(branchDishes.id, id));
}

export async function listBranchDishScores(db: Executor, branchId: string) {
  return db
    .select({ score: branchDishes.score, weightSum: branchDishes.weightSum })
    .from(branchDishes)
    .where(
      and(
        eq(branchDishes.branchId, branchId),
        eq(branchDishes.status, 'active'),
        eq(branchDishes.isActive, true),
      ),
    );
}

export async function updateBranchScores(
  db: Executor,
  branchId: string,
  fields: Partial<{
    foodScore: number | null;
    valueScore: number | null;
    serviceScore: number | null;
    ambienceScore: number | null;
    wouldReturnPct: number | null;
    aspectCount: number;
  }>,
) {
  await db.update(branches).set(fields).where(eq(branches.id, branchId));
}

export async function loadAspectRows(db: Executor, branchId: string) {
  return db
    .select({
      value: branchAspectRatings.value,
      service: branchAspectRatings.service,
      ambience: branchAspectRatings.ambience,
      wouldReturn: branchAspectRatings.wouldReturn,
      disclosure: branchAspectRatings.disclosure,
      trust: currentTrust,
      ageDays: ageDays(branchAspectRatings.createdAt),
      affiliated: affiliated(branchAspectRatings.userId),
      branchListing: branches.listing,
    })
    .from(branchAspectRatings)
    .innerJoin(branches, eq(branches.id, branchAspectRatings.branchId))
    .leftJoin(profiles, eq(profiles.userId, branchAspectRatings.userId))
    .where(and(eq(branchAspectRatings.branchId, branchId), eq(branchAspectRatings.isCurrent, true)));
}

/** City mean per aspect (unweighted) for the §6.2 prior, with the number of answers behind it. */
export async function cityAspectMeans(db: Executor, branchId: string) {
  const mean = (column: typeof branchAspectRatings.value) =>
    sql<
      number | null
    >`avg(case ${column} when 'good' then 1.0 when 'okay' then 0.5 when 'poor' then 0.0 end)`.mapWith(
      (value: unknown) => (value === null ? null : Number(value)),
    );
  const [row] = await db
    .select({
      value: mean(branchAspectRatings.value),
      service: mean(branchAspectRatings.service),
      ambience: mean(branchAspectRatings.ambience),
      answers: sql<number>`count(*)`.mapWith(Number),
    })
    .from(branchAspectRatings)
    .innerJoin(branches, eq(branches.id, branchAspectRatings.branchId))
    .where(
      and(
        eq(branchAspectRatings.isCurrent, true),
        eq(branchAspectRatings.disclosure, 'none'),
        sql`${branches.cityId} = (select ${branches.cityId} from ${branches} where ${branches.id} = ${branchId})`,
      ),
    );
  return row ?? { value: null, service: null, ambience: null, answers: 0 };
}

/** Branches a member has current ratings at, newest first ("Been there", D42). */
export async function listRatedBranches(db: Executor, userId: string) {
  return db
    .select({
      branchId: branches.id,
      branchSlug: branches.slug,
      branchName: branches.name,
      localityName: localities.name,
      ratedAt: sql<Date>`max(${dishRatings.createdAt})`.mapWith((value: string | Date) => new Date(value)),
    })
    .from(dishRatings)
    .innerJoin(branchDishes, eq(branchDishes.id, dishRatings.branchDishId))
    .innerJoin(branches, eq(branches.id, branchDishes.branchId))
    .innerJoin(localities, eq(localities.id, branches.localityId))
    .where(and(eq(dishRatings.userId, userId), eq(dishRatings.isCurrent, true)))
    .groupBy(branches.id, localities.name)
    .orderBy(desc(sql`max(${dishRatings.createdAt})`));
}

// Dish contributions (docs/CONTRIBUTIONS.md §5): born inside a rating submission, so they share its
// transaction and live with the ratings feature (D52).

export async function findDishByFingerprint(db: Executor, branchId: string, fingerprint: string) {
  const [row] = await db
    .select({ id: branchDishes.id, status: branchDishes.status })
    .from(branchDishes)
    .where(
      and(
        eq(branchDishes.branchId, branchId),
        eq(branchDishes.fingerprint, fingerprint),
        inArray(branchDishes.status, ['pending', 'active']),
      ),
    );
  return row ?? null;
}

export async function listBranchDishSlugs(db: Executor, branchId: string) {
  const rows = await db
    .select({ slug: branchDishes.slug })
    .from(branchDishes)
    .where(eq(branchDishes.branchId, branchId));
  return new Set(rows.map((row) => row.slug));
}

export async function insertCommunityDish(
  db: Executor,
  dish: {
    branchId: string;
    canonicalDishId: string | null;
    slug: string;
    name: string;
    normalizedName: string;
    fingerprint: string;
    menuSection: string;
    pricePaise: number | null;
    diet: 'veg' | 'egg' | 'nonveg';
    status: 'pending' | 'active';
    createdBy: string;
  },
) {
  // DO NOTHING (not an error) when someone added the same fingerprint a moment earlier, so the
  // surrounding transaction stays usable; the caller then reads that card instead.
  const [row] = await db
    .insert(branchDishes)
    .values({ ...dish, source: 'community' })
    .onConflictDoNothing()
    .returning({ id: branchDishes.id });
  return row?.id ?? null;
}

export async function insertDishAlias(
  db: Executor,
  alias: {
    branchDishId: string;
    rawText: string;
    normalizedText: string;
    createdBy: string;
    submittedPricePaise: number | null;
  },
) {
  await db
    .insert(branchDishAliases)
    .values({ ...alias, how: 'typed' })
    .onConflictDoNothing();
}

export async function openReviewTask(
  db: Executor,
  task: { kind: 'new_dish'; entityId: string; branchId: string; priority: number; openedBy: string },
) {
  await db.insert(reviewTasks).values(task).onConflictDoNothing();
}

export async function resolveReviewTask(
  db: Executor,
  kind: 'new_dish',
  entityId: string,
  resolution: string,
) {
  await db
    .update(reviewTasks)
    .set({ state: 'resolved', resolution, resolvedAt: new Date() })
    .where(
      and(eq(reviewTasks.kind, kind), eq(reviewTasks.entityId, entityId), eq(reviewTasks.state, 'open')),
    );
}

/** Current raters of a dish with their trust today (D45), for the activation rule (D47). */
export async function listCurrentRaters(db: Executor, branchDishId: string) {
  return db
    .select({ userId: dishRatings.userId, trust: currentTrust })
    .from(dishRatings)
    .leftJoin(profiles, eq(profiles.userId, dishRatings.userId))
    .where(
      and(
        eq(dishRatings.branchDishId, branchDishId),
        eq(dishRatings.isCurrent, true),
        eq(dishRatings.suspect, false),
      ),
    );
}

export async function activateDish(db: Executor, branchDishId: string) {
  await db
    .update(branchDishes)
    .set({ status: 'active' })
    .where(and(eq(branchDishes.id, branchDishId), eq(branchDishes.status, 'pending')));
}

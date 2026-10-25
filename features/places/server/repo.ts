import 'server-only';

import { and, asc, desc, eq, inArray, ne, sql } from 'drizzle-orm';
import { getDb } from '@/db/client';
import {
  branchCuisines,
  branches,
  branchHours,
  brands,
  cities,
  cuisines,
  facts,
  localities,
} from '@/db/schema';
import type { LatLng } from '@/shared/lib/geo';

const branchCard = {
  id: branches.id,
  slug: branches.slug,
  name: branches.name,
  priceBand: branches.priceBand,
  vegOnly: branches.vegOnly,
  foodScore: branches.foodScore,
  status: branches.status,
  location: branches.location,
  localityName: localities.name,
  localitySlug: localities.slug,
};

export async function findBranchBySlug(slug: string) {
  const db = getDb();
  const [branch] = await db
    .select({
      ...branchCard,
      address: branches.address,
      phone: branches.phone,
      paymentModes: branches.paymentModes,
      brandName: brands.name,
      brandSlug: brands.slug,
      cityId: cities.id,
      citySlug: cities.slug,
      cityName: cities.name,
      timezone: cities.timezone,
      localityId: localities.id,
    })
    .from(branches)
    .innerJoin(brands, eq(brands.id, branches.brandId))
    .innerJoin(localities, eq(localities.id, branches.localityId))
    .innerJoin(cities, eq(cities.id, branches.cityId))
    .where(and(eq(branches.slug, slug), ne(branches.status, 'permanently_closed')));
  if (!branch) return null;

  const [cuisineRows, hours, factRows] = await Promise.all([
    db
      .select({
        id: cuisines.id,
        slug: cuisines.slug,
        name: cuisines.name,
        isPrimary: branchCuisines.isPrimary,
      })
      .from(branchCuisines)
      .innerJoin(cuisines, eq(cuisines.id, branchCuisines.cuisineId))
      .where(eq(branchCuisines.branchId, branch.id))
      .orderBy(desc(branchCuisines.isPrimary), asc(cuisines.name)),
    db
      .select({
        dayOfWeek: branchHours.dayOfWeek,
        opensAt: branchHours.opensAt,
        closesAt: branchHours.closesAt,
      })
      .from(branchHours)
      .where(eq(branchHours.branchId, branch.id))
      .orderBy(asc(branchHours.dayOfWeek), asc(branchHours.opensAt)),
    db
      .select({ field: facts.field, value: facts.value, verifiedAt: facts.verifiedAt, source: facts.source })
      .from(facts)
      .where(eq(facts.branchId, branch.id)),
  ]);

  return { ...branch, cuisines: cuisineRows, hours, facts: factRows };
}

export async function listPublishedBranchSlugs() {
  const rows = await getDb()
    .select({ slug: branches.slug })
    .from(branches)
    .where(ne(branches.status, 'permanently_closed'))
    .orderBy(asc(branches.slug));
  return rows.map((row) => row.slug);
}

export async function findNearbyBranches(input: {
  branchId: string;
  location: LatLng;
  cuisineIds: string[];
  radiusMeters: number;
  limit: number;
}) {
  if (input.cuisineIds.length === 0) return [];
  const point = sql`ST_SetSRID(ST_MakePoint(${input.location.lng}, ${input.location.lat}), 4326)::geography`;
  return getDb()
    .select({
      ...branchCard,
      distanceMeters: sql<number>`ST_Distance(${branches.location}, ${point})`.mapWith(Number),
    })
    .from(branches)
    .innerJoin(localities, eq(localities.id, branches.localityId))
    .where(
      and(
        ne(branches.id, input.branchId),
        eq(branches.status, 'active'),
        sql`ST_DWithin(${branches.location}, ${point}, ${input.radiusMeters})`,
        sql`exists (select 1 from ${branchCuisines} where ${branchCuisines.branchId} = ${branches.id} and ${inArray(branchCuisines.cuisineId, input.cuisineIds)})`,
      ),
    )
    .orderBy(
      sql`${branches.foodScore} desc nulls last`,
      asc(sql`ST_Distance(${branches.location}, ${point})`),
    )
    .limit(input.limit);
}

export async function listBranchesInLocality(localityId: string, limit: number) {
  return getDb()
    .select(branchCard)
    .from(branches)
    .innerJoin(localities, eq(localities.id, branches.localityId))
    .where(and(eq(branches.localityId, localityId), eq(branches.status, 'active')))
    .orderBy(sql`${branches.foodScore} desc nulls last`, asc(branches.name))
    .limit(limit);
}

export async function findCuisineBySlug(slug: string) {
  const [cuisine] = await getDb()
    .select({ id: cuisines.id, slug: cuisines.slug, name: cuisines.name })
    .from(cuisines)
    .where(eq(cuisines.slug, slug));
  return cuisine ?? null;
}

export async function listCuisineSlugs() {
  const rows = await getDb().select({ slug: cuisines.slug }).from(cuisines).orderBy(asc(cuisines.slug));
  return rows.map((row) => row.slug);
}

export async function listBranchesForCuisine(cityId: string, cuisineId: string, limit: number) {
  return getDb()
    .select(branchCard)
    .from(branches)
    .innerJoin(localities, eq(localities.id, branches.localityId))
    .innerJoin(branchCuisines, eq(branchCuisines.branchId, branches.id))
    .where(
      and(
        eq(branches.cityId, cityId),
        eq(branchCuisines.cuisineId, cuisineId),
        eq(branches.status, 'active'),
      ),
    )
    .orderBy(sql`${branches.foodScore} desc nulls last`, asc(branches.name))
    .limit(limit);
}

export async function listHoursForBranches(branchIds: string[]) {
  if (branchIds.length === 0) return [];
  return getDb()
    .select({
      branchId: branchHours.branchId,
      dayOfWeek: branchHours.dayOfWeek,
      opensAt: branchHours.opensAt,
      closesAt: branchHours.closesAt,
    })
    .from(branchHours)
    .where(inArray(branchHours.branchId, branchIds));
}

export async function listCuisines() {
  return getDb()
    .select({ slug: cuisines.slug, name: cuisines.name })
    .from(cuisines)
    .orderBy(asc(cuisines.name));
}

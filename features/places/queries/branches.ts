import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';
import { getRankingConfig } from '@/features/ratings/queries/ranking-config';
import { daysBetween } from '@/shared/lib/time';
import type { HoursRow } from '../lib/opening-hours';
import {
  findBranchBySlug,
  findCuisineBySlug,
  listCuisines,
  findNearbyBranches,
  listBranchesForCuisine,
  listBranchesInLocality,
  listCuisineSlugs,
  listHoursForBranches,
  listPublishedBranchSlugs,
} from '../server/repo';

export type BranchDetail = NonNullable<Awaited<ReturnType<typeof getBranch>>>;
export type BranchCard = Awaited<ReturnType<typeof listBranchesInLocality>>[number] & { hours: HoursRow[] };

async function withHours<T extends { id: string }>(rows: T[]): Promise<(T & { hours: HoursRow[] })[]> {
  const hours = await listHoursForBranches(rows.map((row) => row.id));
  return rows.map((row) => ({
    ...row,
    hours: hours
      .filter((entry) => entry.branchId === row.id)
      .map(({ dayOfWeek, opensAt, closesAt }) => ({ dayOfWeek, opensAt, closesAt })),
  }));
}

export async function getBranch(slug: string) {
  'use cache';
  cacheLife('branch');
  cacheTag(`branch-slug:${slug}`);
  const [branch, freshness] = await Promise.all([
    findBranchBySlug(slug),
    getRankingConfig('fact_freshness_days'),
  ]);
  if (!branch) return null;
  cacheTag(`branch:${branch.id}`);
  const now = new Date();
  return {
    ...branch,
    facts: branch.facts.map((fact) => {
      const ageDays = daysBetween(fact.verifiedAt, now);
      return { ...fact, ageDays, stale: ageDays > freshness[fact.field] };
    }),
  };
}

export async function getBranchSlugs() {
  'use cache';
  cacheLife('branch');
  cacheTag('branches');
  return listPublishedBranchSlugs();
}

export async function getNearbyAlternatives(branch: Pick<BranchDetail, 'id' | 'location' | 'cuisines'>) {
  'use cache';
  cacheLife('catalog');
  cacheTag(`branch:${branch.id}`, 'branches');
  const config = await getRankingConfig('nearby_alternatives');
  const primary = branch.cuisines.filter((cuisine) => cuisine.isPrimary).map((cuisine) => cuisine.id);
  const rows = await findNearbyBranches({
    branchId: branch.id,
    location: branch.location,
    cuisineIds: primary.length > 0 ? primary : branch.cuisines.map((cuisine) => cuisine.id),
    radiusMeters: config.radiusMeters,
    limit: config.limit,
  });
  return withHours(rows);
}

export async function getLocalityBranches(localityId: string) {
  'use cache';
  cacheLife('catalog');
  cacheTag(`locality:${localityId}`, 'branches');
  return withHours(await listBranchesInLocality(localityId, 12));
}

export async function getCuisineOptions() {
  'use cache';
  cacheLife('cuisine');
  cacheTag('cuisines');
  return listCuisines();
}

export async function getCuisine(slug: string) {
  'use cache';
  cacheLife('cuisine');
  cacheTag(`cuisine-slug:${slug}`);
  return findCuisineBySlug(slug);
}

export async function getCuisineSlugs() {
  'use cache';
  cacheLife('cuisine');
  cacheTag('cuisines');
  return listCuisineSlugs();
}

export async function getCuisineBranches(cityId: string, cuisineId: string) {
  'use cache';
  cacheLife('cuisine');
  cacheTag(`cuisine:${cuisineId}`, 'branches');
  return withHours(await listBranchesForCuisine(cityId, cuisineId, 24));
}

export async function getHoursForBranches(branchIds: string[]) {
  'use cache';
  cacheLife('branch');
  cacheTag('branches', ...branchIds.map((id) => `branch:${id}`));
  const rows = await listHoursForBranches(branchIds);
  const byBranch = new Map<string, HoursRow[]>();
  for (const { branchId, ...row } of rows) byBranch.set(branchId, [...(byBranch.get(branchId) ?? []), row]);
  return Object.fromEntries(byBranch);
}

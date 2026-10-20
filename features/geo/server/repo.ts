import 'server-only';

import { and, asc, eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { cities, localities } from '@/db/schema';

export async function findCityBySlug(slug: string) {
  const [city] = await getDb()
    .select({
      id: cities.id,
      slug: cities.slug,
      name: cities.name,
      timezone: cities.timezone,
      center: cities.center,
    })
    .from(cities)
    .where(eq(cities.slug, slug));
  return city ?? null;
}

export async function listLocalities(cityId: string) {
  return getDb()
    .select({
      id: localities.id,
      slug: localities.slug,
      name: localities.name,
      isLaunch: localities.isLaunch,
    })
    .from(localities)
    .where(eq(localities.cityId, cityId))
    .orderBy(asc(localities.sortOrder));
}

export async function findLocality(cityId: string, slug: string) {
  const [locality] = await getDb()
    .select({ id: localities.id, slug: localities.slug, name: localities.name, center: localities.center })
    .from(localities)
    .where(and(eq(localities.cityId, cityId), eq(localities.slug, slug)));
  return locality ?? null;
}

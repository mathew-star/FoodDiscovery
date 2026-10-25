import 'server-only';

import { and, eq, inArray, sql } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { cuisines, localities, profiles, users } from '@/db/schema';

export async function findProfile(userId: string) {
  const [profile] = await getDb()
    .select({
      username: profiles.username,
      displayName: profiles.displayName,
      role: profiles.role,
      trustLevel: profiles.trustLevel,
      diet: profiles.diet,
      onboardedAt: profiles.onboardedAt,
    })
    .from(profiles)
    .where(eq(profiles.userId, userId));
  return profile ?? null;
}

export async function isUsernameTaken(username: string, exceptUserId?: string) {
  const [row] = await getDb()
    .select({ userId: profiles.userId })
    .from(profiles)
    .where(sql`lower(${profiles.username}) = ${username.toLowerCase()}`);
  return row !== undefined && row.userId !== exceptUserId;
}

export async function countKnownCuisines(slugs: string[]) {
  if (slugs.length === 0) return 0;
  const rows = await getDb()
    .select({ slug: cuisines.slug })
    .from(cuisines)
    .where(inArray(cuisines.slug, slugs));
  return rows.length;
}

export async function findLocalityId(slug: string) {
  const [row] = await getDb()
    .select({ id: localities.id })
    .from(localities)
    .where(and(eq(localities.slug, slug)));
  return row?.id ?? null;
}

export type ProfileWrite = {
  userId: string;
  username: string;
  displayName: string;
  diet: (typeof profiles.$inferInsert)['diet'];
  cuisines: string[];
  homeLocalityId: string | null;
};

/** Creates or completes the profile; the unique username index is the final arbiter of races. */
export async function upsertOnboardedProfile(input: ProfileWrite) {
  const now = new Date();
  await getDb()
    .insert(profiles)
    .values({ ...input, adultConfirmedAt: now, onboardedAt: now })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: {
        username: input.username,
        displayName: input.displayName,
        diet: input.diet,
        cuisines: input.cuisines,
        homeLocalityId: input.homeLocalityId,
        adultConfirmedAt: now,
        onboardedAt: now,
      },
    });
}

export async function deleteUser(userId: string) {
  await getDb().delete(users).where(eq(users.id, userId));
}

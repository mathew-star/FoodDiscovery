import { eq, inArray } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { Database } from '@/db/client';
import type * as Schema from '@/db/schema';

vi.mock('server-only', () => ({}));
vi.mock('next/cache', () => ({ cacheLife: () => undefined, cacheTag: () => undefined }));

const enabled = process.env.DATABASE_DRIVER === 'pg' && Boolean(process.env.DATABASE_URL);
const DAY_MS = 86_400_000;

describe.runIf(enabled)('nightly jobs (seeded database)', () => {
  let db: Database;
  let schema: typeof Schema;
  const userIds: string[] = [];

  async function member(trust: 't0' | 't1' | 'founding', ageDays: number) {
    const { uuidv7 } = await import('@/shared/lib/uuid');
    const id = uuidv7();
    userIds.push(id);
    const createdAt = new Date(Date.now() - ageDays * DAY_MS);
    await db
      .insert(schema.users)
      .values({ id, name: 'Job test', email: `${id}@example.com`, emailVerified: true, createdAt });
    await db.insert(schema.profiles).values({
      userId: id,
      username: `j_${id.slice(-12)}`,
      displayName: 'Job test',
      trustLevel: trust,
      onboardedAt: createdAt,
    });
    return id;
  }

  async function rateThree(userId: string) {
    const dishes = await db
      .select({ id: schema.branchDishes.id })
      .from(schema.branchDishes)
      .where(eq(schema.branchDishes.status, 'active'))
      .limit(3);
    await db.insert(schema.dishRatings).values(
      dishes.map((dish) => ({
        userId,
        branchDishId: dish.id,
        sentiment: 'good' as const,
        trustAtTime: 't0' as const,
      })),
    );
  }

  const trustOf = async (userId: string) =>
    (
      await db
        .select({ trust: schema.profiles.trustLevel })
        .from(schema.profiles)
        .where(eq(schema.profiles.userId, userId))
    )[0]?.trust;

  beforeAll(async () => {
    db = (await import('@/db/client')).getDb();
    schema = await import('@/db/schema');
  });

  afterAll(async () => {
    if (userIds.length) await db.delete(schema.users).where(inArray(schema.users.id, userIds));
    const { recomputeAllScores } = await import('@/features/ratings/server/service');
    await recomputeAllScores();
  });

  it('promotes, holds and demotes by the §2.2 rules and leaves founding alone', async () => {
    const { recomputeTrustLevels } = await import('@/features/profile/server/service');
    const promoted = await member('t0', 5);
    await rateThree(promoted);
    const tooNew = await member('t0', 1);
    await rateThree(tooNew);
    const idle = await member('t1', 90);
    const founding = await member('founding', 1);

    const result = await recomputeTrustLevels();
    expect(result.changed).toBeGreaterThanOrEqual(2);
    expect(await trustOf(promoted)).toBe('t1');
    expect(await trustOf(tooNew)).toBe('t0');
    expect(await trustOf(idle)).toBe('t0');
    expect(await trustOf(founding)).toBe('founding');
  });

  it('recomputes every score and is stable when nothing changed', async () => {
    const { recomputeAllScores } = await import('@/features/ratings/server/service');
    const first = await recomputeAllScores();
    expect(first.branches).toBeGreaterThan(10);
    const snapshot = await db
      .select({ id: schema.branchDishes.id, score: schema.branchDishes.score })
      .from(schema.branchDishes);
    await recomputeAllScores();
    const again = await db
      .select({ id: schema.branchDishes.id, score: schema.branchDishes.score })
      .from(schema.branchDishes);
    const before = new Map(snapshot.map((row) => [row.id, row.score ?? 0]));
    for (const row of again) expect(row.score ?? 0).toBeCloseTo(before.get(row.id) ?? 0, 4);
  });
});

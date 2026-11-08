import { and, eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { Database } from '@/db/client';
import type * as Schema from '@/db/schema';
import type * as RatingsService from '@/features/ratings/server/service';

vi.mock('server-only', () => ({}));
vi.mock('next/cache', () => ({ cacheLife: () => undefined, cacheTag: () => undefined }));

const enabled = process.env.DATABASE_DRIVER === 'pg' && Boolean(process.env.DATABASE_URL);

describe.runIf(enabled)('ratings service (seeded database)', () => {
  let service: typeof RatingsService;
  let db: Database;
  let schema: typeof Schema;
  const userIds: string[] = [];
  let branch: { id: string; brandId: string };
  let dishes: { id: string; ratingCount: number; score: number | null }[];

  async function member(trust: 't0' | 't1' | 't2' | 'founding', onboarded = true) {
    const { uuidv7 } = await import('@/shared/lib/uuid');
    const id = uuidv7();
    userIds.push(id);
    await db
      .insert(schema.users)
      .values({ id, name: 'Rater', email: `${id}@example.com`, emailVerified: true });
    await db.insert(schema.profiles).values({
      userId: id,
      username: `r_${id.slice(-12)}`,
      displayName: 'Rater',
      trustLevel: trust,
      onboardedAt: onboarded ? new Date() : null,
    });
    return id;
  }

  const dishRow = async (id: string) =>
    (await db.select().from(schema.branchDishes).where(eq(schema.branchDishes.id, id)))[0];

  beforeAll(async () => {
    service = await import('@/features/ratings/server/service');
    db = (await import('@/db/client')).getDb();
    schema = await import('@/db/schema');
    const [first] = await db
      .select({ id: schema.branches.id, brandId: schema.branches.brandId })
      .from(schema.branches)
      .where(eq(schema.branches.slug, 'deccan-degh-house-old-city'));
    if (!first) throw new Error('seed missing');
    branch = first;
    dishes = await db
      .select({
        id: schema.branchDishes.id,
        ratingCount: schema.branchDishes.ratingCount,
        score: schema.branchDishes.score,
      })
      .from(schema.branchDishes)
      .where(eq(schema.branchDishes.branchId, branch.id));
  });

  afterAll(async () => {
    const { inArray } = await import('drizzle-orm');
    if (userIds.length) await db.delete(schema.users).where(inArray(schema.users.id, userIds));
    await service.recomputeDishes(
      db,
      dishes.map((dish) => dish.id),
    );
    await service.recomputeBranch(db, branch.id, { aspects: true });
  });

  it('reproduces the seeded score from the stored ratings', async () => {
    const [dish] = dishes;
    if (!dish) throw new Error('no dish');
    await service.recomputeDishes(db, [dish.id]);
    const after = await dishRow(dish.id);
    expect(after?.ratingCount).toBe(dish.ratingCount);
    expect(after?.score).toBeCloseTo(dish.score ?? 0, 2);
  });

  it('saves a rating, updates the score, and keeps history on re-rate', async () => {
    const userId = await member('t1');
    const [dish] = dishes;
    if (!dish) throw new Error('no dish');
    const before = await dishRow(dish.id);

    const first = await service.rateBranch(userId, {
      branchId: branch.id,
      newDishes: [],
      dishes: [{ branchDishId: dish.id, sentiment: 'skip' }],
      aspects: null,
    });
    expect(first).toMatchObject({ ok: true, data: { savedDishes: 1, aspectsSaved: false } });
    const afterSkip = await dishRow(dish.id);
    expect(afterSkip?.ratingCount).toBe((before?.ratingCount ?? 0) + 1);
    expect(afterSkip?.score ?? 1).toBeLessThan(before?.score ?? 0);

    const same = await service.rateBranch(userId, {
      branchId: branch.id,
      newDishes: [],
      dishes: [{ branchDishId: dish.id, sentiment: 'skip' }],
      aspects: null,
    });
    expect(same).toMatchObject({ ok: true, data: { savedDishes: 0 } });

    await service.rateBranch(userId, {
      branchId: branch.id,
      newDishes: [],
      dishes: [{ branchDishId: dish.id, sentiment: 'loved' }],
      aspects: null,
    });
    const rows = await db
      .select({ isCurrent: schema.dishRatings.isCurrent, sentiment: schema.dishRatings.sentiment })
      .from(schema.dishRatings)
      .where(and(eq(schema.dishRatings.userId, userId), eq(schema.dishRatings.branchDishId, dish.id)));
    expect(rows.sort((a, b) => Number(a.isCurrent) - Number(b.isCurrent))).toEqual([
      { isCurrent: false, sentiment: 'skip' },
      { isCurrent: true, sentiment: 'loved' },
    ]);
    expect((await dishRow(dish.id))?.ratingCount).toBe((before?.ratingCount ?? 0) + 1);
  });

  it('saves restaurant aspects once and counts the respondent', async () => {
    const userId = await member('t2');
    const [branchBefore] = await db.select().from(schema.branches).where(eq(schema.branches.id, branch.id));
    const aspects = { value: 'good', service: 'okay', ambience: null, wouldReturn: true } as const;
    expect(
      await service.rateBranch(userId, { branchId: branch.id, newDishes: [], dishes: [], aspects }),
    ).toMatchObject({
      ok: true,
      data: { aspectsSaved: true },
    });
    expect(
      await service.rateBranch(userId, { branchId: branch.id, newDishes: [], dishes: [], aspects }),
    ).toMatchObject({
      ok: true,
      data: { aspectsSaved: false },
    });
    const [branchAfter] = await db.select().from(schema.branches).where(eq(schema.branches.id, branch.id));
    expect(branchAfter?.aspectCount).toBe((branchBefore?.aspectCount ?? 0) + 1);
  });

  it('shows but does not count a rating from someone affiliated with the brand', async () => {
    const userId = await member('t1');
    await db.insert(schema.brandAffiliations).values({ userId, brandId: branch.brandId, role: 'owner' });
    const dish = dishes[1];
    if (!dish) throw new Error('no dish');
    // Weights decay with age, so the baseline is a fresh recompute, not the seeded value.
    await service.recomputeDishes(db, [dish.id]);
    const before = await dishRow(dish.id);
    await service.rateBranch(userId, {
      branchId: branch.id,
      newDishes: [],
      dishes: [{ branchDishId: dish.id, sentiment: 'loved' }],
      aspects: null,
    });
    const after = await dishRow(dish.id);
    expect(after?.ratingCount).toBe((before?.ratingCount ?? 0) + 1);
    expect(after?.weightSum).toBeCloseTo(before?.weightSum ?? 0, 3);
  });

  it('refuses members who have not finished onboarding and dishes from another branch', async () => {
    const pending = await member('t1', false);
    const [dish] = dishes;
    if (!dish) throw new Error('no dish');
    expect(
      await service.rateBranch(pending, {
        branchId: branch.id,
        newDishes: [],
        dishes: [{ branchDishId: dish.id, sentiment: 'good' }],
        aspects: null,
      }),
    ).toEqual({
      ok: false,
      error: { code: 'forbidden', message: 'onboarding_required' },
    });
    const userId = await member('t1');
    const [other] = await db
      .select({ id: schema.branchDishes.id })
      .from(schema.branchDishes)
      .innerJoin(schema.branches, eq(schema.branches.id, schema.branchDishes.branchId))
      .where(eq(schema.branches.slug, 'qamar-irani-cafe-old-city'))
      .limit(1);
    expect(
      await service.rateBranch(userId, {
        branchId: branch.id,
        newDishes: [],
        dishes: [{ branchDishId: other?.id ?? '', sentiment: 'good' }],
        aspects: null,
      }),
    ).toEqual({ ok: false, error: { code: 'invalid_input' } });
  });
});

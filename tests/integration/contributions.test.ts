import { and, eq, inArray, type SQL } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { Database } from '@/db/client';
import type * as Schema from '@/db/schema';
import type * as RatingsService from '@/features/ratings/server/service';

vi.mock('server-only', () => ({}));
vi.mock('next/cache', () => ({ cacheLife: () => undefined, cacheTag: () => undefined }));

const enabled = process.env.DATABASE_DRIVER === 'pg' && Boolean(process.env.DATABASE_URL);

describe.runIf(enabled)('dish contributions (docs/CONTRIBUTIONS.md §5)', () => {
  let service: typeof RatingsService;
  let db: Database;
  let schema: typeof Schema;
  const userIds: string[] = [];
  const createdDishIds: string[] = [];
  let branchId: string;

  async function member(trust: 't0' | 't1') {
    const { uuidv7 } = await import('@/shared/lib/uuid');
    const id = uuidv7();
    userIds.push(id);
    await db
      .insert(schema.users)
      .values({ id, name: 'Contributor', email: `${id}@example.com`, emailVerified: true });
    await db.insert(schema.profiles).values({
      userId: id,
      username: `c_${id.slice(-12)}`,
      displayName: 'Contributor',
      trustLevel: trust,
      onboardedAt: new Date(),
    });
    return id;
  }

  const rate = (
    userId: string,
    newDishes: { name: string; sentiment: 'loved' | 'good' | 'okay' | 'skip' }[],
    dishes: { branchDishId: string; sentiment: 'loved' | 'good' | 'okay' | 'skip' }[] = [],
  ) =>
    service.rateBranch(userId, {
      branchId,
      dishes,
      newDishes: newDishes.map((dish) => ({ ...dish, diet: 'nonveg' as const, pricePaise: null })),
      aspects: null,
    });

  const dishBy = async (where: SQL) =>
    db
      .select()
      .from(schema.branchDishes)
      .where(and(eq(schema.branchDishes.branchId, branchId), where));

  beforeAll(async () => {
    service = await import('@/features/ratings/server/service');
    db = (await import('@/db/client')).getDb();
    schema = await import('@/db/schema');
    const [branch] = await db
      .select({ id: schema.branches.id })
      .from(schema.branches)
      .where(eq(schema.branches.slug, 'hitech-biryani-co-madhapur'));
    if (!branch) throw new Error('seed missing');
    branchId = branch.id;
    await removeCommunityDishes();
  });

  // Other suites (e2e) may have added dishes at this branch; each run starts from the seeded menu.
  async function removeCommunityDishes() {
    const community = await db
      .select({ id: schema.branchDishes.id })
      .from(schema.branchDishes)
      .where(and(eq(schema.branchDishes.branchId, branchId), eq(schema.branchDishes.source, 'community')));
    const ids = [...new Set([...createdDishIds, ...community.map((row) => row.id)])];
    if (ids.length === 0) return;
    await db.delete(schema.reviewTasks).where(inArray(schema.reviewTasks.entityId, ids));
    await db.delete(schema.branchDishes).where(inArray(schema.branchDishes.id, ids));
  }

  afterAll(async () => {
    await removeCommunityDishes();
    if (userIds.length) {
      await db.delete(schema.branchDishAliases).where(inArray(schema.branchDishAliases.createdBy, userIds));
      await db.delete(schema.users).where(inArray(schema.users.id, userIds));
    }
  });

  it('joins a differently spelt name to the existing card and keeps the spelling as an alias (Gate 2)', async () => {
    const userId = await member('t1');
    const [existing] = await dishBy(eq(schema.branchDishes.fingerprint, 'biryani_chicken_dum'));
    expect(await rate(userId, [{ name: 'Chk dum biriyani (full plate)', sentiment: 'loved' }])).toMatchObject(
      { ok: true },
    );
    expect(await dishBy(eq(schema.branchDishes.fingerprint, 'biryani_chicken_dum'))).toHaveLength(1);
    const aliases = await db
      .select({ rawText: schema.branchDishAliases.rawText })
      .from(schema.branchDishAliases)
      .where(eq(schema.branchDishAliases.branchDishId, existing?.id ?? ''));
    expect(aliases.map((alias) => alias.rawText)).toContain('Chk dum biriyani (full plate)');
  });

  it('saves an unknown dish as pending with an Ops task, visible but not counted, until corroborated (D47)', async () => {
    const newcomer = await member('t0');
    expect(await rate(newcomer, [{ name: 'mutton marag', sentiment: 'loved' }])).toMatchObject({ ok: true });
    const [dish] = await dishBy(eq(schema.branchDishes.fingerprint, 'marag_mutton'));
    if (!dish) throw new Error('no pending dish');
    createdDishIds.push(dish.id);
    expect(dish).toMatchObject({
      name: 'Mutton Marag',
      status: 'pending',
      source: 'community',
      ratingCount: 1,
      weightSum: 0,
    });
    const [task] = await db.select().from(schema.reviewTasks).where(eq(schema.reviewTasks.entityId, dish.id));
    expect(task).toMatchObject({ kind: 'new_dish', state: 'open', priority: 2 });

    const secondNewcomer = await member('t0');
    await rate(secondNewcomer, [], [{ branchDishId: dish.id, sentiment: 'good' }]);
    expect((await dishBy(eq(schema.branchDishes.id, dish.id)))[0]?.status).toBe('pending');

    const regular = await member('t1');
    await rate(regular, [{ name: 'Marag (mutton)', sentiment: 'loved' }]);
    const [after] = await dishBy(eq(schema.branchDishes.id, dish.id));
    expect(after).toMatchObject({ status: 'active', ratingCount: 3 });
    expect(after?.weightSum).toBeGreaterThan(0);
    const [resolved] = await db
      .select()
      .from(schema.reviewTasks)
      .where(eq(schema.reviewTasks.entityId, dish.id));
    expect(resolved).toMatchObject({ state: 'resolved', resolution: 'corroborated' });
  });

  it('lists a known canonical dish at once when a regular member adds it', async () => {
    const regular = await member('t1');
    await rate(regular, [{ name: 'Seekh kabab', sentiment: 'good' }]);
    const [dish] = await dishBy(eq(schema.branchDishes.fingerprint, 'kebab_seekh'));
    if (!dish) throw new Error('no dish');
    createdDishIds.push(dish.id);
    expect(dish.status).toBe('active');
    expect(dish.canonicalDishId).not.toBeNull();
    expect(
      await db.select().from(schema.reviewTasks).where(eq(schema.reviewTasks.entityId, dish.id)),
    ).toHaveLength(0);
  });

  it('shows a pending dish on the public menu only when a regular member added it (§5.4)', async () => {
    const { listDishesForBranch } = await import('@/features/dishes/server/repo');
    await rate(await member('t0'), [{ name: 'Talawa gosht', sentiment: 'good' }]);
    await rate(await member('t1'), [{ name: 'Nalli nihari', sentiment: 'loved' }]);
    const menu = (await listDishesForBranch(branchId)).map((dish) => [dish.name, dish.status]);
    expect(menu).toContainEqual(['Nalli Nihari', 'pending']);
    expect(menu.map(([name]) => name)).not.toContain('Talawa Gosht');
  });

  it('refuses names that cannot be dishes', async () => {
    const userId = await member('t1');
    expect(await rate(userId, [{ name: 'order now www.spam.in', sentiment: 'loved' }])).toEqual({
      ok: false,
      error: { code: 'invalid_input', message: 'dish_name' },
    });
  });
});

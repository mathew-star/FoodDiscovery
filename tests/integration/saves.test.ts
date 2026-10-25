import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type * as SavesService from '@/features/saves/server/service';

vi.mock('server-only', () => ({}));

const enabled = process.env.DATABASE_DRIVER === 'pg' && Boolean(process.env.DATABASE_URL);

describe.runIf(enabled)('saves service (seeded database)', () => {
  let service: typeof SavesService;
  let userId: string;
  let branch: { id: string };
  let dish: { id: string; branchId: string };
  let otherDish: { id: string; branchId: string };

  beforeAll(async () => {
    service = await import('@/features/saves/server/service');
    const { getDb } = await import('@/db/client');
    const { users, branchDishes } = await import('@/db/schema');
    const { uuidv7 } = await import('@/shared/lib/uuid');
    userId = uuidv7();
    await getDb()
      .insert(users)
      .values({ id: userId, name: 'Saves Test', email: `${userId}@example.com` });
    const dishes = await getDb()
      .select({ id: branchDishes.id, branchId: branchDishes.branchId })
      .from(branchDishes)
      .limit(2);
    const [first, second] = dishes;
    if (!first || !second) throw new Error('seed missing');
    dish = first;
    otherDish = second;
    branch = { id: first.branchId };
  });

  afterAll(async () => {
    const { getDb } = await import('@/db/client');
    const { users } = await import('@/db/schema');
    await getDb().delete(users).where(eq(users.id, userId));
  });

  it('toggles a dish in Want to try', async () => {
    const target = { kind: 'dish' as const, id: dish.id, branchId: dish.branchId };
    expect(await service.toggleSave(userId, target)).toEqual({ ok: true, data: { saved: true } });
    expect(await service.listSavedKeys(userId)).toEqual([`dish:${dish.id}`]);
    expect(await service.toggleSave(userId, target)).toEqual({ ok: true, data: { saved: false } });
    expect(await service.listSavedKeys(userId)).toEqual([]);
  });

  it('refuses a dish claimed at the wrong branch', async () => {
    const wrongBranch = {
      kind: 'dish' as const,
      id: dish.id,
      branchId: '01920000-0000-7000-8000-000000000000',
    };
    expect(await service.toggleSave(userId, wrongBranch)).toEqual({
      ok: false,
      error: { code: 'not_found' },
    });
  });

  it('imports device saves once, skipping duplicates and unknown targets', async () => {
    await service.toggleSave(userId, { kind: 'branch', id: branch.id, branchId: branch.id });
    const result = await service.importDeviceSaves(userId, [
      { kind: 'branch', id: branch.id, branchId: branch.id },
      { kind: 'dish', id: otherDish.id, branchId: otherDish.branchId },
      { kind: 'dish', id: otherDish.id, branchId: otherDish.branchId },
      {
        kind: 'branch',
        id: '01920000-0000-7000-8000-000000000001',
        branchId: '01920000-0000-7000-8000-000000000001',
      },
    ]);
    expect(result).toEqual({ ok: true, data: { imported: 1 } });
    expect((await service.listSavedKeys(userId)).sort()).toEqual(
      [`branch:${branch.id}`, `dish:${otherDish.id}`].sort(),
    );
    expect(
      await service.importDeviceSaves(userId, [
        { kind: 'dish', id: otherDish.id, branchId: otherDish.branchId },
      ]),
    ).toEqual({
      ok: true,
      data: { imported: 0 },
    });
  });
});

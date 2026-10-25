import { eq } from 'drizzle-orm';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const enabled = process.env.DATABASE_DRIVER === 'pg' && Boolean(process.env.DATABASE_URL);

describe.runIf(enabled)('analytics repository', () => {
  it('stores events with entity columns and props', async () => {
    const { insertAnalyticsEvents } = await import('@/features/analytics/server/repo');
    const { getDb } = await import('@/db/client');
    const { analyticsEvents } = await import('@/db/schema');
    const { uuidv7 } = await import('@/shared/lib/uuid');

    const deviceId = uuidv7();
    const branchId = uuidv7();
    await insertAnalyticsEvents([
      {
        name: 'call_click',
        deviceId,
        userId: null,
        branchId,
        branchDishId: null,
        props: { surface: 'branch' },
      },
    ]);

    const rows = await getDb().select().from(analyticsEvents).where(eq(analyticsEvents.deviceId, deviceId));
    expect(rows).toEqual([
      expect.objectContaining({
        name: 'call_click',
        branchId,
        branchDishId: null,
        props: { surface: 'branch' },
      }),
    ]);
    await getDb().delete(analyticsEvents).where(eq(analyticsEvents.deviceId, deviceId));
  });
});

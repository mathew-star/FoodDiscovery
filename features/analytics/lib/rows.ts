import type { ClientEvent } from '../schemas/events';

export type AnalyticsRow = {
  name: ClientEvent['name'];
  deviceId: string;
  userId: string | null;
  branchId: string | null;
  branchDishId: string | null;
  props: Record<string, unknown>;
};

// Entity ids move to indexed columns (popularity and per-branch views read them); the rest is props.
export function toAnalyticsRow(
  event: ClientEvent,
  actor: { deviceId: string; userId: string | null },
): AnalyticsRow {
  const { name, ...rest } = event;
  const { branchId, branchDishId, ...props } = rest as Record<string, unknown> & {
    branchId?: string;
    branchDishId?: string;
  };
  return { name, ...actor, branchId: branchId ?? null, branchDishId: branchDishId ?? null, props };
}

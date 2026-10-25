import 'server-only';

import { err, ok, type Result } from '@/shared/lib/result';
import { maxListItems, saveKey, type SaveTarget } from '../schemas/save-target';
import {
  addItem,
  countItems,
  ensureDefaultLists,
  findItem,
  findLiveTargets,
  listSavedTargets,
  removeItem,
} from './repo';

const dishId = (target: SaveTarget) => (target.kind === 'dish' ? target.id : null);

/** Drops targets that no longer exist or whose dish is not at the branch it names. */
async function liveOnly(targets: SaveTarget[]): Promise<SaveTarget[]> {
  const live = await findLiveTargets(
    [...new Set(targets.map((target) => target.branchId))],
    targets.flatMap((target) => (target.kind === 'dish' ? [target.id] : [])),
  );
  return targets.filter((target) =>
    target.kind === 'dish' ? live.dishes.get(target.id) === target.branchId : live.branches.has(target.id),
  );
}

/** Spec E9-2: one tap saves to "Want to try"; a second tap removes. */
export async function toggleSave(userId: string, target: SaveTarget): Promise<Result<{ saved: boolean }>> {
  if ((await liveOnly([target])).length === 0) return err({ code: 'not_found' });
  const { want_to_try: listId } = await ensureDefaultLists(userId);
  if (await findItem(listId, target.branchId, dishId(target))) {
    await removeItem(listId, target.branchId, dishId(target));
    return ok({ saved: false });
  }
  if ((await countItems(listId)) >= maxListItems) return err({ code: 'conflict', message: 'list_full' });
  await addItem(listId, target.branchId, dishId(target));
  return ok({ saved: true });
}

/** Spec E1-4: device saves join "Want to try", de-duplicated, up to the list limit. */
export async function importDeviceSaves(
  userId: string,
  targets: SaveTarget[],
): Promise<Result<{ imported: number }>> {
  const { want_to_try: listId } = await ensureDefaultLists(userId);
  const existing = new Set(
    (await listSavedTargets(listId)).map((row) =>
      saveKey(
        row.branchDishId ? { kind: 'dish', id: row.branchDishId } : { kind: 'branch', id: row.branchId },
      ),
    ),
  );
  const fresh = (await liveOnly(targets)).filter((target, index, all) => {
    const key = saveKey(target);
    return !existing.has(key) && all.findIndex((other) => saveKey(other) === key) === index;
  });
  const room = Math.max(0, maxListItems - existing.size);
  const accepted = fresh.slice(0, room);
  // Oldest first so the newest device save ends up last, like a fresh tap would.
  for (const target of [...accepted].reverse()) await addItem(listId, target.branchId, dishId(target));
  return ok({ imported: accepted.length });
}

export async function listSavedKeys(userId: string): Promise<string[]> {
  const { want_to_try: listId } = await ensureDefaultLists(userId);
  return (await listSavedTargets(listId)).map((row) =>
    saveKey(row.branchDishId ? { kind: 'dish', id: row.branchDishId } : { kind: 'branch', id: row.branchId }),
  );
}

import 'server-only';

import { and, asc, eq, inArray, isNull, sql } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { branchDishes, branches, listItems, lists, localities } from '@/db/schema';

type DefaultKind = 'want_to_try' | 'been_there';
const defaultTitles: Record<DefaultKind, string> = { want_to_try: 'Want to try', been_there: 'Been there' };

/** Creates both default lists once (the partial unique index makes this idempotent) and returns their ids. */
export async function ensureDefaultLists(userId: string): Promise<Record<DefaultKind, string>> {
  const db = getDb();
  await db
    .insert(lists)
    .values(
      (Object.keys(defaultTitles) as DefaultKind[]).map((kind) => ({
        userId,
        kind,
        title: defaultTitles[kind],
      })),
    )
    .onConflictDoNothing();
  const rows = await db
    .select({ id: lists.id, kind: lists.kind })
    .from(lists)
    .where(and(eq(lists.userId, userId), inArray(lists.kind, ['want_to_try', 'been_there'])));
  const byKind = Object.fromEntries(rows.map((row) => [row.kind, row.id]));
  const wantToTry = byKind.want_to_try;
  const beenThere = byKind.been_there;
  if (!wantToTry || !beenThere) throw new Error('default lists missing after insert');
  return { want_to_try: wantToTry, been_there: beenThere };
}

const sameEntity = (branchId: string, branchDishId: string | null) =>
  and(
    eq(listItems.branchId, branchId),
    branchDishId ? eq(listItems.branchDishId, branchDishId) : isNull(listItems.branchDishId),
  );

export async function findItem(listId: string, branchId: string, branchDishId: string | null) {
  const [row] = await getDb()
    .select({ id: listItems.id })
    .from(listItems)
    .where(and(eq(listItems.listId, listId), sameEntity(branchId, branchDishId)));
  return row ?? null;
}

export async function countItems(listId: string) {
  const [row] = await getDb()
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(listItems)
    .where(eq(listItems.listId, listId));
  return row?.count ?? 0;
}

/** Appends at the end; a duplicate is ignored by the entity unique index. */
export async function addItem(listId: string, branchId: string, branchDishId: string | null) {
  await getDb()
    .insert(listItems)
    .values({
      listId,
      branchId,
      branchDishId,
      position: sql`(select coalesce(max(${listItems.position}), 0) + 1 from ${listItems} where ${listItems.listId} = ${listId})`,
    })
    .onConflictDoNothing();
}

export async function removeItem(listId: string, branchId: string, branchDishId: string | null) {
  await getDb()
    .delete(listItems)
    .where(and(eq(listItems.listId, listId), sameEntity(branchId, branchDishId)));
}

/** Which of these targets exist and belong together (a dish must be at the branch it claims). */
export async function findLiveTargets(branchIds: string[], branchDishIds: string[]) {
  const db = getDb();
  const [branchRows, dishRows] = await Promise.all([
    branchIds.length
      ? db.select({ id: branches.id }).from(branches).where(inArray(branches.id, branchIds))
      : Promise.resolve([]),
    branchDishIds.length
      ? db
          .select({ id: branchDishes.id, branchId: branchDishes.branchId })
          .from(branchDishes)
          .where(inArray(branchDishes.id, branchDishIds))
      : Promise.resolve([]),
  ]);
  return {
    branches: new Set(branchRows.map((row) => row.id)),
    dishes: new Map(dishRows.map((row) => [row.id, row.branchId])),
  };
}

export async function listSavedTargets(listId: string) {
  return getDb()
    .select({ branchId: listItems.branchId, branchDishId: listItems.branchDishId })
    .from(listItems)
    .where(eq(listItems.listId, listId));
}

/** A member's lists with their items, ready to render. */
export async function listMemberLists(userId: string) {
  const db = getDb();
  const ownLists = await db
    .select({ id: lists.id, kind: lists.kind, title: lists.title, visibility: lists.visibility })
    .from(lists)
    .where(eq(lists.userId, userId))
    .orderBy(
      sql`case ${lists.kind} when 'want_to_try' then 0 when 'been_there' then 1 else 2 end`,
      asc(lists.createdAt),
    );
  if (ownLists.length === 0) return [];
  const items = await db
    .select({
      listId: listItems.listId,
      branchId: branches.id,
      branchSlug: branches.slug,
      branchName: branches.name,
      localityName: localities.name,
      branchDishId: branchDishes.id,
      dishSlug: branchDishes.slug,
      dishName: branchDishes.name,
      diet: branchDishes.diet,
      note: listItems.note,
    })
    .from(listItems)
    .innerJoin(branches, eq(branches.id, listItems.branchId))
    .innerJoin(localities, eq(localities.id, branches.localityId))
    .leftJoin(branchDishes, eq(branchDishes.id, listItems.branchDishId))
    .where(
      inArray(
        listItems.listId,
        ownLists.map((list) => list.id),
      ),
    )
    .orderBy(asc(listItems.position));
  return ownLists.map((list) => ({ ...list, items: items.filter((item) => item.listId === list.id) }));
}

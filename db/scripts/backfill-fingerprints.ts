import 'dotenv/config';

import { and, eq, isNull } from 'drizzle-orm';
import { isUniqueViolation } from '@/db/errors';
import * as schema from '@/db/schema';
import { fingerprintDish, protectedDishNames } from '@/features/dishes/lib/fingerprint';
import { connect } from './connect';

/*
  One-off for databases created before dish fingerprints (migration 20261108170450). Safe to re-run:
  it only fills rows without a fingerprint. Two cards that collide at one branch keep the older
  card's fingerprint; the other is listed so Ops can merge them (docs/CONTRIBUTIONS.md §5.5).
*/
async function main() {
  const { db, close } = connect();
  try {
    const names = [
      ...(await db.select({ name: schema.canonicalDishes.name }).from(schema.canonicalDishes)).map(
        (row) => row.name,
      ),
      ...(await db.select({ name: schema.canonicalDishAliases.alias }).from(schema.canonicalDishAliases)).map(
        (row) => row.name,
      ),
    ];
    const protectedNames = protectedDishNames(names);
    const rows = await db
      .select({
        id: schema.branchDishes.id,
        branchId: schema.branchDishes.branchId,
        name: schema.branchDishes.name,
      })
      .from(schema.branchDishes)
      .where(isNull(schema.branchDishes.fingerprint))
      .orderBy(schema.branchDishes.createdAt);

    let updated = 0;
    const collisions: string[] = [];
    for (const row of rows) {
      const { normalizedName, fingerprint } = fingerprintDish(row.name, protectedNames);
      try {
        await db
          .update(schema.branchDishes)
          .set({ normalizedName, fingerprint })
          .where(and(eq(schema.branchDishes.id, row.id), isNull(schema.branchDishes.fingerprint)));
        updated += 1;
      } catch (error) {
        if (!isUniqueViolation(error, 'branch_dishes_branch_fingerprint_key')) throw error;
        await db
          .update(schema.branchDishes)
          .set({ normalizedName })
          .where(eq(schema.branchDishes.id, row.id));
        collisions.push(`${row.name} (${row.id})`);
      }
    }
    console.log(`Fingerprinted ${updated} of ${rows.length} dishes.`);
    if (collisions.length > 0) console.log(`Possible duplicates to merge:\n${collisions.join('\n')}`);
  } finally {
    await close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

import { index, jsonb, pgEnum, pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { id, timestamps } from './columns';
import { branches } from './places';

export const factField = pgEnum('fact_field', [
  'hours',
  'price_range',
  'phone',
  'address',
  'payment_modes',
  'veg_only',
]);
export const factSource = pgEnum('fact_source', ['seed', 'ops', 'community']);

export const facts = pgTable(
  'facts',
  {
    id: id(),
    branchId: uuid('branch_id')
      .notNull()
      .references(() => branches.id, { onDelete: 'cascade' }),
    field: factField('field').notNull(),
    value: jsonb('value').notNull(),
    source: factSource('source').notNull(),
    verifiedAt: timestamp('verified_at', { withTimezone: true }).notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('facts_branch_field_key').on(table.branchId, table.field),
    index('facts_verified_idx').on(table.verifiedAt),
  ],
);

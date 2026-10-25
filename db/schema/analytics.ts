import { index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { id } from './columns';

/*
  Append-only event log (D6, D34). Entity ids carry no foreign keys so events survive entity deletes
  and inserts never block on catalogue locks; user_id gains meaning once accounts land in P3.
*/
export const analyticsEvents = pgTable(
  'analytics_events',
  {
    id: id(),
    name: text('name').notNull(),
    deviceId: uuid('device_id').notNull(),
    userId: uuid('user_id'),
    branchId: uuid('branch_id'),
    branchDishId: uuid('branch_dish_id'),
    props: jsonb('props').$type<Record<string, unknown>>().notNull().default({}),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('analytics_events_name_occurred_idx').on(table.name, table.occurredAt),
    index('analytics_events_branch_occurred_idx').on(table.branchId, table.occurredAt),
    index('analytics_events_branch_dish_occurred_idx').on(table.branchDishId, table.occurredAt),
  ],
);

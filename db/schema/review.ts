import { sql } from 'drizzle-orm';
import { index, pgEnum, pgTable, smallint, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { users } from './auth';
import { id, timestamps } from './columns';
import { branches } from './places';

export const reviewTaskKind = pgEnum('review_task_kind', [
  'new_dish',
  'new_branch',
  'dish_duplicate',
  'claim',
  'correction',
]);
export const reviewTaskState = pgEnum('review_task_state', ['open', 'resolved']);

/** The Ops queue (docs/CONTRIBUTIONS.md §3). One open task per kind and entity. */
export const reviewTasks = pgTable(
  'review_tasks',
  {
    id: id(),
    kind: reviewTaskKind('kind').notNull(),
    entityId: uuid('entity_id').notNull(),
    branchId: uuid('branch_id').references(() => branches.id, { onDelete: 'cascade' }),
    // 1 is most urgent.
    priority: smallint('priority').notNull().default(3),
    state: reviewTaskState('state').notNull().default('open'),
    resolution: text('resolution'),
    openedBy: uuid('opened_by').references(() => users.id, { onDelete: 'set null' }),
    resolvedBy: uuid('resolved_by').references(() => users.id, { onDelete: 'set null' }),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('review_tasks_open_key')
      .on(table.kind, table.entityId)
      .where(sql`${table.state} = 'open'`),
    index('review_tasks_queue_idx').on(table.state, table.priority, table.createdAt),
  ],
);

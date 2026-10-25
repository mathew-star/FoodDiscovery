import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { users } from './auth';
import { id, timestamps } from './columns';
import { branchDishes } from './dishes';
import { branches } from './places';

export const listKind = pgEnum('list_kind', ['want_to_try', 'been_there', 'custom']);
export const listVisibility = pgEnum('list_visibility', ['private', 'public']);

/** Spec E9-2/E9-3: two default lists per member plus custom ones. */
export const lists = pgTable(
  'lists',
  {
    id: id(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    kind: listKind('kind').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    visibility: listVisibility('visibility').notNull().default('private'),
    ...timestamps,
  },
  (table) => [
    index('lists_user_idx').on(table.userId),
    // One "Want to try" and one "Been there" per member.
    uniqueIndex('lists_user_default_key')
      .on(table.userId, table.kind)
      .where(sql`${table.kind} <> 'custom'`),
    check('lists_title_length', sql`char_length(${table.title}) between 1 and 80`),
    check('lists_description_length', sql`char_length(${table.description}) <= 280`),
  ],
);

/** A branch, or one dish at a branch (branch_dish_id set). */
export const listItems = pgTable(
  'list_items',
  {
    id: id(),
    listId: uuid('list_id')
      .notNull()
      .references(() => lists.id, { onDelete: 'cascade' }),
    branchId: uuid('branch_id')
      .notNull()
      .references(() => branches.id, { onDelete: 'cascade' }),
    branchDishId: uuid('branch_dish_id').references(() => branchDishes.id, { onDelete: 'cascade' }),
    note: text('note'),
    position: integer('position').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('list_items_list_position_idx').on(table.listId, table.position),
    uniqueIndex('list_items_entity_key').on(
      table.listId,
      table.branchId,
      sql`coalesce(${table.branchDishId}, '00000000-0000-0000-0000-000000000000'::uuid)`,
    ),
    check('list_items_note_length', sql`char_length(${table.note}) <= 280`),
  ],
);

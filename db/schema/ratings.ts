import { sql } from 'drizzle-orm';
import { boolean, index, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { users } from './auth';
import { id, timestamps } from './columns';
import { branchDishes } from './dishes';
import { brands, branches } from './places';
import { trustLevel } from './profiles';

export const sentiment = pgEnum('sentiment', ['loved', 'good', 'okay', 'skip']);
export const disclosure = pgEnum('disclosure', ['none', 'hosted', 'paid', 'works_here']);
export const aspectValue = pgEnum('aspect_value', ['good', 'okay', 'poor']);

/**
 * Spec E6-1: one current rating per member and dish card; re-rating keeps the old row as history.
 * Whether a row counts in scores is decided at recompute time (docs/CONTRIBUTIONS.md §1).
 */
export const dishRatings = pgTable(
  'dish_ratings',
  {
    id: id(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    branchDishId: uuid('branch_dish_id')
      .notNull()
      .references(() => branchDishes.id, { onDelete: 'cascade' }),
    sentiment: sentiment('sentiment').notNull(),
    isCurrent: boolean('is_current').notNull().default(true),
    disclosure: disclosure('disclosure').notNull().default('none'),
    suspect: boolean('suspect').notNull().default(false),
    trustAtTime: trustLevel('trust_at_time').notNull(),
    postId: uuid('post_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('dish_ratings_current_key')
      .on(table.userId, table.branchDishId)
      .where(sql`${table.isCurrent}`),
    index('dish_ratings_dish_current_idx')
      .on(table.branchDishId)
      .where(sql`${table.isCurrent}`),
    index('dish_ratings_user_created_idx').on(table.userId, table.createdAt),
  ],
);

/** Spec E6-2: value, service, ambience and would-return, one current set per member and branch. */
export const branchAspectRatings = pgTable(
  'branch_aspect_ratings',
  {
    id: id(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    branchId: uuid('branch_id')
      .notNull()
      .references(() => branches.id, { onDelete: 'cascade' }),
    value: aspectValue('value'),
    service: aspectValue('service'),
    ambience: aspectValue('ambience'),
    wouldReturn: boolean('would_return'),
    isCurrent: boolean('is_current').notNull().default(true),
    disclosure: disclosure('disclosure').notNull().default('none'),
    trustAtTime: trustLevel('trust_at_time').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('branch_aspect_ratings_current_key')
      .on(table.userId, table.branchId)
      .where(sql`${table.isCurrent}`),
    index('branch_aspect_ratings_branch_current_idx')
      .on(table.branchId)
      .where(sql`${table.isCurrent}`),
  ],
);

/** Spec §7.6: a member who works at or owns a brand; their ratings of it weigh 0. */
export const brandAffiliations = pgTable(
  'brand_affiliations',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    brandId: uuid('brand_id')
      .notNull()
      .references(() => brands.id, { onDelete: 'cascade' }),
    role: text('role').notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex('brand_affiliations_key').on(table.userId, table.brandId)],
);

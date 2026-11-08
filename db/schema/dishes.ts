import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  real,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { users } from './auth';
import { id, timestamps } from './columns';
import { branches } from './places';

export const diet = pgEnum('diet', ['veg', 'egg', 'nonveg']);
/** Listing lifecycle of a dish card (docs/CONTRIBUTIONS.md §2); only `active` cards count and rank. */
export const dishStatus = pgEnum('dish_status', ['pending', 'active', 'rejected', 'merged', 'archived']);
export const dishSource = pgEnum('dish_source', ['seed', 'community', 'owner', 'ops']);

export const dishCategories = pgTable('dish_categories', {
  id: id(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  sortOrder: smallint('sort_order').notNull().default(0),
  ...timestamps,
});

export const canonicalDishes = pgTable(
  'canonical_dishes',
  {
    id: id(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => dishCategories.id),
    defaultDiet: diet('default_diet').notNull(),
    description: text('description'),
    ...timestamps,
  },
  (table) => [index('canonical_dishes_category_idx').on(table.categoryId)],
);

export const canonicalDishAliases = pgTable(
  'canonical_dish_aliases',
  {
    id: id(),
    canonicalDishId: uuid('canonical_dish_id')
      .notNull()
      .references(() => canonicalDishes.id, { onDelete: 'cascade' }),
    alias: text('alias').notNull(),
  },
  (table) => [uniqueIndex('canonical_dish_aliases_alias_key').on(sql`lower(${table.alias})`)],
);

export const branchDishes = pgTable(
  'branch_dishes',
  {
    id: id(),
    branchId: uuid('branch_id')
      .notNull()
      .references(() => branches.id, { onDelete: 'cascade' }),
    canonicalDishId: uuid('canonical_dish_id').references(() => canonicalDishes.id),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    menuSection: text('menu_section').notNull(),
    pricePaise: integer('price_paise'),
    diet: diet('diet').notNull(),
    isJain: boolean('is_jain').notNull().default(false),
    isSignature: boolean('is_signature').notNull().default(false),
    // "Served now": false greys a dish out but keeps its ratings readable.
    isActive: boolean('is_active').notNull().default(true),
    status: dishStatus('status').notNull().default('active'),
    source: dishSource('source').notNull().default('seed'),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    mergedIntoId: uuid('merged_into_id').references((): AnyPgColumn => branchDishes.id),
    ownerManaged: boolean('owner_managed').notNull().default(false),
    // Duplicate detection (docs/CONTRIBUTIONS.md §5.1); written by the app, backfilled for old rows.
    normalizedName: text('normalized_name'),
    fingerprint: text('fingerprint'),
    score: real('score'),
    lovedPct: real('loved_pct'),
    ratingCount: integer('rating_count').notNull().default(0),
    weightSum: real('weight_sum').notNull().default(0),
    lovedWeight: real('loved_weight').notNull().default(0),
    goodWeight: real('good_weight').notNull().default(0),
    okayWeight: real('okay_weight').notNull().default(0),
    skipWeight: real('skip_weight').notNull().default(0),
    scoredAt: timestamp('scored_at', { withTimezone: true }),
    lastRatedAt: timestamp('last_rated_at', { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('branch_dishes_branch_slug_key').on(table.branchId, table.slug),
    index('branch_dishes_canonical_score_idx').on(table.canonicalDishId, table.score),
    index('branch_dishes_branch_score_idx').on(table.branchId, table.score),
    index('branch_dishes_status_idx').on(table.status),
    // Two people adding the same dish at once get one card (Gate 2).
    uniqueIndex('branch_dishes_branch_fingerprint_key')
      .on(table.branchId, table.fingerprint)
      .where(sql`${table.status} in ('pending', 'active') and ${table.fingerprint} is not null`),
  ],
);

export const aliasSource = pgEnum('alias_source', ['typed', 'merge', 'owner', 'seed']);

/** Every spelling people used for a dish card, for matching and search. */
export const branchDishAliases = pgTable(
  'branch_dish_aliases',
  {
    id: id(),
    branchDishId: uuid('branch_dish_id')
      .notNull()
      .references(() => branchDishes.id, { onDelete: 'cascade' }),
    rawText: text('raw_text').notNull(),
    normalizedText: text('normalized_text').notNull(),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    submittedPricePaise: integer('submitted_price_paise'),
    how: aliasSource('how').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('branch_dish_aliases_dish_text_key').on(table.branchDishId, table.normalizedText)],
);

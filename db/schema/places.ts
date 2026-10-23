import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  smallint,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { geographyPoint, id, timestamps } from './columns';
import { cities, localities } from './geo';

export const branchStatus = pgEnum('branch_status', ['active', 'temporarily_closed', 'permanently_closed']);

export const cuisines = pgTable('cuisines', {
  id: id(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  ...timestamps,
});

export const brands = pgTable('brands', {
  id: id(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  ...timestamps,
});

export const branches = pgTable(
  'branches',
  {
    id: id(),
    brandId: uuid('brand_id')
      .notNull()
      .references(() => brands.id),
    cityId: uuid('city_id')
      .notNull()
      .references(() => cities.id),
    localityId: uuid('locality_id')
      .notNull()
      .references(() => localities.id),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    address: text('address').notNull(),
    location: geographyPoint('location').notNull(),
    phone: text('phone'),
    priceBand: smallint('price_band').notNull(),
    vegOnly: boolean('veg_only').notNull().default(false),
    paymentModes: text('payment_modes')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    status: branchStatus('status').notNull().default('active'),
    foodScore: real('food_score'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    index('branches_location_gist').using('gist', table.location),
    index('branches_locality_idx').on(table.localityId),
    index('branches_brand_idx').on(table.brandId),
    check('branches_price_band_check', sql`${table.priceBand} between 1 and 4`),
  ],
);

export const branchCuisines = pgTable(
  'branch_cuisines',
  {
    branchId: uuid('branch_id')
      .notNull()
      .references(() => branches.id, { onDelete: 'cascade' }),
    cuisineId: uuid('cuisine_id')
      .notNull()
      .references(() => cuisines.id),
    isPrimary: boolean('is_primary').notNull().default(false),
  },
  (table) => [
    primaryKey({ columns: [table.branchId, table.cuisineId] }),
    index('branch_cuisines_cuisine_idx').on(table.cuisineId),
  ],
);

export const branchHours = pgTable(
  'branch_hours',
  {
    id: id(),
    branchId: uuid('branch_id')
      .notNull()
      .references(() => branches.id, { onDelete: 'cascade' }),
    dayOfWeek: smallint('day_of_week').notNull(),
    opensAt: time('opens_at').notNull(),
    closesAt: time('closes_at').notNull(),
  },
  (table) => [
    index('branch_hours_branch_idx').on(table.branchId),
    check('branch_hours_day_check', sql`${table.dayOfWeek} between 0 and 6`),
  ],
);

export const slugRedirects = pgTable(
  'slug_redirects',
  {
    id: id(),
    entityType: text('entity_type').notNull(),
    fromSlug: text('from_slug').notNull(),
    toId: uuid('to_id').notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex('slug_redirects_entity_from_key').on(table.entityType, table.fromSlug)],
);

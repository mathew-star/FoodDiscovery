import { boolean, index, pgTable, smallint, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { geographyPoint, id, timestamps } from './columns';

export const cities = pgTable('cities', {
  id: id(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  timezone: text('timezone').notNull().default('Asia/Kolkata'),
  center: geographyPoint('center').notNull(),
  ...timestamps,
});

export const localities = pgTable(
  'localities',
  {
    id: id(),
    cityId: uuid('city_id')
      .notNull()
      .references(() => cities.id),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    center: geographyPoint('center').notNull(),
    isLaunch: boolean('is_launch').notNull().default(false),
    sortOrder: smallint('sort_order').notNull().default(0),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('localities_city_slug_key').on(table.cityId, table.slug),
    index('localities_center_gist').using('gist', table.center),
  ],
);

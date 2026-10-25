import { sql } from 'drizzle-orm';
import { check, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { users } from './auth';
import { timestamps } from './columns';
import { localities } from './geo';

export const dietPreference = pgEnum('diet_preference', ['veg', 'jain', 'egg', 'nonveg']);
export const memberRole = pgEnum('member_role', ['member', 'ops', 'admin']);
export const trustLevel = pgEnum('trust_level', ['t0', 't1', 't2', 'founding']);

/** One row per user, created at onboarding (spec E1-3); `onboarded_at` null means not finished. */
export const profiles = pgTable(
  'profiles',
  {
    userId: uuid('user_id')
      .primaryKey()
      .references(() => users.id, { onDelete: 'cascade' }),
    username: text('username').notNull(),
    displayName: text('display_name').notNull(),
    bio: text('bio'),
    diet: dietPreference('diet'),
    cuisines: text('cuisines')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    homeLocalityId: uuid('home_locality_id').references(() => localities.id),
    role: memberRole('role').notNull().default('member'),
    trustLevel: trustLevel('trust_level').notNull().default('t0'),
    adultConfirmedAt: timestamp('adult_confirmed_at', { withTimezone: true }),
    onboardedAt: timestamp('onboarded_at', { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('profiles_username_key').on(sql`lower(${table.username})`),
    check('profiles_username_format', sql`${table.username} ~ '^[a-z0-9_]{3,20}$'`),
    check('profiles_bio_length', sql`char_length(${table.bio}) <= 160`),
    check('profiles_cuisines_max', sql`cardinality(${table.cuisines}) <= 5`),
  ],
);

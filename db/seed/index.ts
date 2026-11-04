import 'dotenv/config';

import { neonConfig, Pool as NeonPool } from '@neondatabase/serverless';
import { sql } from 'drizzle-orm';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleNodePg } from 'drizzle-orm/node-postgres';
import type { PgAsyncDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import { Pool as PgPool } from 'pg';
import * as schema from '@/db/schema';
import {
  aggregateAspects,
  aggregateDishRatings,
  aspectKeys,
  aspectScores,
  cityPrior,
  weightedValue,
  type AspectAnswer,
  type AspectRow,
  type TrustLevel,
} from '@/features/ratings/lib/aggregate';
import { computeDishScore, computeFoodScore } from '@/features/ratings/lib/score';
import { rankingConfigDefaults } from '@/features/ratings/schemas/ranking-config';
import { sentiments, type Sentiment } from '@/features/ratings/schemas/sentiment';
import { branchSlug, slugify, uniqueSlug } from '@/shared/lib/slug';
import { uuidv7 } from '@/shared/lib/uuid';
import { brands, canonicalDishes, categories, city, cuisines, localities } from './catalogue';
import { between, createRandom, integerBetween, type Random } from './random';

type Database = PgAsyncDatabase<PgQueryResultHKT>;

const DAY_MS = 86_400_000;
const config = rankingConfigDefaults.dish_scoring;
const weightConfig = rankingConfigDefaults.rating_weights;
const aspectConfig = rankingConfigDefaults.aspect_scoring;
// Fictional members behind the sample ratings (D19, D44). `.invalid` never resolves, and with no
// password account they cannot sign in.
const SAMPLE_EMAIL_DOMAIN = 'sample.fdn.invalid';
const SAMPLE_MEMBERS = 180;
const MAX_RATINGS_PER_DISH = 160;

type SampleMember = { id: string; trust: TrustLevel };
type SampleRating = { userId: string; sentiment: Sentiment; trust: TrustLevel; ageDays: number };

function sampleTrust(random: Random): TrustLevel {
  const roll = random();
  return roll < 0.25 ? 't0' : roll < 0.8 ? 't1' : roll < 0.95 ? 't2' : 'founding';
}

/** Mostly recent, some old: age in days skewed toward today. */
const sampleAge = (random: Random) => Math.floor(300 * random() ** 1.8);

function pickMembers(random: Random, members: SampleMember[], count: number): SampleMember[] {
  const pool = [...members];
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [pool[index], pool[swap]] = [pool[swap] as SampleMember, pool[index] as SampleMember];
  }
  return pool.slice(0, count);
}

function aspectAnswer(random: Random, quality: number): AspectAnswer {
  const roll = random() - (quality - 0.6);
  return roll < 0.45 ? 'good' : roll < 0.85 ? 'okay' : 'poor';
}

function connect(): { db: Database; close: () => Promise<void> } {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required to seed');
  if ((process.env.DATABASE_DRIVER ?? 'neon') === 'pg') {
    const pool = new PgPool({ connectionString: url });
    return { db: drizzleNodePg({ client: pool }), close: () => pool.end() };
  }
  neonConfig.webSocketConstructor = WebSocket;
  const pool = new NeonPool({ connectionString: url });
  return { db: drizzleNeon({ client: pool }), close: () => pool.end() };
}

function jitter(random: Random, center: { lat: number; lng: number }, meters: number) {
  const angle = between(random, 0, Math.PI * 2);
  const distance = between(random, meters * 0.2, meters);
  return {
    lat: center.lat + (distance * Math.cos(angle)) / 111_320,
    lng: center.lng + (distance * Math.sin(angle)) / (111_320 * Math.cos((center.lat * Math.PI) / 180)),
  };
}

function simulateRatings(
  random: Random,
  quality: number,
): { counts: Record<Sentiment, number>; total: number } {
  const total =
    random() < 0.12 ? integerBetween(random, 0, 2) : integerBetween(random, 3, MAX_RATINGS_PER_DISH);
  const counts: Record<Sentiment, number> = { loved: 0, good: 0, okay: 0, skip: 0 };
  const shape: Record<Sentiment, number> = {
    loved: quality ** 2.2,
    good: quality * (1 - quality) * 1.6 + 0.08,
    okay: (1 - quality) * 0.6,
    skip: (1 - quality) ** 2.4 * 0.8,
  };
  const sum = sentiments.reduce((acc, sentiment) => acc + shape[sentiment], 0);
  for (let index = 0; index < total; index += 1) {
    let pick = random() * sum;
    for (const sentiment of sentiments) {
      pick -= shape[sentiment];
      if (pick <= 0) {
        counts[sentiment] += 1;
        break;
      }
    }
  }
  return { counts, total };
}

function hoursFor(brand: (typeof brands)[number]) {
  return Array.from({ length: 7 }, (_, dayOfWeek) =>
    brand.hours.map(({ opens, closes }) => ({ dayOfWeek, opensAt: `${opens}:00`, closesAt: `${closes}:00` })),
  ).flat();
}

async function main(): Promise<void> {
  const reset = process.argv.includes('--reset');
  const { db, close } = connect();
  const random = createRandom(20261017);
  const now = Date.now();

  try {
    const [{ count } = { count: 0 }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.branches);
    if (count > 0 && !reset) {
      throw new Error(
        `Database already has ${count} branches. Re-run with --reset to replace catalogue data.`,
      );
    }

    await db.transaction(async (tx) => {
      if (reset) {
        await tx.execute(
          sql`TRUNCATE ranking_config, facts, branch_dishes, branch_hours, branch_cuisines, branches, brands, canonical_dish_aliases, canonical_dishes, dish_categories, cuisines, localities, cities, slug_redirects CASCADE`,
        );
        await tx.execute(sql`DELETE FROM users WHERE email LIKE ${`%@${SAMPLE_EMAIL_DOMAIN}`}`);
      }

      await tx
        .insert(schema.rankingConfig)
        .values(Object.entries(rankingConfigDefaults).map(([key, value]) => ({ key, value })));

      const cityId = uuidv7();
      await tx
        .insert(schema.cities)
        .values({ id: cityId, slug: city.slug, name: city.name, center: city.center });

      const localityIds = new Map<string, string>();
      await tx.insert(schema.localities).values(
        localities.map((locality, sortOrder) => {
          const id = uuidv7();
          localityIds.set(locality.slug, id);
          return {
            id,
            cityId,
            slug: locality.slug,
            name: locality.name,
            center: locality.center,
            isLaunch: locality.isLaunch,
            sortOrder,
          };
        }),
      );

      const cuisineIds = new Map<string, string>();
      await tx.insert(schema.cuisines).values(
        cuisines.map((cuisine) => {
          const id = uuidv7();
          cuisineIds.set(cuisine.slug, id);
          return { id, ...cuisine };
        }),
      );

      const categoryIds = new Map<string, string>();
      await tx.insert(schema.dishCategories).values(
        categories.map((category, sortOrder) => {
          const id = uuidv7();
          categoryIds.set(category.slug, id);
          return { id, ...category, sortOrder };
        }),
      );

      const canonicalIds = new Map<string, string>();
      const aliasRows: (typeof schema.canonicalDishAliases.$inferInsert)[] = [];
      await tx.insert(schema.canonicalDishes).values(
        canonicalDishes.map((dish) => {
          const id = uuidv7();
          const categoryId = categoryIds.get(dish.category);
          if (!categoryId) throw new Error(`Unknown category ${dish.category}`);
          canonicalIds.set(dish.slug, id);
          for (const alias of dish.aliases) aliasRows.push({ canonicalDishId: id, alias });
          return {
            id,
            slug: dish.slug,
            name: dish.name,
            categoryId,
            defaultDiet: dish.diet,
            description: dish.description,
          };
        }),
      );
      await tx.insert(schema.canonicalDishAliases).values(aliasRows);

      const members: SampleMember[] = Array.from({ length: SAMPLE_MEMBERS }, () => ({
        id: uuidv7(),
        trust: sampleTrust(random),
      }));
      const joined = new Date(now - 400 * DAY_MS);
      await tx.insert(schema.users).values(
        members.map((member, index) => ({
          id: member.id,
          name: `Sample member ${index + 1}`,
          email: `member-${index + 1}@${SAMPLE_EMAIL_DOMAIN}`,
          emailVerified: true,
          createdAt: joined,
        })),
      );
      await tx.insert(schema.profiles).values(
        members.map((member, index) => ({
          userId: member.id,
          username: `sample_${index + 1}`,
          displayName: `Sample member ${index + 1}`,
          trustLevel: member.trust,
          adultConfirmedAt: joined,
          onboardedAt: joined,
        })),
      );

      type DishDraft = typeof schema.branchDishes.$inferInsert & { id: string };
      const sampleRatings = new Map<string, SampleRating[]>();
      const aspectRows: (typeof schema.branchAspectRatings.$inferInsert)[] = [];
      const dishDrafts: DishDraft[] = [];
      const branchRows: (typeof schema.branches.$inferInsert)[] = [];
      const branchCuisineRows: (typeof schema.branchCuisines.$inferInsert)[] = [];
      const hoursRows: (typeof schema.branchHours.$inferInsert)[] = [];
      const factRows: (typeof schema.facts.$inferInsert)[] = [];
      const takenBranchSlugs = new Set<string>();

      for (const brand of brands) {
        const brandId = uuidv7();
        await tx.insert(schema.brands).values({ id: brandId, slug: brand.slug, name: brand.name });

        for (const outlet of brand.branches) {
          const locality = localities.find((candidate) => candidate.slug === outlet.locality);
          const localityId = localityIds.get(outlet.locality);
          if (!locality || !localityId) throw new Error(`Unknown locality ${outlet.locality}`);

          const branchId = uuidv7();
          const slug = branchSlug(brand.slug, locality.slug, takenBranchSlugs);
          takenBranchSlugs.add(slug);
          const address = `${outlet.street}, ${locality.name}, Hyderabad`;
          branchRows.push({
            id: branchId,
            brandId,
            cityId,
            localityId,
            slug,
            name: brand.name,
            address,
            location: jitter(random, locality.center, 900),
            phone: null,
            priceBand: brand.priceBand,
            vegOnly: brand.vegOnly ?? false,
            tags: brand.tags ?? [],
            paymentModes: brand.payments,
            publishedAt: new Date(now - integerBetween(random, 30, 200) * DAY_MS),
          });

          brand.cuisines.forEach((cuisineSlug, index) => {
            const cuisineId = cuisineIds.get(cuisineSlug);
            if (!cuisineId) throw new Error(`Unknown cuisine ${cuisineSlug}`);
            branchCuisineRows.push({ branchId, cuisineId, isPrimary: index === 0 });
          });

          const hours = hoursFor(brand);
          hoursRows.push(...hours.map((row) => ({ branchId, ...row })));

          const prices = brand.menu.map((item) => item.rupees * 100);
          const verified = () => new Date(now - integerBetween(random, 1, 140) * DAY_MS);
          factRows.push(
            { branchId, field: 'hours', value: hours, source: 'seed', verifiedAt: verified() },
            {
              branchId,
              field: 'price_range',
              value: { minPaise: Math.min(...prices), maxPaise: Math.max(...prices) },
              source: 'seed',
              verifiedAt: verified(),
            },
            { branchId, field: 'address', value: { address }, source: 'seed', verifiedAt: verified() },
            {
              branchId,
              field: 'payment_modes',
              value: { modes: brand.payments },
              source: 'seed',
              verifiedAt: verified(),
            },
            {
              branchId,
              field: 'veg_only',
              value: { vegOnly: brand.vegOnly ?? false },
              source: 'seed',
              verifiedAt: verified(),
            },
          );

          const takenDishSlugs = new Set<string>();
          for (const item of brand.menu) {
            const dishSlug = uniqueSlug(slugify(item.name), takenDishSlugs);
            takenDishSlugs.add(dishSlug);
            const quality = Math.min(0.97, Math.max(0.2, item.quality + between(random, -0.08, 0.08)));
            const { counts, total } = simulateRatings(random, quality);
            const raters = pickMembers(random, members, total);
            const ratings: SampleRating[] = sentiments
              .flatMap((sentiment) => Array.from({ length: counts[sentiment] }, () => sentiment))
              .map((sentiment, index) => {
                const rater = raters[index] as SampleMember;
                return { userId: rater.id, sentiment, trust: rater.trust, ageDays: sampleAge(random) };
              });
            const canonicalDishId = item.dish ? canonicalIds.get(item.dish) : undefined;
            if (item.dish && !canonicalDishId) throw new Error(`Unknown canonical dish ${item.dish}`);
            const dishId = uuidv7();
            sampleRatings.set(dishId, ratings);
            dishDrafts.push({
              id: dishId,
              branchId,
              canonicalDishId: canonicalDishId ?? null,
              slug: dishSlug,
              name: item.name,
              menuSection: item.section,
              pricePaise: item.rupees * 100,
              diet: item.diet,
              isJain: item.jain ?? false,
              isSignature: item.signature ?? false,
            });
          }

          // Restaurant aspects (spec §6.2) from a handful of the same sample members.
          const brandQuality = brand.menu.reduce((sum, item) => sum + item.quality, 0) / brand.menu.length;
          for (const member of pickMembers(random, members, integerBetween(random, 0, 24))) {
            const ageDays = sampleAge(random);
            aspectRows.push({
              userId: member.id,
              branchId,
              value: aspectAnswer(random, brandQuality),
              service: random() < 0.85 ? aspectAnswer(random, brandQuality) : null,
              ambience: random() < 0.7 ? aspectAnswer(random, brandQuality - 0.05) : null,
              wouldReturn: random() < 0.9 ? random() < brandQuality + 0.1 : null,
              trustAtTime: member.trust,
              createdAt: new Date(now - ageDays * DAY_MS),
            });
          }
        }
      }

      const counted = {
        isCurrent: true,
        suspect: false,
        disclosed: false,
        affiliated: false,
        dishActive: true,
        branchListed: true,
      };
      const aggregates = new Map(
        dishDrafts.map((draft) => [
          draft.id,
          aggregateDishRatings(
            (sampleRatings.get(draft.id) ?? []).map((rating) => ({ ...counted, ...rating })),
            weightConfig,
          ),
        ]),
      );

      const priorTotals = new Map<string, { weightedValue: number; weight: number; count: number }>();
      for (const draft of dishDrafts) {
        const aggregate = aggregates.get(draft.id);
        if (!draft.canonicalDishId || !aggregate) continue;
        const entry = priorTotals.get(draft.canonicalDishId) ?? { weightedValue: 0, weight: 0, count: 0 };
        entry.weightedValue += weightedValue(aggregate.weights);
        entry.weight += sentiments.reduce((sum, sentiment) => sum + aggregate.weights[sentiment], 0);
        entry.count += aggregate.ratingCount;
        priorTotals.set(draft.canonicalDishId, entry);
      }

      const scoredAt = new Date(now);
      const dishRows = dishDrafts.map((draft) => {
        const aggregate = aggregates.get(draft.id);
        if (!aggregate) throw new Error('missing aggregate');
        const totals = draft.canonicalDishId ? priorTotals.get(draft.canonicalDishId) : undefined;
        const prior = totals
          ? cityPrior(totals, config.minRatingsForCityPrior, config.defaultPrior)
          : config.defaultPrior;
        const { score, lovedPct, weightSum } = computeDishScore(aggregate.weights, prior, config);
        return {
          ...draft,
          score,
          lovedPct,
          weightSum,
          ratingCount: aggregate.ratingCount,
          lovedWeight: aggregate.weights.loved,
          goodWeight: aggregate.weights.good,
          okayWeight: aggregate.weights.okay,
          skipWeight: aggregate.weights.skip,
          lastRatedAt:
            aggregate.newestAgeDays === null ? null : new Date(now - aggregate.newestAgeDays * DAY_MS),
          scoredAt,
        };
      });

      const answerValue: Record<AspectAnswer, number> = { good: 1, okay: 0.5, poor: 0 };
      const aspectPriors = Object.fromEntries(
        aspectKeys.map((key) => {
          const answers = aspectRows.flatMap((row) => (row[key] ? [answerValue[row[key]]] : []));
          const mean = answers.reduce((sum, value) => sum + value, 0) / Math.max(1, answers.length);
          return [
            key,
            aspectRows.length >= aspectConfig.minAnswersForCityPrior ? mean : aspectConfig.defaultPrior,
          ];
        }),
      ) as Record<(typeof aspectKeys)[number], number>;
      for (const branch of branchRows) {
        branch.foodScore = computeFoodScore(
          dishRows
            .filter((dish) => dish.branchId === branch.id)
            .map((dish) => ({ score: dish.score, weightSum: dish.weightSum })),
          config,
        );
        const rows: AspectRow[] = aspectRows
          .filter((row) => row.branchId === branch.id)
          .map((row) => ({
            ...counted,
            answers: {
              value: row.value ?? null,
              service: row.service ?? null,
              ambience: row.ambience ?? null,
            },
            wouldReturn: row.wouldReturn ?? null,
            trust: row.trustAtTime,
            ageDays: Math.round((now - (row.createdAt ?? scoredAt).getTime()) / DAY_MS),
          }));
        const totals = aggregateAspects(rows, weightConfig);
        const scores = aspectScores(totals, aspectPriors, aspectConfig);
        Object.assign(branch, {
          valueScore: scores.value,
          serviceScore: scores.service,
          ambienceScore: scores.ambience,
          wouldReturnPct: scores.wouldReturnPct,
          aspectCount: totals.respondents,
        });
      }

      await tx.insert(schema.branches).values(branchRows);
      await tx.insert(schema.branchCuisines).values(branchCuisineRows);
      await tx.insert(schema.branchHours).values(hoursRows);
      await tx.insert(schema.facts).values(factRows);
      await tx.insert(schema.branchDishes).values(dishRows);
      const ratingRows = dishDrafts.flatMap((draft) =>
        (sampleRatings.get(draft.id) ?? []).map((rating) => ({
          userId: rating.userId,
          branchDishId: draft.id,
          sentiment: rating.sentiment,
          trustAtTime: rating.trust,
          createdAt: new Date(now - rating.ageDays * DAY_MS),
        })),
      );
      for (let start = 0; start < ratingRows.length; start += 1000) {
        await tx.insert(schema.dishRatings).values(ratingRows.slice(start, start + 1000));
      }
      if (aspectRows.length > 0) await tx.insert(schema.branchAspectRatings).values(aspectRows);

      console.log(
        `Seeded ${localities.length} localities, ${brands.length} brands, ${branchRows.length} branches, ${dishRows.length} dishes, ${canonicalDishes.length} canonical dishes, ${members.length} sample members, ${ratingRows.length} ratings.`,
      );
    });
  } finally {
    await close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

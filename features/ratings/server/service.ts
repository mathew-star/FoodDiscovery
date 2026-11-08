import 'server-only';

import { withTransaction, type Database, type Transaction } from '@/db/client';
import { getCanonicalNameIndex } from '@/features/dishes/queries/dishes';
import { checkDishName, displayDishName } from '@/features/dishes/lib/dish-name';
import { fingerprintDish } from '@/features/dishes/lib/fingerprint';
import { getRankingConfig } from '@/features/ratings/queries/ranking-config';
import { slugify, uniqueSlug } from '@/shared/lib/slug';
import { err, ok, type Result } from '@/shared/lib/result';
import {
  aggregateAspects,
  aggregateDishRatings,
  aspectKeys,
  aspectScores,
  cityPrior,
  type AspectRow,
  type DishRatingRow,
  type TrustLevel,
} from '../lib/aggregate';
import { activatesOnCreate, isCorroborated } from '../lib/activation';
import { computeDishScore, computeFoodScore } from '../lib/score';
import type { NewDishInput, RateBranchInput } from '../schemas/rate-input';
import type { Sentiment } from '../schemas/sentiment';
import {
  activateDish,
  canonicalTotals,
  findDishByFingerprint,
  insertCommunityDish,
  insertDishAlias,
  listBranchDishSlugs,
  listCurrentRaters,
  openReviewTask,
  resolveReviewTask,
  cityAspectMeans,
  findCurrentAspects,
  findCurrentDishRatings,
  findDishScoringTargets,
  findMemberTrust,
  findRateTarget,
  listBranchDishScores,
  listRateableDishes,
  loadAspectRows,
  loadDishScoringRows,
  replaceAspects,
  replaceDishRatings,
  updateBranchScores,
  updateDishScore,
} from './repo';

type Executor = Database | Transaction;
const DAY_MS = 86_400_000;

/** Recomputes the §6.1 score of these dish cards from their current ratings. */
export async function recomputeDishes(db: Executor, dishIds: string[]) {
  const [scoring, weights] = await Promise.all([
    getRankingConfig('dish_scoring'),
    getRankingConfig('rating_weights'),
  ]);
  const targets = await findDishScoringTargets(db, dishIds);
  const rows = await loadDishScoringRows(db, dishIds);
  const canonicalIds = [
    ...new Set(targets.flatMap((target) => (target.canonicalDishId ? [target.canonicalDishId] : []))),
  ];
  const priors = new Map(
    (await canonicalTotals(db, canonicalIds, weights)).map((totals) => [
      totals.canonicalDishId,
      cityPrior(totals, scoring.minRatingsForCityPrior, scoring.defaultPrior),
    ]),
  );

  for (const target of targets) {
    const dishRows: DishRatingRow[] = rows
      .filter((row) => row.branchDishId === target.id)
      .map((row) => ({
        sentiment: row.sentiment,
        trust: row.trust,
        ageDays: row.ageDays,
        isCurrent: true,
        suspect: row.suspect,
        disclosed: row.disclosure !== 'none',
        affiliated: row.affiliated,
        dishActive: row.dishStatus === 'active',
        branchListed: row.branchListing === 'listed',
      }));
    const { weights: sentimentWeights, ratingCount, newestAgeDays } = aggregateDishRatings(dishRows, weights);
    const prior =
      (target.canonicalDishId ? priors.get(target.canonicalDishId) : undefined) ?? scoring.defaultPrior;
    const { score, lovedPct, weightSum } = computeDishScore(sentimentWeights, prior, scoring);
    await updateDishScore(db, {
      id: target.id,
      score,
      lovedPct,
      weightSum,
      ratingCount,
      lovedWeight: sentimentWeights.loved,
      goodWeight: sentimentWeights.good,
      okayWeight: sentimentWeights.okay,
      skipWeight: sentimentWeights.skip,
      lastRatedAt: newestAgeDays === null ? null : new Date(Date.now() - newestAgeDays * DAY_MS),
    });
  }
  return [...new Set(targets.map((target) => target.branchId))];
}

/** Spec §6.2: food score from the best dishes, and the three aspects with would-return. */
export async function recomputeBranch(db: Executor, branchId: string, options: { aspects: boolean }) {
  const scoring = await getRankingConfig('dish_scoring');
  const foodScore = computeFoodScore(await listBranchDishScores(db, branchId), scoring);
  if (!options.aspects) {
    await updateBranchScores(db, branchId, { foodScore });
    return;
  }
  const [weights, aspectConfig, rows, means] = await Promise.all([
    getRankingConfig('rating_weights'),
    getRankingConfig('aspect_scoring'),
    loadAspectRows(db, branchId),
    cityAspectMeans(db, branchId),
  ]);
  const aspectRows: AspectRow[] = rows.map((row) => ({
    answers: { value: row.value, service: row.service, ambience: row.ambience },
    wouldReturn: row.wouldReturn,
    trust: row.trust,
    ageDays: row.ageDays,
    isCurrent: true,
    suspect: false,
    disclosed: row.disclosure !== 'none',
    affiliated: row.affiliated,
    branchListed: row.branchListing === 'listed',
  }));
  const totals = aggregateAspects(aspectRows, weights);
  const useCity = means.answers >= aspectConfig.minAnswersForCityPrior;
  const priors = Object.fromEntries(
    aspectKeys.map((key) => [
      key,
      useCity ? (means[key] ?? aspectConfig.defaultPrior) : aspectConfig.defaultPrior,
    ]),
  ) as Record<(typeof aspectKeys)[number], number>;
  const scores = aspectScores(totals, priors, aspectConfig);
  await updateBranchScores(db, branchId, {
    foodScore,
    valueScore: scores.value,
    serviceScore: scores.service,
    ambienceScore: scores.ambience,
    wouldReturnPct: scores.wouldReturnPct,
    aspectCount: totals.respondents,
  });
}

const sameAspects = (a: RateBranchInput['aspects'], b: Awaited<ReturnType<typeof findCurrentAspects>>) =>
  a !== null &&
  b !== null &&
  a.value === b.value &&
  a.service === b.service &&
  a.ambience === b.ambience &&
  a.wouldReturn === b.wouldReturn;

export type RateBranchOutcome = {
  branchSlug: string;
  savedDishes: number;
  aspectsSaved: boolean;
  dishIds: string[];
};

/**
 * Spec W3, E6-1/E6-2, E6-4. Saves what changed (an unchanged verdict writes no history row),
 * then recomputes the touched dish cards and the branch in the same transaction.
 */
export async function rateBranch(userId: string, input: RateBranchInput): Promise<Result<RateBranchOutcome>> {
  const [activation, weightConfig, canonicalIndex] = await Promise.all([
    getRankingConfig('dish_activation'),
    getRankingConfig('rating_weights'),
    getCanonicalNameIndex(),
  ]);
  return withTransaction(async (tx) => {
    const trust = await findMemberTrust(tx, userId);
    if (!trust) return err({ code: 'forbidden', message: 'onboarding_required' });

    const branch = await findRateTarget(tx, input.branchId);
    if (
      !branch ||
      branch.listing === 'rejected' ||
      branch.listing === 'merged' ||
      branch.status === 'permanently_closed'
    ) {
      return err({ code: 'not_found' });
    }
    const rateableDishes = await listRateableDishes(tx, branch.id);
    const rateable = new Set(rateableDishes.map((dish) => dish.id));
    if (input.dishes.some((dish) => !rateable.has(dish.branchDishId))) return err({ code: 'invalid_input' });

    // New names resolve to an existing card (Gate 2) or become a card of their own (§5.2).
    const added: { branchDishId: string; sentiment: Sentiment }[] = [];
    for (const newDish of input.newDishes) {
      const resolved = await resolveOrCreateDish(
        tx,
        {
          userId,
          trust,
          branchId: branch.id,
          branchListed: branch.listing === 'listed',
          dish: newDish,
        },
        canonicalIndex,
      );
      if (!resolved.ok) return resolved;
      added.push({ branchDishId: resolved.data, sentiment: newDish.sentiment });
    }
    const wanted = new Map([...input.dishes, ...added].map((dish) => [dish.branchDishId, dish.sentiment]));

    const current = new Map(
      (await findCurrentDishRatings(tx, userId, branch.id)).map((row) => [row.branchDishId, row.sentiment]),
    );
    const changed = [...wanted]
      .filter(([id, sentiment]) => current.get(id) !== sentiment)
      .map(([branchDishId, sentiment]) => ({ branchDishId, sentiment }));
    await replaceDishRatings(tx, userId, trust, changed);

    // D47: a pending card goes live once its raters corroborate it.
    const statusById = new Map(rateableDishes.map((dish) => [dish.id, dish.status]));
    for (const { branchDishId } of changed) {
      if ((statusById.get(branchDishId) ?? 'pending') !== 'pending') continue;
      if (isCorroborated(await listCurrentRaters(tx, branchDishId), activation, weightConfig)) {
        await activateDish(tx, branchDishId);
        await resolveReviewTask(tx, 'new_dish', branchDishId, 'corroborated');
      }
    }

    let aspectsSaved = false;
    if (input.aspects && !sameAspects(input.aspects, await findCurrentAspects(tx, userId, branch.id))) {
      await replaceAspects(tx, userId, branch.id, trust, input.aspects);
      aspectsSaved = true;
    }

    const dishIds = changed.map((dish) => dish.branchDishId);
    if (dishIds.length > 0) await recomputeDishes(tx, dishIds);
    if (dishIds.length > 0 || aspectsSaved) await recomputeBranch(tx, branch.id, { aspects: aspectsSaved });
    return ok({ branchSlug: branch.slug, savedDishes: changed.length, aspectsSaved, dishIds });
  });
}

const communitySection = 'Added by locals';

/**
 * Gate 2 and §5.2: the same fingerprint at this branch reuses that card and keeps the typed text as
 * an alias; otherwise a pending card is created (active at once for a confident canonical match by a
 * regular member, D47) with an Ops task.
 */
async function resolveOrCreateDish(
  tx: Executor,
  input: { userId: string; trust: TrustLevel; branchId: string; branchListed: boolean; dish: NewDishInput },
  index: Awaited<ReturnType<typeof getCanonicalNameIndex>>,
): Promise<Result<string>> {
  if (checkDishName(input.dish.name)) return err({ code: 'invalid_input', message: 'dish_name' });
  const { normalizedName, fingerprint } = fingerprintDish(input.dish.name, new Set(index.protectedNames));
  const alias = (branchDishId: string) =>
    insertDishAlias(tx, {
      branchDishId,
      rawText: input.dish.name.trim(),
      normalizedText: normalizedName,
      createdBy: input.userId,
      submittedPricePaise: input.dish.pricePaise,
    });

  const existing = await findDishByFingerprint(tx, input.branchId, fingerprint);
  if (existing) {
    await alias(existing.id);
    return ok(existing.id);
  }

  const canonical = index.byFingerprint[fingerprint] ?? null;
  const active = activatesOnCreate({
    trust: input.trust,
    branchListed: input.branchListed,
    canonicalMatch: canonical !== null,
  });
  const name = displayDishName(input.dish.name);
  const id = await insertCommunityDish(tx, {
    branchId: input.branchId,
    canonicalDishId: canonical?.canonicalDishId ?? null,
    slug: uniqueSlug(slugify(name), await listBranchDishSlugs(tx, input.branchId)),
    name,
    normalizedName,
    fingerprint,
    menuSection: canonical?.category ?? communitySection,
    pricePaise: input.dish.pricePaise,
    diet: input.dish.diet,
    status: active ? 'active' : 'pending',
    createdBy: input.userId,
  });
  const dishId = id ?? (await findDishByFingerprint(tx, input.branchId, fingerprint))?.id;
  if (!dishId) return err({ code: 'conflict' });
  await alias(dishId);
  if (id && !active) {
    await openReviewTask(tx, {
      kind: 'new_dish',
      entityId: dishId,
      branchId: input.branchId,
      priority: input.trust === 't0' ? 2 : 3,
      openedBy: input.userId,
    });
  }
  return ok(dishId);
}

/** What the rate sheet needs: the branch's dishes and the member's current answers. */
export async function getRateSheet(userId: string | null, branchId: string, db: Executor) {
  const dishes = await listRateableDishes(db, branchId);
  if (!userId) return { dishes, mine: { dishes: [], aspects: null } };
  const [mineDishes, aspects] = await Promise.all([
    findCurrentDishRatings(db, userId, branchId),
    findCurrentAspects(db, userId, branchId),
  ]);
  return { dishes, mine: { dishes: mineDishes, aspects } };
}

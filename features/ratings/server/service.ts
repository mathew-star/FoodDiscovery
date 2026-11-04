import 'server-only';

import { withTransaction, type Database, type Transaction } from '@/db/client';
import { getRankingConfig } from '@/features/ratings/queries/ranking-config';
import { err, ok, type Result } from '@/shared/lib/result';
import {
  aggregateAspects,
  aggregateDishRatings,
  aspectKeys,
  aspectScores,
  cityPrior,
  type AspectRow,
  type DishRatingRow,
} from '../lib/aggregate';
import { computeDishScore, computeFoodScore } from '../lib/score';
import type { RateBranchInput } from '../schemas/rate-input';
import {
  canonicalTotals,
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
    const rateable = new Set((await listRateableDishes(tx, branch.id)).map((dish) => dish.id));
    if (input.dishes.some((dish) => !rateable.has(dish.branchDishId))) return err({ code: 'invalid_input' });

    const current = new Map(
      (await findCurrentDishRatings(tx, userId, branch.id)).map((row) => [row.branchDishId, row.sentiment]),
    );
    const changed = input.dishes.filter((dish) => current.get(dish.branchDishId) !== dish.sentiment);
    await replaceDishRatings(tx, userId, trust, changed);

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

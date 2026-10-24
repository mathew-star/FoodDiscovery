'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { VerdictBar } from '@/features/ratings/components/verdict-bar';
import { verdictFill } from '@/features/ratings/components/verdict-pill';
import { computeDishScore, ratingWeight, type SentimentWeights } from '@/features/ratings/lib/score';
import { verdictShares } from '@/features/ratings/lib/verdict-shares';
import type { DishScoringConfig, RatingWeightsConfig } from '@/features/ratings/schemas/ranking-config';
import {
  sentimentLabelKey,
  sentiments,
  sentimentValue,
  type Sentiment,
} from '@/features/ratings/schemas/sentiment';
import { t, tRich } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { cardVariants } from '@/shared/ui/card';
import { burstHandles, xrayDish, xraySeed, type XrayRating } from '../lib/content';

type ScoreXrayProps = {
  weights: RatingWeightsConfig;
  scoring: Pick<DishScoringConfig, 'priorStrength' | 'minWeightForDisplay'>;
};

type Row = XrayRating & { id: string };

const seedRows = (): Row[] => xraySeed.map((rating) => ({ ...rating, id: rating.handle }));

function ageLabel(days: number): string {
  if (days === 0) return t('landing.trust.xray.age.today');
  if (days < 30) return t('landing.trust.xray.age.days', { n: days });
  if (days < 365) return t('landing.trust.xray.age.months', { n: Math.round(days / 30) });
  return t('landing.trust.xray.age.years', { n: (days / 365).toFixed(1) });
}

/** Restart the row flash (§8 `flash`) without remounting, so keyboard focus stays on the verdict. */
function flash(event: MouseEvent<HTMLButtonElement>) {
  const row = event.currentTarget.closest('li');
  if (!row) return;
  row.classList.remove('animate-flash');
  void row.offsetWidth;
  row.classList.add('animate-flash');
}

/**
 * Score X-Ray (DESIGN-SYSTEM §13 #4). Runs the production scoring code (spec §6.1) on sample
 * ratings with the spec default weights (`defaultRatingWeights`), so what the visitor sees is how scores really work.
 */
export function ScoreXray({ weights, scoring }: ScoreXrayProps) {
  const [rows, setRows] = useState(seedRows);
  const list = useRef<HTMLUListElement>(null);
  const burst = rows.some((row) => row.held);
  const maxTrust = Math.max(...Object.values(weights.trust));

  useEffect(() => {
    if (burst && list.current) list.current.scrollTop = list.current.scrollHeight;
  }, [burst]);

  const weighted = rows.map((row) => ({
    row,
    weight: ratingWeight(
      { trust: row.trust, ageDays: row.ageDays, disclosed: Boolean(row.disclosed), held: Boolean(row.held) },
      weights,
    ),
  }));
  const byVerdict = weighted.reduce<SentimentWeights>(
    (totals, { row, weight }) => ({ ...totals, [row.verdict]: totals[row.verdict] + weight }),
    { loved: 0, good: 0, okay: 0, skip: 0 },
  );
  const fdn = computeDishScore(byVerdict, xrayDish.cityPrior, scoring);
  const plain = rows.reduce((total, row) => total + sentimentValue[row.verdict], 0) / rows.length;

  function setVerdict(id: string, verdict: Sentiment) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, verdict } : row)));
  }

  function addBurst() {
    setRows((current) => [
      ...current,
      ...burstHandles.map((handle) => ({
        id: handle,
        handle,
        trust: 'T0' as const,
        verdict: 'loved' as const,
        ageDays: 0,
        held: true,
      })),
    ]);
  }

  function why(row: Row): { text: string; flagged: boolean } {
    if (row.disclosed) return { text: t('landing.trust.xray.why.paid'), flagged: true };
    if (row.held) return { text: t('landing.trust.xray.why.held'), flagged: true };
    if (row.ageDays > 365) return { text: t('landing.trust.xray.why.old'), flagged: false };
    return { text: t(`landing.trust.xray.trust.${row.trust}`), flagged: false };
  }

  return (
    <div className={cn(cardVariants({ tone: 'onDark' }), 'overflow-hidden text-ink')}>
      <div className="border-b-2 border-ink p-5 sm:p-6">
        <p className="text-[11px] text-inkMuted">{t('landing.trust.xray.kicker')}</p>
        <h3 className="truncate type-title-m">
          {xrayDish.dish} · {xrayDish.place.name}
        </h3>
      </div>

      <div
        aria-hidden="true"
        className="hidden grid-cols-[1.3fr_1.6fr_1fr] gap-4 border-b-2 border-ink bg-cream px-6 py-2.5 text-[11px] text-inkMuted sm:grid"
      >
        <span>{t('landing.trust.xray.who')}</span>
        <span>{t('landing.trust.xray.verdict')}</span>
        <span className="text-right">{t('landing.trust.xray.countsAs')}</span>
      </div>

      <ul ref={list} className="max-h-[440px] divide-y divide-ink/15 overflow-y-auto">
        {weighted.map(({ row, weight }) => {
          const reason = why(row);
          return (
            <li
              key={row.id}
              className={cn(
                'grid grid-cols-1 items-center gap-2 px-5 py-3 sm:grid-cols-[1.3fr_1.6fr_1fr] sm:gap-4 sm:px-6',
                row.held && 'held-stripes',
              )}
            >
              <div className="min-w-0">
                <p className="truncate text-sm">@{row.handle}</p>
                <p className="text-[11px] text-inkMuted">
                  {t('landing.trust.xray.rowMeta', {
                    trust: t(`landing.trust.xray.trust.${row.trust}`),
                    age: ageLabel(row.ageDays),
                  })}
                </p>
              </div>
              <div
                role="group"
                aria-label={t('landing.trust.xray.verdictGroup', { user: `@${row.handle}` })}
                className="flex flex-wrap gap-1"
              >
                {sentiments.map((sentiment) => {
                  const on = row.verdict === sentiment;
                  return (
                    <button
                      key={sentiment}
                      type="button"
                      aria-pressed={on}
                      disabled={row.held}
                      onClick={(event) => {
                        setVerdict(row.id, sentiment);
                        flash(event);
                      }}
                      className={cn(
                        'min-h-7 rounded-full border border-ink px-2 py-1 text-[11px] font-bold transition-colors duration-(--dur-instant) disabled:cursor-not-allowed disabled:opacity-60',
                        on ? verdictFill[sentiment] : 'bg-paper text-inkMuted hover:bg-cream',
                      )}
                    >
                      {t(sentimentLabelKey[sentiment])}
                    </button>
                  );
                })}
              </div>
              <div className="sm:text-right">
                <div className="flex items-center gap-2 sm:justify-end">
                  <div
                    aria-hidden="true"
                    className="h-2 w-20 overflow-hidden rounded-full border border-ink/30 bg-creamDark"
                  >
                    <div
                      style={{ width: `${Math.min(100, (weight / maxTrust) * 100)}%` }}
                      className="h-full bg-ink w-bar"
                    />
                  </div>
                  <span
                    className={cn(
                      'w-9 text-xs font-bold tabular-nums',
                      weight === 0 && 'text-terracottaDeep',
                    )}
                  >
                    {weight.toFixed(2)}
                  </span>
                </div>
                <p className={cn('text-[10px]', reason.flagged ? 'text-terracottaDeep' : 'text-inkMuted')}>
                  {reason.text}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      {burst ? (
        <p
          role="status"
          className="border-t-2 border-ink bg-terracottaDeep px-5 py-3 text-xs leading-relaxed text-paper sm:px-6"
        >
          {tRich('landing.trust.xray.burst', { label: <b>{t('landing.trust.xray.burstLabel')}</b> })}
        </p>
      ) : null}

      <div aria-live="polite" className="grid border-t-2 border-ink sm:grid-cols-2">
        <div className="border-b-2 border-ink p-5 sm:border-r-2 sm:border-b-0 sm:p-6">
          <p className="text-[11px] text-inkMuted">{t('landing.trust.xray.plain')}</p>
          <p className="mt-1 flex items-baseline gap-2 text-inkMuted">
            <span className="type-score text-4xl">{Math.round(plain * 100)}</span>
            <span className="text-xs">{t('landing.trust.xray.outOf')}</span>
          </p>
          <p className="mt-2 text-xs leading-relaxed text-inkMuted">{t('landing.trust.xray.plainNote')}</p>
        </div>
        <div className="bg-lime p-5 sm:p-6">
          <p className="text-[11px]">{t('landing.trust.xray.fdn')}</p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="type-score text-4xl">{Math.round(fdn.score * 100)}</span>
            <span className="text-xs">{t('landing.trust.xray.outOf')}</span>
            <span className="ml-auto rounded-full border border-ink bg-paper px-2 py-0.5 text-xs font-bold">
              {fdn.lovedPct === null
                ? t('landing.trust.xray.fewRatings')
                : t('landing.trust.xray.lovedPct', { pct: Math.round(fdn.lovedPct) })}
            </span>
          </p>
          <VerdictBar shares={verdictShares(byVerdict)} legend={false} track="paper" className="mt-3" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t-2 border-ink bg-cream p-5 sm:px-6">
        <button
          type="button"
          onClick={addBurst}
          disabled={burst}
          className="min-h-10 rounded-full border-2 border-ink bg-ink px-4 py-2.5 text-xs text-cream hover:bg-terracottaDeep disabled:opacity-50"
        >
          {t('landing.trust.xray.tryBurst')}
        </button>
        <button
          type="button"
          onClick={() => setRows(seedRows())}
          className="min-h-10 rounded-full border-2 border-ink bg-paper px-4 py-2.5 text-xs hover:bg-creamDark"
        >
          {t('landing.trust.xray.reset')}
        </button>
        <details className="ml-auto max-w-full text-[11px] text-inkMuted">
          <summary className="underline underline-offset-4">{t('landing.trust.xray.howWeight')}</summary>
          <p className="mt-2 max-w-sm leading-relaxed">
            {t('landing.trust.xray.howWeightBody', {
              t0: weights.trust.T0,
              t1: weights.trust.T1.toFixed(1),
              t2: weights.trust.T2,
              halfLife: weights.halfLifeDays,
            })}
          </p>
        </details>
      </div>
    </div>
  );
}

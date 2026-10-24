import { Clock } from 'lucide-react';
import type { ReactNode } from 'react';
import { defaultRatingWeights, rankingConfigDefaults } from '@/features/ratings/schemas/ranking-config';
import { t, type MessageKey } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { ScoreXray } from './score-xray.client';

const points: { mark: ReactNode; tone: string; title: MessageKey; body: MessageKey }[] = [
  {
    mark: t('landing.trust.points.words.mark'),
    tone: 'bg-lime text-ink',
    title: 'landing.trust.points.words.title',
    body: 'landing.trust.points.words.body',
  },
  {
    mark: <Clock aria-hidden="true" className="size-5" strokeWidth={2.5} />,
    tone: 'bg-saffron text-ink',
    title: 'landing.trust.points.facts.title',
    body: 'landing.trust.points.facts.body',
  },
  {
    mark: t('landing.trust.points.money.mark'),
    tone: 'bg-terracottaDeep text-paper',
    title: 'landing.trust.points.money.title',
    body: 'landing.trust.points.money.body',
  },
];

const cantBuy: MessageKey[] = [
  'landing.trust.cantBuy.placement',
  'landing.trust.cantBuy.score',
  'landing.trust.cantBuy.hidden',
  'landing.trust.cantBuy.battle',
];

/** Section 4, the page's one dark section: a score you can take apart. */
export function HonestByDesign() {
  const weights = defaultRatingWeights;
  const scoring = rankingConfigDefaults.dish_scoring;

  return (
    <section
      id="rules"
      aria-labelledby="trust-title"
      className="relative overflow-hidden border-b-4 border-ink bg-ink py-16 text-cream md:py-24"
    >
      <div className="mx-auto grid max-w-[1360px] grid-cols-1 items-start gap-12 px-5 md:px-10 lg:grid-cols-12">
        <div className="space-y-8 lg:sticky lg:top-28 lg:col-span-5">
          <h2 id="trust-title" className="type-display-l">
            {t('landing.trust.title')}
          </h2>
          <p className="max-w-md text-lg leading-relaxed text-cream/75">{t('landing.trust.body')}</p>

          <ul className="space-y-5">
            {points.map((point) => (
              <li key={point.title} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex size-11 shrink-0 items-center justify-center rounded-xl border-2 border-cream/20 font-display font-extrabold',
                    point.tone,
                  )}
                >
                  {point.mark}
                </span>
                <p>
                  <span className="block">{t(point.title)}</span>
                  <span className="text-sm text-cream/70">{t(point.body)}</span>
                </p>
              </li>
            ))}
          </ul>

          <div className="rounded-2xl border-2 border-cream/25 p-5">
            <h3 className="mb-3 font-sans text-xs text-cream/70">{t('landing.trust.cantBuy.title')}</h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {cantBuy.map((key) => (
                <li key={key} className="line-through decoration-terracotta decoration-2">
                  {t(key)}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="min-w-0 lg:col-span-7">
          <ScoreXray
            weights={weights}
            scoring={{
              priorStrength: scoring.priorStrength,
              minWeightForDisplay: scoring.minWeightForDisplay,
            }}
          />
        </div>
      </div>
    </section>
  );
}

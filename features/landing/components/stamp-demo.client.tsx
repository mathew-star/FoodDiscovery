'use client';

import { AnimatePresence, m } from 'motion/react';
import { useState } from 'react';
import { DietMark } from '@/features/dishes/components/diet-mark';
import { RatingBadge } from '@/features/ratings/components/rating-badge';
import { SentimentIcon } from '@/features/ratings/components/sentiment-icon';
import { sentimentLabelKey, sentiments, type Sentiment } from '@/features/ratings/schemas/sentiment';
import { t } from '@/i18n';
import { cn } from '@/shared/lib/cn';

const tone: Record<Sentiment, string> = {
  loved: 'text-rate-loved',
  good: 'text-rate-good',
  okay: 'text-rate-okay',
  skip: 'text-rate-skip',
};

export function StampDemo() {
  const [stamped, setStamped] = useState<Sentiment | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div className="relative mx-auto w-full max-w-sm drop-shadow-[6px_6px_0_var(--lift-color)]">
        <div className="relative h-56 bg-raised px-6 pt-6 pb-10 font-mono text-sm perforate-b">
          <p className="text-2xs tracking-[0.25em] text-ink-soft uppercase">{t('landing.stampDemo.try')}</p>
          <div className="mt-4 flex items-start gap-2">
            <DietMark diet="nonveg" className="mt-1" />
            <p className="font-display text-5xl leading-none font-extrabold [font-stretch:72%]">
              {t('landing.stampDemo.dish')}
            </p>
          </div>
          <p className="mt-2 flex items-baseline gap-2">
            <span className="uppercase">{t('landing.stampDemo.place')}</span>
            <span aria-hidden="true" className="leader" />
            <span className="font-bold">{t('landing.stampDemo.price')}</span>
          </p>
          <AnimatePresence mode="popLayout">
            {stamped ? (
              <m.div
                key={stamped}
                className="absolute right-4 bottom-10"
                initial={{ scale: 2.4, opacity: 0, rotate: -24 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.12 } }}
                transition={{ type: 'spring', stiffness: 700, damping: 24, mass: 0.8 }}
              >
                <RatingBadge sentiment={stamped} size="xl" className="bg-raised/70" />
              </m.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
      <p aria-live="polite" className="sr-only">
        {stamped ? t('landing.stampDemo.stamped', { label: t(sentimentLabelKey[stamped]) }) : ''}
      </p>
      <div
        role="group"
        aria-label={t('landing.stampDemo.try')}
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {sentiments.map((sentiment) => (
          <m.button
            key={sentiment}
            type="button"
            aria-pressed={stamped === sentiment}
            onClick={() => setStamped(sentiment)}
            whileTap={{ scale: 0.92, y: 3 }}
            className={cn(
              'flex h-16 flex-col items-center justify-center gap-0.5 border-2 border-ink bg-raised font-display text-xl font-extrabold uppercase [font-stretch:78%] shadow-lift-sm',
              tone[sentiment],
              stamped === sentiment && 'bg-haldi/40 shadow-none',
            )}
          >
            <SentimentIcon sentiment={sentiment} className="size-5" />
            {t(sentimentLabelKey[sentiment])}
          </m.button>
        ))}
      </div>
      {stamped ? (
        <button
          type="button"
          onClick={() => setStamped(null)}
          className="self-center font-mono text-xs uppercase underline decoration-2 underline-offset-4"
        >
          {t('landing.stampDemo.reset')}
        </button>
      ) : null}
    </div>
  );
}

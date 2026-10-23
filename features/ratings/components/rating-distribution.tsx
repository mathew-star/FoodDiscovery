import type { CSSProperties } from 'react';
import { sentimentLabelKey, sentiments, type Sentiment } from '@/features/ratings/schemas/sentiment';
import { t } from '@/i18n';
import { SentimentIcon } from './sentiment-icon';

const barTone: Record<Sentiment, string> = {
  loved: 'bg-rate-loved',
  good: 'bg-rate-good',
  okay: 'bg-rate-okay',
  skip: 'bg-rate-skip',
};

const textTone: Record<Sentiment, string> = {
  loved: 'text-rate-loved',
  good: 'text-rate-good',
  okay: 'text-rate-okay',
  skip: 'text-rate-skip',
};

export function RatingDistribution({ weights }: { weights: Record<Sentiment, number> }) {
  const total = sentiments.reduce((sum, sentiment) => sum + weights[sentiment], 0);
  return (
    <dl aria-label={t('rating.distributionLabel')} className="flex flex-col gap-3">
      {sentiments.map((sentiment, index) => {
        const pct = total > 0 ? Math.round((weights[sentiment] / total) * 100) : 0;
        const label = t(sentimentLabelKey[sentiment]);
        return (
          <div key={sentiment} className="grid grid-cols-[5.5rem_1fr_3rem] items-center gap-3">
            <dt
              className={`flex items-center gap-1.5 font-display text-lg font-bold uppercase [font-stretch:80%] ${textTone[sentiment]}`}
            >
              <SentimentIcon sentiment={sentiment} />
              {label}
            </dt>
            <dd aria-hidden="true" className="h-3 border-2 border-ink bg-raised">
              <div
                style={{ '--i': index, transform: `scaleX(${pct / 100})` } as CSSProperties}
                className={`h-full origin-left ${barTone[sentiment]} motion-safe:animate-[grow_700ms_var(--motion-snap)_both] motion-safe:[animation-delay:calc(var(--i)*90ms+150ms)]`}
              />
            </dd>
            <dd className="text-right font-mono text-sm font-medium tabular-nums">
              <span className="sr-only">{t('rating.distributionRow', { label, pct })}</span>
              <span aria-hidden="true">{pct}%</span>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

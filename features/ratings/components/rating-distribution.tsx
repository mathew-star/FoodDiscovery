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
    <dl aria-label={t('rating.distributionLabel')} className="flex flex-col gap-2">
      {sentiments.map((sentiment) => {
        const pct = total > 0 ? Math.round((weights[sentiment] / total) * 100) : 0;
        const label = t(sentimentLabelKey[sentiment]);
        return (
          <div key={sentiment} className="grid grid-cols-[6rem_1fr_3rem] items-center gap-3 text-sm">
            <dt className={`flex items-center gap-1.5 font-semibold ${textTone[sentiment]}`}>
              <SentimentIcon sentiment={sentiment} />
              {label}
            </dt>
            <dd className="h-2.5 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
              <div className={`h-full rounded-full ${barTone[sentiment]}`} style={{ width: `${pct}%` }} />
            </dd>
            <dd className="text-right font-medium tabular-nums">
              <span className="sr-only">{t('rating.distributionRow', { label, pct })}</span>
              <span aria-hidden="true">{pct}%</span>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

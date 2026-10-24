import { sentimentLabelKey, sentiments, type Sentiment } from '@/features/ratings/schemas/sentiment';
import { t } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { verdictShares } from '../lib/verdict-shares';
import { verdictBarFill, VerdictPill } from './verdict-pill';

/** Per-verdict breakdown rows for a dish page (spec §3.5 branch dish). */
export function RatingDistribution({ weights }: { weights: Record<Sentiment, number> }) {
  const shares = verdictShares(weights);
  return (
    <dl aria-label={t('rating.distributionLabel')} className="flex flex-col gap-3">
      {sentiments.map((sentiment) => {
        const pct = shares[sentiment];
        const label = t(sentimentLabelKey[sentiment]);
        return (
          <div key={sentiment} className="grid grid-cols-[4.5rem_1fr_2.5rem] items-center gap-3">
            <dt>
              <VerdictPill verdict={sentiment} />
            </dt>
            <dd
              aria-hidden="true"
              className="h-3 overflow-hidden rounded-full border-[1.5px] border-ink bg-cream"
            >
              <div style={{ width: `${pct}%` }} className={cn('h-full w-bar', verdictBarFill[sentiment])} />
            </dd>
            <dd className="text-right text-sm tabular-nums">
              <span className="sr-only">{t('rating.distributionRow', { label, pct })}</span>
              <span aria-hidden="true">{pct}%</span>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

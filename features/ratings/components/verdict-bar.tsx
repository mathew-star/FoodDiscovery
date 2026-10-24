import { sentimentLabelKey, sentiments } from '@/features/ratings/schemas/sentiment';
import { t } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import type { VerdictShares } from '../lib/verdict-shares';
import { verdictBarFill } from './verdict-pill';

type VerdictBarProps = {
  shares: VerdictShares;
  legend?: boolean;
  /** Bar track colour; use `paper` on lime or cream surfaces. */
  track?: 'cream' | 'paper';
  className?: string;
};

/**
 * DESIGN-SYSTEM §7.8. Always Loved → Good → Okay → Skip; segment widths animate on change.
 * The bar is decorative; the legend carries the numbers for assistive tech.
 */
export function VerdictBar({ shares, legend = true, track = 'cream', className }: VerdictBarProps) {
  return (
    <div className={className}>
      <div
        aria-hidden="true"
        className={cn(
          'flex h-3 w-full overflow-hidden rounded-full border-[1.5px] border-ink',
          track === 'paper' ? 'bg-paper' : 'bg-cream',
        )}
      >
        {sentiments.map((sentiment, index) => (
          <div
            key={sentiment}
            style={{ width: `${shares[sentiment]}%` }}
            className={cn('h-full w-bar', verdictBarFill[sentiment], index > 0 && 'border-l border-ink')}
          />
        ))}
      </div>
      {legend ? (
        <p className="mt-1.5 flex justify-between gap-2 text-[10px] text-inkMuted">
          {sentiments.map((sentiment) => (
            <span key={sentiment}>
              {t('rating.legendItem', { label: t(sentimentLabelKey[sentiment]), pct: shares[sentiment] })}
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}

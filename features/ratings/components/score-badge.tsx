import { Heart, Sparkles } from 'lucide-react';
import { t } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { ScoreInfo } from './score-info.client';

type ScoreBadgeProps = {
  lovedPct: number | null;
  ratingCount: number;
  withInfo?: boolean;
  size?: 'sm' | 'md';
  className?: string;
};

export function ScoreBadge({
  lovedPct,
  ratingCount,
  withInfo = false,
  size = 'sm',
  className,
}: ScoreBadgeProps) {
  const text = size === 'md' ? 'text-base' : 'text-sm';
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      {lovedPct === null ? (
        <span className={cn('inline-flex items-center gap-1 font-medium text-muted', text)}>
          <Sparkles aria-hidden="true" className="size-4" />
          {ratingCount === 1 ? t('rating.newRatingOne') : t('rating.newRatings', { count: ratingCount })}
        </span>
      ) : (
        <span className={cn('inline-flex items-center gap-1 font-semibold text-rate-loved', text)}>
          <Heart aria-hidden="true" className="size-4" fill="currentColor" />
          {t('rating.lovedPct', { pct: Math.round(lovedPct) })}
          <span className="font-normal text-muted">
            · {ratingCount === 1 ? t('rating.basedOnOne') : t('rating.basedOn', { count: ratingCount })}
          </span>
        </span>
      )}
      {withInfo ? <ScoreInfo label={t('rating.scoreInfoLabel')} content={t('rating.scoreInfo')} /> : null}
    </span>
  );
}

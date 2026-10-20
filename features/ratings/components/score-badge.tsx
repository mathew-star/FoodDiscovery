import { t } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { ScoreInfo } from './score-info.client';

type ScoreBadgeProps = {
  lovedPct: number | null;
  ratingCount: number;
  withInfo?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

function countLabel(count: number): string {
  return count === 1 ? t('rating.basedOnOne') : t('rating.basedOn', { count });
}

export function ScoreBadge({
  lovedPct,
  ratingCount,
  withInfo = false,
  size = 'sm',
  className,
}: ScoreBadgeProps) {
  if (lovedPct === null) {
    return (
      <span className={cn('inline-flex items-center gap-2', className)}>
        <span className="rounded-tick border border-dashed border-rule-strong px-1.5 py-px font-mono text-2xs tracking-wide text-ink-soft uppercase">
          {ratingCount === 1 ? t('rating.newRatingOne') : t('rating.newRatings', { count: ratingCount })}
        </span>
        {withInfo ? <ScoreInfo label={t('rating.scoreInfoLabel')} content={t('rating.scoreInfo')} /> : null}
      </span>
    );
  }

  const pct = Math.round(lovedPct);
  const number = { sm: 'text-2xl', md: 'text-4xl', lg: 'text-7xl' }[size];
  return (
    <span className={cn('inline-flex flex-wrap items-end gap-x-2 gap-y-0.5', className)}>
      <span className="flex items-baseline gap-1 text-rate-loved">
        <span
          className={cn('font-display leading-none font-extrabold [font-stretch:72%] tabular-nums', number)}
        >
          {pct}%
        </span>
        <span className="font-display text-sm font-bold tracking-wide uppercase [font-stretch:80%]">
          {t('rating.lovedWord')}
        </span>
      </span>
      <span className="pb-0.5 font-mono text-2xs whitespace-nowrap text-ink-soft uppercase">
        {countLabel(ratingCount)}
      </span>
      {withInfo ? <ScoreInfo label={t('rating.scoreInfoLabel')} content={t('rating.scoreInfo')} /> : null}
    </span>
  );
}

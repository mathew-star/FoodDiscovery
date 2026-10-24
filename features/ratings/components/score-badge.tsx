import { t } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { ScoreInfo } from './score-info.client';

type ScoreBadgeProps = {
  /** Null until the weighted sum reaches the display minimum (spec §6.1). */
  lovedPct: number | null;
  ratingCount: number;
  /**
   * `box`: lime score box with count (proof card, dish header).
   * `pill`: lime loved % pill (leaderboard rows).
   * `inline`: quiet text for dense lists (menus).
   */
  variant?: 'box' | 'pill' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  withInfo?: boolean;
  className?: string;
};

const boxNumber = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl' } as const;

export function ScoreBadge({
  lovedPct,
  ratingCount,
  variant = 'box',
  size = 'md',
  withInfo = false,
  className,
}: ScoreBadgeProps) {
  const info = withInfo ? (
    <ScoreInfo label={t('rating.scoreInfoLabel')} content={t('rating.scoreInfo')} />
  ) : null;
  const count = ratingCount.toLocaleString('en-IN');

  if (lovedPct === null) {
    return (
      <span className={cn('inline-flex items-center gap-1.5', className)}>
        <span className="rounded border border-dashed border-ink/40 bg-paper px-1.5 py-0.5 text-[11px] whitespace-nowrap text-inkMuted">
          {ratingCount === 1 ? t('rating.newRatingOne') : t('rating.newRatings', { count })}
        </span>
        {info}
      </span>
    );
  }

  const pct = Math.round(lovedPct);

  if (variant === 'inline') {
    return (
      <span className={cn('inline-flex items-center gap-1.5 text-xs', className)}>
        <span className="text-oliveDeep">{t('rating.lovedPct', { pct })}</span>
        <span className="text-inkMuted">· {t('rating.ratingsCount', { count })}</span>
        {info}
      </span>
    );
  }

  if (variant === 'pill') {
    return (
      <span className={cn('inline-flex items-center gap-1.5', className)}>
        <span className="rounded-lg border-[1.5px] border-ink bg-lime px-2 py-0.5 text-[13px] font-bold tabular-nums">
          {pct}%<span className="sr-only"> {t('rating.lovedWord')}</span>
        </span>
        {info}
      </span>
    );
  }

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className="inline-flex flex-col items-end rounded-xl border-2 border-ink bg-lime px-3 py-1.5 text-right shadow-brutal-sm">
        <span className={cn('type-score', boxNumber[size])}>{pct}%</span>
        <span className="text-[10px] leading-tight font-bold whitespace-nowrap">
          {t('rating.lovedCount', { count })}
        </span>
      </span>
      {info}
    </span>
  );
}

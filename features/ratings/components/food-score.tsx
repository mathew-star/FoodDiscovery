import { t, type MessageKey } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { ScoreInfo } from './score-info.client';

/** Spec §6.2 labels: Great (≥ 0.8), Good (≥ 0.6), Mixed (≥ 0.4), Poor. */
export function foodScoreLabelKey(score: number): MessageKey {
  if (score >= 0.8) return 'rating.foodGreat';
  if (score >= 0.6) return 'rating.foodGood';
  if (score >= 0.4) return 'rating.foodMixed';
  return 'rating.foodPoor';
}

function fill(score: number): string {
  if (score >= 0.8) return 'bg-olive text-ink';
  if (score >= 0.6) return 'bg-lime text-ink';
  if (score >= 0.4) return 'bg-saffron text-ink';
  return 'bg-terracottaDeep text-paper';
}

export function FoodScore({ score }: { score: number | null }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs">
      <span className="text-inkMuted">{t('rating.foodScore')}</span>
      {score === null ? (
        <span className="text-inkMuted">{t('rating.noFoodScore')}</span>
      ) : (
        <span
          className={cn(
            'rounded-full border border-ink px-2 py-0.5 text-[11px] leading-tight font-bold',
            fill(score),
          )}
        >
          {t(foodScoreLabelKey(score))}
        </span>
      )}
      <ScoreInfo label={t('rating.scoreInfoLabel')} content={t('rating.foodScoreInfo')} />
    </span>
  );
}

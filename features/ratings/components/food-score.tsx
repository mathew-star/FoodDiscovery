import { t, type MessageKey } from '@/i18n';
import { ScoreInfo } from './score-info.client';

function labelKey(score: number): MessageKey {
  if (score >= 0.8) return 'rating.foodGreat';
  if (score >= 0.6) return 'rating.foodGood';
  if (score >= 0.4) return 'rating.foodMixed';
  return 'rating.foodPoor';
}

export function FoodScore({ score }: { score: number | null }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <span className="text-muted">{t('rating.foodScore')}:</span>
      <span className="font-semibold">{score === null ? t('rating.noFoodScore') : t(labelKey(score))}</span>
      <ScoreInfo label={t('rating.scoreInfoLabel')} content={t('rating.foodScoreInfo')} />
    </span>
  );
}

export { labelKey as foodScoreLabelKey };

import { t, type MessageKey } from '@/i18n';
import { Stamp } from '@/shared/ui/stamp';
import { ScoreInfo } from './score-info.client';

export function foodScoreLabelKey(score: number): MessageKey {
  if (score >= 0.8) return 'rating.foodGreat';
  if (score >= 0.6) return 'rating.foodGood';
  if (score >= 0.4) return 'rating.foodMixed';
  return 'rating.foodPoor';
}

const tone = (score: number) =>
  score >= 0.8
    ? 'text-rate-loved'
    : score >= 0.6
      ? 'text-rate-good'
      : score >= 0.4
        ? 'text-rate-okay'
        : 'text-rate-skip';

export function FoodScore({ score, animate = false }: { score: number | null; animate?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="font-mono text-2xs tracking-wide text-ink-soft uppercase">
        {t('rating.foodScore')}
      </span>
      {score === null ? (
        <span className="font-mono text-2xs text-ink-soft uppercase">{t('rating.noFoodScore')}</span>
      ) : (
        <Stamp size="sm" tilt={-3} animate={animate} className={tone(score)}>
          {t(foodScoreLabelKey(score))}
        </Stamp>
      )}
      <ScoreInfo label={t('rating.scoreInfoLabel')} content={t('rating.foodScoreInfo')} />
    </span>
  );
}

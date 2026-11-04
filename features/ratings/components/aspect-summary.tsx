import { t, type MessageKey } from '@/i18n';
import { aspectLabel, type AspectLabel } from '../lib/aggregate';
import { rankingConfigDefaults } from '../schemas/ranking-config';

const labelKey: Record<AspectLabel, MessageKey> = {
  great: 'rating.foodGreat',
  good: 'rating.foodGood',
  mixed: 'rating.foodMixed',
  poor: 'rating.foodPoor',
};

type AspectSummaryProps = {
  value: number | null;
  service: number | null;
  ambience: number | null;
  wouldReturnPct: number | null;
};

/** Spec §6.2: three words and a would-return share; nothing is shown until there are enough answers. */
export function AspectSummary({ value, service, ambience, wouldReturnPct }: AspectSummaryProps) {
  const { labels } = rankingConfigDefaults.aspect_scoring;
  const items = (
    [
      ['ratings.sheet.value', value],
      ['ratings.sheet.service', service],
      ['ratings.sheet.ambience', ambience],
    ] as const
  ).flatMap(([key, score]) => (score === null ? [] : [{ key, label: labelKey[aspectLabel(score, labels)] }]));
  if (items.length === 0 && wouldReturnPct === null) return null;
  return (
    <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
      {items.map((item) => (
        <div key={item.key} className="flex items-center gap-1.5">
          <dt className="text-inkMuted">{t(item.key)}</dt>
          <dd>{t(item.label)}</dd>
        </div>
      ))}
      {wouldReturnPct !== null ? (
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">{t('ratings.sheet.wouldReturn')}</dt>
          <dd>{t('ratings.wouldReturnPct', { pct: Math.round(wouldReturnPct) })}</dd>
        </div>
      ) : null}
    </dl>
  );
}

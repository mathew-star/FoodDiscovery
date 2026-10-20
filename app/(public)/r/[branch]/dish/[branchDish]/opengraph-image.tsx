import { getBranchDish } from '@/features/dishes/queries/dishes';
import { getRankingConfig } from '@/features/ratings/queries/ranking-config';
import { t } from '@/i18n';
import { formatRupees } from '@/shared/lib/money';
import { ogContentType, ogSize, renderOgCard } from '@/shared/ui/og-card';

export const size = ogSize;
export const contentType = ogContentType;
export const alt = t('app.fullName');

export default async function Image({ params }: { params: Promise<{ branch: string; branchDish: string }> }) {
  const { branch, branchDish } = await params;
  const [dish, scoring] = await Promise.all([
    getBranchDish(branch, branchDish),
    getRankingConfig('dish_scoring'),
  ]);
  const badge =
    dish && dish.lovedPct !== null && dish.weightSum >= scoring.minWeightForDisplay
      ? t('rating.lovedPct', { pct: Math.round(dish.lovedPct) })
      : dish
        ? t('rating.newRatings', { count: dish.ratingCount })
        : undefined;
  return renderOgCard({
    brand: t('app.name'),
    eyebrow: dish ? `${dish.branchName} · ${dish.localityName}` : t('city.hyderabad'),
    title: dish ? dish.name : t('app.fullName'),
    subtitle: dish?.pricePaise ? formatRupees(dish.pricePaise) : undefined,
    badge,
  });
}

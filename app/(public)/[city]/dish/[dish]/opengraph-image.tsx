import { getCanonicalDish } from '@/features/dishes/queries/dishes';
import { t } from '@/i18n';
import { ogContentType, ogSize, renderOgCard } from '@/shared/ui/og-card';

export const size = ogSize;
export const contentType = ogContentType;
export const alt = t('app.fullName');

export default async function Image({ params }: { params: Promise<{ city: string; dish: string }> }) {
  const dish = await getCanonicalDish((await params).dish);
  return renderOgCard({
    brand: t('app.name'),
    eyebrow: dish ? dish.categoryName : t('city.hyderabad'),
    title: dish ? t('dish.cityTitle', { dish: dish.name, city: t('city.hyderabad') }) : t('app.fullName'),
    subtitle: t('discover.subtitle'),
  });
}

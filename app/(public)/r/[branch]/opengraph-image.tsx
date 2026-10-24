import { getBranch } from '@/features/places/queries/branches';
import { t } from '@/i18n';
import { ogContentType, ogSize, renderOgCard } from '@/shared/ui/og-card';

export const size = ogSize;
export const contentType = ogContentType;
export const alt = t('place.whatToOrder');

export default async function Image({ params }: { params: Promise<{ branch: string }> }) {
  const branch = await getBranch((await params).branch);
  return renderOgCard({
    brand: t('app.name'),
    city: t('city.hyderabad'),
    eyebrow: branch ? branch.localityName : t('city.hyderabad'),
    title: branch ? branch.name : t('app.fullName'),
    subtitle: branch ? branch.cuisines.map((cuisine) => cuisine.name).join(' · ') : undefined,
    badge: t('place.whatToOrder'),
  });
}

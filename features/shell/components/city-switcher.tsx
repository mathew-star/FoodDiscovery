import { MapPin } from 'lucide-react';
import { cityNameKey, type CitySlug } from '@/features/geo/schemas/city';
import { t } from '@/i18n';

export function CitySwitcher({ city }: { city: CitySlug }) {
  const name = t(cityNameKey[city]);
  return (
    <p
      className="inline-flex h-9 items-center gap-1 rounded-full bg-surface-2 px-3 text-sm font-medium"
      title={t('city.onlyCity')}
    >
      <MapPin aria-hidden="true" className="size-4 text-primary" />
      <span className="sr-only">{t('city.label')}: </span>
      {name}
    </p>
  );
}

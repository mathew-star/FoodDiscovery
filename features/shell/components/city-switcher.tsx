import { MapPin } from 'lucide-react';
import { cityNameKey, type CitySlug } from '@/features/geo/schemas/city';
import { t } from '@/i18n';

export function CitySwitcher({ city }: { city: CitySlug }) {
  return (
    <p
      className="inline-flex h-9 items-center gap-1.5 border-2 border-ink bg-haldi px-2.5 font-mono text-2xs font-medium tracking-wide text-on-haldi uppercase"
      title={t('city.onlyCity')}
    >
      <MapPin aria-hidden="true" className="size-3.5" />
      <span className="sr-only">{t('city.label')}: </span>
      {t(cityNameKey[city])}
    </p>
  );
}

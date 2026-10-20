import { cityNameKey, type CitySlug } from '@/features/geo/schemas/city';
import { ContextChips } from '@/features/search/components/context-chips';
import { SearchBox } from '@/features/search/components/search-box';
import { t } from '@/i18n';

export function DiscoverHero({ city }: { city: CitySlug }) {
  return (
    <section aria-labelledby="discover-title" className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 id="discover-title" className="text-3xl font-semibold md:text-4xl">
          {t('discover.title')}
        </h1>
        <p className="text-muted">{t('app.tagline', { city: t(cityNameKey[city]) })}</p>
      </div>
      <SearchBox city={city} size="lg" className="lg:hidden" />
      <ContextChips city={city} />
      <p className="text-sm font-medium text-muted">{t('discover.subtitle')}</p>
    </section>
  );
}

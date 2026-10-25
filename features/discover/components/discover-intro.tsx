import type { CitySlug } from '@/features/geo/schemas/city';
import { CommandBar } from '@/features/search/components/command-bar.client';
import { ContextChips } from '@/features/search/components/context-chips.client';
import { searchExamples } from '@/features/search/lib/examples';
import { t } from '@/i18n';

export function DiscoverIntro({ city }: { city: CitySlug }) {
  return (
    <section aria-labelledby="discover-title" className="flex flex-col gap-6">
      <h1 id="discover-title" className="max-w-4xl type-display-xl">
        {t('discover.title')}
      </h1>
      <p className="max-w-xl text-base leading-relaxed text-inkMuted sm:text-lg">{t('discover.subtitle')}</p>
      <div className="flex max-w-3xl flex-col gap-4">
        <CommandBar
          action={`/${city}/search`}
          id="discover-search"
          label={t('search.label')}
          placeholder={searchExamples[0] ?? t('search.placeholder')}
          examples={searchExamples}
          suggestCity={city}
          className="flex flex-col gap-4"
        >
          <ContextChips surface="discover" />
        </CommandBar>
      </div>
    </section>
  );
}

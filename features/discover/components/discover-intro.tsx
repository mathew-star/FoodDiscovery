import type { CitySlug } from '@/features/geo/schemas/city';
import { ContextChips } from '@/features/search/components/context-chips';
import { SearchBox } from '@/features/search/components/search-box';
import { t } from '@/i18n';

export function DiscoverIntro({ city }: { city: CitySlug }) {
  return (
    <section aria-labelledby="discover-title" className="flex flex-col gap-6">
      <h1
        id="discover-title"
        className="max-w-4xl rise-in text-[clamp(3rem,10vw,6.5rem)] leading-[0.88] font-extrabold [font-stretch:72%]"
      >
        {t('discover.title')}
      </h1>
      <p className="max-w-xl rise-in font-mono text-xs tracking-wide text-ink-soft uppercase [--i:1]">
        {t('discover.subtitle')}
      </p>
      <div className="flex max-w-3xl rise-in flex-col gap-4 [--i:2]">
        <SearchBox city={city} size="lg" />
        <ContextChips city={city} />
      </div>
    </section>
  );
}

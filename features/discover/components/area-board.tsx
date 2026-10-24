import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { CitySlug } from '@/features/geo/schemas/city';
import { t } from '@/i18n';

type AreaBoardProps = { city: CitySlug; areas: { slug: string; name: string; isLaunch: boolean }[] };

/** "Explore areas" (spec §3.5), the Discover page's one dark section. */
export function AreaBoard({ city, areas }: AreaBoardProps) {
  return (
    <section
      aria-labelledby="explore-areas"
      className="rounded-card border-2 border-ink bg-ink p-6 text-cream md:p-10"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="explore-areas" className="type-display-l">
          {t('discover.exploreAreas')}
        </h2>
        <p className="max-w-xs text-sm text-cream/70">{t('discover.exploreAreasBody')}</p>
      </div>
      <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {areas.map((area) => (
          <li key={area.slug}>
            <Link
              href={`/${city}/area/${area.slug}`}
              className="group flex h-full min-h-28 flex-col justify-between gap-6 rounded-panel border-2 border-cream bg-paper p-5 text-ink shadow-brutal-lime transition-colors duration-(--dur-instant) hover:bg-lime"
            >
              <span className="text-[11px] text-inkMuted group-hover:text-ink">
                {area.isLaunch ? t('discover.launchArea') : null}
              </span>
              <span className="flex items-end justify-between gap-2">
                <span className="type-title-m">{area.name}</span>
                <ArrowUpRight aria-hidden="true" className="size-5 shrink-0" strokeWidth={2.5} />
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { CitySlug } from '@/features/geo/schemas/city';
import { t } from '@/i18n';

type AreaBoardProps = { city: CitySlug; areas: { slug: string; name: string; isLaunch: boolean }[] };

export function AreaBoard({ city, areas }: AreaBoardProps) {
  return (
    <section aria-labelledby="explore-areas" className="bg-ink p-6 text-on-ink md:p-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="explore-areas" className="text-6xl font-extrabold text-haldi md:text-7xl">
          {t('discover.exploreAreas')}
        </h2>
        <p className="max-w-xs text-sm opacity-90">{t('discover.exploreAreasBody')}</p>
      </div>
      <ol className="mt-8 grid gap-px border-2 border-on-ink/40 bg-on-ink/40 sm:grid-cols-2 lg:grid-cols-5">
        {areas.map((area, index) => (
          <li key={area.slug} className="bg-ink">
            <Link
              href={`/${city}/area/${area.slug}`}
              className="group flex h-full flex-col gap-6 p-5 transition-colors duration-(--dur-micro) hover:bg-haldi hover:text-on-haldi"
            >
              <span className="flex items-center justify-between font-mono text-2xs tracking-widest uppercase opacity-80">
                {t('discover.areaStop', { n: String(index + 1).padStart(2, '0') })}
                {area.isLaunch ? <span>{t('discover.launchArea')}</span> : null}
              </span>
              <span className="flex items-end justify-between gap-2">
                <span className="font-display text-4xl leading-none font-extrabold [font-stretch:75%]">
                  {area.name}
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-6 transition-transform duration-(--dur-micro) group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

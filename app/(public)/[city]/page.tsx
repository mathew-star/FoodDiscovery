import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AreaBoard } from '@/features/discover/components/area-board';
import { DiscoverIntro } from '@/features/discover/components/discover-intro';
import { Shelf } from '@/features/discover/components/shelf';
import { PlacedDishRow } from '@/features/dishes/components/placed-dish-row';
import { getCityShelves } from '@/features/dishes/queries/dishes';
import { cityNameKey, citySlugs, parseCitySlug } from '@/features/geo/schemas/city';
import { getCity, getLocalities } from '@/features/geo/queries/geo';
import { t } from '@/i18n';
import { formatRupees } from '@/shared/lib/money';
import { TokenBoard } from '@/shared/ui/token-board';

export function generateStaticParams() {
  return citySlugs.map((city) => ({ city }));
}

export async function generateMetadata({ params }: PageProps<'/[city]'>): Promise<Metadata> {
  const city = parseCitySlug((await params).city);
  if (!city) return {};
  const name = t(cityNameKey[city]);
  return {
    title: { absolute: `${t('app.name')} · ${t('app.tagline', { city: name })}` },
    alternates: { canonical: `/${city}` },
  };
}

export default async function CityDiscoverPage({ params }: PageProps<'/[city]'>) {
  const slug = parseCitySlug((await params).city);
  if (!slug) notFound();
  const city = await getCity(slug);
  if (!city) notFound();
  const [{ shelves, topOverall, minWeightForDisplay }, areas] = await Promise.all([
    getCityShelves(city.id),
    getLocalities(slug),
  ]);

  const ticker = topOverall.map(
    (dish, index) =>
      `No. ${String(index + 1).padStart(2, '0')} · ${dish.canonicalName} · ${dish.localityName}${
        dish.lovedPct !== null ? ` · ${t('rating.lovedPct', { pct: Math.round(dish.lovedPct) })}` : ''
      }${dish.pricePaise !== null ? ` · ${formatRupees(dish.pricePaise)}` : ''}`,
  );

  return (
    <div className="flex flex-col gap-16">
      <DiscoverIntro city={slug} />
      {ticker.length > 0 ? (
        <TokenBoard label={t('shell.nowServing')} items={ticker} className="-mx-4 md:-mx-6" />
      ) : null}

      <section aria-labelledby="top-tickets" className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h2 id="top-tickets" className="text-5xl font-extrabold md:text-6xl">
            {t('discover.topTickets')}
          </h2>
          <p className="text-ink-soft">{t('discover.topTicketsBody')}</p>
        </div>
        <ol className="grid gap-4 lg:grid-cols-2">
          {topOverall.map((dish, index) => (
            <li key={dish.id}>
              <PlacedDishRow dish={dish} rank={index + 1} minWeightForDisplay={minWeightForDisplay} />
            </li>
          ))}
        </ol>
      </section>

      {shelves.slice(0, 3).map((shelf) => (
        <Shelf key={shelf.slug} shelf={shelf} city={slug} minWeightForDisplay={minWeightForDisplay} />
      ))}

      <AreaBoard city={slug} areas={areas} />

      {shelves.slice(3).map((shelf) => (
        <Shelf key={shelf.slug} shelf={shelf} city={slug} minWeightForDisplay={minWeightForDisplay} />
      ))}
    </div>
  );
}

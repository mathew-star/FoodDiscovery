import Link from 'next/link';
import { MapPin } from 'lucide-react';
import type { CitySlug } from '@/features/geo/schemas/city';
import { t } from '@/i18n';
import { ChipLink } from '@/shared/ui/chip';

type DiscoverDirectoryProps = {
  city: CitySlug;
  areas: { slug: string; name: string }[];
  categories: { slug: string; name: string; dishes: { slug: string; name: string }[] }[];
};

export function DiscoverDirectory({ city, areas, categories }: DiscoverDirectoryProps) {
  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="popular-dishes" className="flex flex-col gap-4">
        <h2 id="popular-dishes" className="text-2xl font-semibold">
          {t('discover.popularDishes')}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <section key={category.slug} aria-label={category.name} className="flex flex-col gap-2">
              <h3 className="font-sans text-sm font-semibold tracking-wide text-muted uppercase">
                {category.name}
              </h3>
              <ul className="flex flex-wrap gap-2">
                {category.dishes.map((dish) => (
                  <li key={dish.slug}>
                    <ChipLink href={`/${city}/dish/${dish.slug}`}>{dish.name}</ChipLink>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>
      <section aria-labelledby="explore-areas" className="flex flex-col gap-4">
        <h2 id="explore-areas" className="text-2xl font-semibold">
          {t('discover.exploreAreas')}
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {areas.map((area) => (
            <li key={area.slug}>
              <Link
                href={`/${city}/area/${area.slug}`}
                className="flex h-full items-center gap-2 rounded-md border border-border bg-surface p-4 font-semibold shadow-1 transition-colors duration-(--dur-fast) hover:border-border-strong"
              >
                <MapPin aria-hidden="true" className="size-5 text-primary" />
                {area.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

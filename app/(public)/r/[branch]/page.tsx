import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DishRow } from '@/features/dishes/components/dish-row';
import { getBranchMenu } from '@/features/dishes/queries/dishes';
import { BranchCard } from '@/features/places/components/branch-card';
import { BranchHeader } from '@/features/places/components/branch-header';
import { FactsCard } from '@/features/places/components/facts-card';
import { breadcrumbJsonLd, restaurantJsonLd } from '@/features/places/lib/json-ld';
import { getBranch, getBranchSlugs, getNearbyAlternatives } from '@/features/places/queries/branches';
import { getRankingConfig } from '@/features/ratings/queries/ranking-config';
import { t } from '@/i18n';
import { siteUrl } from '@/shared/config/site';
import { Breadcrumbs } from '@/shared/ui/breadcrumbs';
import { EmptyState } from '@/shared/ui/empty-state';
import { JsonLd } from '@/shared/ui/json-ld';

export async function generateStaticParams() {
  return (await getBranchSlugs()).map((branch) => ({ branch }));
}

export async function generateMetadata({ params }: PageProps<'/r/[branch]'>): Promise<Metadata> {
  const branch = await getBranch((await params).branch);
  if (!branch) return {};
  return {
    title: `${branch.name}, ${branch.localityName}`,
    description: t('place.metaDescription', { name: branch.name, locality: branch.localityName }),
    alternates: { canonical: `/r/${branch.slug}` },
  };
}

export default async function BranchPage({ params }: PageProps<'/r/[branch]'>) {
  const branch = await getBranch((await params).branch);
  if (!branch) notFound();

  const [menu, nearby, scoring] = await Promise.all([
    getBranchMenu(branch.id),
    getNearbyAlternatives(branch),
    getRankingConfig('dish_scoring'),
  ]);
  const path = `/r/${branch.slug}`;

  return (
    <div className="flex flex-col gap-8">
      <JsonLd
        data={{
          '@graph': [
            restaurantJsonLd(branch, new URL(path, siteUrl).toString()),
            breadcrumbJsonLd([
              { name: branch.cityName, url: new URL(`/${branch.citySlug}`, siteUrl).toString() },
              {
                name: branch.localityName,
                url: new URL(`/${branch.citySlug}/area/${branch.localitySlug}`, siteUrl).toString(),
              },
              { name: branch.name, url: new URL(path, siteUrl).toString() },
            ]),
          ],
        }}
      />
      <Breadcrumbs
        label={t('common.breadcrumb')}
        items={[
          { href: `/${branch.citySlug}`, label: branch.cityName },
          { href: `/${branch.citySlug}/area/${branch.localitySlug}`, label: branch.localityName },
          { href: path, label: branch.name },
        ]}
      />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-10">
          <BranchHeader branch={branch} />

          <section aria-labelledby="what-to-order" className="flex flex-col gap-4">
            <h2 id="what-to-order" className="text-2xl font-semibold">
              {t('place.whatToOrder')}
            </h2>
            {menu.whatToOrder.length === 0 ? (
              <EmptyState title={t('place.whatToOrder')} body={t('place.whatToOrderEmpty')} />
            ) : (
              <ol className="grid gap-3 sm:grid-cols-2">
                {menu.whatToOrder.map(({ dish, knownFor }) => (
                  <li key={dish.id}>
                    <DishRow
                      dish={dish}
                      branchSlug={branch.slug}
                      knownFor={knownFor}
                      minWeightForDisplay={scoring.minWeightForDisplay}
                      variant="feature"
                    />
                  </li>
                ))}
              </ol>
            )}
          </section>

          <div className="lg:hidden">
            <FactsCard facts={branch.facts} />
          </div>

          <section aria-labelledby="full-menu" className="flex flex-col gap-4">
            <h2 id="full-menu" className="text-2xl font-semibold">
              {t('place.fullMenu')}
            </h2>
            {menu.sections.map((section) => (
              <section key={section.name} aria-label={section.name} className="flex flex-col">
                <h3 className="border-b border-border pb-2 font-sans text-sm font-semibold tracking-wide text-muted uppercase">
                  {section.name}
                </h3>
                <ul className="divide-y divide-border">
                  {section.dishes.map((dish) => (
                    <li key={dish.id}>
                      <DishRow
                        dish={dish}
                        branchSlug={branch.slug}
                        minWeightForDisplay={scoring.minWeightForDisplay}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </section>

          <section aria-labelledby="nearby" className="flex flex-col gap-4">
            <h2 id="nearby" className="text-2xl font-semibold">
              {t('place.nearby')}
            </h2>
            {nearby.length === 0 ? (
              <p className="text-muted">{t('place.nearbyEmpty')}</p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {nearby.map((alternative) => (
                  <li key={alternative.id}>
                    <BranchCard branch={alternative} timezone={branch.timezone} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <FactsCard facts={branch.facts} />
          </div>
        </aside>
      </div>
    </div>
  );
}

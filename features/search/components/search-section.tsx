import Link from 'next/link';
import { getLocalities } from '@/features/geo/queries/geo';
import { BranchCard } from '@/features/places/components/branch-card';
import { IntentButton } from '@/features/shell/components/intent-button.client';
import { t } from '@/i18n';
import { buttonVariants } from '@/shared/ui/button';
import { ChipLink } from '@/shared/ui/chip';
import { EmptyState } from '@/shared/ui/empty-state';
import { parseQueryIntents } from '../lib/query-intents';
import { searchExamples } from '../lib/examples';
import { getSearchResults } from '../queries/search';
import { searchParamsSchema } from '../schemas/search-params';
import { CommandBar } from './command-bar.client';
import { SearchBoard } from './search-board.client';

type SearchSectionProps = {
  city: { id: string; slug: string; name: string; timezone: string };
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Search results (spec E4-1–E4-3, E4-7): dishes first, then rankings, restaurants, areas, cuisines. */
export async function SearchSection({ city, searchParams }: SearchSectionProps) {
  const [params, areas] = await Promise.all([
    searchParams.then((raw) => searchParamsSchema.parse(raw)),
    getLocalities(city.slug),
  ]);
  const intents = params.q ? parseQueryIntents(params.q, areas) : { text: '', chips: [], area: null };
  const chips = [...new Set([...params.chip, ...intents.chips])];
  const initialFilters = {
    area: params.area ?? intents.area ?? undefined,
    cuisine: params.cuisine,
    diet: params.diet,
    price: params.price,
    km: params.km,
  };
  const results = await getSearchResults(city.id, intents.text || null);
  const path = `/${city.slug}/search`;
  const nothing =
    params.q !== null &&
    [results.dishes, results.rankings, results.branches, results.areas, results.cuisines].every(
      (group) => group.length === 0,
    );

  return (
    <div className="flex flex-col gap-8">
      <CommandBar
        action={path}
        id="search-page"
        label={t('search.label')}
        placeholder={searchExamples[0] ?? t('search.placeholder')}
        suggestCity={city.slug}
        defaultValue={params.q ?? ''}
      />

      {params.q ? (
        <p className="-mt-4 text-sm text-inkMuted" aria-live="polite">
          {t('search.resultsFor', { query: params.q })}
        </p>
      ) : null}

      {nothing ? (
        <NoResults
          city={city}
          query={params.q ?? ''}
          didYouMean={results.didYouMean}
          areas={areas.filter((area) => area.isLaunch)}
        />
      ) : (
        <>
          {results.rankings.length > 0 ? (
            <section aria-labelledby="rankings-title" className="flex flex-col gap-3">
              <h2 id="rankings-title" className="type-title-s">
                {t('search.rankingsTitle', { city: city.name })}
              </h2>
              <ul className="-mx-5 no-scrollbar flex gap-2 overflow-x-auto px-5 py-1 sm:mx-0 sm:flex-wrap sm:px-0">
                {results.rankings.map((ranking) => (
                  <li key={ranking.slug}>
                    <ChipLink href={`/${city.slug}/dish/${ranking.slug}`}>
                      {t('search.bestIn', { dish: ranking.name, city: city.name })}
                    </ChipLink>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <SearchBoard
            path={path}
            query={params.q}
            dishes={results.dishes}
            hours={results.hours}
            timezone={city.timezone}
            areas={areas.map(({ slug, name }) => ({ slug, name }))}
            config={results.config}
            minWeightForDisplay={results.minWeightForDisplay}
            initialChips={chips}
            initialFilters={initialFilters}
          />

          {results.branches.length > 0 ? (
            <section aria-labelledby="branch-results-title" className="flex flex-col gap-3">
              <h2 id="branch-results-title" className="type-title-m">
                {t('search.restaurantsTitle')}
              </h2>
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {results.branches.map((branch) => (
                  <li key={branch.id}>
                    <BranchCard
                      branch={{ ...branch, hours: results.hours[branch.id] ?? [] }}
                      timezone={city.timezone}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {results.areas.length + results.cuisines.length > 0 ? (
            <section aria-labelledby="place-results-title" className="flex flex-col gap-3">
              <h2 id="place-results-title" className="type-title-m">
                {t('search.areasCuisinesTitle')}
              </h2>
              <ul className="flex flex-wrap gap-2">
                {results.areas.map((area) => (
                  <li key={`area-${area.slug}`}>
                    <ChipLink href={`/${city.slug}/area/${area.slug}`}>
                      {t('search.areaLink', { area: area.name })}
                    </ChipLink>
                  </li>
                ))}
                {results.cuisines.map((cuisine) => (
                  <li key={`cuisine-${cuisine.slug}`}>
                    <ChipLink href={`/${city.slug}/cuisine/${cuisine.slug}`}>
                      {t('search.cuisineLink', { cuisine: cuisine.name })}
                    </ChipLink>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}

function NoResults({
  city,
  query,
  didYouMean,
  areas,
}: {
  city: { slug: string; name: string };
  query: string;
  didYouMean: string | null;
  areas: { slug: string; name: string }[];
}) {
  return (
    <EmptyState
      title={t('search.noResults.title', { query })}
      body={t('search.noResults.body')}
      action={
        <div className="flex flex-col gap-4">
          {didYouMean ? (
            <p className="text-sm">
              {t('search.noResults.didYouMean')}{' '}
              <Link
                href={{ pathname: `/${city.slug}/search`, query: { q: didYouMean } }}
                className="underline underline-offset-4 hover:text-terracottaDeep"
              >
                {didYouMean}
              </Link>
            </p>
          ) : null}
          {areas.length > 0 ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-inkMuted">{t('search.noResults.areas', { city: city.name })}</p>
              <ul className="flex flex-wrap gap-2">
                {areas.map((area) => (
                  <li key={area.slug}>
                    <ChipLink href={`/${city.slug}/area/${area.slug}`}>{area.name}</ChipLink>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <IntentButton
            reason={t('search.noResults.askReason', { query })}
            className={buttonVariants({ variant: 'dark', size: 'sm' })}
          >
            {t('search.noResults.ask')}
          </IntentButton>
        </div>
      }
    />
  );
}

import Form from 'next/form';
import Link from 'next/link';
import { connection } from 'next/server';
import { getOpenStatus } from '@/features/places/lib/opening-hours';
import { getHoursForBranches } from '@/features/places/queries/branches';
import { t } from '@/i18n';
import { formatRupees } from '@/shared/lib/money';
import { Button, buttonVariants } from '@/shared/ui/button';
import type { PlacedDish } from '../queries/dishes';
import { cityDishFiltersSchema, priceCaps } from '../schemas/city-dish-filters';
import { PlacedDishRow } from './placed-dish-row';

type CityDishResultsProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  path: string;
  dishes: PlacedDish[];
  areas: { slug: string; name: string }[];
  timezone: string;
  minWeightForDisplay: number;
};

const selectClass = 'h-11 rounded-sm border border-border-strong bg-surface px-3 text-sm text-text';

export async function CityDishResults({
  searchParams,
  path,
  dishes,
  areas,
  timezone,
  minWeightForDisplay,
}: CityDishResultsProps) {
  const filters = cityDishFiltersSchema.parse(await searchParams);
  const hours = await getHoursForBranches([...new Set(dishes.map((dish) => dish.branchId))]);
  let now: Date | null = null;
  if (filters.open) {
    await connection();
    now = new Date();
  }

  const visible = dishes.filter((dish) => {
    if (filters.area && dish.localitySlug !== filters.area) return false;
    if (filters.maxPrice && (dish.pricePaise === null || dish.pricePaise > filters.maxPrice * 100))
      return false;
    if (now && getOpenStatus(hours[dish.branchId] ?? [], now, timezone).state !== 'open') return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      <Form
        action={path}
        className="flex flex-wrap items-end gap-3 rounded-md border border-border bg-surface p-3"
        aria-label={t('dish.filters')}
      >
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t('dish.filterArea')}
          <select name="area" defaultValue={filters.area ?? ''} className={selectClass}>
            <option value="">{t('dish.filterAnyArea')}</option>
            {areas.map((area) => (
              <option key={area.slug} value={area.slug}>
                {area.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t('dish.filterPrice')}
          <select
            name="maxPrice"
            defaultValue={filters.maxPrice ? String(filters.maxPrice) : ''}
            className={selectClass}
          >
            <option value="">{t('dish.filterAnyPrice')}</option>
            {priceCaps.map((cap) => (
              <option key={cap} value={cap}>
                {formatRupees(cap * 100)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex h-11 items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            name="open"
            value="1"
            defaultChecked={Boolean(filters.open)}
            className="size-5 accent-(--primary)"
          />
          {t('dish.filterOpenNow')}
        </label>
        <Button type="submit" size="md">
          {t('dish.applyFilters')}
        </Button>
        {filters.area || filters.maxPrice || filters.open ? (
          <Link href={path} className={buttonVariants({ variant: 'ghost' })}>
            {t('dish.clearFilters')}
          </Link>
        ) : null}
      </Form>

      <p className="text-sm text-muted" aria-live="polite">
        {visible.length === 1 ? t('dish.resultsCountOne') : t('dish.resultsCount', { count: visible.length })}
      </p>

      {visible.length === 0 ? (
        <p className="text-muted">{dishes.length === 0 ? t('dish.cityEmpty') : t('dish.noMatches')}</p>
      ) : (
        <ol className="flex flex-col gap-3">
          {visible.map((dish, index) => (
            <li key={dish.id}>
              <PlacedDishRow
                dish={dish}
                rank={index + 1}
                minWeightForDisplay={minWeightForDisplay}
                hours={hours[dish.branchId] ?? []}
                timezone={timezone}
              />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

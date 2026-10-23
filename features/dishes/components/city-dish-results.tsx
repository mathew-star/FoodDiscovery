import { getHoursForBranches } from '@/features/places/queries/branches';
import type { PlacedDish } from '../queries/dishes';
import { cityDishFiltersSchema } from '../schemas/city-dish-filters';
import { CityDishBoard } from './city-dish-board.client';

type CityDishResultsProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  path: string;
  dishes: PlacedDish[];
  areas: { slug: string; name: string }[];
  timezone: string;
  minWeightForDisplay: number;
};

export async function CityDishResults({
  searchParams,
  path,
  dishes,
  areas,
  timezone,
  minWeightForDisplay,
}: CityDishResultsProps) {
  const [initial, hours] = await Promise.all([
    searchParams.then((params) => cityDishFiltersSchema.parse(params)),
    getHoursForBranches([...new Set(dishes.map((dish) => dish.branchId))]),
  ]);
  return (
    <CityDishBoard
      dishes={dishes}
      hours={hours}
      timezone={timezone}
      areas={areas}
      initial={initial}
      path={path}
      minWeightForDisplay={minWeightForDisplay}
    />
  );
}

import {
  getOpenStatus,
  isOpenAfter,
  localMinuteOfWeek,
  type HoursRow,
} from '@/features/places/lib/opening-hours';
import { distanceMeters, type LatLng } from '@/shared/lib/geo';
import type { ContextChipId } from '../schemas/context-chips';

/** What each chip means. Labels are fixed by the chip copy, so these are definitions, not tunables. */
export const chipRules = {
  underPricePaise: 30_000,
  lateNightClock: '23:00',
  nearRadiusMeters: 3_000,
  biryaniCategory: 'biryani',
} as const;

export type ChipCandidate = {
  diet: 'veg' | 'egg' | 'nonveg';
  pricePaise: number | null;
  categorySlug: string | null;
  branchId: string;
  branchTags: readonly string[];
  branchLocation: LatLng;
};

export type ChipContext = {
  hours: Readonly<Record<string, readonly HoursRow[]>>;
  timezone: string;
  // null before hydration: time-based chips wait for the client clock instead of guessing.
  now: Date | null;
  // null until the guest shares location; "Within 3 km" then filters nothing and asks for it.
  location: LatLng | null;
};

export function matchesChip(item: ChipCandidate, chip: ContextChipId, context: ChipContext): boolean {
  const hours = context.hours[item.branchId] ?? [];
  switch (chip) {
    case 'open-now':
      return context.now === null || getOpenStatus(hours, context.now, context.timezone).state === 'open';
    case 'late-night': {
      if (context.now === null) return true;
      const today = Math.floor(localMinuteOfWeek(context.now, context.timezone) / 1_440);
      return isOpenAfter(hours, today, chipRules.lateNightClock);
    }
    case 'under-300':
      return item.pricePaise !== null && item.pricePaise <= chipRules.underPricePaise;
    case 'veg':
      return item.diet === 'veg';
    case 'biryani':
      return item.categorySlug === chipRules.biryaniCategory;
    case 'within-3km':
      return (
        context.location === null ||
        distanceMeters(context.location, item.branchLocation) <= chipRules.nearRadiusMeters
      );
    case 'rainy-day':
    case 'date-night':
    case 'family':
      return item.branchTags.includes(chip);
  }
}

export function matchesChips(
  item: ChipCandidate,
  chips: Iterable<ContextChipId>,
  context: ChipContext,
): boolean {
  for (const chip of chips) if (!matchesChip(item, chip, context)) return false;
  return true;
}

import { z } from 'zod';
import type { MessageKey } from '@/i18n';

export const contextChipIds = [
  'open-now',
  'under-300',
  'late-night',
  'veg',
  'biryani',
  'rainy-day',
  'date-night',
  'family',
  'within-3km',
] as const;

export const contextChipIdSchema = z.enum(contextChipIds);
export type ContextChipId = z.infer<typeof contextChipIdSchema>;

export const contextChipLabelKey: Record<ContextChipId, MessageKey> = {
  'open-now': 'chips.openNow',
  'under-300': 'chips.under300',
  'late-night': 'chips.lateNight',
  veg: 'chips.veg',
  biryani: 'chips.biryaniLeaderboard',
  'rainy-day': 'chips.rainyDay',
  'date-night': 'chips.dateNight',
  family: 'chips.family',
  'within-3km': 'chips.within3km',
};

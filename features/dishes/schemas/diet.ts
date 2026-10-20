import { z } from 'zod';
import type { MessageKey } from '@/i18n';

export const diets = ['veg', 'egg', 'nonveg'] as const;
export const dietSchema = z.enum(diets);
export type Diet = z.infer<typeof dietSchema>;

export const dietLabelKey: Record<Diet, MessageKey> = {
  veg: 'diet.veg',
  egg: 'diet.egg',
  nonveg: 'diet.nonveg',
};

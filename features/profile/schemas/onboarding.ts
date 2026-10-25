import { z } from 'zod';
import { isReservedUsername, usernamePattern } from '../lib/username';

export const dietPreferenceValues = ['veg', 'jain', 'egg', 'nonveg'] as const;
export const maxCuisines = 5;
const slug = z.string().regex(/^[a-z0-9-]{1,60}$/);

/** Spec E1-3. Messages are i18n keys; the form renders them. */
export const onboardingInputSchema = z.object({
  displayName: z.string().trim().min(1, 'profile.errors.displayName').max(40, 'profile.errors.displayName'),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(usernamePattern, 'profile.errors.usernameFormat')
    .refine((value) => !isReservedUsername(value), 'profile.errors.usernameReserved'),
  adult: z.literal(true, 'profile.errors.adult'),
  diet: z.enum(dietPreferenceValues).nullable(),
  cuisines: z.array(slug).max(maxCuisines, 'profile.errors.cuisines'),
  homeLocality: slug.nullable(),
});

export type OnboardingInput = z.infer<typeof onboardingInputSchema>;

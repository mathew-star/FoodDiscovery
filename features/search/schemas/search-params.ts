import { z } from 'zod';
import { contextChipIdSchema, type ContextChipId } from './context-chips';

export const searchQueryMaxLength = 80;

/** Lowercase, trim and collapse whitespace so equivalent queries share one cache entry. */
export function normalizeSearchQuery(raw: string): string {
  return raw.normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase().slice(0, searchQueryMaxLength);
}

const single = (value: unknown) => (Array.isArray(value) ? value[0] : value);
const list = (value: unknown) =>
  (Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : []).filter(
    (item): item is string => typeof item === 'string' && item.length > 0,
  );

export const searchParamsSchema = z.object({
  q: z.preprocess(single, z.string().max(200).optional().catch(undefined)).transform((value) => {
    const query = value ? normalizeSearchQuery(value) : '';
    return query.length > 0 ? query : null;
  }),
  chip: z.preprocess(list, z.array(z.string())).transform((values) => [
    ...new Set(
      values.flatMap((value): ContextChipId[] => {
        const parsed = contextChipIdSchema.safeParse(value);
        return parsed.success ? [parsed.data] : [];
      }),
    ),
  ]),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;

export const suggestParamsSchema = z.object({
  city: z.string().regex(/^[a-z0-9-]{1,40}$/),
  q: z.string().transform(normalizeSearchQuery).pipe(z.string().min(2)),
});

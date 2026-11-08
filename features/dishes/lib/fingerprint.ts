/**
 * Dish-name fingerprint for duplicate detection at one branch (docs/CONTRIBUTIONS.md §5.1).
 * "Chk Biryani (Single)", "Chicken biriyani" and "Full plate chicken biryani" → `biryani_chicken`.
 */

// Spelling and shorthand people type; the right side is the form we keep.
const tokenSynonyms: Readonly<Record<string, string>> = {
  biriyani: 'biryani',
  briyani: 'biryani',
  biriani: 'biryani',
  biryanee: 'biryani',
  chk: 'chicken',
  chkn: 'chicken',
  chicken65: 'chicken 65',
  ckn: 'chicken',
  mtn: 'mutton',
  mutn: 'mutton',
  halim: 'haleem',
  haleam: 'haleem',
  shawrma: 'shawarma',
  shwarma: 'shawarma',
  parota: 'parotta',
  porotta: 'parotta',
  dosai: 'dosa',
  dosha: 'dosa',
  kabab: 'kebab',
  kebap: 'kebab',
  panner: 'paneer',
  vegetable: 'veg',
};

// Portion sizes and filler: they never make a different dish.
const fillerWords: ReadonlySet<string> = new Set([
  'plate',
  'half',
  'full',
  'single',
  'double',
  'family',
  'pack',
  'jumbo',
  'mini',
  'regular',
  'medium',
  'large',
  'small',
  'pc',
  'pcs',
  'piece',
  'pieces',
  'portion',
  'bowl',
  'cup',
  'glass',
  'person',
  'persons',
  'people',
  'pax',
  'serves',
  'with',
  'and',
  'the',
  'a',
  'an',
  'of',
  'in',
  'style',
]);

/** Lowercase, no accents or punctuation, single spaces, synonyms applied. */
export function cleanDishName(raw: string): string {
  return raw
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => tokenSynonyms[token] ?? token)
    .join(' ');
}

const join = (tokens: Iterable<string>) => [...new Set(tokens)].sort().join('_');

export type DishFingerprint = { normalizedName: string; fingerprint: string };

/**
 * `protectedNames` are cleaned canonical dish names and aliases: when a name equals one, all of
 * its words are kept, so "Double ka meetha" does not lose "double" (D48).
 */
export function fingerprintDish(
  raw: string,
  protectedNames: ReadonlySet<string> = new Set(),
): DishFingerprint {
  const normalizedName = cleanDishName(raw);
  const tokens = normalizedName.split(' ').filter(Boolean);
  if (protectedNames.has(normalizedName)) return { normalizedName, fingerprint: join(tokens) };
  // Small counts ("4 pcs", "2 eggs") are portions; larger numbers name dishes ("Chicken 65").
  const meaningful = tokens.filter(
    (token) => !fillerWords.has(token) && !(/^\d+$/.test(token) && Number(token) <= 12),
  );
  return { normalizedName, fingerprint: join(meaningful.length > 0 ? meaningful : tokens) };
}

/** The protected set from canonical dish names and their aliases. */
export const protectedDishNames = (names: Iterable<string>): ReadonlySet<string> =>
  new Set([...names].map(cleanDishName));

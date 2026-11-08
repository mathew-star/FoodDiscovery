/**
 * Text check for a dish name a member adds (docs/CONTRIBUTIONS.md §5.4). It refuses what cannot be
 * a dish name; everything else is saved and waits for corroboration or Ops.
 */
export const dishNameMaxLength = 80;

export type DishNameProblem = 'too_short' | 'too_long' | 'no_letters' | 'link' | 'contact' | 'shouting';

export function checkDishName(raw: string): DishNameProblem | null {
  const name = raw.trim().replace(/\s+/g, ' ');
  if (name.length < 2) return 'too_short';
  if (name.length > dishNameMaxLength) return 'too_long';
  if (!/\p{L}/u.test(name)) return 'no_letters';
  if (/(https?:\/\/|www\.|\.(com|in|net|org|io)\b)/i.test(name)) return 'link';
  if (/(\d[\s-]?){7,}/.test(name) || /@/.test(name)) return 'contact';
  const letters = name.replace(/[^A-Za-z]/g, '');
  if (letters.length >= 8 && letters === letters.toUpperCase()) return 'shouting';
  return null;
}

/** Title case for display, keeping short connector words lower ("Double ka Meetha"). */
export function displayDishName(raw: string): string {
  const keepLower = new Set(['ka', 'ki', 'ke', 'e', 'and', 'with', 'of', 'in']);
  return raw
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word, index) =>
      index > 0 && keepLower.has(word.toLowerCase())
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join(' ');
}

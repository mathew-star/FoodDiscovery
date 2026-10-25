import type { ContextChipId } from '../schemas/context-chips';

/*
  Phrases people type that mean a chip ("biryani under ₹300", "irani chai open now"). Matching is on
  the normalised query; the phrase is removed so trigram matching sees only the food words.
*/
const chipPhrases: readonly [RegExp, ContextChipId][] = [
  [/\bopen now\b/, 'open-now'],
  [/\b(?:under|below|less than) (?:₹|rs\.? ?|inr ?)?300\b/, 'under-300'],
  [/\b(?:after (?:11|eleven)(?: ?pm)?|after midnight|late night|midnight)\b/, 'late-night'],
  [/\b(?:pure veg|veg only)\b/, 'veg'],
  [/\brainy day\b/, 'rainy-day'],
  [/\bdate night\b/, 'date-night'],
  [/\bfamily sunday\b/, 'family'],
  [/\b(?:near me|nearby)\b/, 'within-3km'],
];

export type QueryIntents = { text: string; chips: ContextChipId[]; area: string | null };

export function parseQueryIntents(
  query: string,
  areas: readonly { slug: string; name: string }[],
): QueryIntents {
  let text = ` ${query} `;
  const chips: ContextChipId[] = [];
  for (const [pattern, chip] of chipPhrases) {
    if (pattern.test(text)) {
      chips.push(chip);
      text = text.replace(pattern, ' ');
    }
  }

  let area: string | null = null;
  // Longest names first so "Banjara Hills" wins over a shorter overlapping name.
  for (const candidate of [...areas].sort((a, b) => b.name.length - a.name.length)) {
    const name = candidate.name.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const phrase = new RegExp(`\\b(?:near|in|at|around) ${name}\\b`);
    if (phrase.test(text)) {
      area = candidate.slug;
      text = text.replace(phrase, ' ');
      break;
    }
  }

  return { text: text.replace(/\s+/g, ' ').trim(), chips, area };
}

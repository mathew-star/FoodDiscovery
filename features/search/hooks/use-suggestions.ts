import { useEffect, useState } from 'react';
import type { Suggestion } from '../schemas/suggestion';

const debounceMs = 150;
const minChars = 2;
const memo = new Map<string, Suggestion[]>();

/** Typeahead results for the current text (spec E4-1: after 2 characters), debounced and abortable. */
export function useSuggestions(city: string | undefined, text: string): Suggestion[] {
  const query = text.trim().toLowerCase();
  const key = city && query.length >= minChars ? `${city}:${query}` : null;
  const [state, setState] = useState<{ key: string | null; items: Suggestion[] }>({ key: null, items: [] });

  useEffect(() => {
    if (!key || !city || memo.has(key)) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ city, q: query });
        const response = await fetch(`/api/search/suggest?${params}`, { signal: controller.signal });
        if (!response.ok) return;
        const body = (await response.json()) as { suggestions?: Suggestion[] };
        const items = Array.isArray(body.suggestions) ? body.suggestions : [];
        memo.set(key, items);
        setState({ key, items });
      } catch {
        // Aborted or offline: the form still submits to the full search page.
      }
    }, debounceMs);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [city, key, query]);

  if (!key) return [];
  return memo.get(key) ?? (state.key === key ? state.items : []);
}

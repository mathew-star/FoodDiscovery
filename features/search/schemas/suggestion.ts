export type SuggestionKind = 'ranking' | 'dish' | 'branch' | 'area' | 'cuisine';

export type Suggestion = {
  kind: SuggestionKind;
  label: string;
  detail: string | null;
  href: string;
};

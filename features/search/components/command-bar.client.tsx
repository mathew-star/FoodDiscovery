'use client';

import Form from 'next/form';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { t } from '@/i18n';
import { useToast } from '@/shared/ui/toast.client';
import { useSuggestions } from '../hooks/use-suggestions';
import type { SuggestionKind } from '../schemas/suggestion';

type CommandBarProps = {
  /** Search route, e.g. `/hyderabad/search`. */
  action: string;
  id: string;
  label: string;
  placeholder: string;
  /** Example queries typed into the placeholder until the field is used. */
  examples?: readonly string[];
  /** City slug for typeahead suggestions; omit for a plain search form. */
  suggestCity?: string;
  defaultValue?: string;
  /** Controlled value, for callers that fill the query (hero chips). */
  value?: string;
  onValueChange?: (value: string) => void;
  showIcon?: boolean;
  className?: string;
  /** Extra form fields under the bar, e.g. chip toggles that submit with the query. */
  children?: ReactNode;
};

const noExamples: readonly string[] = [];
const typeMs = 70;
const holdTicks = 14;
const announceMs = 600;

const kindLabel: Record<SuggestionKind, string> = {
  ranking: t('search.kind.ranking'),
  dish: t('search.kind.dish'),
  branch: t('search.kind.branch'),
  area: t('search.kind.area'),
  cuisine: t('search.kind.cuisine'),
};

/** Types example queries into the placeholder; stops while focused or filled, off under reduced motion. */
function useTypedPlaceholder(input: RefObject<HTMLInputElement | null>, examples: readonly string[]) {
  useEffect(() => {
    const node = input.current;
    if (!node || examples.length === 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const initial = node.placeholder;
    let example = 0;
    let chars = 0;
    let deleting = false;
    const id = window.setInterval(() => {
      if (document.activeElement === node || node.value) return;
      const text = examples[example] ?? '';
      chars += deleting ? -1 : 1;
      node.placeholder = text.slice(0, Math.max(0, chars)) + (deleting ? '' : '▍');
      if (!deleting && chars >= text.length + holdTicks) deleting = true;
      if (deleting && chars <= 0) {
        deleting = false;
        example = (example + 1) % examples.length;
      }
    }, typeMs);
    return () => {
      window.clearInterval(id);
      node.placeholder = initial;
    };
  }, [input, examples]);
}

/** Debounced so a screen reader hears the settled count, not every keystroke. */
function useAnnouncement(count: number, active: boolean): string {
  const [message, setMessage] = useState('');
  useEffect(() => {
    const id = window.setTimeout(() => {
      if (!active) setMessage('');
      else setMessage(count === 1 ? t('search.suggestionsOne') : t('search.suggestionsCount', { count }));
    }, announceMs);
    return () => window.clearTimeout(id);
  }, [count, active]);
  return message;
}

/**
 * Command bar (DESIGN-SYSTEM §7.10) with an ARIA 1.2 combobox: suggestions after two characters,
 * arrow keys move through them, Enter opens the highlighted one or submits the full search.
 */
export function CommandBar({
  action,
  id,
  label,
  placeholder,
  examples = noExamples,
  suggestCity,
  defaultValue,
  value,
  onValueChange,
  showIcon = true,
  className,
  children,
}: CommandBarProps) {
  const input = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const router = useRouter();
  const listId = `${useId()}-suggestions`;
  const [ownText, setOwnText] = useState(defaultValue ?? '');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  useTypedPlaceholder(input, examples);

  const text = value ?? ownText;
  const suggestions = useSuggestions(suggestCity, text);
  const expanded = open && suggestions.length > 0;
  const announcement = useAnnouncement(suggestions.length, expanded);
  const active = expanded && activeIndex < suggestions.length ? activeIndex : -1;

  function setText(next: string) {
    if (value === undefined) setOwnText(next);
    onValueChange?.(next);
    setOpen(true);
    setActiveIndex(-1);
  }

  function choose(href: string) {
    setOpen(false);
    router.push(href);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (suggestions.length === 0) return;
      event.preventDefault();
      setOpen(true);
      // -1 is the input itself, so the highlight wraps through it like a native list.
      const last = suggestions.length - 1;
      setActiveIndex((current) =>
        event.key === 'ArrowDown' ? (current >= last ? -1 : current + 1) : current <= -1 ? last : current - 1,
      );
      return;
    }
    if (event.key === 'Enter' && active >= 0) {
      const suggestion = suggestions[active];
      if (!suggestion) return;
      event.preventDefault();
      choose(suggestion.href);
      return;
    }
    if (event.key === 'Escape' && expanded) {
      event.preventDefault();
      setOpen(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    setOpen(false);
    if (input.current?.value.trim()) return;
    if (new FormData(event.currentTarget).getAll('chip').length > 0) return;
    event.preventDefault();
    toast({ message: t('search.emptyHint') });
    input.current?.focus();
  }

  return (
    <Form action={action} prefetch={false} role="search" onSubmit={onSubmit} className={className}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="relative">
        <div className="flex items-center rounded-2xl border-2 border-ink bg-paper p-2 shadow-brutal-lg transition-shadow focus-within:ring-4 focus-within:ring-lime">
          {showIcon ? <Search aria-hidden="true" className="ml-2 size-6 shrink-0" strokeWidth={2.5} /> : null}
          <input
            ref={input}
            id={id}
            name="q"
            type="search"
            role={suggestCity ? 'combobox' : undefined}
            aria-autocomplete={suggestCity ? 'list' : undefined}
            aria-expanded={suggestCity ? expanded : undefined}
            aria-controls={suggestCity ? listId : undefined}
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            enterKeyHint="search"
            autoComplete="off"
            maxLength={80}
            placeholder={placeholder}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={suggestCity ? onKeyDown : undefined}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            className="w-full min-w-0 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-inkMuted sm:text-base [&::-webkit-search-cancel-button]:appearance-none"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-ink px-4 py-3.5 text-xs text-cream transition-colors duration-(--dur-instant) hover:bg-terracottaDeep sm:px-5"
          >
            {t('search.submit')}
          </button>
        </div>
        {suggestCity ? (
          <>
            <ul
              id={listId}
              role="listbox"
              aria-label={t('search.suggestionsLabel')}
              hidden={!expanded}
              className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border-2 border-ink bg-paper shadow-brutal"
            >
              {suggestions.map((suggestion, index) => (
                <li
                  key={suggestion.href}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === active}
                  // Keeps focus in the input so the blur handler does not close the list first.
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(suggestion.href)}
                  className="flex cursor-pointer items-center justify-between gap-3 border-b-2 border-dashed border-ink/15 px-4 py-3 last:border-b-0 hover:bg-cream aria-selected:bg-lime"
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-sm">{suggestion.label}</span>
                    {suggestion.detail ? (
                      <span className="truncate text-[11px] text-inkMuted">{suggestion.detail}</span>
                    ) : null}
                  </span>
                  <span className="shrink-0 rounded border border-ink bg-cream px-1.5 py-0.5 text-[11px]">
                    {kindLabel[suggestion.kind]}
                  </span>
                </li>
              ))}
            </ul>
            <p role="status" aria-live="polite" className="sr-only">
              {announcement}
            </p>
          </>
        ) : null}
      </div>
      {children}
    </Form>
  );
}

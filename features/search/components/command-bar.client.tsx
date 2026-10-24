'use client';

import Form from 'next/form';
import { Search } from 'lucide-react';
import { useEffect, useRef, type FormEvent, type RefObject } from 'react';
import { t } from '@/i18n';
import { useToast } from '@/shared/ui/toast.client';

type CommandBarProps = {
  /** Search route, e.g. `/hyderabad/search`. */
  action: string;
  id: string;
  label: string;
  placeholder: string;
  /** Example queries typed into the placeholder until the field is used. */
  examples?: readonly string[];
  /** Controlled value, for callers that fill the query (hero chips). */
  value?: string;
  onValueChange?: (value: string) => void;
  showIcon?: boolean;
  className?: string;
};

const noExamples: readonly string[] = [];
const typeMs = 70;
const holdTicks = 14;

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

/** Command bar (DESIGN-SYSTEM §7.10): submits to the city search route. */
export function CommandBar({
  action,
  id,
  label,
  placeholder,
  examples = noExamples,
  value,
  onValueChange,
  showIcon = true,
  className,
}: CommandBarProps) {
  const input = useRef<HTMLInputElement>(null);
  const toast = useToast();
  useTypedPlaceholder(input, examples);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    if (input.current?.value.trim()) return;
    event.preventDefault();
    toast({ message: t('search.emptyHint') });
    input.current?.focus();
  }

  return (
    <Form action={action} prefetch={false} role="search" onSubmit={onSubmit} className={className}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="flex items-center rounded-2xl border-2 border-ink bg-paper p-2 shadow-brutal-lg transition-shadow focus-within:ring-4 focus-within:ring-lime">
        {showIcon ? <Search aria-hidden="true" className="ml-2 size-6 shrink-0" strokeWidth={2.5} /> : null}
        <input
          ref={input}
          id={id}
          name="q"
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          placeholder={placeholder}
          value={value}
          onChange={onValueChange ? (event) => onValueChange(event.target.value) : undefined}
          className="w-full min-w-0 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-inkMuted sm:text-base"
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-ink px-4 py-3.5 text-xs text-cream transition-colors duration-(--dur-instant) hover:bg-terracottaDeep sm:px-5"
        >
          {t('search.submit')}
        </button>
      </div>
    </Form>
  );
}

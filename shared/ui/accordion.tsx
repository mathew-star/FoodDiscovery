import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

type AccordionItemProps = Omit<ComponentProps<'details'>, 'children'> & {
  summary: ReactNode;
  /** Rendered before the summary text, e.g. a vote count column. */
  leading?: ReactNode;
  children: ReactNode;
};

/**
 * DESIGN-SYSTEM §7.13. Native `<details>`; give items the same `name` to make them exclusive.
 */
export function AccordionItem({ summary, leading, children, className, ...props }: AccordionItemProps) {
  return (
    <details
      className={cn(
        'group rounded-panel border-2 border-ink bg-paper transition-shadow duration-(--dur-instant) open:shadow-brutal',
        className,
      )}
      {...props}
    >
      <summary className="flex items-center gap-4 p-4 sm:p-5">
        {leading}
        <span className="grow type-title-s sm:text-xl">{summary}</span>
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-ink text-lg transition-transform duration-(--dur-instant) group-open:rotate-45"
        >
          +
        </span>
      </summary>
      {children}
    </details>
  );
}

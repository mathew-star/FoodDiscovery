import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

type TickerProps = { label: string; items: ReactNode[]; className?: string };

/**
 * DESIGN-SYSTEM §7.14. Full-bleed ink strip that loops in CSS, pauses on hover and stays still
 * under reduced motion. At most one per page.
 */
export function Ticker({ label, items, className }: TickerProps) {
  const row = (copy: number) => (
    <ul aria-hidden={copy > 0 || undefined} className="flex shrink-0 gap-10 pr-10">
      {items.map((item, index) => (
        <li key={`${copy}-${index}`}>{item}</li>
      ))}
    </ul>
  );

  return (
    <section
      aria-label={label}
      className={cn('group overflow-hidden border-y-2 border-ink bg-ink text-cream', className)}
    >
      <div className="flex w-max animate-ticker py-2.5 text-xs whitespace-nowrap group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {row(0)}
        {row(1)}
      </div>
    </section>
  );
}

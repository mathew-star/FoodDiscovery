import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/cn';

/** Centre pill navigation of the desktop header (DESIGN-SYSTEM §7.12). */
export function NavPills({ className, ...props }: ComponentProps<'nav'>) {
  return (
    <nav
      className={cn(
        'items-center gap-1 rounded-full border-[1.5px] border-ink bg-paper p-1.5 shadow-brutal-sm',
        className,
      )}
      {...props}
    />
  );
}

export function navPillClass(active = false): string {
  return cn(
    'rounded-full border px-4 py-1.5 text-xs transition-colors duration-(--dur-instant)',
    active ? 'border-ink bg-olive text-ink' : 'border-transparent hover:bg-cream',
  );
}

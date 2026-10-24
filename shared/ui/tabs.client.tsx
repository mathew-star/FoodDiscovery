'use client';

import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/cn';

/*
  Tab primitives on Base UI (roles, aria-controls, roving focus, arrow keys).
  Two looks from DESIGN-SYSTEM: §7.3 segmented pills and §7.4 stacked mode cards.
*/

export const TabsRoot = BaseTabs.Root;

export function TabsPanel({ className, ...props }: ComponentProps<typeof BaseTabs.Panel>) {
  return <BaseTabs.Panel className={cn('animate-panel-in', className)} {...props} />;
}

/** Arrow keys move the selection, not just focus (DESIGN-SYSTEM §7.3, §7.4). */
export function SegmentedTabsList({ className, ...props }: ComponentProps<typeof BaseTabs.List>) {
  return (
    <BaseTabs.List
      activateOnFocus
      className={cn(
        'no-scrollbar inline-flex max-w-full gap-1 overflow-x-auto rounded-full border-[1.5px] border-ink bg-paper p-1.5 shadow-brutal-sm',
        className,
      )}
      {...props}
    />
  );
}

export function SegmentedTab({ className, ...props }: ComponentProps<typeof BaseTabs.Tab>) {
  return (
    <BaseTabs.Tab
      className={cn(
        'min-h-9 rounded-full border border-transparent px-4 py-2 text-xs whitespace-nowrap transition-colors duration-(--dur-instant) hover:bg-cream aria-selected:border-ink aria-selected:bg-olive aria-selected:text-ink',
        className,
      )}
      {...props}
    />
  );
}

export function ModeTabsList({ className, ...props }: ComponentProps<typeof BaseTabs.List>) {
  return (
    <BaseTabs.List
      activateOnFocus
      className={cn(
        '-mx-5 no-scrollbar flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-col lg:px-0',
        className,
      )}
      {...props}
    />
  );
}

export function ModeTab({
  title,
  description,
  className,
  ...props
}: Omit<ComponentProps<typeof BaseTabs.Tab>, 'children'> & { title: string; description: string }) {
  return (
    <BaseTabs.Tab
      className={cn(
        'group flex min-w-[220px] flex-col gap-0.5 rounded-2xl border-2 border-ink bg-paper px-4 py-3.5 text-left transition-[background-color,box-shadow,translate] duration-(--dur-instant) hover:bg-creamDark aria-selected:-translate-x-0.5 aria-selected:-translate-y-0.5 aria-selected:bg-ink aria-selected:text-cream aria-selected:shadow-brutal-terracotta',
        className,
      )}
      {...props}
    >
      <span className="type-title-s">{title}</span>
      <span className="text-[13px] text-inkMuted group-aria-selected:text-cream/70">{description}</span>
    </BaseTabs.Tab>
  );
}

'use client';

import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

type TabItem<T extends string> = { value: T; label: string; content: ReactNode };

type TabsProps<T extends string> = {
  items: readonly TabItem<T>[];
  defaultValue: T;
  label: string;
  className?: string;
};

export function Tabs<T extends string>({ items, defaultValue, label, className }: TabsProps<T>) {
  return (
    <BaseTabs.Root defaultValue={defaultValue} className={cn('flex flex-col gap-4', className)}>
      <BaseTabs.List aria-label={label} className="relative flex gap-1 border-b border-border">
        {items.map((item) => (
          <BaseTabs.Tab
            key={item.value}
            value={item.value}
            className="h-11 px-3 text-sm font-medium text-muted transition-colors duration-(--dur-fast) hover:text-text data-active:text-text"
          >
            {item.label}
          </BaseTabs.Tab>
        ))}
        <BaseTabs.Indicator className="absolute bottom-0 left-(--active-tab-left) h-0.5 w-(--active-tab-width) bg-primary transition-[left,width] duration-(--dur-base) ease-standard" />
      </BaseTabs.List>
      {items.map((item) => (
        <BaseTabs.Panel key={item.value} value={item.value}>
          {item.content}
        </BaseTabs.Panel>
      ))}
    </BaseTabs.Root>
  );
}

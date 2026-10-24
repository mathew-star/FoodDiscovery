'use client';

import { Toggle } from '@base-ui/react/toggle';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

type Option<T extends string> = { value: T; label: string; icon?: ReactNode };

type SegmentedControlProps<T extends string> = {
  label: string;
  options: readonly Option<T>[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
};

export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onValueChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <ToggleGroup
      aria-label={label}
      value={[value]}
      onValueChange={(next) => {
        const selected = options.find((option) => option.value === next[0]);
        if (selected) onValueChange(selected.value);
      }}
      className={cn('inline-flex gap-1 rounded-full border-[1.5px] border-ink bg-paper p-1', className)}
    >
      {options.map((option) => (
        <Toggle
          key={option.value}
          value={option.value}
          className="inline-flex min-h-9 min-w-11 items-center justify-center gap-1.5 rounded-full border border-transparent px-3 text-xs text-inkMuted transition-colors duration-(--dur-instant) hover:text-ink data-pressed:border-ink data-pressed:bg-lime data-pressed:text-ink [&_svg]:size-4"
        >
          {option.icon}
          {option.label}
        </Toggle>
      ))}
    </ToggleGroup>
  );
}

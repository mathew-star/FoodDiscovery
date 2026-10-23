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
      className={cn('inline-flex rounded-tick border border-rule-strong bg-raised p-0.5', className)}
    >
      {options.map((option) => (
        <Toggle
          key={option.value}
          value={option.value}
          className="inline-flex h-10 min-w-11 items-center justify-center gap-1.5 rounded-tick px-3 text-sm font-medium text-ink-soft transition-colors duration-(--dur-micro) hover:text-ink data-pressed:bg-haldi data-pressed:text-ink [&_svg]:size-4"
        >
          {option.icon}
          {option.label}
        </Toggle>
      ))}
    </ToggleGroup>
  );
}

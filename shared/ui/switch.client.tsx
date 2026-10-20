'use client';

import { Switch as BaseSwitch } from '@base-ui/react/switch';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

type SwitchProps = Omit<ComponentProps<typeof BaseSwitch.Root>, 'children'> & { label: ReactNode };

export function Switch({ label, className, ...props }: SwitchProps) {
  return (
    <label
      className={cn('inline-flex min-h-11 cursor-pointer items-center justify-between gap-3', className)}
    >
      <span>{label}</span>
      <BaseSwitch.Root
        className="relative inline-flex h-6 w-10 shrink-0 rounded-full border border-rule-strong bg-sunk transition-colors duration-(--dur-micro) data-checked:border-ink data-checked:bg-ink"
        {...props}
      >
        <BaseSwitch.Thumb className="bg-text data-checked:bg-on-primary m-0.5 size-4.5 rounded-full shadow-lift-sm transition-transform duration-(--dur-micro) ease-snap data-checked:translate-x-4" />
      </BaseSwitch.Root>
    </label>
  );
}

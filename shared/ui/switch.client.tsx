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
        className="relative inline-flex h-6 w-10 shrink-0 rounded-full border border-border-strong bg-surface-2 transition-colors duration-(--dur-fast) data-checked:border-primary data-checked:bg-primary"
        {...props}
      >
        <BaseSwitch.Thumb className="m-0.5 size-4.5 rounded-full bg-text shadow-1 transition-transform duration-(--dur-fast) ease-standard data-checked:translate-x-4 data-checked:bg-on-primary" />
      </BaseSwitch.Root>
    </label>
  );
}

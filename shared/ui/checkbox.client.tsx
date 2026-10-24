'use client';

import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { Check } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

type CheckboxProps = Omit<ComponentProps<typeof BaseCheckbox.Root>, 'children'> & { label: ReactNode };

export function Checkbox({ label, className, ...props }: CheckboxProps) {
  return (
    <label className={cn('inline-flex min-h-11 cursor-pointer items-center gap-3', className)}>
      <BaseCheckbox.Root
        className="flex size-5 shrink-0 items-center justify-center rounded border-[1.5px] border-ink bg-paper text-cream transition-colors duration-(--dur-instant) data-checked:bg-ink"
        {...props}
      >
        <BaseCheckbox.Indicator>
          <Check aria-hidden="true" className="size-4" strokeWidth={3} />
        </BaseCheckbox.Indicator>
      </BaseCheckbox.Root>
      <span>{label}</span>
    </label>
  );
}

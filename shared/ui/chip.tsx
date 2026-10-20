import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/cn';

export const chipVariants = cva(
  'relative inline-flex h-10 shrink-0 press items-center gap-1.5 rounded-tick border-2 border-ink px-3 text-sm font-semibold whitespace-nowrap shadow-lift-sm before:absolute before:inset-x-0 before:-inset-y-1 before:content-[""] [&_svg]:size-4',
  {
    variants: {
      selected: {
        true: 'bg-haldi text-on-haldi',
        false: 'bg-raised text-ink hover:bg-sunk',
      },
    },
    defaultVariants: { selected: false },
  },
);

type ChipVariantProps = VariantProps<typeof chipVariants>;

export function ChipButton({
  selected = false,
  className,
  type = 'button',
  ...props
}: ComponentProps<'button'> & ChipVariantProps) {
  return (
    <button
      type={type}
      aria-pressed={selected ?? false}
      className={cn(chipVariants({ selected }), className)}
      {...props}
    />
  );
}

export function ChipLink({
  selected = false,
  className,
  ...props
}: ComponentProps<typeof Link> & ChipVariantProps) {
  return (
    <Link
      aria-current={selected ? 'true' : undefined}
      className={cn(chipVariants({ selected }), className)}
      {...props}
    />
  );
}

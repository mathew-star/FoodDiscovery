import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/cn';

export const chipVariants = cva(
  'relative inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium whitespace-nowrap transition-[background-color,border-color,color] duration-(--dur-fast) ease-standard before:absolute before:inset-x-0 before:-inset-y-1 before:content-[""] [&_svg]:size-4',
  {
    variants: {
      selected: {
        true: 'border-primary bg-primary-soft text-text',
        false: 'border-border-strong bg-surface text-text hover:bg-surface-2',
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

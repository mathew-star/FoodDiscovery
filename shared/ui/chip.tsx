import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/cn';

/** DESIGN-SYSTEM §7.2. Context filters; active chips are lime and lift by 1px. */
export const chipVariants = cva(
  'inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-full border-[1.5px] border-ink px-3 py-1.5 text-xs whitespace-nowrap text-ink transition-[background-color,box-shadow,translate] duration-(--dur-instant) [&_svg]:size-3.5',
  {
    variants: {
      selected: {
        true: '-translate-x-px -translate-y-px bg-lime shadow-brutal-sm',
        false: 'bg-paper hover:bg-cream',
      },
    },
    defaultVariants: { selected: false },
  },
);

type ChipVariantProps = VariantProps<typeof chipVariants>;

/** A toggle: `selected` is exposed as `aria-pressed`. */
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

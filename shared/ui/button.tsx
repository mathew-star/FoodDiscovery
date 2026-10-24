import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/cn';

/**
 * DESIGN-SYSTEM §7.1. One `primary` per view; labels say what happens.
 * Each variant owns its text colour: cva concatenates without merging, so the base must not set one.
 */
export const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 text-xs whitespace-nowrap select-none disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'press border-2 border-ink bg-terracottaDeep text-paper shadow-brutal',
        secondary: 'press border-2 border-ink bg-oliveBtn text-ink shadow-brutal',
        dark: 'rounded-full border-2 border-ink bg-ink text-cream transition-colors duration-(--dur-instant) hover:bg-terracottaDeep hover:text-paper',
        outline:
          'rounded-full border-[1.5px] border-ink bg-paper text-ink transition-colors duration-(--dur-instant) hover:bg-cream',
        link: 'underline underline-offset-4 transition-colors duration-(--dur-instant) hover:text-terracottaDeep',
      },
      size: {
        sm: 'min-h-9 px-3.5 py-2',
        md: 'min-h-11 px-5 py-3',
        icon: 'size-11 p-0',
      },
    },
    compoundVariants: [{ variant: 'link', className: 'min-h-0 px-0 py-0' }],
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export type ButtonProps = ComponentProps<'button'> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

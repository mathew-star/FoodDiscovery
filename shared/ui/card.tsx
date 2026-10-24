import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/cn';

/**
 * DESIGN-SYSTEM §6: bigger card → bigger radius → bigger shadow.
 * `onDark` is the paper card used inside the single ink section of a page.
 */
export const cardVariants = cva('border-2', {
  variants: {
    size: {
      lg: 'rounded-card shadow-brutal-lg',
      md: 'rounded-panel shadow-brutal',
      flat: 'rounded-panel',
    },
    tone: {
      paper: 'border-ink bg-paper text-ink',
      cream: 'border-ink bg-cream text-ink',
      lime: 'border-ink bg-lime text-ink',
      ink: 'border-ink bg-ink text-cream',
      onDark: 'rounded-[24px] border-cream bg-paper text-ink shadow-brutal-lime',
    },
  },
  defaultVariants: { size: 'md', tone: 'paper' },
});

export type CardVariantProps = VariantProps<typeof cardVariants>;

export function Card({ size, tone, className, ...props }: ComponentProps<'div'> & CardVariantProps) {
  return <div className={cn(cardVariants({ size, tone }), className)} {...props} />;
}

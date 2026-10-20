import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/cn';

export const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-xs px-1.5 py-0.5 text-xs font-semibold [&_svg]:size-3.5',
  {
    variants: {
      tone: {
        neutral: 'bg-surface-2 text-text',
        primary: 'bg-primary-soft text-text',
        accent: 'bg-accent-soft text-text',
        danger: 'bg-danger-soft text-text',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export function Badge({
  tone,
  className,
  ...props
}: ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

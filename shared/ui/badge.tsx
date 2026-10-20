import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/cn';

export const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-tick border px-1.5 py-px font-mono text-2xs font-medium tracking-wide uppercase [&_svg]:size-3.5',
  {
    variants: {
      tone: {
        neutral: 'border-rule-strong text-ink',
        haldi: 'border-ink bg-haldi text-on-haldi',
        live: 'border-live text-live',
        danger: 'border-danger text-danger',
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

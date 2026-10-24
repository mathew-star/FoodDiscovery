import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/cn';

/** DESIGN-SYSTEM §7.7. Never more than four badges in one card. */
export const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] leading-tight font-bold whitespace-nowrap [&_svg]:size-3',
  {
    variants: {
      tone: {
        /** Open till HH:MM, Founding member. */
        lime: 'border-ink bg-lime text-ink',
        /** Closed / opens HH:MM. */
        paper: 'border-ink bg-paper font-normal text-inkMuted',
        /** Rank (#1 in …). */
        ink: 'border-ink bg-ink text-cream',
        /** ✓ Accepted, ✓ Answered by FDN. */
        olive: 'border-ink bg-olive text-ink',
        /** Hosted, Paid partnership, I work here. Always visible. */
        disclosure: 'border-terracotta bg-terracotta/10 text-ink',
        /** Neutral facts such as Jain option or Pure veg. */
        neutral: 'border-ink bg-cream text-ink',
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

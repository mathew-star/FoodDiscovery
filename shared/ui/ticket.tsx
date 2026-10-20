import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/cn';

export const ticketVariants = cva('relative bg-raised text-ink', {
  variants: {
    edge: {
      plain: 'rounded-tick border-2 border-ink shadow-lift',
      notched: 'border-y-2 border-ink notch-x',
      perforated: 'border-x-2 border-t-2 border-ink pb-3 perforate-b',
      receipt: 'pb-4 perforate-b',
    },
    interactive: { true: 'press hover:-translate-y-px', false: '' },
  },
  defaultVariants: { edge: 'plain', interactive: false },
});

export function Ticket({
  edge,
  interactive,
  className,
  ...props
}: ComponentProps<'div'> & VariantProps<typeof ticketVariants>) {
  return <div className={cn(ticketVariants({ edge, interactive }), className)} {...props} />;
}

export function TicketRule({ className }: { className?: string }) {
  return (
    <hr
      aria-hidden="true"
      className={cn('border-0 border-t-2 border-dashed border-rule-strong', className)}
    />
  );
}

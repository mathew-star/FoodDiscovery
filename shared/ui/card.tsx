import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/cn';

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('rounded-md border border-border bg-surface shadow-1', className)} {...props} />;
}

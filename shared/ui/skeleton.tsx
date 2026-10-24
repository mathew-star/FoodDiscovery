import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/cn';

export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-panel bg-creamDark [animation-duration:1.6s]', className)}
      {...props}
    />
  );
}

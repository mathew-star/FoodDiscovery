import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/cn';

export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-sm bg-surface-2 [animation-duration:1.5s]', className)}
      {...props}
    />
  );
}

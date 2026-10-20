import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div style={{ '--reveal-delay': `${delay * 40}%` } as CSSProperties} className={cn('reveal', className)}>
      {children}
    </div>
  );
}

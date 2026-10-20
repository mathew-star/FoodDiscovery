import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

type StampProps = {
  children: ReactNode;
  tilt?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  index?: number;
  className?: string;
};

const sizes = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
  xl: 'text-5xl md:text-6xl',
} as const;

export function Stamp({
  children,
  tilt = -4,
  size = 'sm',
  animate = false,
  index = 0,
  className,
}: StampProps) {
  const style = { '--tilt': `${tilt}deg`, '--i': index } as CSSProperties;
  return (
    <span style={style} className={cn('stamp', sizes[size], animate && 'stamp-in', className)}>
      {children}
    </span>
  );
}

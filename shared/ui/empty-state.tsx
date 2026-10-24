import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

type EmptyStateProps = {
  title: string;
  /** Directs the next action; no apologies (DESIGN-SYSTEM §9.5). */
  body?: string;
  action?: ReactNode;
  /** `page` for full-page states (404, error, offline); `inline` inside a section. */
  size?: 'page' | 'inline';
  className?: string;
};

export function EmptyState({ title, body, action, size = 'inline', className }: EmptyStateProps) {
  const Heading = size === 'page' ? 'h1' : 'h2';
  return (
    <div
      className={cn(
        'flex flex-col items-start gap-4 rounded-panel border-2 border-dashed border-ink/40 bg-paper',
        size === 'page' ? 'px-6 py-10 sm:px-10 sm:py-14' : 'px-5 py-6',
        className,
      )}
    >
      <Heading className={size === 'page' ? 'type-display-l' : 'type-title-m'}>{title}</Heading>
      {body ? <p className="max-w-prose text-inkMuted">{body}</p> : null}
      {action}
    </div>
  );
}

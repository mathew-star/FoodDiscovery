import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

type EmptyStateProps = {
  title: string;
  body?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, body, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-md border border-dashed border-border-strong px-6 py-10 text-center',
        className,
      )}
    >
      {icon ? (
        <span className="text-muted [&_svg]:size-8" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <h2 className="font-sans text-lg font-semibold">{title}</h2>
      {body ? <p className="max-w-prose text-muted">{body}</p> : null}
      {action}
    </div>
  );
}

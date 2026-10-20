import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { Stamp } from './stamp';

type EmptyStateProps = {
  title: string;
  body?: string;
  stamp?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, body, stamp, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-start gap-4 border-2 border-dashed border-rule-strong bg-raised/60 px-6 py-8',
        className,
      )}
    >
      {stamp ? (
        <Stamp size="lg" tilt={-6} animate className="text-danger">
          {stamp}
        </Stamp>
      ) : icon ? (
        <span className="text-ink-soft [&_svg]:size-8" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <h2 className="text-3xl font-bold">{title}</h2>
      {body ? <p className="max-w-prose text-ink-soft">{body}</p> : null}
      {action}
    </div>
  );
}

import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { cardVariants } from '@/shared/ui/card';

/** Auth pages: one paper card, title first, one primary action (DESIGN-SYSTEM §7.6 card rules). */
export function AuthCard({
  title,
  intro,
  children,
  footer,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5">
      <section
        aria-labelledby="auth-title"
        className={cn(cardVariants({ size: 'lg' }), 'flex flex-col gap-5 p-6 sm:p-8')}
      >
        <div className="flex flex-col gap-2">
          <h1 id="auth-title" className="type-title-l">
            {title}
          </h1>
          {intro ? <p className="text-sm text-inkMuted">{intro}</p> : null}
        </div>
        {children}
      </section>
      {footer ? <div className="flex flex-col items-center gap-2 text-sm">{footer}</div> : null}
    </div>
  );
}

export function FormField({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm">
        {label}
      </label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-inkMuted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-terracottaDeep">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Form-level message: errors are announced assertively, confirmations politely. */
export function FormMessage({ tone, children }: { tone: 'error' | 'success'; children: ReactNode }) {
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'rounded-row border-2 px-3 py-2 text-sm',
        tone === 'error' ? 'border-terracottaDeep bg-terracotta/10' : 'border-ink bg-lime',
      )}
    >
      {children}
    </p>
  );
}

'use client';

import Link from 'next/link';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

export type ToastAction = { label: string; href: string };
export type ToastInput = { message: string; action?: ToastAction };

type ToastState = ToastInput & { id: number };

const ToastContext = createContext<((toast: ToastInput) => void) | null>(null);

const visibleMs = 3_800;

/** Single bottom-centre toast (DESIGN-SYSTEM §7.11). The live region is always mounted so updates are announced. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const show = useCallback((next: ToastInput) => {
    window.clearTimeout(timer.current);
    setToast((previous) => ({ ...next, id: (previous?.id ?? 0) + 1 }));
    setOpen(true);
    timer.current = window.setTimeout(() => setOpen(false), visibleMs);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <ToastContext value={show}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'fixed bottom-[calc(96px+env(safe-area-inset-bottom,0px))] left-1/2 z-[60] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl border-2 border-ink bg-ink p-4 text-cream shadow-brutal-lime transition-[opacity,translate] duration-(--dur-swap) lg:bottom-8',
          open ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
        )}
      >
        {toast ? (
          <>
            <p key={toast.id} className="grow text-sm">
              {toast.message}
            </p>
            {toast.action ? (
              <Link
                href={toast.action.href}
                tabIndex={open ? undefined : -1}
                className="shrink-0 rounded-full border-2 border-ink bg-lime px-3.5 py-2 text-xs text-ink hover:bg-limeBright"
              >
                {toast.action.label}
              </Link>
            ) : null}
          </>
        ) : null}
      </div>
    </ToastContext>
  );
}

export function useToast(): (toast: ToastInput) => void {
  const show = useContext(ToastContext);
  if (!show) throw new Error('useToast must be used inside <ToastProvider>');
  return show;
}

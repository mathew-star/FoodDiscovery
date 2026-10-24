'use client';

import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

type DialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title: string;
  description?: string;
  closeLabel: string;
  children: ReactNode;
  variant?: 'dialog' | 'sheet';
  className?: string;
};

const popupClass = {
  dialog:
    'fixed top-1/2 left-1/2 w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-card data-ending-style:scale-[0.98] data-starting-style:scale-[0.98]',
  sheet:
    'fixed inset-x-0 bottom-0 max-h-[90dvh] overflow-y-auto rounded-t-card pb-[max(1rem,env(safe-area-inset-bottom))] data-ending-style:translate-y-full data-starting-style:translate-y-full md:inset-x-auto md:top-0 md:right-0 md:bottom-0 md:max-h-none md:w-[28rem] md:rounded-none md:rounded-l-card md:data-ending-style:translate-x-full md:data-ending-style:translate-y-0 md:data-starting-style:translate-x-full md:data-starting-style:translate-y-0',
} as const;

export function Dialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  closeLabel,
  children,
  variant = 'dialog',
  className,
}: DialogProps) {
  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger ? (
        <BaseDialog.Trigger render={<span className="contents" />}>{trigger}</BaseDialog.Trigger>
      ) : null}
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 z-[64] bg-ink/40 transition-opacity duration-(--dur-swap) data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <BaseDialog.Popup
          className={cn(
            'z-[65] flex flex-col gap-4 border-2 border-ink bg-paper p-5 text-ink shadow-brutal-lg transition-[transform,opacity] duration-(--dur-swap) ease-out data-ending-style:opacity-0 data-starting-style:opacity-0',
            popupClass[variant],
            className,
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <BaseDialog.Title className="type-title-m">{title}</BaseDialog.Title>
              {description ? (
                <BaseDialog.Description className="text-sm text-inkMuted">
                  {description}
                </BaseDialog.Description>
              ) : null}
            </div>
            <BaseDialog.Close
              aria-label={closeLabel}
              className="-m-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-inkMuted hover:bg-cream hover:text-ink"
            >
              <X aria-hidden="true" className="size-5" />
            </BaseDialog.Close>
          </div>
          {children}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

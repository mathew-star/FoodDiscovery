'use client';

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import type { ReactElement, ReactNode } from 'react';

type TooltipProps = {
  content: ReactNode;
  children: ReactElement;
};

export function TooltipProvider({ children }: { children: ReactNode }) {
  return <BaseTooltip.Provider delay={300}>{children}</BaseTooltip.Provider>;
}

export function Tooltip({ content, children }: TooltipProps) {
  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger render={children} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner sideOffset={8}>
          <BaseTooltip.Popup className="max-w-64 rounded-tick border-2 border-ink bg-ink px-3 py-2 text-sm text-on-ink shadow-lift-sm transition-opacity duration-(--dur-micro) data-ending-style:opacity-0 data-starting-style:opacity-0">
            {content}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}

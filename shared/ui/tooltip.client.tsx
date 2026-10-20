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
          <BaseTooltip.Popup className="max-w-64 rounded-sm bg-text px-2.5 py-1.5 text-sm text-bg shadow-2 transition-opacity duration-(--dur-base) data-ending-style:opacity-0 data-starting-style:opacity-0">
            {content}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}

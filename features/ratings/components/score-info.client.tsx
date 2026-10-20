'use client';

import { Info } from 'lucide-react';
import { Tooltip } from '@/shared/ui/tooltip.client';

export function ScoreInfo({ label, content }: { label: string; content: string }) {
  return (
    <Tooltip content={content}>
      <button
        type="button"
        aria-label={label}
        className="relative inline-flex size-6 items-center justify-center rounded-full text-ink-soft before:absolute before:-inset-2.5 hover:text-ink"
      >
        <Info aria-hidden="true" className="size-4" />
      </button>
    </Tooltip>
  );
}

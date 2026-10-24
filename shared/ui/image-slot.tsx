import { Image as PhotoIcon, Map as MapIcon } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

type ImageSlotProps = {
  /** Expected asset, printed in the slot, e.g. "Map image · 800 × 300". */
  label: string;
  kind?: 'photo' | 'map';
  className?: string;
};

/**
 * DESIGN-SYSTEM §7.5. Stands in where a real photo or map will go; FDN never uses illustrations.
 * Replace with an `<img>`/`next/image` that has explicit width/height, `object-cover` and a meaningful alt.
 */
export function ImageSlot({ label, kind = 'photo', className }: ImageSlotProps) {
  const Icon = kind === 'map' ? MapIcon : PhotoIcon;
  return (
    <div aria-hidden="true" className={cn('relative overflow-hidden map-slot', className)}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-2 text-center text-inkMuted">
        <Icon className="size-6" strokeWidth={2} />
        <span className="text-xs">{label}</span>
      </div>
    </div>
  );
}

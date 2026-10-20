import { Clock, MapPin } from 'lucide-react';
import { DietMark } from '@/features/dishes/components/diet-mark';
import type { Diet } from '@/features/dishes/schemas/diet';
import { RatingBadge } from '@/features/ratings/components/rating-badge';
import type { Sentiment } from '@/features/ratings/schemas/sentiment';
import { cn } from '@/shared/lib/cn';

export type DishPreview = {
  name: string;
  area: string;
  price: string;
  diet: Diet;
  sentiment: Sentiment;
  meta: string;
  plate: 'saffron' | 'chilli' | 'cardamom';
  badge?: string;
  distance?: string;
  open?: string;
};

const plates: Record<DishPreview['plate'], string> = {
  saffron: 'plate-saffron',
  chilli: 'plate-chilli',
  cardamom: 'plate-cardamom',
};

export function DishPreviewCard({ dish, className }: { dish: DishPreview; className?: string }) {
  return (
    <div className={cn('flex gap-3 rounded-lg border border-border bg-surface p-3 shadow-2', className)}>
      <div aria-hidden="true" className="relative size-20 shrink-0 overflow-hidden rounded-md bg-surface-2">
        <div className={cn('absolute inset-2 rounded-full shadow-inner', plates[dish.plate])} />
        <div className="absolute inset-0 rounded-md ring-1 ring-black/5 ring-inset" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate font-semibold">{dish.name}</p>
          <DietMark diet={dish.diet} />
        </div>
        <p className="flex items-center gap-1 text-sm text-muted">
          <MapPin aria-hidden="true" className="size-3.5" />
          {dish.area}
          {dish.distance ? <span>· {dish.distance}</span> : null}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-2">
          <RatingBadge sentiment={dish.sentiment} />
          <span className="text-sm font-semibold tabular-nums">{dish.price}</span>
          <span className="text-xs text-muted">{dish.meta}</span>
        </div>
        {dish.open ? (
          <p className="flex items-center gap-1 text-xs font-medium text-accent">
            <Clock aria-hidden="true" className="size-3.5" />
            {dish.open}
          </p>
        ) : null}
        {dish.badge ? <p className="text-xs font-semibold text-primary">{dish.badge}</p> : null}
      </div>
    </div>
  );
}

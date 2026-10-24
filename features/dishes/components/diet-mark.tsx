import { dietLabelKey, type Diet } from '@/features/dishes/schemas/diet';
import { t } from '@/i18n';
import { cn } from '@/shared/lib/cn';

/** Shape and colour both encode the diet, so the mark never relies on colour alone. */
const tone: Record<Diet, string> = {
  veg: 'text-oliveDeep',
  egg: 'text-ink',
  nonveg: 'text-terracottaDeep',
};

function Glyph({ diet }: { diet: Diet }) {
  switch (diet) {
    case 'veg':
      return <circle cx="8" cy="8" r="3.5" fill="currentColor" />;
    case 'egg':
      return (
        <ellipse
          cx="8"
          cy="8.3"
          rx="2.9"
          ry="3.8"
          fill="var(--fdn-saffron)"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      );
    case 'nonveg':
      return <path d="M8 4.2 11.8 11H4.2Z" fill="currentColor" />;
  }
}

type DietMarkProps = { diet: Diet; showLabel?: boolean; size?: 'sm' | 'md'; className?: string };

export function DietMark({ diet, showLabel = false, size = 'sm', className }: DietMarkProps) {
  const label = t(dietLabelKey[diet]);
  return (
    <span className={cn('inline-flex shrink-0 items-center gap-1 text-xs', tone[diet], className)}>
      <svg aria-hidden="true" viewBox="0 0 16 16" className={size === 'md' ? 'size-5' : 'size-4'}>
        <rect x="1" y="1" width="14" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <Glyph diet={diet} />
      </svg>
      {showLabel ? <span className="text-ink">{label}</span> : <span className="sr-only">{label}</span>}
    </span>
  );
}

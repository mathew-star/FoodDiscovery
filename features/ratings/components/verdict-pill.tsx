import { sentimentLabelKey, type Sentiment } from '@/features/ratings/schemas/sentiment';
import { t } from '@/i18n';
import { cn } from '@/shared/lib/cn';

/**
 * Fixed verdict colours (DESIGN-SYSTEM §3.3). Olive fills carry ink text and Skip uses
 * terracotta-deep so the word stays AA-readable at pill size.
 */
export const verdictFill: Record<Sentiment, string> = {
  loved: 'bg-olive text-ink',
  good: 'bg-lime text-ink',
  okay: 'bg-saffron text-ink',
  skip: 'bg-terracottaDeep text-paper',
};

/** Segment colours for bars, where no text sits on the fill. */
export const verdictBarFill: Record<Sentiment, string> = {
  loved: 'bg-olive',
  good: 'bg-limeBright',
  okay: 'bg-saffron',
  skip: 'bg-terracotta',
};

export function VerdictPill({ verdict, className }: { verdict: Sentiment; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border border-ink px-2 py-0.5 text-[11px] leading-tight font-bold whitespace-nowrap',
        verdictFill[verdict],
        className,
      )}
    >
      {t(sentimentLabelKey[verdict])}
    </span>
  );
}

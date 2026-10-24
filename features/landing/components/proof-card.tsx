import Link from 'next/link';
import { ScoreBadge } from '@/features/ratings/components/score-badge';
import { VerdictBar } from '@/features/ratings/components/verdict-bar';
import { t } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { formatRupees } from '@/shared/lib/money';
import { Badge } from '@/shared/ui/badge';
import { cardVariants } from '@/shared/ui/card';
import type { ProofSet, ProofSetId } from '../lib/content';

type ProofCardProps = {
  id: ProofSetId;
  set: ProofSet;
  swapping: boolean;
  confirmed: boolean;
  onStillTrue: () => void;
};

/** Hero proof card (DESIGN-SYSTEM §7.6): decision data first, then opinion, then the route it opens. */
export function ProofCard({ id, set, swapping, confirmed, onStillTrue }: ProofCardProps) {
  return (
    <article
      aria-live="polite"
      aria-label={t('landing.hero.proof.label')}
      className={cn(
        cardVariants({ size: 'lg' }),
        'p-5 transition-opacity duration-(--dur-swap)',
        swapping && 'opacity-15',
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-2 border-b-2 border-ink pb-3">
        <div className="flex min-w-0 items-center gap-2">
          <Badge tone="ink">{t(`landing.hero.sets.${id}.rank`)}</Badge>
          <span className="text-xs whitespace-nowrap text-inkMuted">
            {t('place.km', { km: set.distanceKm })}
          </span>
        </div>
        <Badge tone="lime">{t('place.openTill', { time: set.openTill })}</Badge>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-xs text-inkMuted">
            {t('place.inArea', { place: set.place.name, area: set.place.area })}
          </p>
          <h2 className="mt-0.5 type-title-m">{set.dish}</h2>
        </div>
        <ScoreBadge lovedPct={set.shares.loved} ratingCount={set.ratings} className="shrink-0" />
      </div>

      <div className="mt-4">
        <p className="mb-1.5 flex justify-between text-[11px]">
          <span>{t('landing.hero.proof.whatLocalsSaid')}</span>
          <span className="text-inkMuted">{t('rating.trustWeighted')}</span>
        </p>
        <VerdictBar shares={set.shares} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t-2 border-dashed border-ink/30 pt-3 text-xs">
        <p>
          <span>{formatRupees(set.pricePaise)}</span>{' '}
          <span className="text-inkMuted">{t(`landing.hero.sets.${id}.checked`)}</span>
        </p>
        <button
          type="button"
          onClick={onStillTrue}
          className={cn(
            'min-h-8 rounded border border-ink px-2.5 py-1 text-[11px] transition-colors duration-(--dur-instant)',
            confirmed ? 'bg-lime' : 'bg-cream hover:bg-lime',
          )}
        >
          {confirmed ? t('landing.hero.proof.noted') : t('landing.hero.proof.stillTrue')}
        </button>
      </div>

      <Link
        href={set.route}
        className="mt-4 flex items-center justify-between rounded-xl border-[1.5px] border-ink px-3.5 py-2.5 text-xs transition-colors duration-(--dur-instant) hover:bg-cream"
      >
        <span>{t('landing.hero.proof.whatElse')}</span>
        <span className="ml-3 truncate text-inkMuted">{set.route}</span>
      </Link>
    </article>
  );
}

import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { ShareButton } from '@/features/places/components/share-button.client';
import { VerdictPill } from '@/features/ratings/components/verdict-pill';
import { sentimentLabelKey } from '@/features/ratings/schemas/sentiment';
import { IntentButton } from '@/features/shell/components/intent-button.client';
import { t } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { formatRupees } from '@/shared/lib/money';
import { Avatar } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { buttonVariants } from '@/shared/ui/button';
import { cardVariants } from '@/shared/ui/card';
import { ImageSlot } from '@/shared/ui/image-slot';
import { chaiList, closedBattle, experiencePost, factsToday, questionPost, receipt } from '../lib/content';
import { GuestSaveButton } from './guest-save-button.client';

/*
  The community feed uses the same card shapes as the product (DESIGN-SYSTEM §7.6), so the landing
  page teaches the post, question, list and battle UI before sign-up. Write actions show the
  sign-in prompt; reading never does.
*/

const actionPill = 'min-h-8 rounded-full border-[1.5px] border-ink px-3 py-1.5 text-xs';
const verdictText = {
  loved: 'text-oliveDeep',
  good: 'text-ink',
  okay: 'text-ink',
  skip: 'text-terracottaDeep',
} as const;

export function ExperiencePostCard({ className }: { className?: string }) {
  return (
    <article
      aria-labelledby="post-title"
      className={cn(cardVariants({ size: 'lg' }), 'flex flex-col overflow-hidden', className)}
    >
      <div className="flex justify-end border-b-2 border-ink bg-creamDark px-4 py-2.5">
        <span className="flex items-center gap-1.5 rounded-full border-[1.5px] border-ink bg-paper px-2.5 py-1 text-[11px]">
          <MapPin aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
          {t('landing.community.post.onSite')}
        </span>
      </div>
      <div className="flex grow flex-col gap-4 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <Avatar name={experiencePost.author} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span>{experiencePost.author}</span>
              <Badge tone="lime">{t('landing.community.post.founding')}</Badge>
            </div>
            <p className="text-[11px] text-inkMuted">{t('landing.community.post.meta')}</p>
          </div>
        </div>
        <h3 id="post-title" className="type-title-l">
          {t('landing.community.post.title')}
        </h3>
        <p className="max-w-prose leading-relaxed text-inkMuted">{t('landing.community.post.body')}</p>
        <ul aria-label={t('landing.community.post.ratingsLabel')} className="grid gap-2 sm:grid-cols-2">
          {experiencePost.ratings.map(({ place, verdict }) => (
            <li
              key={place.slug}
              className="flex items-center justify-between gap-3 rounded-xl border-[1.5px] border-ink bg-cream px-3 py-2"
            >
              <span className="truncate text-sm">
                {t('place.inArea', { place: place.name, area: place.area })}
              </span>
              <VerdictPill verdict={verdict} />
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-wrap items-center gap-2 border-t-2 border-dashed border-ink/25 pt-4 text-xs">
          <div
            role="group"
            aria-label={t('landing.community.post.votesLabel')}
            className="flex items-center overflow-hidden rounded-full border-[1.5px] border-ink bg-paper"
          >
            <IntentButton
              reason={t('intent.vote')}
              aria-label={t('landing.community.post.upvote')}
              className="min-h-8 px-3 py-1.5 hover:bg-lime"
            >
              ▲
            </IntentButton>
            <span className="px-1">{experiencePost.votes}</span>
            <IntentButton
              reason={t('intent.vote')}
              aria-label={t('landing.community.post.downvote')}
              className="min-h-8 px-3 py-1.5 hover:bg-cream"
            >
              ▼
            </IntentButton>
          </div>
          <span className={actionPill}>
            {t('landing.community.post.comments', { count: experiencePost.comments })}
          </span>
          <ShareButton title={t('landing.community.post.title')} path="/#community" size="sm" />
          <GuestSaveButton label={t('landing.community.post.save')} className="ml-auto" />
        </div>
      </div>
    </article>
  );
}

export function QuestionCard({ className }: { className?: string }) {
  return (
    <article
      aria-labelledby="question-title"
      className={cn(
        cardVariants({ size: 'md', tone: 'lime' }),
        'flex flex-col gap-4 rounded-card p-5 sm:p-6',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="rounded-full border-[1.5px] border-ink bg-paper px-2.5 py-1 text-[11px]">
          {t('landing.community.question.tag')}
        </span>
        <span className="text-[11px]">
          {t('landing.community.question.answers', { count: questionPost.answers })}
        </span>
      </div>
      <h3 id="question-title" className="type-title-m">
        {t('landing.community.question.title')}
      </h3>
      <div className="rounded-2xl border-[1.5px] border-ink bg-paper p-3.5">
        <div className="mb-1.5 flex items-center gap-2">
          <Badge tone="olive">{t('landing.community.question.accepted')}</Badge>
          <span className="text-[11px] text-inkMuted">
            {t('landing.community.question.by', { user: questionPost.answerer })}
          </span>
        </div>
        <p className="text-sm leading-relaxed">{t('landing.community.question.answer')}</p>
        <div className="mt-2.5 flex items-center justify-between gap-3 rounded-xl border border-ink bg-cream px-3 py-2">
          <span className="text-sm">{t('landing.community.question.place')}</span>
          <span className="shrink-0 text-[11px]">{t('place.km', { km: questionPost.distanceKm })}</span>
        </div>
      </div>
      <IntentButton
        reason={t('intent.answer')}
        className={cn(buttonVariants({ variant: 'dark', size: 'sm' }), 'mt-auto self-start')}
      >
        {t('landing.community.question.add')}
      </IntentButton>
    </article>
  );
}

export function ListCard({ className }: { className?: string }) {
  return (
    <article
      aria-labelledby="list-title"
      className={cn(cardVariants({ size: 'md' }), 'flex flex-col overflow-hidden rounded-card', className)}
    >
      <ImageSlot
        kind="map"
        label={t('imageSlot.map', { width: 800, height: 300 })}
        className="h-36 border-b-2 border-ink"
      />
      <div className="flex grow flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 id="list-title" className="type-title-m">
            {t('landing.community.list.title')}
          </h3>
          <span className="shrink-0 text-[11px]">
            {t('landing.community.list.by', { user: chaiList.author })}
          </span>
        </div>
        <ol className="space-y-1.5 text-sm">
          {chaiList.rows.map(({ place, pricePaise }, index) => (
            <li key={place.slug} className="flex justify-between gap-2">
              <span>
                <span className="mr-2">{index + 1}</span>
                {t('place.inArea', { place: place.name, area: place.area })}
              </span>
              <span className="text-xs text-inkMuted">{formatRupees(pricePaise)}</span>
            </li>
          ))}
        </ol>
        <div className="mt-auto flex items-center justify-between pt-2 text-xs">
          <span className="text-inkMuted">
            {t('landing.community.list.saves', { count: chaiList.saves.toLocaleString('en-IN') })}
          </span>
          <Link href={chaiList.route} className={buttonVariants({ variant: 'link' })}>
            {t('landing.community.list.open')}
          </Link>
        </div>
      </div>
    </article>
  );
}

/** Receipt card (community content only, never the footer). */
export function ReceiptCard({ className }: { className?: string }) {
  return (
    <article
      aria-label={t('landing.community.receipt.label')}
      className={cn('lg:-rotate-[1.2deg]', className)}
    >
      <div className="receipt-bottom rounded-t-panel border-2 border-b-0 border-ink bg-paper p-5 text-[13px]">
        <div className="mb-3 border-b-2 border-dashed border-ink/40 pb-3 text-center">
          <h3 className="type-title-s">
            {t('place.inArea', { place: receipt.place.name, area: receipt.place.area })}
          </h3>
          <p className="text-[11px] text-inkMuted">
            {t('landing.community.receipt.by', { user: receipt.author })}
          </p>
        </div>
        <ul className="space-y-2">
          {receipt.lines.map(({ dish, verdict }) => (
            <li key={dish} className="flex justify-between gap-3">
              <span>{dish}</span>
              <span className={verdictText[verdict]}>{t(sentimentLabelKey[verdict])}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t-2 border-dashed border-ink/40 pt-3">
          <span>{t('landing.community.receipt.paid')}</span>
          <span>{formatRupees(receipt.totalPaise)}</span>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-inkMuted">
          {t('landing.community.receipt.note')}
        </p>
      </div>
    </article>
  );
}

/** Closed battle: result bars are visible to everyone once voting ends (spec W7). */
export function BattleResultCard({ className }: { className?: string }) {
  const sides = [
    { ...closedBattle.winner, barClass: 'bg-lime', pctClass: 'text-lime', nameClass: undefined },
    {
      ...closedBattle.loser,
      barClass: 'bg-terracotta',
      pctClass: 'text-cream/70',
      nameClass: 'text-cream/80',
    },
  ];
  return (
    <article
      aria-labelledby="battle-result-title"
      className={cn(
        cardVariants({ size: 'md', tone: 'ink' }),
        'flex flex-col gap-4 rounded-card p-5',
        className,
      )}
    >
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-lime">{t('landing.community.battle.closed')}</span>
        <span className="text-cream/70">
          {t('landing.community.battle.votes', { count: closedBattle.votes.toLocaleString('en-IN') })}
        </span>
      </div>
      <h3 id="battle-result-title" className="type-title-s">
        {t('landing.community.battle.title')}
      </h3>
      <div className="space-y-3">
        {sides.map((side) => (
          <div key={side.place.slug}>
            <div className="mb-1 flex justify-between gap-3 text-sm">
              <span className={side.nameClass}>
                {t('place.inArea', { place: side.place.name, area: side.place.area })}
              </span>
              <span className={side.pctClass}>{side.pct}%</span>
            </div>
            <div aria-hidden="true" className="h-2.5 overflow-hidden rounded-full bg-cream/10">
              <div style={{ width: `${side.pct}%` }} className={cn('h-full rounded-full', side.barClass)} />
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] leading-relaxed text-cream/70">{t('landing.community.battle.note')}</p>
      <Link href="/battles" className="mt-auto text-xs text-lime underline underline-offset-4">
        {t('landing.community.battle.see')}
      </Link>
    </article>
  );
}

export function FactsCheckedCard({ className }: { className?: string }) {
  const swatches = ['bg-olive', 'bg-saffron', 'bg-terracotta', 'bg-ink'];
  return (
    <article
      aria-labelledby="facts-today-title"
      className={cn(cardVariants({ size: 'md' }), 'flex flex-col gap-4 rounded-card p-5', className)}
    >
      <div className="flex items-baseline justify-between gap-2">
        <h3 id="facts-today-title" className="type-title-m">
          {t('landing.community.facts.title')}
        </h3>
        <span className="font-display text-3xl font-extrabold">{factsToday.checked}</span>
      </div>
      <div className="rounded-2xl border-[1.5px] border-ink bg-cream p-3.5">
        <p className="text-sm">{t('landing.community.facts.update')}</p>
        <p className="mt-0.5 text-[11px] text-inkMuted">{t('landing.community.facts.meta')}</p>
        <div
          role="img"
          aria-label={t('landing.community.facts.confirmedBy', { count: factsToday.confirmers })}
          className="mt-3 flex -space-x-2"
        >
          {swatches.map((swatch) => (
            <span key={swatch} className={cn('size-7 rounded-full border-2 border-paper', swatch)} />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 border-t-2 border-dashed border-ink/25 pt-3">
        <span className="text-sm">{t('landing.community.facts.question')}</span>
        <div className="flex gap-1.5 text-[11px]">
          <IntentButton
            reason={t('intent.factCheck')}
            className="min-h-8 rounded border border-ink bg-lime px-2.5 py-1 hover:bg-limeBright"
          >
            {t('landing.community.facts.yes')}
          </IntentButton>
          <IntentButton
            reason={t('intent.factCheck')}
            className="min-h-8 rounded border border-ink bg-paper px-2.5 py-1 hover:bg-creamDark"
          >
            {t('landing.community.facts.no')}
          </IntentButton>
        </div>
      </div>
    </article>
  );
}

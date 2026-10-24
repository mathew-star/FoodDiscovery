import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';
import { sentimentLabelKey } from '@/features/ratings/schemas/sentiment';
import { t, tRich } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { buttonVariants } from '@/shared/ui/button';
import { chipVariants } from '@/shared/ui/chip';
import { SegmentedTab, SegmentedTabsList, TabsPanel, TabsRoot } from '@/shared/ui/tabs.client';
import { Ticker } from '@/shared/ui/ticker';
import { communities, tickerItems } from '../lib/content';
import {
  BattleResultCard,
  ExperiencePostCard,
  FactsCheckedCard,
  ListCard,
  QuestionCard,
  ReceiptCard,
} from './feed-cards';

const feedFilters = ['all', 'photo', 'question', 'list'] as const;
type FeedFilter = (typeof feedFilters)[number];
type FeedKind = Exclude<FeedFilter, 'all'>;

/* Bento order and spans follow the reference layout; `dense` packing back-fills gaps. */
const feed: { id: string; kind: FeedKind; render: () => ReactNode }[] = [
  {
    id: 'post',
    kind: 'photo',
    render: () => <ExperiencePostCard className="md:col-span-6 lg:col-span-7 lg:row-span-2" />,
  },
  {
    id: 'question',
    kind: 'question',
    render: () => <QuestionCard className="md:col-span-3 lg:col-span-5" />,
  },
  { id: 'list', kind: 'list', render: () => <ListCard className="md:col-span-3 lg:col-span-5" /> },
  { id: 'receipt', kind: 'photo', render: () => <ReceiptCard className="md:col-span-3 lg:col-span-4" /> },
  { id: 'battle', kind: 'list', render: () => <BattleResultCard className="md:col-span-3 lg:col-span-4" /> },
  {
    id: 'facts',
    kind: 'question',
    render: () => <FactsCheckedCard className="md:col-span-6 lg:col-span-4" />,
  },
];

const compact = new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 });

function tickerLine({ id, user, verdict }: (typeof tickerItems)[number]) {
  return tRich(`landing.community.ticker.${id}`, {
    user: <span className="text-lime">{user}</span>,
    verdict: verdict ? (
      <b className={verdict === 'loved' ? 'text-lime' : 'text-saffron'}>{t(sentimentLabelKey[verdict])}</b>
    ) : null,
  });
}

/** Section 3: real member content in the shapes the product uses. */
export function Community() {
  return (
    <section
      id="community"
      aria-labelledby="community-title"
      className="relative border-b-4 border-ink py-16 md:py-24"
    >
      <Ticker
        label={t('landing.community.ticker.label')}
        items={tickerItems.map(tickerLine)}
        className="mb-14"
      />

      <div className="mx-auto max-w-[1360px] px-5 md:px-10">
        <TabsRoot defaultValue="all">
          <div className="mb-10 grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h2 id="community-title" className="type-display-l">
                {t('landing.community.titleLine1')}
                <br />
                {t('landing.community.titleLine2')}
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-inkMuted sm:text-lg">
                {t('landing.community.body')}
              </p>
            </div>
            <div className="min-w-0 lg:col-span-5 lg:justify-self-end">
              <SegmentedTabsList aria-label={t('landing.community.tabsLabel')}>
                {feedFilters.map((filter) => (
                  <SegmentedTab key={filter} value={filter}>
                    {t(`landing.community.tabs.${filter}`)}
                  </SegmentedTab>
                ))}
              </SegmentedTabsList>
            </div>
          </div>

          {feedFilters.map((filter) => (
            <TabsPanel
              key={filter}
              value={filter}
              className="grid [grid-auto-flow:dense] grid-cols-1 gap-5 md:grid-cols-6 lg:grid-cols-12"
            >
              {feed
                .filter((item) => filter === 'all' || item.kind === filter)
                .map((item) => (
                  <Fragment key={item.id}>{item.render()}</Fragment>
                ))}
            </TabsPanel>
          ))}
        </TabsRoot>

        <div className="mt-12 flex flex-col justify-between gap-6 rounded-card border-2 border-ink bg-paper px-5 py-5 sm:px-6 lg:flex-row lg:items-center">
          <ul aria-label={t('landing.community.strip.label')} className="flex flex-wrap gap-2">
            {communities.map(({ slug, members }) => (
              <li key={slug}>
                <Link href={`/c/${slug}`} className={cn(chipVariants(), 'bg-cream hover:bg-lime')}>
                  {t(`landing.community.communities.${slug}`)}
                  <span className="text-inkMuted">
                    <span aria-hidden="true">{compact.format(members)}</span>
                    <span className="sr-only">
                      {t('landing.community.strip.members', { count: members })}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex shrink-0 items-center gap-4">
            <span className="hidden text-sm text-inkMuted sm:inline">
              {t('landing.community.strip.reading')}
            </span>
            <Link href="/communities" className={buttonVariants({ size: 'sm' })}>
              {t('landing.community.strip.browse')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  BadgeCheck,
  Clock3,
  Compass,
  Footprints,
  HandCoins,
  MessageCircleQuestion,
  MessagesSquare,
  Scale,
  Search,
  Share2,
  ShieldCheck,
  Swords,
  Trophy,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';
import { DietMark } from '@/features/dishes/components/diet-mark';
import { diets } from '@/features/dishes/schemas/diet';
import { defaultCity } from '@/features/geo/schemas/city';
import { RatingBadge } from '@/features/ratings/components/rating-badge';
import { sentiments } from '@/features/ratings/schemas/sentiment';
import { t, type MessageKey } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { buttonVariants } from '@/shared/ui/button';

type Item = { icon: LucideIcon; title: MessageKey; body: MessageKey };

function SectionHeading({ id, title, body }: { id: string; title: MessageKey; body?: MessageKey }) {
  return (
    <div className="flex max-w-2xl flex-col gap-3">
      <h2 id={id} className="text-3xl font-semibold md:text-4xl">
        {t(title)}
      </h2>
      {body ? <p className="text-lg text-muted">{t(body)}</p> : null}
    </div>
  );
}

function Section({
  id,
  labelledBy,
  className,
  children,
}: {
  id?: string;
  labelledBy: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn('scroll-mt-20', className)}>
      <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-4 py-16 md:px-6 md:py-20">
        {children}
      </div>
    </section>
  );
}

const problemItems: { icon: LucideIcon; key: MessageKey }[] = [
  { icon: Compass, key: 'landing.problem.items.discover' },
  { icon: Footprints, key: 'landing.problem.items.distance' },
  { icon: HandCoins, key: 'landing.problem.items.prices' },
  { icon: MessagesSquare, key: 'landing.problem.items.opinions' },
];

export function ProblemSection() {
  return (
    <Section labelledBy="problem-title" className="border-y border-border bg-surface-2">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <SectionHeading id="problem-title" title="landing.problem.title" body="landing.problem.body" />
        <ul className="grid grid-cols-2 gap-3">
          {problemItems.map(({ icon: Icon, key }) => (
            <li key={key} className="flex items-center gap-3 rounded-md border border-border bg-surface p-4">
              <Icon aria-hidden="true" className="size-5 shrink-0 text-muted" />
              <span className="text-sm font-medium">{t(key)}</span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

const steps: Item[] = [
  { icon: Search, title: 'landing.how.steps.find.title', body: 'landing.how.steps.find.body' },
  { icon: Clock3, title: 'landing.how.steps.facts.title', body: 'landing.how.steps.facts.body' },
  { icon: BadgeCheck, title: 'landing.how.steps.opinions.title', body: 'landing.how.steps.opinions.body' },
  { icon: UtensilsCrossed, title: 'landing.how.steps.rate.title', body: 'landing.how.steps.rate.body' },
];

export function HowItWorksSection() {
  return (
    <Section id="how" labelledBy="how-title">
      <SectionHeading id="how-title" title="landing.how.title" />
      <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(({ icon: Icon, title, body }, index) => (
          <li key={title} className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary font-semibold text-on-primary tabular-nums">
                {index + 1}
              </span>
              <Icon aria-hidden="true" className="size-5 text-primary" />
            </div>
            <h3 className="font-sans text-lg font-semibold">{t(title)}</h3>
            <p className="text-muted">{t(body)}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

const features: Item[] = [
  {
    icon: UtensilsCrossed,
    title: 'landing.features.items.whatToOrder.title',
    body: 'landing.features.items.whatToOrder.body',
  },
  {
    icon: Trophy,
    title: 'landing.features.items.cityRanking.title',
    body: 'landing.features.items.cityRanking.body',
  },
  {
    icon: Swords,
    title: 'landing.features.items.battles.title',
    body: 'landing.features.items.battles.body',
  },
  {
    icon: Clock3,
    title: 'landing.features.items.livingFacts.title',
    body: 'landing.features.items.livingFacts.body',
  },
  {
    icon: MessageCircleQuestion,
    title: 'landing.features.items.askLocals.title',
    body: 'landing.features.items.askLocals.body',
  },
  {
    icon: Share2,
    title: 'landing.features.items.whatsapp.title',
    body: 'landing.features.items.whatsapp.body',
  },
];

export function FeaturesSection() {
  return (
    <Section id="features" labelledBy="features-title" className="bg-surface-2">
      <SectionHeading id="features-title" title="landing.features.title" />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, body }) => (
          <li
            key={title}
            className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-6 shadow-1"
          >
            <span className="flex size-11 items-center justify-center rounded-md bg-primary-soft text-primary">
              <Icon aria-hidden="true" className="size-6" />
            </span>
            <h3 className="font-sans text-lg font-semibold">{t(title)}</h3>
            <p className="text-muted">{t(body)}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function RatingsSection() {
  return (
    <Section labelledBy="ratings-title">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <SectionHeading id="ratings-title" title="landing.ratings.title" body="landing.ratings.body" />
          <ul className="flex flex-wrap gap-3" aria-label={t('landing.ratings.title')}>
            {sentiments.map((sentiment) => (
              <li key={sentiment}>
                <RatingBadge sentiment={sentiment} size="md" />
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6 shadow-1">
          <h3 className="font-sans text-lg font-semibold">{t('landing.ratings.dietTitle')}</h3>
          <p className="text-muted">{t('landing.ratings.dietBody')}</p>
          <ul className="flex flex-wrap gap-5">
            {diets.map((diet) => (
              <li key={diet}>
                <DietMark diet={diet} showLabel size="md" className="text-sm" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

const trustItems: Item[] = [
  {
    icon: Scale,
    title: 'landing.trust.items.noPayToRank.title',
    body: 'landing.trust.items.noPayToRank.body',
  },
  {
    icon: BadgeCheck,
    title: 'landing.trust.items.disclosure.title',
    body: 'landing.trust.items.disclosure.body',
  },
  {
    icon: ShieldCheck,
    title: 'landing.trust.items.weighted.title',
    body: 'landing.trust.items.weighted.body',
  },
];

export function TrustSection() {
  return (
    <Section id="trust" labelledBy="trust-title" className="bg-text text-bg">
      <h2 id="trust-title" className="text-3xl font-semibold md:text-4xl">
        {t('landing.trust.title')}
      </h2>
      <ul className="grid gap-8 md:grid-cols-3">
        {trustItems.map(({ icon: Icon, title, body }) => (
          <li key={title} className="flex flex-col gap-3">
            <Icon aria-hidden="true" className="size-7" />
            <h3 className="font-sans text-lg font-semibold">{t(title)}</h3>
            <p className="opacity-90">{t(body)}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

const communityTags: MessageKey[] = [
  'landing.community.tags.city',
  'landing.community.tags.biryani',
  'landing.community.tags.haleem',
  'landing.community.tags.cafes',
  'landing.community.tags.streetFood',
  'landing.community.tags.budget',
  'landing.community.tags.desserts',
  'landing.community.tags.veg',
];

export function CommunitySection() {
  return (
    <Section labelledBy="community-title">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <SectionHeading id="community-title" title="landing.community.title" body="landing.community.body" />
        <ul className="flex flex-wrap gap-2">
          {communityTags.map((key) => (
            <li
              key={key}
              className="inline-flex h-10 items-center rounded-full border border-border-strong bg-surface px-4 text-sm font-medium"
            >
              {t(key)}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

export function FinalCtaSection() {
  return (
    <Section labelledBy="final-title" className="pb-24 lg:pb-20">
      <div className="flex flex-col items-start gap-6 rounded-xl bg-primary-soft p-8 md:flex-row md:items-center md:justify-between md:p-12">
        <div className="flex max-w-xl flex-col gap-3">
          <h2 id="final-title" className="text-3xl font-semibold">
            {t('landing.final.title')}
          </h2>
          <p className="text-muted">{t('landing.final.body')}</p>
        </div>
        <Link href={`/${defaultCity}`} className={buttonVariants({ size: 'lg' })}>
          {t('landing.final.cta')}
        </Link>
      </div>
    </Section>
  );
}

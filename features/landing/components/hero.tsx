import Link from 'next/link';
import { MessagesSquare } from 'lucide-react';
import { defaultCity } from '@/features/geo/schemas/city';
import { t } from '@/i18n';
import { buttonVariants } from '@/shared/ui/button';
import { DishPreviewCard, type DishPreview } from './dish-preview-card';

const featured: DishPreview = {
  name: t('landing.preview.dish'),
  area: t('landing.preview.area'),
  distance: t('landing.preview.distance'),
  price: t('landing.preview.price'),
  diet: 'nonveg',
  sentiment: 'loved',
  meta: t('landing.preview.ratings'),
  open: t('landing.preview.open'),
  badge: t('landing.preview.topPick'),
  plate: 'saffron',
};

const others: DishPreview[] = [
  {
    name: t('landing.preview.dish2'),
    area: t('landing.preview.area2'),
    price: t('landing.preview.price2'),
    diet: 'nonveg',
    sentiment: 'good',
    meta: t('rating.lovedPct', { pct: 78 }),
    plate: 'chilli',
  },
  {
    name: t('landing.preview.dish3'),
    area: t('landing.preview.area3'),
    price: t('landing.preview.price3'),
    diet: 'veg',
    sentiment: 'loved',
    meta: t('rating.lovedPct', { pct: 88 }),
    plate: 'cardamom',
  },
];

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-40 size-[36rem] rounded-full bg-primary-soft blur-3xl"
      />
      <div className="relative mx-auto grid max-w-[1200px] items-center gap-12 px-4 py-14 md:px-6 md:py-20 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col gap-6">
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">{t('landing.eyebrow')}</p>
          <h1 id="hero-title" className="text-4xl font-semibold md:text-6xl">
            {t('landing.title')}
          </h1>
          <p className="max-w-xl text-lg text-muted">{t('landing.subtitle')}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href={`/${defaultCity}`} className={buttonVariants({ size: 'lg' })}>
              {t('landing.ctaPrimary')}
            </Link>
            <a href="#how" className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
              {t('landing.ctaSecondary')}
            </a>
          </div>
          <p className="text-sm text-muted">{t('landing.guestNote')}</p>
        </div>
        <figure
          aria-label={t('landing.preview.label')}
          className="relative mx-auto flex w-full max-w-md flex-col gap-3"
        >
          <DishPreviewCard dish={featured} className="rotate-[-1.5deg]" />
          {others.map((dish) => (
            <DishPreviewCard key={dish.name} dish={dish} className="ml-6" />
          ))}
          <div className="ml-12 flex items-start gap-3 rounded-lg border border-border bg-surface p-3 shadow-2">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
              <MessagesSquare aria-hidden="true" className="size-5" />
            </span>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold">{t('landing.preview.question')}</p>
              <p className="text-xs text-muted">{t('landing.preview.answers')}</p>
            </div>
          </div>
        </figure>
      </div>
    </section>
  );
}

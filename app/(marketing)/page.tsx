import type { Metadata } from 'next';
import { FinalTicket } from '@/features/landing/components/final-ticket';
import { Hero } from '@/features/landing/components/hero';
import { HouseRules } from '@/features/landing/components/house-rules';
import { HowStrip } from '@/features/landing/components/how-strip';
import { LandingHeader } from '@/features/landing/components/landing-header';
import { MenuBoard } from '@/features/landing/components/menu-board';
import { NoticeBoard } from '@/features/landing/components/notice-board';
import { RatingsSection } from '@/features/landing/components/ratings-section';
import { ShuffleReceipt } from '@/features/landing/components/shuffle-receipt';
import { SiteFooter } from '@/features/shell/components/site-footer';
import { t, type MessageKey } from '@/i18n';
import { TokenBoard } from '@/shared/ui/token-board';

export const metadata: Metadata = {
  title: { absolute: t('landing.metaTitle') },
  description: t('app.description'),
  alternates: { canonical: '/' },
};

const tickerKeys: MessageKey[] = [
  'landing.ticker.t1',
  'landing.ticker.t2',
  'landing.ticker.t3',
  'landing.ticker.t4',
  'landing.ticker.t5',
];

export default function LandingPage() {
  return (
    <>
      <LandingHeader />
      <TokenBoard label={t('shell.nowServing')} items={tickerKeys.map((key) => t(key))} />
      <main id="main" tabIndex={-1} className="flex-1">
        <Hero />
        <ShuffleReceipt />
        <HowStrip />
        <RatingsSection />
        <HouseRules />
        <MenuBoard />
        <NoticeBoard />
        <FinalTicket />
      </main>
      <SiteFooter />
    </>
  );
}

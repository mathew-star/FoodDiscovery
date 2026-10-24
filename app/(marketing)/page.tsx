import type { Metadata } from 'next';
import { ClosingCta } from '@/features/landing/components/closing-cta';
import { Community } from '@/features/landing/components/community';
import { Faq } from '@/features/landing/components/faq';
import { Hero } from '@/features/landing/components/hero';
import { HonestByDesign } from '@/features/landing/components/honest-by-design';
import { HowItWorks } from '@/features/landing/components/how-it-works';
import { LandingHeader } from '@/features/landing/components/landing-header';
import { SixApps } from '@/features/landing/components/six-apps';
import { BottomNav } from '@/features/shell/components/bottom-nav.client';
import { SiteFooter } from '@/features/shell/components/site-footer';
import { t } from '@/i18n';

export const metadata: Metadata = {
  title: { absolute: t('landing.metaTitle') },
  description: t('app.description'),
  alternates: { canonical: '/' },
};

export default function LandingPage() {
  return (
    <>
      <LandingHeader />
      <main id="main" tabIndex={-1} className="flex-1">
        <Hero />
        <SixApps />
        <HowItWorks />
        <Community />
        <HonestByDesign />
        <Faq />
        <ClosingCta />
      </main>
      <SiteFooter />
      <BottomNav />
    </>
  );
}

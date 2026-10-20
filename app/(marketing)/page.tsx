import type { Metadata } from 'next';
import { Hero } from '@/features/landing/components/hero';
import { LandingHeader } from '@/features/landing/components/landing-header';
import {
  CommunitySection,
  FeaturesSection,
  FinalCtaSection,
  HowItWorksSection,
  ProblemSection,
  RatingsSection,
  TrustSection,
} from '@/features/landing/components/sections';
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
        <ProblemSection />
        <HowItWorksSection />
        <FeaturesSection />
        <RatingsSection />
        <TrustSection />
        <CommunitySection />
        <FinalCtaSection />
      </main>
      <SiteFooter />
    </>
  );
}

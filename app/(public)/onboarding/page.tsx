import type { Metadata } from 'next';
import { Suspense } from 'react';
import { OnboardingPage } from '@/features/profile/components/onboarding-page';
import { t } from '@/i18n';
import { Skeleton } from '@/shared/ui/skeleton';

export const metadata: Metadata = {
  title: t('profile.onboarding.title'),
  robots: { index: false, follow: false },
};

export default function Page({ searchParams }: PageProps<'/onboarding'>) {
  return (
    <Suspense fallback={<Skeleton className="mx-auto h-[40rem] w-full max-w-md" />}>
      <OnboardingPage searchParams={searchParams} />
    </Suspense>
  );
}

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SignUpPage } from '@/features/auth/components/auth-pages';
import { t } from '@/i18n';
import { Skeleton } from '@/shared/ui/skeleton';

export const metadata: Metadata = {
  title: t('auth.signUp.title'),
  robots: { index: false, follow: false },
};

export default function Page({ searchParams }: PageProps<'/login/create'>) {
  return (
    <Suspense fallback={<Skeleton className="mx-auto h-[28rem] w-full max-w-md" />}>
      <SignUpPage searchParams={searchParams} />
    </Suspense>
  );
}

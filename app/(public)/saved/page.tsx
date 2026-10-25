import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AccountPanel } from '@/features/auth/components/account-entry';
import { SavedContent } from '@/features/saves/components/saved-content';
import { t } from '@/i18n';
import { Skeleton } from '@/shared/ui/skeleton';

export const metadata: Metadata = {
  title: t('saves.pageTitle'),
  robots: { index: false, follow: false },
};

export default function SavedPage() {
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-3">
        <h1 className="type-display-l">{t('saves.pageTitle')}</h1>
        <Suspense fallback={null}>
          <AccountPanel />
        </Suspense>
      </header>
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <SavedContent />
      </Suspense>
    </div>
  );
}

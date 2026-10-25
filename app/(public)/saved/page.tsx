import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AccountPanel } from '@/features/auth/components/account-entry';
import { defaultCity } from '@/features/geo/schemas/city';
import { SavedList } from '@/features/saves/components/saved-list.client';
import { t } from '@/i18n';

export const metadata: Metadata = {
  title: t('saves.title'),
  robots: { index: false, follow: false },
};

export default function SavedPage() {
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="type-display-l">{t('saves.title')}</h1>
        <p className="text-inkMuted">{t('saves.intro')}</p>
        <Suspense fallback={null}>
          <AccountPanel />
        </Suspense>
      </header>
      <SavedList discoverHref={`/${defaultCity}`} />
    </div>
  );
}

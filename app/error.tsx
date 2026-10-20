'use client';

import { TriangleAlert } from 'lucide-react';
import { t } from '@/i18n';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';

export default function ErrorBoundary({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main" className="mx-auto flex w-full max-w-[1200px] flex-1 items-center px-4 py-12">
      <EmptyState
        className="w-full"
        icon={<TriangleAlert />}
        title={t('error.title')}
        body={t('error.body')}
        action={<Button onClick={reset}>{t('error.retry')}</Button>}
      />
    </main>
  );
}

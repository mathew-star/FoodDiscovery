import type { Metadata } from 'next';
import { WifiOff } from 'lucide-react';
import { t } from '@/i18n';
import { EmptyState } from '@/shared/ui/empty-state';

export const metadata: Metadata = { title: t('offline.title'), robots: { index: false } };

export default function OfflinePage() {
  return (
    <EmptyState icon={<WifiOff />} title={t('offline.title')} body={t('offline.body')} className="my-8" />
  );
}

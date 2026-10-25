import type { Metadata } from 'next';
import { ForgotPage } from '@/features/auth/components/auth-pages';
import { t } from '@/i18n';

export const metadata: Metadata = {
  title: t('auth.forgot.title'),
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ForgotPage />;
}

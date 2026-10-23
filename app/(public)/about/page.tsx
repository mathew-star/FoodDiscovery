import type { Metadata } from 'next';
import { ProsePage } from '@/features/content/components/prose-page';
import { t } from '@/i18n';

export const metadata: Metadata = {
  title: t('about.title'),
  description: t('about.metaDescription'),
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <ProsePage
      title={t('about.title')}
      intro={t('about.intro')}
      sections={[
        { title: t('about.dishFirstTitle'), body: t('about.dishFirstBody') },
        { title: t('about.factsTitle'), body: t('about.factsBody') },
        { title: t('about.honestTitle'), body: t('about.honestBody') },
        { title: t('about.guestTitle'), body: t('about.guestBody') },
      ]}
    />
  );
}

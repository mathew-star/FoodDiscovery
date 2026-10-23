import type { Metadata } from 'next';
import { ProsePage } from '@/features/content/components/prose-page';
import { t } from '@/i18n';

export const metadata: Metadata = {
  title: t('guidelines.title'),
  description: t('guidelines.metaDescription'),
  alternates: { canonical: '/guidelines' },
};

export default function GuidelinesPage() {
  const removed = t('guidelines.removeItems').split(' · ');
  return (
    <ProsePage
      title={t('guidelines.title')}
      intro={t('guidelines.intro')}
      sections={[
        { title: t('guidelines.beHonestTitle'), body: t('guidelines.beHonestBody') },
        { title: t('guidelines.discloseTitle'), body: t('guidelines.discloseBody') },
        { title: t('guidelines.scoresTitle'), body: t('guidelines.scoresBody') },
        {
          title: t('guidelines.removeTitle'),
          body: (
            <ul className="list-disc space-y-1 pl-5">
              {removed.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ),
        },
        { title: t('guidelines.enforcementTitle'), body: t('guidelines.enforcementBody') },
        { title: t('guidelines.appealTitle'), body: t('guidelines.appealBody') },
      ]}
    />
  );
}

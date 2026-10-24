import Link from 'next/link';
import { t } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { buttonVariants } from '@/shared/ui/button';
import { cardVariants } from '@/shared/ui/card';
import { JsonLd } from '@/shared/ui/json-ld';
import { faqIds, faqVotes } from '../lib/content';
import { FaqBrowser, type FaqItem } from './faq-browser.client';

const items: FaqItem[] = faqIds.map((id) => ({
  id,
  question: t(`landing.faq.items.${id}.q`),
  answer: t(`landing.faq.items.${id}.a`),
  votes: faqVotes[id],
}));

/** Section 5: fair questions before you trust us. */
export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="relative border-b-4 border-ink py-16 md:py-24">
      <JsonLd
        data={{
          '@type': 'FAQPage',
          mainEntity: items.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: { '@type': 'Answer', text: item.answer },
          })),
        }}
      />
      <div className="mx-auto grid max-w-[1360px] grid-cols-1 items-start gap-10 px-5 md:px-10 lg:grid-cols-12 lg:gap-14">
        <FaqBrowser
          items={items}
          title={
            <h2 id="faq-title" className="type-display-l">
              {t('landing.faq.title')}
            </h2>
          }
          aside={
            <div className={cn(cardVariants({ size: 'md', tone: 'ink' }), 'rounded-card p-5')}>
              <h3 className="type-title-s">{t('landing.faq.askTitle')}</h3>
              <p className="mt-1 mb-4 text-sm text-cream/70">{t('landing.faq.askBody')}</p>
              <Link
                href="/c/hyderabad-food"
                className={cn(
                  buttonVariants({ variant: 'dark', size: 'sm' }),
                  'bg-lime text-ink hover:bg-limeBright hover:text-ink',
                )}
              >
                {t('landing.faq.ask')}
              </Link>
            </div>
          }
        />
      </div>
    </section>
  );
}

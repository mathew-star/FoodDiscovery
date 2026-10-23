import Link from 'next/link';
import { defaultCity } from '@/features/geo/schemas/city';
import { t } from '@/i18n';
import { buttonVariants } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';

export default function NotFound() {
  return (
    <main id="main" className="mx-auto flex w-full max-w-[1200px] flex-1 items-center px-4 py-12">
      <EmptyState
        className="w-full"
        stamp={t('notFound.stamp')}
        title={t('notFound.title')}
        body={t('notFound.body')}
        action={
          <Link href={`/${defaultCity}`} className={buttonVariants({ variant: 'haldi' })}>
            {t('notFound.cta')}
          </Link>
        }
      />
    </main>
  );
}

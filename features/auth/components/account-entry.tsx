import Link from 'next/link';
import { t } from '@/i18n';
import { Avatar } from '@/shared/ui/avatar';
import { buttonVariants } from '@/shared/ui/button';
import { getSession } from '../queries/session';
import { SignOutButton } from './sign-out-button.client';

/** Header slot: Sign in for guests, the member's avatar otherwise. Render inside <Suspense>. */
export async function AccountEntry() {
  const session = await getSession();
  if (!session) {
    return (
      <Link href="/login" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
        {t('auth.signIn.submit')}
      </Link>
    );
  }
  return (
    <Link href="/saved" aria-label={t('auth.account.label', { name: session.name })} className="rounded-full">
      <Avatar name={session.name} size="md" />
    </Link>
  );
}

/** Account block on /saved: who is signed in and a way out, or a reason to sign in. */
export async function AccountPanel() {
  const session = await getSession();
  if (!session) {
    return (
      <p className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-inkMuted">{t('auth.account.guest')}</span>
        <Link href="/login?next=%2Fsaved" className={buttonVariants({ variant: 'dark', size: 'sm' })}>
          {t('auth.signIn.submit')}
        </Link>
      </p>
    );
  }
  return (
    <p className="flex flex-wrap items-center gap-3 text-sm">
      <span>{t('auth.account.signedInAs', { email: session.email })}</span>
      <SignOutButton />
    </p>
  );
}

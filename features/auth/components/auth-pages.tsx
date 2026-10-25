import Link from 'next/link';
import { redirect } from 'next/navigation';
import { t } from '@/i18n';
import { safeNextPath } from '@/shared/lib/safe-next';
import { getSession } from '../queries/session';
import { AuthCard } from './auth-card';
import { ForgotForm } from './forgot-form.client';
import { GoogleButton, OrDivider } from './google-button';
import { ResetForm } from './reset-form.client';
import { SignInForm } from './sign-in-form.client';
import { SignUpForm } from './sign-up-form.client';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

const linkClass = 'underline underline-offset-4 hover:text-terracottaDeep';

async function nextFrom(searchParams: SearchParams) {
  const next = safeNextPath(first((await searchParams).next));
  // Signed-in members never see the auth forms; they go where they were heading.
  if (await getSession()) redirect(next);
  return next;
}

const withNext = (path: string, next: string) => `${path}?${new URLSearchParams({ next })}`;

export async function SignInPage({ searchParams }: { searchParams: SearchParams }) {
  const next = await nextFrom(searchParams);
  const verifyFailed = first((await searchParams).error) !== undefined;
  return (
    <AuthCard
      title={t('auth.signIn.title')}
      intro={verifyFailed ? t('auth.errors.invalidToken') : t('auth.signIn.intro')}
      footer={
        <p>
          {t('auth.signIn.newHere')}{' '}
          <Link href={withNext('/login/create', next)} className={linkClass}>
            {t('auth.signUp.title')}
          </Link>
        </p>
      }
    >
      <SignInForm next={next} />
      <OrDivider />
      <GoogleButton />
    </AuthCard>
  );
}

export async function SignUpPage({ searchParams }: { searchParams: SearchParams }) {
  const next = await nextFrom(searchParams);
  return (
    <AuthCard
      title={t('auth.signUp.title')}
      intro={t('auth.signUp.intro')}
      footer={
        <p>
          {t('auth.signUp.haveAccount')}{' '}
          <Link href={withNext('/login', next)} className={linkClass}>
            {t('auth.signIn.submit')}
          </Link>
        </p>
      }
    >
      <SignUpForm next={next} />
      <OrDivider />
      <GoogleButton />
    </AuthCard>
  );
}

export function ForgotPage() {
  return (
    <AuthCard
      title={t('auth.forgot.title')}
      intro={t('auth.forgot.intro')}
      footer={
        <Link href="/login" className={linkClass}>
          {t('auth.forgot.back')}
        </Link>
      }
    >
      <ForgotForm />
    </AuthCard>
  );
}

export async function ResetPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const token = first(params.error) ? null : (first(params.token) ?? null);
  return (
    <AuthCard
      title={t('auth.reset.title')}
      intro={t('auth.reset.intro')}
      footer={
        <Link href="/login/forgot" className={linkClass}>
          {t('auth.reset.again')}
        </Link>
      }
    >
      <ResetForm token={token} />
    </AuthCard>
  );
}

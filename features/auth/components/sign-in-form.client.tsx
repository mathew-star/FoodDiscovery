'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { t } from '@/i18n';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { authClient } from '../lib/auth-client';
import { authErrorMessage } from '../lib/auth-errors';
import { onboardingPath } from '../lib/onboarding-path';
import { FormField, FormMessage } from './auth-card';

/** Spec W2.3 as D1: email + password; an unverified account gets a fresh link instead of a session. */
export function SignInForm({ next }: { next: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    setNotice(null);
    const { error: failure } = await authClient.signIn.email({
      email: String(form.get('email') ?? ''),
      password: String(form.get('password') ?? ''),
      callbackURL: onboardingPath(next),
    });
    setPending(false);
    if (failure) {
      if (failure.code === 'EMAIL_NOT_VERIFIED') setNotice(t('auth.signIn.verifyAgain'));
      else setError(authErrorMessage(failure));
      return;
    }
    // Onboarding forwards straight to `next` once the profile is complete.
    router.replace(onboardingPath(next));
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} noValidate={false} className="flex flex-col gap-4">
      {error ? <FormMessage tone="error">{error}</FormMessage> : null}
      {notice ? <FormMessage tone="success">{notice}</FormMessage> : null}
      <FormField id="sign-in-email" label={t('auth.fields.email')}>
        <Input id="sign-in-email" name="email" type="email" autoComplete="email" required inputMode="email" />
      </FormField>
      <FormField id="sign-in-password" label={t('auth.fields.password')}>
        <Input
          id="sign-in-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </FormField>
      <Link
        href="/login/forgot"
        className="self-end text-xs underline underline-offset-4 hover:text-terracottaDeep"
      >
        {t('auth.signIn.forgot')}
      </Link>
      <Button type="submit" variant="primary" disabled={pending} className="w-full">
        {pending ? t('auth.signIn.pending') : t('auth.signIn.submit')}
      </Button>
    </form>
  );
}

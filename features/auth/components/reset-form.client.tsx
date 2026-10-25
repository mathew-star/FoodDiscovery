'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { t } from '@/i18n';
import { Button, buttonVariants } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { authClient } from '../lib/auth-client';
import { authErrorMessage } from '../lib/auth-errors';
import { checkPassword, passwordMinLength } from '../lib/password-policy';
import { FormField, FormMessage } from './auth-card';

/** Sets a new password from the emailed link; every other session is signed out (D2). */
export function ResetForm({ token }: { token: string | null }) {
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token) return <FormMessage tone="error">{t('auth.errors.invalidToken')}</FormMessage>;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = String(new FormData(event.currentTarget).get('password') ?? '');
    const problem = checkPassword(password);
    if (problem) {
      setError(t(`auth.errors.password.${problem}`));
      return;
    }
    setPending(true);
    const { error: failure } = await authClient.resetPassword({ newPassword: password, token: token ?? '' });
    setPending(false);
    if (failure) setError(authErrorMessage(failure));
    else setDone(true);
  }

  if (done) {
    return (
      <div className="flex flex-col gap-4">
        <FormMessage tone="success">{t('auth.reset.done')}</FormMessage>
        <Link href="/login" className={buttonVariants({ variant: 'primary' })}>
          {t('auth.signIn.submit')}
        </Link>
      </div>
    );
  }
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {error ? <FormMessage tone="error">{error}</FormMessage> : null}
      <FormField
        id="reset-password"
        label={t('auth.fields.newPassword')}
        hint={t('auth.fields.passwordHint', { min: passwordMinLength })}
      >
        <Input
          id="reset-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={passwordMinLength}
          aria-describedby="reset-password-hint"
        />
      </FormField>
      <Button type="submit" variant="primary" disabled={pending} className="w-full">
        {t('auth.reset.submit')}
      </Button>
    </form>
  );
}

'use client';

import { useState, type FormEvent } from 'react';
import { t } from '@/i18n';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { authClient } from '../lib/auth-client';
import { authErrorMessage } from '../lib/auth-errors';
import { checkPassword, passwordMinLength } from '../lib/password-policy';
import { FormField, FormMessage } from './auth-card';

/** Account creation (D1/D2). The account is usable after the emailed link is opened. */
export function SignUpForm({ next }: { next: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');
    const problem = checkPassword(password, email);
    setPasswordError(problem ? t(`auth.errors.password.${problem}`) : null);
    if (problem) return;

    setPending(true);
    setError(null);
    const { error: failure } = await authClient.signUp.email({
      name: String(form.get('name') ?? '').trim(),
      email,
      password,
      callbackURL: next,
    });
    setPending(false);
    if (failure) setError(authErrorMessage(failure));
    else setSentTo(email);
  }

  async function resend() {
    if (!sentTo) return;
    const { error: failure } = await authClient.sendVerificationEmail({ email: sentTo, callbackURL: next });
    setError(failure ? authErrorMessage(failure) : null);
  }

  if (sentTo) {
    return (
      <div className="flex flex-col gap-4">
        <FormMessage tone="success">{t('auth.signUp.checkEmail', { email: sentTo })}</FormMessage>
        <p className="text-sm text-inkMuted">{t('auth.signUp.checkEmailHint')}</p>
        {error ? <FormMessage tone="error">{error}</FormMessage> : null}
        <Button variant="outline" onClick={resend}>
          {t('auth.signUp.resend')}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {error ? <FormMessage tone="error">{error}</FormMessage> : null}
      <FormField id="sign-up-name" label={t('auth.fields.name')}>
        <Input id="sign-up-name" name="name" autoComplete="name" required maxLength={60} />
      </FormField>
      <FormField id="sign-up-email" label={t('auth.fields.email')}>
        <Input id="sign-up-email" name="email" type="email" autoComplete="email" required inputMode="email" />
      </FormField>
      <FormField
        id="sign-up-password"
        label={t('auth.fields.newPassword')}
        hint={t('auth.fields.passwordHint', { min: passwordMinLength })}
        error={passwordError}
      >
        <Input
          id="sign-up-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={passwordMinLength}
          aria-invalid={passwordError ? true : undefined}
          aria-describedby={
            passwordError ? 'sign-up-password-hint sign-up-password-error' : 'sign-up-password-hint'
          }
        />
      </FormField>
      <Button type="submit" variant="primary" disabled={pending} className="w-full">
        {pending ? t('auth.signUp.pending') : t('auth.signUp.submit')}
      </Button>
      <p className="text-xs text-inkMuted">{t('auth.signUp.terms')}</p>
    </form>
  );
}

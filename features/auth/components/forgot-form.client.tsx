'use client';

import { useState, type FormEvent } from 'react';
import { t } from '@/i18n';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { authClient } from '../lib/auth-client';
import { authErrorMessage } from '../lib/auth-errors';
import { FormField, FormMessage } from './auth-card';

/** Always answers the same way, so the form never reveals which emails have accounts. */
export function ForgotForm() {
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    const { error: failure } = await authClient.requestPasswordReset({
      email: String(form.get('email') ?? '').trim(),
      redirectTo: '/login/reset',
    });
    setPending(false);
    if (failure?.status === 429) setError(authErrorMessage(failure));
    else setSent(true);
  }

  if (sent) return <FormMessage tone="success">{t('auth.forgot.sent')}</FormMessage>;
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {error ? <FormMessage tone="error">{error}</FormMessage> : null}
      <FormField id="forgot-email" label={t('auth.fields.email')}>
        <Input id="forgot-email" name="email" type="email" autoComplete="email" required inputMode="email" />
      </FormField>
      <Button type="submit" variant="primary" disabled={pending} className="w-full">
        {t('auth.forgot.submit')}
      </Button>
    </form>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { t } from '@/i18n';
import { Button } from '@/shared/ui/button';
import { authClient } from '../lib/auth-client';

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await authClient.signOut();
        router.refresh();
      }}
    >
      {t('auth.account.signOut')}
    </Button>
  );
}

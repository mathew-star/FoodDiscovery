'use client';

import { useState } from 'react';
import { t } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { buttonVariants } from '@/shared/ui/button';
import { useToast } from '@/shared/ui/toast.client';
import { signInPath } from '@/shared/config/site';

/**
 * Guest save on the landing demo (spec W2 step 1): saving never needs an account, and the toast
 * explains how to keep it everywhere. Real device saves arrive with P2 (E9-1).
 */
export function GuestSaveButton({ label, className }: { label: string; className?: string }) {
  const toast = useToast();
  const [saved, setSaved] = useState(false);

  function save() {
    setSaved(true);
    toast({
      message: t('intent.saved'),
      action: {
        label: t('intent.signIn'),
        href: `${signInPath}?next=${encodeURIComponent(window.location.pathname)}`,
      },
    });
  }

  return (
    <button
      type="button"
      onClick={save}
      className={cn(buttonVariants({ variant: 'dark', size: 'sm' }), className)}
    >
      {saved ? t('landing.community.post.saved') : label}
    </button>
  );
}

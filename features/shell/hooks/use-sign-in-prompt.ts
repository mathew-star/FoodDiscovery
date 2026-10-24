import { useCallback } from 'react';
import { t } from '@/i18n';
import { signInPath } from '@/shared/config/site';
import { useToast } from '@/shared/ui/toast.client';

/**
 * Sign-in at the moment of intent (spec W2, DESIGN-SYSTEM §9.1): reading never needs an account;
 * a write action shows why to sign in and links back to where the guest was.
 */
export function useSignInPrompt(): (message: string) => void {
  const toast = useToast();
  return useCallback(
    (message: string) => {
      const next = `${window.location.pathname}${window.location.search}`;
      toast({
        message,
        action: { label: t('intent.signIn'), href: `${signInPath}?next=${encodeURIComponent(next)}` },
      });
    },
    [toast],
  );
}

'use client';

import { Plus } from 'lucide-react';
import { t } from '@/i18n';
import { Button } from '@/shared/ui/button';
import { useSignInPrompt } from '../hooks/use-sign-in-prompt';

/** Posting needs an account; for guests the button explains that (spec §3.1, W2). */
export function PostButton({ variant }: { variant: 'header' | 'bottom-nav' }) {
  const prompt = useSignInPrompt();
  const onClick = () => prompt(t('intent.post'));

  if (variant === 'bottom-nav') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={t('nav.createPost')}
        className="-mt-5 flex size-14 press items-center justify-center rounded-2xl border-2 border-ink bg-terracottaDeep text-paper shadow-brutal"
      >
        <Plus aria-hidden="true" className="size-6" strokeWidth={3} />
      </button>
    );
  }

  return (
    <Button size="sm" onClick={onClick}>
      <Plus aria-hidden="true" strokeWidth={3} />
      {t('nav.post')}
    </Button>
  );
}

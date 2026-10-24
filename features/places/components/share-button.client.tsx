'use client';

import { Share2 } from 'lucide-react';
import { t } from '@/i18n';
import { Button, type ButtonProps } from '@/shared/ui/button';
import { useToast } from '@/shared/ui/toast.client';

type ShareButtonProps = { title: string; path: string; size?: ButtonProps['size']; className?: string };

/** Web Share API with a copy-link fallback (spec E2-3). */
export function ShareButton({ title, path, size, className }: ShareButtonProps) {
  const toast = useToast();

  async function share() {
    const url = new URL(path, window.location.origin).toString();
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast({ message: t('place.linkCopied') });
    } catch {
      toast({ message: t('place.copyFailed', { url }) });
    }
  }

  return (
    <Button variant="outline" size={size} onClick={share} className={className}>
      <Share2 aria-hidden="true" />
      {t('place.share')}
    </Button>
  );
}

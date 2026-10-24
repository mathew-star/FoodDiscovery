'use client';

import { Smartphone } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { t } from '@/i18n';
import { buttonVariants } from '@/shared/ui/button';
import { useToast } from '@/shared/ui/toast.client';

/** Chromium's install event; not in the DOM typings. */
type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void> };

/** Uses the browser's install prompt when it offers one, otherwise explains the menu path. */
export function InstallButton() {
  const toast = useToast();
  const deferred = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    function capture(event: Event) {
      event.preventDefault();
      deferred.current = event as BeforeInstallPromptEvent;
    }
    window.addEventListener('beforeinstallprompt', capture);
    return () => window.removeEventListener('beforeinstallprompt', capture);
  }, []);

  async function install() {
    const event = deferred.current;
    if (!event) {
      toast({ message: t('landing.cta.installHint') });
      return;
    }
    deferred.current = null;
    await event.prompt();
  }

  return (
    <button type="button" onClick={install} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
      <Smartphone aria-hidden="true" strokeWidth={2.5} />
      {t('landing.cta.install')}
    </button>
  );
}

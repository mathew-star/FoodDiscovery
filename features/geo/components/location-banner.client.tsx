'use client';

import { MapPin } from 'lucide-react';
import { useState } from 'react';
import { track } from '@/features/analytics/lib/track';
import { t } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { requestDeviceLocation, useDeviceLocation } from '../hooks/use-device-location';

/**
 * Soft location ask (DESIGN-SYSTEM §9.6): the browser prompt only opens after a tap, never on paint.
 * The position stays on this phone; distances are worked out in the browser.
 */
export function LocationBanner({ className }: { className?: string }) {
  const location = useDeviceLocation();
  const [state, setState] = useState<'idle' | 'asking' | 'dismissed' | 'denied' | 'unavailable'>('idle');
  if (location || state === 'dismissed') return null;

  async function ask() {
    setState('asking');
    const outcome = await requestDeviceLocation();
    track({ name: 'location_prompt', outcome });
    setState(outcome === 'granted' ? 'idle' : outcome);
  }

  function dismiss() {
    track({ name: 'location_prompt', outcome: 'dismissed' });
    setState('dismissed');
  }

  const blocked = state === 'denied' || state === 'unavailable';
  return (
    <aside
      aria-labelledby="location-banner-title"
      className={cn(
        'flex flex-col gap-3 rounded-panel border-2 border-ink bg-paper p-4 shadow-brutal-sm sm:flex-row sm:items-center',
        className,
      )}
    >
      <MapPin aria-hidden="true" className="size-6 shrink-0" strokeWidth={2.5} />
      <div className="flex min-w-0 grow flex-col gap-0.5">
        <p id="location-banner-title" className="type-title-s">
          {t('location.title')}
        </p>
        <p className="text-xs text-inkMuted" aria-live="polite">
          {blocked ? t(state === 'denied' ? 'location.denied' : 'location.unavailable') : t('location.body')}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        {blocked ? null : (
          <Button variant="dark" size="sm" onClick={ask} disabled={state === 'asking'}>
            {t('location.allow')}
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={dismiss}>
          {t('location.notNow')}
        </Button>
      </div>
    </aside>
  );
}

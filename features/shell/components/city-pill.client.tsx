'use client';

import { ChevronDown } from 'lucide-react';
import { cityNameKey, type CitySlug } from '@/features/geo/schemas/city';
import { t } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { useToast } from '@/shared/ui/toast.client';

/** City switcher (spec §3.1). Hyderabad is the only city in the MVP, so it explains that. */
export function CityPill({ city, className }: { city: CitySlug; className?: string }) {
  const toast = useToast();
  const name = t(cityNameKey[city]);
  return (
    <button
      type="button"
      onClick={() => toast({ message: t('city.onlyCity') })}
      aria-label={t('city.change', { city: name })}
      className={cn(
        'flex min-h-9 items-center gap-2 rounded-full border-[1.5px] border-ink bg-paper px-3 py-1.5 text-xs hover:bg-creamDark',
        className,
      )}
    >
      <span aria-hidden="true" className="size-2 animate-live-dot rounded-full bg-olive" />
      <span>{name}</span>
      <span className="text-inkMuted">{t('city.beta')}</span>
      <ChevronDown aria-hidden="true" className="size-3" strokeWidth={2.5} />
    </button>
  );
}

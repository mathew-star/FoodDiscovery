'use client';

import { t } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { chipVariants } from '@/shared/ui/chip';
import { useToast } from '@/shared/ui/toast.client';
import { setVegOnly, useVegOnly } from '../hooks/use-veg-only';

/**
 * Header diet filter (DESIGN-SYSTEM §7.12). A pressed toggle with a stable name, so the
 * accessible label never contradicts the visible one.
 */
export function DietToggle({ className }: { className?: string }) {
  const vegOnly = useVegOnly();
  const toast = useToast();

  function toggle() {
    setVegOnly(!vegOnly);
    toast({ message: t(vegOnly ? 'diet.showingAll' : 'diet.showingVeg') });
  }

  return (
    <button
      type="button"
      aria-pressed={vegOnly}
      onClick={toggle}
      className={cn(chipVariants({ selected: vegOnly }), 'min-h-9 gap-2', className)}
    >
      <span
        aria-hidden="true"
        className="flex size-4 items-center justify-center rounded-[3px] border-[1.5px] border-oliveDeep bg-paper"
      >
        <span className={cn('size-2 rounded-full', vegOnly ? 'bg-oliveDeep' : 'bg-inkMuted')} />
      </span>
      {t('diet.vegOnly')}
    </button>
  );
}

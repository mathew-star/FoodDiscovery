'use client';

import { Bookmark } from 'lucide-react';
import { track } from '@/features/analytics/lib/track';
import type { AnalyticsSurface } from '@/features/analytics/schemas/events';
import { useSignInPrompt } from '@/features/shell/hooks/use-sign-in-prompt';
import { t } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { Button, type ButtonProps } from '@/shared/ui/button';
import { toggleSave, useDeviceSaves } from '../hooks/use-device-saves';
import type { DeviceSave } from '../lib/device-saves';

type SaveButtonProps = {
  item: Omit<DeviceSave, 'savedAt'>;
  surface: AnalyticsSurface;
  size?: ButtonProps['size'];
  className?: string;
};

/** Guest saves live on this phone (max 20); the 21st asks to sign in (DESIGN-SYSTEM §9.1). */
export function SaveButton({ item, surface, size, className }: SaveButtonProps) {
  const saves = useDeviceSaves();
  const prompt = useSignInPrompt();
  const saved = saves.some((save) => save.kind === item.kind && save.id === item.id);

  function onClick() {
    const outcome = toggleSave({ ...item, savedAt: Date.now() });
    if (outcome === 'full') {
      prompt(t('saves.full'));
      return;
    }
    const on = outcome === 'saved';
    track({
      name: 'save',
      on,
      surface,
      branchId: item.branchId,
      branchDishId: item.kind === 'dish' ? item.id : undefined,
    });
    if (on) prompt(t('intent.saved'));
  }

  return (
    <Button
      variant="outline"
      size={size}
      aria-pressed={saved}
      onClick={onClick}
      className={cn('aria-pressed:bg-lime', className)}
    >
      <Bookmark aria-hidden="true" className={saved ? 'fill-current' : undefined} />
      {t('saves.save')}
    </Button>
  );
}

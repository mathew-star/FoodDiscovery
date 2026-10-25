'use client';

import { Bookmark } from 'lucide-react';
import { track } from '@/features/analytics/lib/track';
import type { AnalyticsSurface } from '@/features/analytics/schemas/events';
import { useSignInPrompt } from '@/features/shell/hooks/use-sign-in-prompt';
import { t } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { Button, type ButtonProps } from '@/shared/ui/button';
import { useToast } from '@/shared/ui/toast.client';
import { toggleSave, useDeviceSaves } from '../hooks/use-device-saves';
import { setMemberKey, useMemberSaves } from '../hooks/use-member-saves';
import type { DeviceSave } from '../lib/device-saves';
import { saveKey } from '../schemas/save-target';
import { toggleSaveAction } from '../server/actions';

type SaveButtonProps = {
  item: Omit<DeviceSave, 'savedAt'>;
  surface: AnalyticsSurface;
  size?: ButtonProps['size'];
  className?: string;
};

/**
 * Spec E9-1/E9-2. Members save to "Want to try" on their account (optimistic, undone on failure);
 * guests save on this phone (max 20) and the 21st asks to sign in (DESIGN-SYSTEM §9.1).
 */
export function SaveButton({ item, surface, size, className }: SaveButtonProps) {
  const saves = useDeviceSaves();
  const member = useMemberSaves();
  const prompt = useSignInPrompt();
  const toast = useToast();
  const key = saveKey(item);
  const saved = member.signedIn
    ? (member.keys?.has(key) ?? false)
    : saves.some((save) => save.kind === item.kind && save.id === item.id);

  const record = (on: boolean) =>
    track({
      name: 'save',
      on,
      surface,
      branchId: item.branchId,
      branchDishId: item.kind === 'dish' ? item.id : undefined,
    });

  async function saveToAccount() {
    const on = !saved;
    setMemberKey(key, on);
    const result = await toggleSaveAction({ kind: item.kind, id: item.id, branchId: item.branchId });
    if (!result.ok) {
      setMemberKey(key, !on);
      toast({ message: result.error.message === 'list_full' ? t('saves.listFull') : t('saves.failed') });
      return;
    }
    record(result.data.saved);
    if (result.data.saved)
      toast({ message: t('saves.savedToList'), action: { label: t('saves.open'), href: '/saved' } });
  }

  function onClick() {
    if (member.signedIn) {
      void saveToAccount();
      return;
    }
    const outcome = toggleSave({ ...item, savedAt: Date.now() });
    if (outcome === 'full') {
      prompt(t('saves.full'));
      return;
    }
    const on = outcome === 'saved';
    record(on);
    if (on) prompt(t('intent.saved'));
  }

  return (
    <Button
      variant="outline"
      size={size}
      aria-pressed={saved}
      onClick={onClick}
      disabled={member.signedIn && member.keys === null}
      className={cn('aria-pressed:bg-lime', className)}
    >
      <Bookmark aria-hidden="true" className={saved ? 'fill-current' : undefined} />
      {t('saves.save')}
    </Button>
  );
}

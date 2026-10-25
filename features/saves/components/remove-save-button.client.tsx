'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { t } from '@/i18n';
import { Button } from '@/shared/ui/button';
import { useToast } from '@/shared/ui/toast.client';
import { setMemberKey } from '../hooks/use-member-saves';
import { saveKey, type SaveTarget } from '../schemas/save-target';
import { toggleSaveAction } from '../server/actions';

export function RemoveSaveButton({ target, name }: { target: SaveTarget; name: string }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await toggleSaveAction(target);
          if (!result.ok) {
            toast({ message: t('saves.failed') });
            return;
          }
          setMemberKey(saveKey(target), result.data.saved);
          router.refresh();
        })
      }
    >
      {t('saves.remove')}
      <span className="sr-only">{name}</span>
    </Button>
  );
}

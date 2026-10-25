'use client';

import { useEffect } from 'react';
import { t } from '@/i18n';
import { useToast } from '@/shared/ui/toast.client';
import { clearDeviceSaves, readDeviceSaves } from '../hooks/use-device-saves';
import { markSignedIn, markSignedOut } from '../hooks/use-member-saves';
import { importDeviceSavesAction, listSavedKeysAction } from '../server/actions';

/**
 * Mounted once per page for signed-in members. Moves any saves left on this phone into the account
 * (spec E1-4), then loads the account's saved keys for Save buttons.
 */
export function MemberSyncClient() {
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    markSignedIn(null);
    (async () => {
      const device = readDeviceSaves();
      if (device.length > 0) {
        const result = await importDeviceSavesAction(
          device.map(({ kind, id, branchId }) => ({ kind, id, branchId })),
        );
        if (result.ok) {
          clearDeviceSaves();
          if (result.data.imported > 0 && !cancelled) {
            toast({
              message:
                result.data.imported === 1
                  ? t('saves.importedOne')
                  : t('saves.imported', { count: result.data.imported }),
              action: { label: t('saves.open'), href: '/saved' },
            });
          }
        }
      }
      const keys = await listSavedKeysAction();
      if (!cancelled && keys.ok) markSignedIn(keys.data);
    })();
    return () => {
      cancelled = true;
      markSignedOut();
    };
  }, [toast]);

  return null;
}

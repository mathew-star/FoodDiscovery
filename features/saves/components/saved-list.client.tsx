'use client';

import Link from 'next/link';
import { DietMark } from '@/features/dishes/components/diet-mark';
import { t } from '@/i18n';
import { buttonVariants } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { toggleSave, useDeviceSaves } from '../hooks/use-device-saves';
import { deviceSaveLimit, type DeviceSave } from '../lib/device-saves';

/** The guest's saves on this phone (spec W2). Nothing here is sent to the server. */
export function SavedList({ discoverHref }: { discoverHref: string }) {
  const saves = useDeviceSaves();
  if (saves.length === 0) {
    return (
      <EmptyState
        title={t('saves.emptyTitle')}
        body={t('saves.emptyBody')}
        action={
          <Link href={discoverHref} className={buttonVariants({ variant: 'primary' })}>
            {t('saves.emptyAction')}
          </Link>
        }
      />
    );
  }

  const groups: { kind: DeviceSave['kind']; title: string }[] = [
    { kind: 'dish', title: t('saves.dishes') },
    { kind: 'branch', title: t('saves.places') },
  ];
  return (
    <div className="flex flex-col gap-8">
      <p className="text-sm text-inkMuted">
        {t('saves.count', { count: saves.length, limit: deviceSaveLimit })}
      </p>
      {groups.map(({ kind, title }) => {
        const items = saves.filter((save) => save.kind === kind);
        if (items.length === 0) return null;
        return (
          <section key={kind} aria-labelledby={`saved-${kind}`} className="flex flex-col gap-3">
            <h2 id={`saved-${kind}`} className="type-title-m">
              {title}
            </h2>
            <ul className="divide-y-2 divide-dashed divide-ink/15 border-y-2 border-ink">
              {items.map((save) => (
                <li
                  key={save.id}
                  data-diet={save.diet ?? undefined}
                  className="flex items-center justify-between gap-3 px-1 py-3"
                >
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <Link
                      href={save.href}
                      className="truncate text-base hover:underline hover:underline-offset-4"
                    >
                      {save.name}
                    </Link>
                    <p className="flex items-center gap-2 text-[11px] text-inkMuted">
                      {save.diet ? <DietMark diet={save.diet} /> : null}
                      <span className="truncate">{save.detail}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSave(save)}
                    className={buttonVariants({ variant: 'outline', size: 'sm' })}
                  >
                    {t('saves.remove')}
                    <span className="sr-only">{save.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

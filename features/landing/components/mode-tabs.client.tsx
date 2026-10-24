'use client';

import Link from 'next/link';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { t } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { buttonVariants } from '@/shared/ui/button';
import { cardVariants } from '@/shared/ui/card';
import { ModeTab, ModeTabsList, TabsPanel, TabsRoot } from '@/shared/ui/tabs.client';
import { modeIds, type ModeId } from '../lib/content';

export type ModePanel = { id: ModeId; route: string; content: ReactNode };

const SetRouteContext = createContext<(id: ModeId, route: string) => void>(() => undefined);

/** Lets a panel change the route shown in the preview's address bar (e.g. the chosen mood). */
export function useSetModeRoute() {
  return useContext(SetRouteContext);
}

/**
 * Section 2B: each mode previews a real product page; the address bar shows the route the
 * visitor lands on (DESIGN-SYSTEM §7.4).
 */
export function ModeTabs({ panels, host }: { panels: ModePanel[]; host: string }) {
  const [active, setActive] = useState<ModeId>('xray');
  const [routes, setRoutes] = useState(
    () => Object.fromEntries(panels.map((panel) => [panel.id, panel.route])) as Record<ModeId, string>,
  );
  const setRoute = useCallback(
    (id: ModeId, route: string) =>
      setRoutes((current) => (current[id] === route ? current : { ...current, [id]: route })),
    [],
  );
  const route = routes[active];

  return (
    <SetRouteContext value={setRoute}>
      <TabsRoot
        value={active}
        onValueChange={(value) => {
          const next = modeIds.find((id) => id === value);
          if (next) setActive(next);
        }}
        orientation="vertical"
        className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8"
      >
        <ModeTabsList aria-label={t('landing.modes.tabsLabel')} className="min-w-0 lg:col-span-4">
          {modeIds.map((id) => (
            <ModeTab
              key={id}
              value={id}
              title={t(`landing.modes.tabs.${id}.title`)}
              description={t(`landing.modes.tabs.${id}.description`)}
            />
          ))}
        </ModeTabsList>

        <div className={cn(cardVariants({ size: 'lg' }), 'min-w-0 overflow-hidden lg:col-span-8')}>
          <div className="flex items-center gap-3 border-b-2 border-ink bg-creamDark px-4 py-2.5">
            <span aria-hidden="true" className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-terracotta" />
              <span className="size-2.5 rounded-full bg-saffron" />
              <span className="size-2.5 rounded-full bg-olive" />
            </span>
            <span className="grow truncate rounded-full border border-ink/40 bg-paper px-3 py-1 text-xs">
              {host}
              {route}
            </span>
          </div>

          {panels.map((panel) => (
            <TabsPanel key={panel.id} value={panel.id} keepMounted className="p-5 sm:p-7">
              {panel.content}
            </TabsPanel>
          ))}

          <div className="flex items-center justify-between gap-3 border-t-2 border-ink bg-cream px-5 py-4 sm:px-7">
            <span className="text-sm text-inkMuted">{t(`landing.modes.tabs.${active}.note`)}</span>
            <Link href={route} className={cn(buttonVariants({ size: 'sm' }), 'shadow-brutal-sm')}>
              {t('landing.modes.openPage')}
            </Link>
          </div>
        </div>
      </TabsRoot>
    </SetRouteContext>
  );
}

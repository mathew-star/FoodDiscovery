'use client';

import { useState } from 'react';
import { track } from '@/features/analytics/lib/track';
import type { AnalyticsSurface } from '@/features/analytics/schemas/events';
import { t } from '@/i18n';
import { ChipButton } from '@/shared/ui/chip';
import { contextChipIds, contextChipLabelKey, type ContextChipId } from '../schemas/context-chips';

type ContextChipsProps = {
  surface: AnalyticsSurface;
  /** Controlled selection (search results apply chips in place). */
  selected?: readonly ContextChipId[];
  onToggle?: (chip: ContextChipId, on: boolean) => void;
};

/**
 * Context chips (spec E4-3, DESIGN-SYSTEM §7.2): toggle buttons. Uncontrolled inside a search form,
 * pressed chips submit as `chip` fields with the query.
 */
export function ContextChips({ surface, selected, onToggle }: ContextChipsProps) {
  const [own, setOwn] = useState<readonly ContextChipId[]>([]);
  const pressed = selected ?? own;

  function toggle(chip: ContextChipId) {
    const on = !pressed.includes(chip);
    if (!selected) setOwn(on ? [...own, chip] : own.filter((id) => id !== chip));
    onToggle?.(chip, on);
    track({ name: 'chip_toggle', chip, on, surface });
  }

  return (
    <div
      role="group"
      aria-label={t('chips.label')}
      className="-mx-5 no-scrollbar overflow-x-auto px-5 sm:mx-0 sm:px-0"
    >
      <ul className="flex w-max gap-2 py-1 sm:w-auto sm:flex-wrap">
        {contextChipIds.map((chip) => (
          <li key={chip}>
            <ChipButton selected={pressed.includes(chip)} onClick={() => toggle(chip)}>
              {t(contextChipLabelKey[chip])}
            </ChipButton>
          </li>
        ))}
      </ul>
      {selected ? null : own.map((chip) => <input key={chip} type="hidden" name="chip" value={chip} />)}
    </div>
  );
}

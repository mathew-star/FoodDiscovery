import type { CitySlug } from '@/features/geo/schemas/city';
import { contextChipIds, contextChipLabelKey } from '@/features/search/schemas/context-chips';
import { t } from '@/i18n';
import { ChipLink } from '@/shared/ui/chip';

/** Context chips (spec E4-3). Links until P2 search applies them in place as toggles (DESIGN-SYSTEM §7.2). */
export function ContextChips({ city }: { city: CitySlug }) {
  return (
    <nav aria-label={t('chips.label')} className="-mx-5 no-scrollbar overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <ul className="flex w-max gap-2 py-1 sm:w-auto sm:flex-wrap">
        {contextChipIds.map((id) => (
          <li key={id}>
            <ChipLink href={{ pathname: `/${city}/search`, query: { chip: id } }} prefetch={false}>
              {t(contextChipLabelKey[id])}
            </ChipLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

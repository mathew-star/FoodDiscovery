import type { CitySlug } from '@/features/geo/schemas/city';
import { contextChipIds, contextChipLabelKey } from '@/features/search/schemas/context-chips';
import { t } from '@/i18n';
import { ChipLink } from '@/shared/ui/chip';

export function ContextChips({ city }: { city: CitySlug }) {
  return (
    <nav aria-label={t('chips.label')} className="-mx-4 [scrollbar-width:none] overflow-x-auto px-4">
      <ul className="flex w-max gap-2 py-1">
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

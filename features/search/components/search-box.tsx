import Form from 'next/form';
import { Search } from 'lucide-react';
import type { CitySlug } from '@/features/geo/schemas/city';
import { t } from '@/i18n';
import { cn } from '@/shared/lib/cn';

/** Compact header search (spec §3.1 desktop). The large command bar is `CommandBar`. */
export function SearchBox({ city, className }: { city: CitySlug; className?: string }) {
  return (
    <Form action={`/${city}/search`} prefetch={false} role="search" className={cn('w-full', className)}>
      <label htmlFor="header-search" className="sr-only">
        {t('search.label')}
      </label>
      <div className="flex h-10 items-center gap-2 rounded-2xl border-2 border-ink bg-paper pl-3 focus-within:ring-4 focus-within:ring-lime">
        <Search aria-hidden="true" className="size-4 shrink-0" strokeWidth={2.5} />
        <input
          id="header-search"
          name="q"
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          placeholder={t('search.placeholder')}
          className="h-full min-w-0 flex-1 bg-transparent pr-3 text-sm outline-none placeholder:text-inkMuted"
        />
      </div>
    </Form>
  );
}

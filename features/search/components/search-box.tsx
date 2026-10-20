import Form from 'next/form';
import { Search } from 'lucide-react';
import type { CitySlug } from '@/features/geo/schemas/city';
import { t } from '@/i18n';
import { cn } from '@/shared/lib/cn';

type SearchBoxProps = { city: CitySlug; className?: string; size?: 'md' | 'lg' };

export function SearchBox({ city, className, size = 'md' }: SearchBoxProps) {
  return (
    <Form action={`/${city}/search`} role="search" className={cn('relative w-full', className)}>
      <label htmlFor={`search-${size}`} className="sr-only">
        {t('search.label')}
      </label>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted"
      />
      <input
        id={`search-${size}`}
        name="q"
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        placeholder={t('search.placeholder')}
        className={cn(
          'w-full rounded-full border border-border-strong bg-surface pr-4 pl-10 text-text placeholder:text-muted hover:border-text',
          size === 'lg' ? 'h-12 text-base' : 'h-10 text-sm',
        )}
      />
    </Form>
  );
}

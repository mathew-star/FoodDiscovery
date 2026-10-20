import Form from 'next/form';
import { ArrowRight, Search } from 'lucide-react';
import type { CitySlug } from '@/features/geo/schemas/city';
import { t } from '@/i18n';
import { cn } from '@/shared/lib/cn';

type SearchBoxProps = { city: CitySlug; className?: string; size?: 'md' | 'lg' };

export function SearchBox({ city, className, size = 'md' }: SearchBoxProps) {
  const large = size === 'lg';
  return (
    <Form action={`/${city}/search`} role="search" className={cn('relative w-full', className)}>
      <label htmlFor={`search-${size}`} className="sr-only">
        {t('search.label')}
      </label>
      <div
        className={cn(
          'flex items-center gap-2 border-2 border-ink bg-raised focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-haldi',
          large ? 'h-14 pl-4 shadow-lift' : 'h-10 pl-3',
        )}
      >
        <Search aria-hidden="true" className={cn('shrink-0 text-ink-soft', large ? 'size-6' : 'size-4')} />
        <input
          id={`search-${size}`}
          name="q"
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          placeholder={t('search.placeholder')}
          className={cn(
            'h-full min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-ink-soft focus-visible:shadow-none focus-visible:outline-none',
            large ? 'text-lg' : 'text-sm',
          )}
        />
        {large ? (
          <button
            type="submit"
            aria-label={t('search.submit')}
            className="flex h-full w-14 shrink-0 items-center justify-center border-l-2 border-ink bg-ink text-on-ink"
          >
            <ArrowRight aria-hidden="true" className="size-6" />
          </button>
        ) : null}
      </div>
    </Form>
  );
}

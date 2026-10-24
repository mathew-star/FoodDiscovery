import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export type Crumb = { href: string; label: string };

export function Breadcrumbs({ items, label }: { items: Crumb[]; label: string }) {
  return (
    <nav aria-label={label} className="text-xs text-inkMuted">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-1">
              {last ? (
                <span aria-current="page" className="text-ink">
                  {item.label}
                </span>
              ) : (
                <>
                  <Link href={item.href} className="underline-offset-4 hover:text-ink hover:underline">
                    {item.label}
                  </Link>
                  <ChevronRight aria-hidden="true" className="size-3.5" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

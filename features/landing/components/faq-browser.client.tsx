'use client';

import { Search } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { t } from '@/i18n';
import { AccordionItem } from '@/shared/ui/accordion';
import { Badge } from '@/shared/ui/badge';

export type FaqItem = { id: string; question: string; answer: string; votes: number };

type FaqBrowserProps = { title: ReactNode; aside: ReactNode; items: FaqItem[] };

const matches = (item: FaqItem, query: string) =>
  !query || `${item.question} ${item.answer}`.toLowerCase().includes(query);

/** FAQ styled as an "Ask Hyderabad" thread (DESIGN-SYSTEM §7.13) with instant search. */
export function FaqBrowser({ title, aside, items }: FaqBrowserProps) {
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);
  const normalized = query.trim().toLowerCase();
  const visible = items.filter((item) => matches(item, normalized));

  function search(value: string) {
    setQuery(value);
    const next = value.trim().toLowerCase();
    if (next) setOpenId(items.find((item) => matches(item, next))?.id ?? null);
  }

  return (
    <>
      <div className="space-y-6 lg:sticky lg:top-28 lg:col-span-4">
        {title}
        <div>
          <label htmlFor="faq-search" className="sr-only">
            {t('landing.faq.searchLabel')}
          </label>
          <div className="flex items-center rounded-2xl border-2 border-ink bg-paper px-3 shadow-brutal-sm focus-within:ring-4 focus-within:ring-lime">
            <Search aria-hidden="true" className="size-5 shrink-0" strokeWidth={2.5} />
            <input
              id="faq-search"
              type="search"
              value={query}
              onChange={(event) => search(event.target.value)}
              placeholder={t('landing.faq.searchPlaceholder')}
              className="w-full bg-transparent px-2 py-3 text-sm outline-none placeholder:text-inkMuted"
            />
          </div>
          <p aria-live="polite" className="mt-3 text-sm empty:hidden">
            {visible.length === 0 ? t('landing.faq.empty') : null}
          </p>
        </div>
        {aside}
      </div>

      <div className="space-y-3 lg:col-span-8">
        {items.map((item) => (
          <AccordionItem
            key={item.id}
            name="faq"
            hidden={!matches(item, normalized)}
            open={openId === item.id}
            onToggle={(event) => {
              const isOpen = event.currentTarget.open;
              setOpenId((current) => (isOpen ? item.id : current === item.id ? null : current));
            }}
            summary={item.question}
            leading={
              <span className="hidden w-12 shrink-0 flex-col items-center text-xs sm:flex">
                <span aria-hidden="true">▲</span>
                <span aria-hidden="true">{item.votes}</span>
                <span className="sr-only">{t('landing.faq.votes', { count: item.votes })}</span>
              </span>
            }
          >
            <div className="px-4 pb-5 sm:px-5 sm:pl-[88px]">
              <Badge tone="olive">{t('landing.faq.answered')}</Badge>
              <p className="mt-2 max-w-prose leading-relaxed text-inkMuted">{item.answer}</p>
            </div>
          </AccordionItem>
        ))}
      </div>
    </>
  );
}

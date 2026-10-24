import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { cardVariants } from '@/shared/ui/card';

type Section = { id?: string; title: string; body: ReactNode };

export function ProsePage({ title, intro, sections }: { title: string; intro: string; sections: Section[] }) {
  return (
    <article className="grid gap-12 lg:grid-cols-12">
      <header className="flex flex-col gap-5 lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
        <h1 className="type-display-xl">{title}</h1>
        <p className="max-w-md text-lg leading-relaxed text-inkMuted">{intro}</p>
      </header>
      <ol
        className={cn(cardVariants({ size: 'lg' }), 'divide-y-2 divide-dashed divide-ink/25 lg:col-span-7')}
      >
        {sections.map((section, index) => (
          <li key={section.title} id={section.id} className="flex scroll-mt-28 gap-5 p-6 md:p-8">
            <span
              aria-hidden="true"
              className="font-display text-3xl leading-none font-extrabold text-inkMuted"
            >
              {index + 1}
            </span>
            <section className="flex flex-col gap-2">
              <h2 className="type-title-m">{section.title}</h2>
              <div className="max-w-prose leading-relaxed">{section.body}</div>
            </section>
          </li>
        ))}
      </ol>
    </article>
  );
}

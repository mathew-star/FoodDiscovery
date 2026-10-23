import type { ReactNode } from 'react';

type Section = { title: string; body: ReactNode };

export function ProsePage({ title, intro, sections }: { title: string; intro: string; sections: Section[] }) {
  return (
    <article className="grid gap-12 py-2 lg:grid-cols-[0.9fr_1.1fr]">
      <header className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
        <h1 className="rise-in text-[clamp(3.2rem,9vw,6.5rem)] leading-[0.88] font-extrabold [font-stretch:72%]">
          {title}
        </h1>
        <p className="max-w-md text-xl text-ink-soft">{intro}</p>
      </header>
      <ol className="flex flex-col border-2 border-ink bg-raised shadow-lift">
        {sections.map((section, index) => (
          <li
            key={section.title}
            className="flex gap-5 border-dashed border-rule-strong p-6 not-last:border-b-2 md:p-8"
          >
            <span
              aria-hidden="true"
              className="font-display text-5xl leading-none font-extrabold text-ink-soft/40 [font-stretch:70%] tabular-nums"
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <section className="flex flex-col gap-2">
              <h2 className="text-3xl font-bold">{section.title}</h2>
              <div className="max-w-prose text-lg leading-relaxed">{section.body}</div>
            </section>
          </li>
        ))}
      </ol>
    </article>
  );
}

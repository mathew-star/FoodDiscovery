import type { ReactNode } from 'react';

type Section = { title: string; body: ReactNode };

export function ProsePage({ title, intro, sections }: { title: string; intro: string; sections: Section[] }) {
  return (
    <article className="mx-auto flex max-w-prose flex-col gap-8 py-2">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold md:text-4xl">{title}</h1>
        <p className="text-lg text-muted">{intro}</p>
      </header>
      {sections.map((section) => (
        <section key={section.title} className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">{section.title}</h2>
          <div className="text-text">{section.body}</div>
        </section>
      ))}
    </article>
  );
}

import { cn } from '@/shared/lib/cn';

type TokenBoardProps = { label: string; items: string[]; className?: string };

export function TokenBoard({ label, items, className }: TokenBoardProps) {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-8 pr-8">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="flex items-center gap-8 whitespace-nowrap">
          <span>{item}</span>
          <span aria-hidden="true" className="text-haldi/60">
            ◆
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <section
      aria-label={label}
      className={cn(
        'group relative flex h-10 items-center overflow-hidden border-y-2 border-ink bg-ink font-mono text-xs tracking-[0.12em] text-haldi uppercase',
        className,
      )}
    >
      <p className="z-10 flex h-full shrink-0 items-center bg-haldi px-3 font-bold text-on-haldi">{label}</p>
      <div className="flex animate-ticker group-focus-within:[animation-play-state:paused] group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {row(false)}
        {row(true)}
      </div>
    </section>
  );
}

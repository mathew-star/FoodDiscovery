import { cn } from '@/shared/lib/cn';

const tones = [
  'bg-haldi text-on-haldi',
  'bg-ink text-on-ink',
  'bg-sunk text-ink',
  'bg-rate-loved text-on-ink',
] as const;

function hash(value: string): number {
  let result = 0;
  for (const char of value) result = (result * 31 + char.charCodeAt(0)) >>> 0;
  return result;
}

function initials(name: string): string {
  const words = name
    .replace(/\(.*?\)/g, '')
    .trim()
    .split(/\s+/)
    .filter((word) => /^[A-Za-z]/.test(word));
  const first = words[0]?.[0] ?? '';
  const second = words.length > 1 ? (words.at(-1)?.[0] ?? '') : (words[0]?.[1] ?? '');
  return `${first}${second}`.toUpperCase();
}

type DishTileProps = { name: string; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string };

const sizes = {
  sm: 'size-12 text-xl',
  md: 'size-16 text-3xl',
  lg: 'size-24 text-5xl',
  xl: 'size-36 text-7xl md:size-44',
} as const;

export function DishTile({ name, size = 'md', className }: DishTileProps) {
  const tone = tones[hash(name) % tones.length];
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden border-2 border-ink font-display leading-none font-extrabold tracking-tight [font-stretch:70%]',
        tone,
        sizes[size],
        className,
      )}
    >
      <span className="translate-y-[0.06em]">{initials(name)}</span>
      <span className="absolute inset-x-1 bottom-1 border-t border-dashed border-current opacity-40" />
    </span>
  );
}

export { initials as dishInitials };

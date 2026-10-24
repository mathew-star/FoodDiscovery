import Image from 'next/image';
import { cn } from '@/shared/lib/cn';

/** Avatars are the only circles allowed (DESIGN-SYSTEM §7.5). */
const sizes = { sm: 28, md: 40 } as const;

type AvatarProps = {
  name: string;
  src?: string | null;
  size?: keyof typeof sizes;
  className?: string;
};

function initials(name: string): string {
  return name
    .replace(/^@/, '')
    .trim()
    .split(/[\s._-]+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const pixels = sizes[size];
  const frame = cn(
    'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-ink bg-saffron font-display font-extrabold text-ink',
    className,
  );

  if (src) {
    return (
      <Image src={src} alt={name} width={pixels} height={pixels} className={cn(frame, 'object-cover')} />
    );
  }

  return (
    <span
      role="img"
      aria-label={name}
      className={frame}
      style={{ width: pixels, height: pixels, fontSize: pixels * 0.4 }}
    >
      {initials(name)}
    </span>
  );
}

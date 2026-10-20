import Image from 'next/image';
import { cn } from '@/shared/lib/cn';

const sizes = { sm: 32, md: 40, lg: 64 } as const;

type AvatarProps = {
  name: string;
  src?: string | null;
  size?: keyof typeof sizes;
  className?: string;
};

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const pixels = sizes[size];
  const frame = cn(
    'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2 font-semibold text-text',
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

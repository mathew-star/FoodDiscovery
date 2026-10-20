import { cn } from '@/shared/lib/cn';

const plates = ['plate-saffron', 'plate-chilli', 'plate-cardamom'] as const;

function hash(value: string): number {
  let result = 0;
  for (const char of value) result = (result * 31 + char.charCodeAt(0)) >>> 0;
  return result;
}

export function DishPlate({ name, className }: { name: string; className?: string }) {
  const plate = plates[hash(name) % plates.length];
  return (
    <div
      aria-hidden="true"
      className={cn('relative shrink-0 overflow-hidden rounded-md bg-surface-2', className)}
    >
      <div className={cn('absolute inset-[12%] rounded-full shadow-inner', plate)} />
    </div>
  );
}

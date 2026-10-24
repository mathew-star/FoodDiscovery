import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/cn';

const fieldClass =
  'w-full rounded-2xl border-2 border-ink bg-paper px-3 text-base text-ink placeholder:text-inkMuted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lime aria-invalid:border-terracotta disabled:opacity-50';

export function Input({ className, type = 'text', ...props }: ComponentProps<'input'>) {
  return <input type={type} className={cn(fieldClass, 'h-12', className)} {...props} />;
}

export function Textarea({ className, rows = 4, ...props }: ComponentProps<'textarea'>) {
  return <textarea rows={rows} className={cn(fieldClass, 'min-h-24 py-2', className)} {...props} />;
}

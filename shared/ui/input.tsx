import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/cn';

const fieldClass =
  'w-full rounded-sm border border-border-strong bg-surface px-3 text-base text-text placeholder:text-muted transition-[border-color] duration-(--dur-fast) hover:border-text aria-invalid:border-danger disabled:opacity-50';

export function Input({ className, type = 'text', ...props }: ComponentProps<'input'>) {
  return <input type={type} className={cn(fieldClass, 'h-11', className)} {...props} />;
}

export function Textarea({ className, rows = 4, ...props }: ComponentProps<'textarea'>) {
  return <textarea rows={rows} className={cn(fieldClass, 'min-h-24 py-2', className)} {...props} />;
}

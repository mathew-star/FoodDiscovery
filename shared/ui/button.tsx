import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/cn';

export const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-sm font-medium whitespace-nowrap transition-[background-color,border-color,color,transform] duration-(--dur-fast) ease-standard select-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:size-5 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-on-primary hover:bg-primary/90',
        secondary: 'border border-border-strong bg-surface text-text hover:bg-surface-2',
        ghost: 'text-text hover:bg-surface-2',
        danger: 'bg-danger text-on-primary hover:bg-danger/90',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-4 text-base',
        lg: 'h-12 px-5 text-lg',
        icon: 'size-11 p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export type ButtonProps = ComponentProps<'button'> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export type IconButtonProps = Omit<ButtonProps, 'size' | 'aria-label'> & { label: string };

export function IconButton({ label, variant = 'ghost', className, ...props }: IconButtonProps) {
  return (
    <Button
      aria-label={label}
      variant={variant}
      size="icon"
      className={cn('rounded-full', className)}
      {...props}
    />
  );
}

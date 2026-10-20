import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/cn';

export const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-tick font-display font-bold tracking-wide whitespace-nowrap uppercase [font-stretch:85%] select-none disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:size-5 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'press border-2 border-ink bg-ink text-on-ink shadow-lift-sm hover:bg-ink/90',
        haldi: 'press border-2 border-ink bg-haldi text-on-haldi shadow-lift-sm hover:brightness-105',
        secondary: 'press border-2 border-ink bg-raised text-ink shadow-lift-sm hover:bg-sunk',
        ghost: 'text-ink underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-10 px-3 text-base',
        md: 'h-12 px-5 text-lg',
        lg: 'h-14 px-7 text-xl',
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
      className={cn(variant === 'ghost' && 'rounded-full hover:bg-sunk hover:no-underline', className)}
      {...props}
    />
  );
}

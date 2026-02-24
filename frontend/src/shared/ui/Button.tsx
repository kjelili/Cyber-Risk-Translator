import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
};

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-[0.98]',
        {
          'bg-accent hover:bg-accent-hover text-white shadow-sm': variant === 'primary',
          'bg-surface-tertiary hover:bg-surface-secondary text-content-primary border border-border': variant === 'secondary',
          'bg-status-danger hover:bg-red-600 text-white': variant === 'danger',
          'hover:bg-surface-tertiary text-content-secondary hover:text-content-primary': variant === 'ghost',
        },
        {
          'text-xs px-3 py-1.5 min-h-[32px]': size === 'sm',
          'text-sm px-4 py-2 min-h-[40px]': size === 'md',
          'text-base px-6 py-3 min-h-[48px]': size === 'lg',
        },
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/utils';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  hover?: boolean;
};

export function Card({ className, children, hover = true, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-surface-card p-6 transition-all duration-200',
        hover && 'hover:border-border-hover hover:shadow-md hover:shadow-black/20',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

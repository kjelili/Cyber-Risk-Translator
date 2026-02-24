import { cn } from '../lib/utils';

type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
};

export function LoadingSpinner({ size = 'md', className, label }: SpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className={cn(
        'animate-spin rounded-full border-2 border-border border-t-accent',
        { 'h-5 w-5': size === 'sm', 'h-8 w-8': size === 'md', 'h-12 w-12': size === 'lg' },
      )} />
      {label && <p className="text-sm text-content-tertiary">{label}</p>}
    </div>
  );
}

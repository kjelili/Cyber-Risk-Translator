import type { HTMLAttributes } from 'react';
import { cn, severityBg, complianceBg } from '../lib/utils';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  severity?: string;
  compliance?: string;
};

export function Badge({ severity, compliance, className, children, ...props }: BadgeProps) {
  const auto = severity ? severityBg(severity) : compliance ? complianceBg(compliance) : '';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium uppercase tracking-wider',
        auto || 'border-border bg-surface-tertiary text-content-secondary',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

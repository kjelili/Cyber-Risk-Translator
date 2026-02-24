import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

const base = 'w-full rounded-lg border border-border bg-surface-tertiary px-4 py-2 text-sm text-content-primary placeholder:text-content-tertiary transition-all duration-200 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 min-h-[40px]';

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label?: string };

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, className, id, ...props }, ref) {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label htmlFor={inputId} className="text-sm font-medium text-content-primary">{label}</label>}
        <input ref={ref} id={inputId} className={cn(base, className)} {...props} />
      </div>
    );
  }
);

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: { value: string; label: string }[];
};

export function Select({ label, options, className, id, ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={selectId} className="text-sm font-medium text-content-primary">{label}</label>}
      <select id={selectId} className={cn(base, 'cursor-pointer', className)} {...props}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string };

export function Textarea({ label, className, id, ...props }: TextareaProps) {
  const taId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={taId} className="text-sm font-medium text-content-primary">{label}</label>}
      <textarea id={taId} className={cn(base, 'min-h-[80px] resize-y', className)} {...props} />
    </div>
  );
}

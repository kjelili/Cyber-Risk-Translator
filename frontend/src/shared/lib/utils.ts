import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = 'GBP'): string {
  const symbols: Record<string, string> = { GBP: '£', USD: '$', EUR: '€' };
  const sym = symbols[currency] || currency;
  return `${sym}${Math.round(value).toLocaleString()}`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString();
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function severityColor(severity: string): string {
  const map: Record<string, string> = {
    critical: 'text-severity-critical',
    high: 'text-severity-high',
    medium: 'text-severity-medium',
    low: 'text-severity-low',
    info: 'text-severity-info',
  };
  return map[severity.toLowerCase()] || 'text-content-secondary';
}

export function severityBg(severity: string): string {
  const map: Record<string, string> = {
    critical: 'bg-red-500/15 text-severity-critical border-red-500/30',
    high: 'bg-orange-500/15 text-severity-high border-orange-500/30',
    medium: 'bg-yellow-500/15 text-severity-medium border-yellow-500/30',
    low: 'bg-blue-500/15 text-severity-low border-blue-500/30',
    info: 'bg-gray-500/15 text-severity-info border-gray-500/30',
  };
  return map[severity.toLowerCase()] || 'bg-surface-tertiary text-content-secondary border-border';
}

export function complianceBg(status: string): string {
  const map: Record<string, string> = {
    compliant: 'bg-emerald-500/15 text-status-success border-emerald-500/30',
    non_compliant: 'bg-red-500/15 text-status-danger border-red-500/30',
    partial: 'bg-yellow-500/15 text-status-warning border-yellow-500/30',
    not_assessed: 'bg-gray-500/15 text-content-tertiary border-border',
  };
  return map[status] || 'bg-surface-tertiary text-content-secondary border-border';
}

import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

type Column<T> = {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
};

type TableProps<T> = {
  columns: Column<T>[];
  data: T[];
  keyField: string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T extends Record<string, any>>({
  columns, data, keyField, onRowClick, emptyMessage = 'No data available',
}: TableProps<T>) {
  if (data.length === 0) {
    return <div className="py-12 text-center text-sm text-content-tertiary">{emptyMessage}</div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface-secondary">
            {columns.map(col => (
              <th key={col.key} className={cn('px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-content-primary border-b-2 border-border', col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr
              key={String(row[keyField])}
              className={cn('border-b border-border transition-colors hover:bg-surface-secondary', onRowClick && 'cursor-pointer')}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map(col => (
                <td key={col.key} className={cn('px-4 py-3 text-content-secondary', col.className)}>
                  {col.render ? col.render(row) : String(row[col.key] ?? '-')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

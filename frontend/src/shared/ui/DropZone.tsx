import { useState, useCallback, type DragEvent, type ChangeEvent } from 'react';
import { cn } from '../lib/utils';

type DropZoneProps = {
  onFileSelect: (file: File) => void;
  accept?: string;
  label?: string;
  hint?: string;
  file?: File | null;
};

export function DropZone({ onFileSelect, accept = '.json,.xlsx,.xls,.pdf', label, hint, file }: DropZoneProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) onFileSelect(f);
  }, [onFileSelect]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onFileSelect(f);
  }, [onFileSelect]);

  return (
    <div
      className={cn(
        'cursor-pointer rounded-xl border-2 border-dashed border-border p-10 text-center transition-all duration-200',
        dragOver && 'border-accent bg-accent/5',
        !dragOver && 'hover:border-border-hover hover:bg-surface-secondary/50',
      )}
      onDrop={handleDrop}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onClick={() => document.getElementById('drop-file-input')?.click()}
    >
      <div className="text-4xl mb-3">{file ? '📄' : '📤'}</div>
      <div className="text-base font-semibold text-content-primary mb-1">
        {file ? file.name : (label || 'Drag & drop files here')}
      </div>
      <div className="text-sm text-content-tertiary">
        {file ? `${(file.size / 1024).toFixed(1)} KB` : (hint || 'or click to browse')}
      </div>
      <input id="drop-file-input" type="file" accept={accept} onChange={handleChange} className="hidden" />
    </div>
  );
}

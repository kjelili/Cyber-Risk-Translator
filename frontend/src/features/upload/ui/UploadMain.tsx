import { useState } from 'react';
import { useApp } from '../../../app/context';
import { upload } from '../../../shared/api/client';
import { Button, Card, Badge, DropZone } from '../../../shared/ui';

type UploadResult = { project_id: number; ingested: number; critical: number; high: number; medium: number; low: number; info: number };

export function UploadMain() {
  const { projectId } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file || !projectId) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const r = await upload<UploadResult>(`/projects/${projectId}/upload`, file);
      setResult(r); setFile(null);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Upload failed'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Upload Scan Data</h1>
        <p className="text-sm text-content-tertiary">Upload vulnerability scan results from security tools</p>
      </div>

      <Card className="mb-6">
        <div className="mb-4 text-sm text-content-tertiary">
          Project: <Badge>#{projectId}</Badge>
        </div>
        <DropZone onFileSelect={f => { setFile(f); setError(''); }} file={file} accept=".json,.xlsx,.xls,.pdf" hint="Supports JSON, Excel (.xlsx), and PDF" />
        {file && (
          <div className="mt-4 flex gap-3">
            <Button className="flex-1" disabled={loading} onClick={handleUpload}>{loading ? 'Uploading...' : 'Upload File'}</Button>
            <Button variant="secondary" onClick={() => setFile(null)} disabled={loading}>Clear</Button>
          </div>
        )}
        {error && <div className="mt-4 rounded-lg border border-status-danger/30 bg-status-danger/10 p-3 text-sm text-status-danger">{error}</div>}
      </Card>

      <Card className="mb-6">
        <h3 className="mb-3 font-semibold">Supported Formats</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: '📄', title: 'JSON', desc: 'Generic vulnerability JSON with tool and findings array.' },
            { icon: '📊', title: 'Excel (.xlsx)', desc: 'Spreadsheet with Title, Severity, CVSS, Asset headers.' },
            { icon: '📕', title: 'PDF', desc: 'Penetration test reports with numbered findings.' },
          ].map(f => (
            <div key={f.title} className="rounded-lg border border-border bg-surface-secondary p-4">
              <div className="mb-2 flex items-center gap-2"><span className="text-xl">{f.icon}</span><span className="font-medium text-sm">{f.title}</span></div>
              <p className="text-xs text-content-tertiary">{f.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {result && (
        <Card className="border-status-success/30 bg-status-success/5">
          <h3 className="mb-3 font-semibold text-status-success">Upload Successful</h3>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-status-success/20 text-status-success border-status-success/30">Total: {result.ingested}</Badge>
            <Badge severity="critical">Critical: {result.critical}</Badge>
            <Badge severity="high">High: {result.high}</Badge>
            <Badge severity="medium">Medium: {result.medium}</Badge>
            <Badge severity="low">Low: {result.low}</Badge>
            <Badge severity="info">Info: {result.info}</Badge>
          </div>
        </Card>
      )}
    </div>
  );
}

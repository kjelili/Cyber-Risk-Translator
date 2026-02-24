import { useEffect, useState } from 'react';
import { useApp } from '../../../app/context';
import { Button, Card, Badge, Input, Select, DataTable, Modal, LoadingSpinner } from '../../../shared/ui';
import { formatCurrency } from '../../../shared/lib/utils';
import { listFindings, getFinding, genDev, genExec, type FindingOut, type TicketJSON, type ExecJSON } from '../api/findings.api';

export function FindingsMain() {
  const { projectId, params } = useApp();
  const [items, setItems] = useState<FindingOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sevFilter, setSevFilter] = useState('all');
  const [detail, setDetail] = useState<FindingOut | null>(null);
  const [dev, setDev] = useState<TicketJSON | null>(null);
  const [exec, setExec] = useState<ExecJSON | null>(null);
  const [genLoading, setGenLoading] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    listFindings(projectId).then(setItems).finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    if (params.findingId) {
      getFinding(Number(params.findingId)).then(setDetail);
    }
  }, [params.findingId]);

  const filtered = items.filter(f => {
    const ms = f.title.toLowerCase().includes(search.toLowerCase()) || f.asset.toLowerCase().includes(search.toLowerCase());
    const mf = sevFilter === 'all' || f.severity === sevFilter;
    return ms && mf;
  });

  if (loading) return <LoadingSpinner size="lg" label="Loading findings..." className="py-20" />;

  if (detail) {
    return (
      <div>
        <Button variant="ghost" className="mb-4" onClick={() => { setDetail(null); setDev(null); setExec(null); }}>← Back to Findings</Button>
        <h1 className="text-2xl font-bold mb-2">{detail.title}</h1>
        <div className="flex flex-wrap gap-2 mb-6">
          <Badge severity={detail.severity}>{detail.severity}</Badge>
          {detail.cvss != null && <Badge>CVSS: {detail.cvss}</Badge>}
          {detail.owasp && <Badge>OWASP: {detail.owasp}</Badge>}
          {detail.cwe && <Badge>CWE: {detail.cwe}</Badge>}
        </div>
        <Card className="mb-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><div className="text-xs text-content-tertiary mb-1">Asset</div><div className="font-medium">{detail.asset || 'N/A'}</div></div>
            <div><div className="text-xs text-content-tertiary mb-1">Endpoint</div><div className="font-mono text-sm">{detail.endpoint || 'N/A'}</div></div>
          </div>
        </Card>
        <Card className="mb-6">
          <h3 className="mb-3 font-semibold">Generate Reports</h3>
          <div className="flex gap-3">
            <Button disabled={genLoading} onClick={async () => { setGenLoading(true); setDev(await genDev(detail.id)); setGenLoading(false); }}>Dev Ticket</Button>
            <Button variant="secondary" disabled={genLoading} onClick={async () => { setGenLoading(true); setExec(await genExec(detail.id)); setGenLoading(false); }}>Exec Summary</Button>
          </div>
        </Card>
        <div className="grid gap-6 lg:grid-cols-2">
          {exec && (
            <Card>
              <h3 className="mb-3 font-semibold text-accent">Executive Summary</h3>
              <p className="mb-2 font-semibold">{exec.one_liner}</p>
              <p className="mb-4 text-sm text-content-secondary">{exec.business_impact}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge>Likelihood: {exec.likelihood}</Badge><Badge>Impact: {exec.impact}</Badge>
                <Badge severity="critical">{formatCurrency(exec.estimated_exposure.point, exec.estimated_exposure.currency)}</Badge>
              </div>
              <div className="border-t border-border pt-3 text-sm">
                <div className="font-semibold mb-1">Recommended:</div>
                <div className="text-accent">{exec.recommended_decision}</div>
              </div>
            </Card>
          )}
          {dev && (
            <Card>
              <h3 className="mb-3 font-semibold text-accent">Developer Ticket</h3>
              <Badge className="mb-3">Priority: {dev.priority}</Badge>
              <div className="mb-2"><span className="text-xs text-content-tertiary">Summary:</span> <span className="text-sm">{dev.summary}</span></div>
              <div className="mb-2"><span className="text-xs text-content-tertiary">Root cause:</span> <span className="text-sm text-content-secondary">{dev.root_cause_hypothesis}</span></div>
              <details className="mt-3"><summary className="cursor-pointer text-sm font-medium">Full JSON</summary>
                <pre className="mt-2 overflow-x-auto rounded-lg bg-surface-secondary p-3 text-xs">{JSON.stringify(dev, null, 2)}</pre>
              </details>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Findings</h1>
        <p className="text-sm text-content-tertiary">Review and manage security findings</p>
      </div>
      <Card>
        <div className="mb-4 flex flex-wrap gap-3">
          <Input placeholder="Search findings..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
          <Select value={sevFilter} onChange={e => setSevFilter(e.target.value)} options={[
            { value: 'all', label: 'All Severities' }, { value: 'critical', label: 'Critical' }, { value: 'high', label: 'High' },
            { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }, { value: 'info', label: 'Info' },
          ]} className="w-40" />
        </div>
        <DataTable
          columns={[
            { key: 'severity', header: 'Severity', render: (r: FindingOut) => <Badge severity={r.severity}>{r.severity}</Badge> },
            { key: 'title', header: 'Title', render: (r: FindingOut) => <span className="font-medium text-content-primary">{r.title}</span> },
            { key: 'asset', header: 'Asset' },
            { key: 'cvss', header: 'CVSS', render: (r: FindingOut) => r.cvss?.toFixed(1) ?? '-' },
            { key: 'owasp', header: 'OWASP', render: (r: FindingOut) => r.owasp ?? '-' },
            { key: 'actions', header: '', render: (r: FindingOut) => <Button size="sm" onClick={() => setDetail(r)}>View</Button> },
          ]}
          data={filtered}
          keyField="id"
          emptyMessage={items.length === 0 ? 'No findings yet. Upload scan data first.' : 'No findings match your filters.'}
        />
      </Card>
    </div>
  );
}

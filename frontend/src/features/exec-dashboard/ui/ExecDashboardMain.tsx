import { useEffect, useState, useMemo } from 'react';
import { useApp } from '../../../app/context';
import { Card, Badge, Select, LoadingSpinner } from '../../../shared/ui';
import { formatCurrency } from '../../../shared/lib/utils';
import { listFindings, type FindingOut } from '../../findings/api/findings.api';
import { post } from '../../../shared/api/client';

type SimResult = { estimated_exposure: { currency: string; point: number; low: number; high: number; drivers: { name: string; value: number }[]; assumptions: string[] } };

export function ExecDashboardMain() {
  const { projectId } = useApp();
  const [findings, setFindings] = useState<FindingOut[]>([]);
  const [selected, setSelected] = useState<FindingOut | null>(null);
  const [downtime, setDowntime] = useState(24);
  const [records, setRecords] = useState(250000);
  const [jurisdiction, setJurisdiction] = useState('GDPR');
  const [churn, setChurn] = useState(2);
  const [maturity, setMaturity] = useState('Medium');
  const [result, setResult] = useState<SimResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    listFindings(projectId).then(fs => { setFindings(fs); setSelected(fs[0] ?? null); setLoading(false); });
  }, [projectId]);

  useEffect(() => {
    if (!selected || !projectId) return;
    post<SimResult>('/impact/simulate', { project_id: projectId, finding_id: selected.id, downtime_hours: downtime, records_exposed: records, jurisdiction, churn_pct: churn, ir_maturity: maturity })
      .then(setResult);
  }, [selected, downtime, records, jurisdiction, churn, maturity, projectId]);

  const top5 = useMemo(() => findings.slice(0, 5), [findings]);

  if (loading) return <LoadingSpinner size="lg" label="Loading dashboard..." className="py-20" />;

  return (
    <div>
      <div className="mb-8"><h1 className="text-2xl font-bold">Executive Risk Dashboard</h1><p className="text-sm text-content-tertiary">Board-ready risk analysis and impact simulation</p></div>
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <Card>
          <h3 className="mb-3 font-semibold">Top Findings</h3>
          {findings.length === 0 ? <p className="text-sm text-content-tertiary">No findings. Upload scan data first.</p> : (
            <>
              <Select value={String(selected?.id ?? '')} onChange={e => setSelected(findings.find(f => f.id === Number(e.target.value)) ?? null)}
                options={findings.map(f => ({ value: String(f.id), label: `${f.severity.toUpperCase()} - ${f.title}` }))} className="mb-3" />
              <div className="space-y-2">{top5.map(f => (
                <div key={f.id} onClick={() => setSelected(f)} className={`flex items-center justify-between rounded-lg border border-border p-3 text-sm cursor-pointer transition-colors ${selected?.id === f.id ? 'bg-surface-tertiary' : 'hover:bg-surface-secondary'}`}>
                  <span className="font-medium truncate">{f.title}</span><Badge severity={f.severity}>{f.severity}</Badge>
                </div>
              ))}</div>
            </>
          )}
        </Card>
        <Card>
          <h3 className="mb-4 font-semibold">Impact Simulator</h3>
          {!selected ? <p className="text-sm text-content-tertiary">Select a finding to simulate.</p> : (
            <div className="space-y-4">
              <div className="rounded-lg bg-surface-secondary p-3"><div className="text-xs text-content-tertiary">Selected</div><div className="font-medium">{selected.title}</div><Badge severity={selected.severity} className="mt-1">{selected.severity}</Badge></div>
              <div><div className="flex justify-between text-sm mb-1"><span>Downtime (hours)</span><span className="font-semibold text-accent">{downtime}h</span></div>
                <input type="range" min="0" max="240" value={downtime} onChange={e => setDowntime(Number(e.target.value))} className="w-full accent-accent" /></div>
              <div><div className="flex justify-between text-sm mb-1"><span>Records exposed</span><span className="font-semibold text-accent">{records.toLocaleString()}</span></div>
                <input type="range" min="0" max="2000000" step="50000" value={records} onChange={e => setRecords(Number(e.target.value))} className="w-full accent-accent" /></div>
              <div className="grid grid-cols-3 gap-3">
                <Select label="Jurisdiction" value={jurisdiction} onChange={e => setJurisdiction(e.target.value)} options={[{ value: 'GDPR', label: 'GDPR' }, { value: 'HIPAA', label: 'HIPAA' }, { value: 'PCI-DSS', label: 'PCI-DSS' }, { value: 'Other', label: 'Other' }]} />
                <div className="flex flex-col gap-1.5"><label className="text-sm font-medium">Churn %</label><input type="number" value={churn} step="0.5" min="0" max="50" onChange={e => setChurn(Number(e.target.value))} className="w-full rounded-lg border border-border bg-surface-tertiary px-3 py-2 text-sm text-content-primary" /></div>
                <Select label="IR Maturity" value={maturity} onChange={e => setMaturity(e.target.value)} options={[{ value: 'Low', label: 'Low' }, { value: 'Medium', label: 'Medium' }, { value: 'High', label: 'High' }]} />
              </div>
              {result && (
                <div className="rounded-xl border border-status-danger/30 bg-status-danger/5 p-5">
                  <div className="text-2xl font-bold text-status-danger">{formatCurrency(result.estimated_exposure.point, result.estimated_exposure.currency)}</div>
                  <div className="text-sm text-content-tertiary">Range: {formatCurrency(result.estimated_exposure.low, result.estimated_exposure.currency)} - {formatCurrency(result.estimated_exposure.high, result.estimated_exposure.currency)}</div>
                  <div className="mt-4 space-y-2">{result.estimated_exposure.drivers.map(d => (
                    <div key={d.name} className="flex justify-between rounded-lg bg-surface-secondary p-2 text-sm">
                      <span>{d.name}</span><span className="font-semibold">{formatCurrency(d.value, result.estimated_exposure.currency)}</span>
                    </div>
                  ))}</div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

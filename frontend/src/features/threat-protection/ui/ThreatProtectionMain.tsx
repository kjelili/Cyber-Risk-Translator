import { useEffect, useState, useCallback } from 'react';
import { useApp } from '../../../app/context';
import { get, post, put, del } from '../../../shared/api/client';
import { Card, Button, Badge, DataTable, Modal, Input, Select, Textarea, LoadingSpinner } from '../../../shared/ui';

type IOC = { id: number; project_id: number; ioc_type: string; ioc_value: string; threat_actor: string; confidence: string; severity: string; source: string; status: string; tags: string };
type Incident = { id: number; project_id: number; title: string; severity: string; description: string; status: string; detected_at: string; resolved_at: string | null; impact: string };

export function ThreatProtectionMain() {
  const { projectId } = useApp();
  const [iocs, setIocs] = useState<IOC[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [iocModal, setIocModal] = useState(false);
  const [incModal, setIncModal] = useState(false);
  const [iocForm, setIocForm] = useState({ project_id: 0, ioc_type: 'ip', ioc_value: '', threat_actor: '', confidence: 'medium', severity: 'medium', source: '', status: 'active', tags: '' });
  const [incForm, setIncForm] = useState({ project_id: 0, title: '', severity: 'medium', description: '', status: 'detected', detected_at: '', impact: '' });

  const refresh = useCallback(() => {
    if (!projectId) return; setLoading(true);
    Promise.all([get<IOC[]>(`/threat-intel?project_id=${projectId}`), get<Incident[]>(`/threat-incidents?project_id=${projectId}`)])
      .then(([i, inc]) => { setIocs(i); setIncidents(inc); }).catch(() => {}).finally(() => setLoading(false));
  }, [projectId]);
  useEffect(refresh, [refresh]);

  const saveIoc = async () => { await post('/threat-intel', { ...iocForm, project_id: projectId }); setIocModal(false); refresh(); };
  const saveInc = async () => { await post('/threat-incidents', { ...incForm, project_id: projectId }); setIncModal(false); refresh(); };
  const deleteIoc = async (id: number) => { await del(`/threat-intel/${id}`); refresh(); };
  const deleteInc = async (id: number) => { await del(`/threat-incidents/${id}`); refresh(); };
  const updateIncStatus = async (inc: Incident, status: string) => { await put(`/threat-incidents/${inc.id}`, { ...inc, status }); refresh(); };

  if (loading) return <LoadingSpinner size="lg" label="Loading threat data..." className="py-20" />;

  const statusColor = (s: string) => {
    const map: Record<string, string> = { detected: 'bg-red-500/15 text-status-danger border-red-500/30', investigating: 'bg-yellow-500/15 text-status-warning border-yellow-500/30', contained: 'bg-blue-500/15 text-accent border-blue-500/30', eradicated: 'bg-emerald-500/15 text-status-success border-emerald-500/30', recovered: 'bg-emerald-500/15 text-status-success border-emerald-500/30' };
    return map[s] || '';
  };

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div><h1 className="text-2xl font-bold">Threat Protection</h1><p className="text-sm text-content-tertiary">Track IOCs, manage incidents, and threat intelligence</p></div>
        <div className="flex gap-2"><Button variant="secondary" onClick={() => { setIocForm({ project_id: projectId!, ioc_type: 'ip', ioc_value: '', threat_actor: '', confidence: 'medium', severity: 'medium', source: '', status: 'active', tags: '' }); setIocModal(true); }}>+ IOC</Button>
          <Button onClick={() => { setIncForm({ project_id: projectId!, title: '', severity: 'medium', description: '', status: 'detected', detected_at: new Date().toISOString().slice(0, 10), impact: '' }); setIncModal(true); }}>+ Incident</Button></div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card hover={false} className="text-center"><div className="text-2xl font-bold text-accent">{iocs.length}</div><div className="text-xs text-content-tertiary">IOCs Tracked</div></Card>
        <Card hover={false} className="text-center"><div className="text-2xl font-bold text-status-danger">{iocs.filter(i => i.status === 'active').length}</div><div className="text-xs text-content-tertiary">Active IOCs</div></Card>
        <Card hover={false} className="text-center"><div className="text-2xl font-bold text-status-warning">{incidents.filter(i => i.status === 'detected' || i.status === 'investigating').length}</div><div className="text-xs text-content-tertiary">Open Incidents</div></Card>
        <Card hover={false} className="text-center"><div className="text-2xl font-bold text-status-success">{incidents.filter(i => i.status === 'recovered').length}</div><div className="text-xs text-content-tertiary">Resolved</div></Card>
      </div>

      <Card className="mb-6"><h3 className="mb-3 font-semibold">Indicators of Compromise</h3>
        <DataTable columns={[
          { key: 'ioc_type', header: 'Type', render: (r: IOC) => <Badge>{r.ioc_type.toUpperCase()}</Badge> },
          { key: 'ioc_value', header: 'Value', render: (r: IOC) => <span className="font-mono text-xs font-medium text-content-primary">{r.ioc_value}</span> },
          { key: 'severity', header: 'Severity', render: (r: IOC) => <Badge severity={r.severity}>{r.severity}</Badge> },
          { key: 'threat_actor', header: 'Actor' },
          { key: 'source', header: 'Source' },
          { key: 'status', header: 'Status', render: (r: IOC) => <Badge className={r.status === 'active' ? 'bg-red-500/15 text-status-danger border-red-500/30' : ''}>{r.status}</Badge> },
          { key: 'actions', header: '', render: (r: IOC) => <Button size="sm" variant="danger" onClick={() => deleteIoc(r.id)}>Del</Button> },
        ]} data={iocs} keyField="id" emptyMessage="No IOCs tracked." />
      </Card>

      <Card><h3 className="mb-3 font-semibold">Incidents</h3>
        <DataTable columns={[
          { key: 'severity', header: 'Sev', render: (r: Incident) => <Badge severity={r.severity}>{r.severity}</Badge> },
          { key: 'title', header: 'Incident', render: (r: Incident) => <span className="font-medium text-content-primary">{r.title}</span> },
          { key: 'status', header: 'Status', render: (r: Incident) => (
            <select value={r.status} onChange={e => updateIncStatus(r, e.target.value)} className="rounded border border-border bg-surface-tertiary px-2 py-1 text-xs text-content-primary">
              <option value="detected">Detected</option><option value="investigating">Investigating</option><option value="contained">Contained</option><option value="eradicated">Eradicated</option><option value="recovered">Recovered</option>
            </select>
          )},
          { key: 'detected_at', header: 'Detected' },
          { key: 'actions', header: '', render: (r: Incident) => <Button size="sm" variant="danger" onClick={() => deleteInc(r.id)}>Del</Button> },
        ]} data={incidents} keyField="id" emptyMessage="No incidents recorded." />
      </Card>

      <Modal open={iocModal} onClose={() => setIocModal(false)} title="Add IOC" footer={<><Button variant="secondary" onClick={() => setIocModal(false)}>Cancel</Button><Button onClick={saveIoc}>Save</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Type" value={iocForm.ioc_type} onChange={e => setIocForm({ ...iocForm, ioc_type: e.target.value })} options={[{ value: 'ip', label: 'IP Address' }, { value: 'domain', label: 'Domain' }, { value: 'hash', label: 'File Hash' }, { value: 'url', label: 'URL' }]} />
          <Input label="Value" value={iocForm.ioc_value} onChange={e => setIocForm({ ...iocForm, ioc_value: e.target.value })} />
          <Select label="Severity" value={iocForm.severity} onChange={e => setIocForm({ ...iocForm, severity: e.target.value })} options={[{ value: 'critical', label: 'Critical' }, { value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }]} />
          <Input label="Threat Actor" value={iocForm.threat_actor} onChange={e => setIocForm({ ...iocForm, threat_actor: e.target.value })} />
          <Input label="Source" value={iocForm.source} onChange={e => setIocForm({ ...iocForm, source: e.target.value })} />
          <Input label="Tags" value={iocForm.tags} onChange={e => setIocForm({ ...iocForm, tags: e.target.value })} placeholder="comma-separated" />
        </div>
      </Modal>
      <Modal open={incModal} onClose={() => setIncModal(false)} title="Add Incident" size="lg" footer={<><Button variant="secondary" onClick={() => setIncModal(false)}>Cancel</Button><Button onClick={saveInc}>Save</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Title" value={incForm.title} onChange={e => setIncForm({ ...incForm, title: e.target.value })} />
          <Select label="Severity" value={incForm.severity} onChange={e => setIncForm({ ...incForm, severity: e.target.value })} options={[{ value: 'critical', label: 'Critical' }, { value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }]} />
          <div className="sm:col-span-2"><Textarea label="Description" value={incForm.description} onChange={e => setIncForm({ ...incForm, description: e.target.value })} /></div>
          <div className="sm:col-span-2"><Textarea label="Impact" value={incForm.impact} onChange={e => setIncForm({ ...incForm, impact: e.target.value })} /></div>
        </div>
      </Modal>
    </div>
  );
}

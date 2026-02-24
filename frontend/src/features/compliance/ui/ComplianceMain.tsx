import { useEffect, useState, useCallback } from 'react';
import { useApp } from '../../../app/context';
import { get, post, put, del } from '../../../shared/api/client';
import { Card, Button, Badge, DataTable, Modal, Input, Select, LoadingSpinner } from '../../../shared/ui';

type Framework = { id: number; project_id: number; name: string; version: string; status: string; overall_score: number };
type Control = { id: number; framework_id: number; project_id: number; control_id: string; title: string; description: string; status: string; evidence_notes: string; owner: string; due_date: string | null };

export function ComplianceMain() {
  const { projectId } = useApp();
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [controls, setControls] = useState<Control[]>([]);
  const [loading, setLoading] = useState(true);
  const [fwModal, setFwModal] = useState(false);
  const [ctrlModal, setCtrlModal] = useState(false);
  const [fwForm, setFwForm] = useState({ project_id: 0, name: 'ISO27001', version: '2022', status: 'in_progress', overall_score: 0 });
  const [ctrlForm, setCtrlForm] = useState({ framework_id: 0, project_id: 0, control_id: '', title: '', description: '', status: 'not_assessed', evidence_notes: '', owner: '', due_date: '' });
  const [selectedFw, setSelectedFw] = useState<Framework | null>(null);

  const refresh = useCallback(() => {
    if (!projectId) return;
    setLoading(true);
    Promise.all([
      get<Framework[]>(`/compliance-frameworks?project_id=${projectId}`),
      get<Control[]>(`/compliance-controls?project_id=${projectId}`),
    ]).then(([fw, ctrl]) => { setFrameworks(fw); setControls(ctrl); if (fw.length && !selectedFw) setSelectedFw(fw[0]); }).catch(() => {}).finally(() => setLoading(false));
  }, [projectId]);

  useEffect(refresh, [refresh]);

  const saveFw = async () => { await post('/compliance-frameworks', { ...fwForm, project_id: projectId }); setFwModal(false); refresh(); };
  const saveCtrl = async () => { await post('/compliance-controls', { ...ctrlForm, project_id: projectId, framework_id: selectedFw?.id }); setCtrlModal(false); refresh(); };
  const deleteCtrl = async (id: number) => { await del(`/compliance-controls/${id}`); refresh(); };
  const updateStatus = async (ctrl: Control, status: string) => { await put(`/compliance-controls/${ctrl.id}`, { ...ctrl, status }); refresh(); };

  if (loading) return <LoadingSpinner size="lg" label="Loading compliance data..." className="py-20" />;

  const fwControls = controls.filter(c => c.framework_id === selectedFw?.id);
  const compliant = fwControls.filter(c => c.status === 'compliant').length;
  const total = fwControls.length;
  const pct = total > 0 ? Math.round((compliant / total) * 100) : 0;

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div><h1 className="text-2xl font-bold">Compliance</h1><p className="text-sm text-content-tertiary">Track ISO 27001, SOC2, NIST controls and evidence</p></div>
        <div className="flex gap-2"><Button variant="secondary" onClick={() => { setFwForm({ project_id: projectId!, name: 'ISO27001', version: '2022', status: 'in_progress', overall_score: 0 }); setFwModal(true); }}>+ Framework</Button>
          {selectedFw && <Button onClick={() => { setCtrlForm({ framework_id: selectedFw.id, project_id: projectId!, control_id: '', title: '', description: '', status: 'not_assessed', evidence_notes: '', owner: '', due_date: '' }); setCtrlModal(true); }}>+ Control</Button>}</div>
      </div>

      {frameworks.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-3">
          {frameworks.map(fw => (
            <button key={fw.id} onClick={() => setSelectedFw(fw)} className={`rounded-lg border px-4 py-2 text-sm transition-all ${selectedFw?.id === fw.id ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-surface-card text-content-secondary hover:bg-surface-tertiary'}`}>
              {fw.name} {fw.version}
            </button>
          ))}
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card hover={false} className="text-center"><div className="text-2xl font-bold text-accent">{total}</div><div className="text-xs text-content-tertiary">Total Controls</div></Card>
        <Card hover={false} className="text-center"><div className="text-2xl font-bold text-status-success">{compliant}</div><div className="text-xs text-content-tertiary">Compliant</div></Card>
        <Card hover={false} className="text-center"><div className="text-2xl font-bold text-status-warning">{fwControls.filter(c => c.status === 'partial').length}</div><div className="text-xs text-content-tertiary">Partial</div></Card>
        <Card hover={false} className="text-center"><div className="text-2xl font-bold text-accent">{pct}%</div><div className="text-xs text-content-tertiary">Score</div></Card>
      </div>

      <Card>
        <DataTable columns={[
          { key: 'control_id', header: 'ID', render: (r: Control) => <span className="font-mono text-xs font-medium text-content-primary">{r.control_id}</span> },
          { key: 'title', header: 'Control', render: (r: Control) => <span className="font-medium text-content-primary">{r.title}</span> },
          { key: 'status', header: 'Status', render: (r: Control) => (
            <select value={r.status} onChange={e => updateStatus(r, e.target.value)} className="rounded border border-border bg-surface-tertiary px-2 py-1 text-xs text-content-primary">
              <option value="compliant">Compliant</option><option value="non_compliant">Non-Compliant</option><option value="partial">Partial</option><option value="not_assessed">Not Assessed</option>
            </select>
          )},
          { key: 'owner', header: 'Owner' },
          { key: 'actions', header: '', render: (r: Control) => <Button size="sm" variant="danger" onClick={() => deleteCtrl(r.id)}>Del</Button> },
        ]} data={fwControls} keyField="id" emptyMessage="No controls added yet." />
      </Card>

      <Modal open={fwModal} onClose={() => setFwModal(false)} title="Add Framework" footer={<><Button variant="secondary" onClick={() => setFwModal(false)}>Cancel</Button><Button onClick={saveFw}>Save</Button></>}>
        <div className="grid gap-4">
          <Select label="Framework" value={fwForm.name} onChange={e => setFwForm({ ...fwForm, name: e.target.value })} options={[{ value: 'ISO27001', label: 'ISO 27001' }, { value: 'SOC2', label: 'SOC2' }, { value: 'NIST_CSF', label: 'NIST CSF' }, { value: 'CIS', label: 'CIS Controls' }]} />
          <Input label="Version" value={fwForm.version} onChange={e => setFwForm({ ...fwForm, version: e.target.value })} />
        </div>
      </Modal>
      <Modal open={ctrlModal} onClose={() => setCtrlModal(false)} title="Add Control" footer={<><Button variant="secondary" onClick={() => setCtrlModal(false)}>Cancel</Button><Button onClick={saveCtrl}>Save</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Control ID" value={ctrlForm.control_id} onChange={e => setCtrlForm({ ...ctrlForm, control_id: e.target.value })} placeholder="e.g. A.5.1" />
          <Input label="Title" value={ctrlForm.title} onChange={e => setCtrlForm({ ...ctrlForm, title: e.target.value })} />
          <Input label="Owner" value={ctrlForm.owner} onChange={e => setCtrlForm({ ...ctrlForm, owner: e.target.value })} />
          <Input label="Due Date" type="date" value={ctrlForm.due_date} onChange={e => setCtrlForm({ ...ctrlForm, due_date: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}

import { useEffect, useState, useCallback } from 'react';
import { useApp } from '../../../app/context';
import { get, post, put, del } from '../../../shared/api/client';
import { Card, Button, Badge, DataTable, Modal, Input, Select, Textarea, LoadingSpinner } from '../../../shared/ui';

type PCIReq = { id: number; project_id: number; requirement_number: number; sub_requirement: string; title: string; description: string; status: string; compensating_control: string; evidence_notes: string; assessor_notes: string };

const PCI_REQS = ['Install and maintain network security controls', 'Apply secure configurations', 'Protect stored account data', 'Protect cardholder data with strong cryptography', 'Protect against malicious software', 'Develop and maintain secure systems', 'Restrict access by business need to know', 'Identify users and authenticate access', 'Restrict physical access', 'Log and monitor all access', 'Test security of systems regularly', 'Support information security with policies'];

export function PciComplianceMain() {
  const { projectId } = useApp();
  const [items, setItems] = useState<PCIReq[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PCIReq | null>(null);
  const [form, setForm] = useState({ project_id: 0, requirement_number: 1, sub_requirement: '', title: '', description: '', status: 'not_assessed', compensating_control: '', evidence_notes: '', assessor_notes: '' });

  const refresh = useCallback(() => {
    if (!projectId) return; setLoading(true);
    get<PCIReq[]>(`/pci-requirements?project_id=${projectId}`).then(setItems).catch(() => setItems([])).finally(() => setLoading(false));
  }, [projectId]);

  useEffect(refresh, [refresh]);

  const openNew = () => { setEditing(null); setForm({ project_id: projectId!, requirement_number: 1, sub_requirement: '', title: '', description: '', status: 'not_assessed', compensating_control: '', evidence_notes: '', assessor_notes: '' }); setModalOpen(true); };
  const openEdit = (r: PCIReq) => { setEditing(r); setForm(r); setModalOpen(true); };
  const save = async () => { if (editing) await put(`/pci-requirements/${editing.id}`, form); else await post('/pci-requirements', form); setModalOpen(false); refresh(); };
  const remove = async (id: number) => { await del(`/pci-requirements/${id}`); refresh(); };
  const updateStatus = async (r: PCIReq, status: string) => { await put(`/pci-requirements/${r.id}`, { ...r, status }); refresh(); };

  if (loading) return <LoadingSpinner size="lg" label="Loading PCI data..." className="py-20" />;

  const compliantCount = items.filter(r => r.status === 'compliant').length;
  const pct = items.length > 0 ? Math.round((compliantCount / items.length) * 100) : 0;

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div><h1 className="text-2xl font-bold">PCI DSS Compliance</h1><p className="text-sm text-content-tertiary">Track all 12 PCI DSS requirements and assessments</p></div>
        <Button onClick={openNew}>+ Add Requirement</Button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card hover={false} className="text-center"><div className="text-2xl font-bold text-accent">{items.length}</div><div className="text-xs text-content-tertiary">Requirements</div></Card>
        <Card hover={false} className="text-center"><div className="text-2xl font-bold text-status-success">{compliantCount}</div><div className="text-xs text-content-tertiary">Compliant</div></Card>
        <Card hover={false} className="text-center"><div className="text-2xl font-bold text-status-danger">{items.filter(r => r.status === 'non_compliant').length}</div><div className="text-xs text-content-tertiary">Non-Compliant</div></Card>
        <Card hover={false} className="text-center"><div className="text-2xl font-bold text-accent">{pct}%</div><div className="text-xs text-content-tertiary">Score</div></Card>
      </div>

      {/* Requirements by group */}
      <div className="space-y-3 mb-6">
        {PCI_REQS.map((title, idx) => {
          const reqNum = idx + 1;
          const reqItems = items.filter(r => r.requirement_number === reqNum);
          const allCompliant = reqItems.length > 0 && reqItems.every(r => r.status === 'compliant');
          return (
            <Card key={reqNum} className="!p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${allCompliant ? 'bg-status-success/20 text-status-success' : 'bg-surface-tertiary text-content-secondary'}`}>{reqNum}</span>
                  <div><div className="text-sm font-medium text-content-primary">{title}</div><div className="text-xs text-content-tertiary">{reqItems.length} sub-requirements</div></div>
                </div>
                {allCompliant && reqItems.length > 0 ? <Badge compliance="compliant">Compliant</Badge> : reqItems.length > 0 ? <Badge compliance="partial">In Progress</Badge> : <Badge compliance="not_assessed">Not Assessed</Badge>}
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <h3 className="mb-3 font-semibold">All Requirements Detail</h3>
        <DataTable columns={[
          { key: 'requirement_number', header: 'Req #', render: (r: PCIReq) => <span className="font-mono font-medium">{r.requirement_number}.{r.sub_requirement}</span> },
          { key: 'title', header: 'Title', render: (r: PCIReq) => <span className="font-medium text-content-primary">{r.title}</span> },
          { key: 'status', header: 'Status', render: (r: PCIReq) => (
            <select value={r.status} onChange={e => updateStatus(r, e.target.value)} className="rounded border border-border bg-surface-tertiary px-2 py-1 text-xs text-content-primary">
              <option value="compliant">Compliant</option><option value="non_compliant">Non-Compliant</option><option value="partial">Partial</option><option value="not_assessed">Not Assessed</option>
            </select>
          )},
          { key: 'actions', header: '', render: (r: PCIReq) => <div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => openEdit(r)}>Edit</Button><Button size="sm" variant="danger" onClick={() => remove(r.id)}>Del</Button></div> },
        ]} data={items} keyField="id" emptyMessage="No PCI requirements added yet." />
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Requirement' : 'Add Requirement'} size="lg"
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Requirement #" value={String(form.requirement_number)} onChange={e => setForm({ ...form, requirement_number: Number(e.target.value) })} options={PCI_REQS.map((_, i) => ({ value: String(i + 1), label: `Req ${i + 1}` }))} />
          <Input label="Sub-Requirement" value={form.sub_requirement} onChange={e => setForm({ ...form, sub_requirement: e.target.value })} placeholder="e.g. 1.1" />
          <div className="sm:col-span-2"><Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
          <div className="sm:col-span-2"><Textarea label="Evidence Notes" value={form.evidence_notes} onChange={e => setForm({ ...form, evidence_notes: e.target.value })} /></div>
          <div className="sm:col-span-2"><Textarea label="Compensating Control" value={form.compensating_control} onChange={e => setForm({ ...form, compensating_control: e.target.value })} /></div>
        </div>
      </Modal>
    </div>
  );
}

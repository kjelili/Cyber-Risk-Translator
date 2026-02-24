import { useEffect, useState, useCallback } from 'react';
import { useApp } from '../../../app/context';
import { get, post, put, del } from '../../../shared/api/client';
import { Card, Button, Badge, DataTable, Modal, Input, Select, LoadingSpinner } from '../../../shared/ui';

type Endpoint = { id: number; project_id: number; hostname: string; ip_address: string; os: string; edr_status: string; av_status: string; patch_status: string; risk_score: number; department: string; criticality: string };

const empty: Omit<Endpoint, 'id'> = { project_id: 0, hostname: '', ip_address: '', os: 'Windows', edr_status: 'active', av_status: 'active', patch_status: 'up_to_date', risk_score: 0, department: '', criticality: 'medium' };

export function EndpointSecurityMain() {
  const { projectId } = useApp();
  const [items, setItems] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Endpoint | null>(null);
  const [form, setForm] = useState(empty);

  const refresh = useCallback(() => {
    if (!projectId) return;
    setLoading(true);
    get<Endpoint[]>(`/endpoints?project_id=${projectId}`).then(setItems).catch(() => setItems([])).finally(() => setLoading(false));
  }, [projectId]);

  useEffect(refresh, [refresh]);

  const openNew = () => { setEditing(null); setForm({ ...empty, project_id: projectId! }); setModalOpen(true); };
  const openEdit = (e: Endpoint) => { setEditing(e); setForm(e); setModalOpen(true); };
  const save = async () => {
    if (editing) await put(`/endpoints/${editing.id}`, form);
    else await post('/endpoints', form);
    setModalOpen(false); refresh();
  };
  const remove = async (id: number) => { await del(`/endpoints/${id}`); refresh(); };

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = { active: 'bg-emerald-500/15 text-status-success border-emerald-500/30', inactive: 'bg-red-500/15 text-status-danger border-red-500/30', not_installed: 'bg-gray-500/15 text-content-tertiary border-border', unknown: 'bg-yellow-500/15 text-status-warning border-yellow-500/30', up_to_date: 'bg-emerald-500/15 text-status-success border-emerald-500/30', outdated: 'bg-yellow-500/15 text-status-warning border-yellow-500/30', critical_missing: 'bg-red-500/15 text-status-danger border-red-500/30' };
    return <Badge className={colors[s] || ''}>{s.replace(/_/g, ' ')}</Badge>;
  };

  if (loading) return <LoadingSpinner size="lg" label="Loading endpoints..." className="py-20" />;

  const activeCount = items.filter(e => e.edr_status === 'active').length;
  const patchedCount = items.filter(e => e.patch_status === 'up_to_date').length;

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div><h1 className="text-2xl font-bold">Endpoint Security</h1><p className="text-sm text-content-tertiary">Monitor EDR, AV, and patch status across your infrastructure</p></div>
        <Button onClick={openNew}>+ Add Endpoint</Button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card hover={false} className="text-center"><div className="text-2xl font-bold text-accent">{items.length}</div><div className="text-xs text-content-tertiary">Total Endpoints</div></Card>
        <Card hover={false} className="text-center"><div className="text-2xl font-bold text-status-success">{activeCount}</div><div className="text-xs text-content-tertiary">EDR Active</div></Card>
        <Card hover={false} className="text-center"><div className="text-2xl font-bold text-status-success">{patchedCount}</div><div className="text-xs text-content-tertiary">Fully Patched</div></Card>
        <Card hover={false} className="text-center"><div className="text-2xl font-bold text-status-warning">{items.length - patchedCount}</div><div className="text-xs text-content-tertiary">Needs Patching</div></Card>
      </div>

      <Card>
        <DataTable columns={[
          { key: 'hostname', header: 'Hostname', render: (r: Endpoint) => <span className="font-medium text-content-primary">{r.hostname}</span> },
          { key: 'ip_address', header: 'IP', render: (r: Endpoint) => <span className="font-mono text-xs">{r.ip_address || '-'}</span> },
          { key: 'os', header: 'OS' },
          { key: 'edr_status', header: 'EDR', render: (r: Endpoint) => statusBadge(r.edr_status) },
          { key: 'av_status', header: 'AV', render: (r: Endpoint) => statusBadge(r.av_status) },
          { key: 'patch_status', header: 'Patches', render: (r: Endpoint) => statusBadge(r.patch_status) },
          { key: 'criticality', header: 'Criticality', render: (r: Endpoint) => <Badge severity={r.criticality}>{r.criticality}</Badge> },
          { key: 'actions', header: '', render: (r: Endpoint) => (
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => openEdit(r)}>Edit</Button>
              <Button size="sm" variant="danger" onClick={() => remove(r.id)}>Del</Button>
            </div>
          )},
        ]} data={items} keyField="id" emptyMessage="No endpoints tracked yet." />
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Endpoint' : 'Add Endpoint'}
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Hostname" value={form.hostname} onChange={e => setForm({ ...form, hostname: e.target.value })} />
          <Input label="IP Address" value={form.ip_address} onChange={e => setForm({ ...form, ip_address: e.target.value })} />
          <Select label="OS" value={form.os} onChange={e => setForm({ ...form, os: e.target.value })} options={[{ value: 'Windows', label: 'Windows' }, { value: 'Linux', label: 'Linux' }, { value: 'macOS', label: 'macOS' }]} />
          <Select label="EDR Status" value={form.edr_status} onChange={e => setForm({ ...form, edr_status: e.target.value })} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'not_installed', label: 'Not Installed' }]} />
          <Select label="AV Status" value={form.av_status} onChange={e => setForm({ ...form, av_status: e.target.value })} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'not_installed', label: 'Not Installed' }]} />
          <Select label="Patch Status" value={form.patch_status} onChange={e => setForm({ ...form, patch_status: e.target.value })} options={[{ value: 'up_to_date', label: 'Up to Date' }, { value: 'outdated', label: 'Outdated' }, { value: 'critical_missing', label: 'Critical Missing' }]} />
          <Input label="Department" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
          <Select label="Criticality" value={form.criticality} onChange={e => setForm({ ...form, criticality: e.target.value })} options={[{ value: 'critical', label: 'Critical' }, { value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }]} />
        </div>
      </Modal>
    </div>
  );
}

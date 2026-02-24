import { useEffect, useState, useCallback } from 'react';
import { useApp } from '../../../app/context';
import { get, post, put, del } from '../../../shared/api/client';
import { Card, Button, Badge, DataTable, Modal, Input, Select, Textarea, LoadingSpinner } from '../../../shared/ui';

type Account = { id: number; project_id: number; provider: string; account_id: string; account_name: string; region: string; status: string; risk_score: number };
type Finding = { id: number; account_id: number; project_id: number; service: string; resource_id: string; title: string; severity: string; description: string; recommendation: string; status: string; compliance_standard: string };

export function CloudSecurityMain() {
  const { projectId } = useApp();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [accModal, setAccModal] = useState(false);
  const [findModal, setFindModal] = useState(false);
  const [accForm, setAccForm] = useState({ project_id: 0, provider: 'AWS', account_id: '', account_name: '', region: 'us-east-1', status: 'active', risk_score: 0 });
  const [findForm, setFindForm] = useState({ account_id: 0, project_id: 0, service: '', resource_id: '', title: '', severity: 'medium', description: '', recommendation: '', status: 'open', compliance_standard: '' });

  const refresh = useCallback(() => {
    if (!projectId) return; setLoading(true);
    Promise.all([get<Account[]>(`/cloud-accounts?project_id=${projectId}`), get<Finding[]>(`/cloud-findings?project_id=${projectId}`)])
      .then(([a, f]) => { setAccounts(a); setFindings(f); }).catch(() => {}).finally(() => setLoading(false));
  }, [projectId]);
  useEffect(refresh, [refresh]);

  const saveAcc = async () => { await post('/cloud-accounts', { ...accForm, project_id: projectId }); setAccModal(false); refresh(); };
  const saveFind = async () => { await post('/cloud-findings', { ...findForm, project_id: projectId }); setFindModal(false); refresh(); };
  const deleteFind = async (id: number) => { await del(`/cloud-findings/${id}`); refresh(); };

  if (loading) return <LoadingSpinner size="lg" label="Loading cloud data..." className="py-20" />;

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div><h1 className="text-2xl font-bold">Cloud Security</h1><p className="text-sm text-content-tertiary">Monitor cloud posture across AWS, Azure, and GCP</p></div>
        <div className="flex gap-2"><Button variant="secondary" onClick={() => { setAccForm({ project_id: projectId!, provider: 'AWS', account_id: '', account_name: '', region: 'us-east-1', status: 'active', risk_score: 0 }); setAccModal(true); }}>+ Account</Button>
          <Button onClick={() => { setFindForm({ account_id: accounts[0]?.id || 0, project_id: projectId!, service: '', resource_id: '', title: '', severity: 'medium', description: '', recommendation: '', status: 'open', compliance_standard: '' }); setFindModal(true); }}>+ Finding</Button></div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card hover={false} className="text-center"><div className="text-2xl font-bold text-accent">{accounts.length}</div><div className="text-xs text-content-tertiary">Cloud Accounts</div></Card>
        <Card hover={false} className="text-center"><div className="text-2xl font-bold text-status-danger">{findings.filter(f => f.severity === 'critical').length}</div><div className="text-xs text-content-tertiary">Critical</div></Card>
        <Card hover={false} className="text-center"><div className="text-2xl font-bold text-status-warning">{findings.filter(f => f.severity === 'high').length}</div><div className="text-xs text-content-tertiary">High</div></Card>
        <Card hover={false} className="text-center"><div className="text-2xl font-bold text-content-primary">{findings.length}</div><div className="text-xs text-content-tertiary">Total Findings</div></Card>
      </div>

      {accounts.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-3">{accounts.map(a => (
          <Card key={a.id} className="!p-4 flex items-center gap-3">
            <span className="text-2xl">{a.provider === 'AWS' ? '🟠' : a.provider === 'Azure' ? '🔵' : '🟢'}</span>
            <div><div className="font-medium text-sm">{a.account_name}</div><div className="text-xs text-content-tertiary">{a.provider} · {a.region}</div></div>
          </Card>
        ))}</div>
      )}

      <Card>
        <h3 className="mb-3 font-semibold">Cloud Findings</h3>
        <DataTable columns={[
          { key: 'severity', header: 'Severity', render: (r: Finding) => <Badge severity={r.severity}>{r.severity}</Badge> },
          { key: 'title', header: 'Finding', render: (r: Finding) => <span className="font-medium text-content-primary">{r.title}</span> },
          { key: 'service', header: 'Service' },
          { key: 'status', header: 'Status', render: (r: Finding) => <Badge>{r.status}</Badge> },
          { key: 'actions', header: '', render: (r: Finding) => <Button size="sm" variant="danger" onClick={() => deleteFind(r.id)}>Del</Button> },
        ]} data={findings} keyField="id" emptyMessage="No cloud findings." />
      </Card>

      <Modal open={accModal} onClose={() => setAccModal(false)} title="Add Cloud Account" footer={<><Button variant="secondary" onClick={() => setAccModal(false)}>Cancel</Button><Button onClick={saveAcc}>Save</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Provider" value={accForm.provider} onChange={e => setAccForm({ ...accForm, provider: e.target.value })} options={[{ value: 'AWS', label: 'AWS' }, { value: 'Azure', label: 'Azure' }, { value: 'GCP', label: 'GCP' }]} />
          <Input label="Account Name" value={accForm.account_name} onChange={e => setAccForm({ ...accForm, account_name: e.target.value })} />
          <Input label="Account ID" value={accForm.account_id} onChange={e => setAccForm({ ...accForm, account_id: e.target.value })} />
          <Input label="Region" value={accForm.region} onChange={e => setAccForm({ ...accForm, region: e.target.value })} />
        </div>
      </Modal>
      <Modal open={findModal} onClose={() => setFindModal(false)} title="Add Cloud Finding" size="lg" footer={<><Button variant="secondary" onClick={() => setFindModal(false)}>Cancel</Button><Button onClick={saveFind}>Save</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Title" value={findForm.title} onChange={e => setFindForm({ ...findForm, title: e.target.value })} />
          <Select label="Severity" value={findForm.severity} onChange={e => setFindForm({ ...findForm, severity: e.target.value })} options={[{ value: 'critical', label: 'Critical' }, { value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }]} />
          <Input label="Service" value={findForm.service} onChange={e => setFindForm({ ...findForm, service: e.target.value })} placeholder="e.g. S3, EC2" />
          <Input label="Resource ID" value={findForm.resource_id} onChange={e => setFindForm({ ...findForm, resource_id: e.target.value })} />
          <div className="sm:col-span-2"><Textarea label="Description" value={findForm.description} onChange={e => setFindForm({ ...findForm, description: e.target.value })} /></div>
          <div className="sm:col-span-2"><Textarea label="Recommendation" value={findForm.recommendation} onChange={e => setFindForm({ ...findForm, recommendation: e.target.value })} /></div>
        </div>
      </Modal>
    </div>
  );
}

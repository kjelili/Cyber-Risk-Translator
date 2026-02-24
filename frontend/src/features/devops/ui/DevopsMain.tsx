import { useEffect, useState, useCallback } from 'react';
import { useApp } from '../../../app/context';
import { get, post, del } from '../../../shared/api/client';
import { Card, Button, Badge, DataTable, Modal, Input, Select, Textarea, LoadingSpinner } from '../../../shared/ui';

type PipelineT = { id: number; project_id: number; name: string; repo_url: string; branch: string; status: string; sast_enabled: boolean; dast_enabled: boolean; sca_enabled: boolean; container_scan_enabled: boolean };
type PipeFind = { id: number; pipeline_id: number; project_id: number; scan_type: string; title: string; severity: string; file_path: string; line_number: number | null; description: string; remediation: string; status: string };

export function DevopsMain() {
  const { projectId } = useApp();
  const [pipes, setPipes] = useState<PipelineT[]>([]);
  const [findings, setFindings] = useState<PipeFind[]>([]);
  const [loading, setLoading] = useState(true);
  const [pipeModal, setPipeModal] = useState(false);
  const [findModal, setFindModal] = useState(false);
  const [pipeForm, setPipeForm] = useState({ project_id: 0, name: '', repo_url: '', branch: 'main', status: 'active', sast_enabled: true, dast_enabled: false, sca_enabled: true, container_scan_enabled: false });
  const [findForm, setFindForm] = useState({ pipeline_id: 0, project_id: 0, scan_type: 'SAST', title: '', severity: 'medium', file_path: '', line_number: null as number | null, description: '', remediation: '', status: 'open' });

  const refresh = useCallback(() => {
    if (!projectId) return; setLoading(true);
    Promise.all([get<PipelineT[]>(`/pipelines?project_id=${projectId}`), get<PipeFind[]>(`/pipeline-findings?project_id=${projectId}`)])
      .then(([p, f]) => { setPipes(p); setFindings(f); }).catch(() => {}).finally(() => setLoading(false));
  }, [projectId]);
  useEffect(refresh, [refresh]);

  const savePipe = async () => { await post('/pipelines', { ...pipeForm, project_id: projectId }); setPipeModal(false); refresh(); };
  const saveFind = async () => { await post('/pipeline-findings', { ...findForm, project_id: projectId }); setFindModal(false); refresh(); };
  const deleteFind = async (id: number) => { await del(`/pipeline-findings/${id}`); refresh(); };

  if (loading) return <LoadingSpinner size="lg" label="Loading DevSecOps data..." className="py-20" />;

  const scanBadge = (enabled: boolean) => enabled ? <span className="text-status-success text-xs">ON</span> : <span className="text-content-tertiary text-xs">OFF</span>;

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div><h1 className="text-2xl font-bold">DevSecOps</h1><p className="text-sm text-content-tertiary">Security scanning in CI/CD pipelines</p></div>
        <div className="flex gap-2"><Button variant="secondary" onClick={() => { setPipeForm({ project_id: projectId!, name: '', repo_url: '', branch: 'main', status: 'active', sast_enabled: true, dast_enabled: false, sca_enabled: true, container_scan_enabled: false }); setPipeModal(true); }}>+ Pipeline</Button>
          <Button onClick={() => { setFindForm({ pipeline_id: pipes[0]?.id || 0, project_id: projectId!, scan_type: 'SAST', title: '', severity: 'medium', file_path: '', line_number: null, description: '', remediation: '', status: 'open' }); setFindModal(true); }}>+ Finding</Button></div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card hover={false} className="text-center"><div className="text-2xl font-bold text-accent">{pipes.length}</div><div className="text-xs text-content-tertiary">Pipelines</div></Card>
        <Card hover={false} className="text-center"><div className="text-2xl font-bold text-status-danger">{findings.filter(f => f.severity === 'critical' || f.severity === 'high').length}</div><div className="text-xs text-content-tertiary">Critical/High</div></Card>
        <Card hover={false} className="text-center"><div className="text-2xl font-bold text-content-primary">{findings.length}</div><div className="text-xs text-content-tertiary">Total Findings</div></Card>
        <Card hover={false} className="text-center"><div className="text-2xl font-bold text-status-success">{findings.filter(f => f.status === 'resolved').length}</div><div className="text-xs text-content-tertiary">Resolved</div></Card>
      </div>

      {pipes.length > 0 && (
        <Card className="mb-6"><h3 className="mb-3 font-semibold">Pipelines</h3>
          <DataTable columns={[
            { key: 'name', header: 'Name', render: (r: PipelineT) => <span className="font-medium text-content-primary">{r.name}</span> },
            { key: 'branch', header: 'Branch', render: (r: PipelineT) => <span className="font-mono text-xs">{r.branch}</span> },
            { key: 'sast_enabled', header: 'SAST', render: (r: PipelineT) => scanBadge(r.sast_enabled) },
            { key: 'dast_enabled', header: 'DAST', render: (r: PipelineT) => scanBadge(r.dast_enabled) },
            { key: 'sca_enabled', header: 'SCA', render: (r: PipelineT) => scanBadge(r.sca_enabled) },
            { key: 'container_scan_enabled', header: 'Container', render: (r: PipelineT) => scanBadge(r.container_scan_enabled) },
          ]} data={pipes} keyField="id" />
        </Card>
      )}

      <Card><h3 className="mb-3 font-semibold">Pipeline Findings</h3>
        <DataTable columns={[
          { key: 'severity', header: 'Sev', render: (r: PipeFind) => <Badge severity={r.severity}>{r.severity}</Badge> },
          { key: 'scan_type', header: 'Type', render: (r: PipeFind) => <Badge>{r.scan_type}</Badge> },
          { key: 'title', header: 'Finding', render: (r: PipeFind) => <span className="font-medium text-content-primary">{r.title}</span> },
          { key: 'file_path', header: 'File', render: (r: PipeFind) => <span className="font-mono text-xs">{r.file_path || '-'}</span> },
          { key: 'status', header: 'Status' },
          { key: 'actions', header: '', render: (r: PipeFind) => <Button size="sm" variant="danger" onClick={() => deleteFind(r.id)}>Del</Button> },
        ]} data={findings} keyField="id" emptyMessage="No pipeline findings." />
      </Card>

      <Modal open={pipeModal} onClose={() => setPipeModal(false)} title="Add Pipeline" footer={<><Button variant="secondary" onClick={() => setPipeModal(false)}>Cancel</Button><Button onClick={savePipe}>Save</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Pipeline Name" value={pipeForm.name} onChange={e => setPipeForm({ ...pipeForm, name: e.target.value })} />
          <Input label="Repo URL" value={pipeForm.repo_url} onChange={e => setPipeForm({ ...pipeForm, repo_url: e.target.value })} />
          <Input label="Branch" value={pipeForm.branch} onChange={e => setPipeForm({ ...pipeForm, branch: e.target.value })} />
        </div>
      </Modal>
      <Modal open={findModal} onClose={() => setFindModal(false)} title="Add Finding" size="lg" footer={<><Button variant="secondary" onClick={() => setFindModal(false)}>Cancel</Button><Button onClick={saveFind}>Save</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Title" value={findForm.title} onChange={e => setFindForm({ ...findForm, title: e.target.value })} />
          <Select label="Scan Type" value={findForm.scan_type} onChange={e => setFindForm({ ...findForm, scan_type: e.target.value })} options={[{ value: 'SAST', label: 'SAST' }, { value: 'DAST', label: 'DAST' }, { value: 'SCA', label: 'SCA' }, { value: 'Container', label: 'Container' }]} />
          <Select label="Severity" value={findForm.severity} onChange={e => setFindForm({ ...findForm, severity: e.target.value })} options={[{ value: 'critical', label: 'Critical' }, { value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }]} />
          <Input label="File Path" value={findForm.file_path} onChange={e => setFindForm({ ...findForm, file_path: e.target.value })} />
          <div className="sm:col-span-2"><Textarea label="Remediation" value={findForm.remediation} onChange={e => setFindForm({ ...findForm, remediation: e.target.value })} /></div>
        </div>
      </Modal>
    </div>
  );
}

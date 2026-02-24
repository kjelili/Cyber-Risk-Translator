import { useEffect, useState } from 'react';
import { useApp } from '../../../app/context';
import { Button, Card, Input, Select, DataTable } from '../../../shared/ui';
import { healthCheck } from '../../../shared/api/client';
import { listProjects, createProject, type ProjectOut } from '../api/projects.api';

export function ProjectsMain() {
  const { navigate, setProject } = useApp();
  const [projects, setProjects] = useState<ProjectOut[]>([]);
  const [name, setName] = useState('ACME Q1 PenTest');
  const [industry, setIndustry] = useState('fintech');
  const [currency, setCurrency] = useState('GBP');
  const [revenue, setRevenue] = useState('50000');
  const [loading, setLoading] = useState(false);
  const [backendOk, setBackendOk] = useState<boolean | null>(null);
  const [error, setError] = useState('');

  async function refresh() {
    try {
      setProjects(await listProjects());
      setBackendOk(true);
      setError('');
    } catch (e: unknown) {
      setBackendOk(false);
      setError(e instanceof Error ? e.message : 'Cannot reach backend');
    }
  }

  useEffect(() => {
    healthCheck().then(ok => { setBackendOk(ok); if (ok) refresh(); else setError('Backend not running. Start: cd backend && uvicorn app.main:app --reload --port 8000'); });
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      await createProject({ name: name.trim(), industry, currency, revenue_per_hour: Number(revenue) });
      await refresh();
      setName('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (p: ProjectOut) => {
    setProject(p.id, p.name);
    navigate('roc-overview');
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="text-sm text-content-tertiary">Create and manage security assessment projects</p>
      </div>

      {backendOk === false && (
        <Card className="mb-6 border-status-danger/40 bg-status-danger/5">
          <p className="font-semibold text-status-danger">Backend not available</p>
          <p className="mt-1 text-sm text-content-secondary">{error}</p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={() => healthCheck().then(ok => { setBackendOk(ok); if (ok) refresh(); })}>
            Check again
          </Button>
        </Card>
      )}

      {error && backendOk && (
        <Card className="mb-6 border-status-danger/40 bg-status-danger/5">
          <p className="text-sm text-status-danger">{error}</p>
        </Card>
      )}

      <Card className="mb-6">
        <h3 className="mb-4 text-lg font-semibold">Create New Project</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="Project Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., ACME Q1 PenTest" />
          <Select label="Industry" value={industry} onChange={e => setIndustry(e.target.value)} options={[
            { value: 'fintech', label: 'Fintech' }, { value: 'healthcare', label: 'Healthcare' },
            { value: 'retail', label: 'Retail' }, { value: 'technology', label: 'Technology' }, { value: 'generic', label: 'Generic' },
          ]} />
          <Select label="Currency" value={currency} onChange={e => setCurrency(e.target.value)} options={[
            { value: 'GBP', label: 'GBP (£)' }, { value: 'USD', label: 'USD ($)' }, { value: 'EUR', label: 'EUR (€)' },
          ]} />
          <Input label="Revenue/Hour" type="number" value={revenue} onChange={e => setRevenue(e.target.value)} />
        </div>
        <Button className="mt-4 w-full sm:w-auto" disabled={loading || !name.trim()} onClick={handleCreate}>
          {loading ? 'Creating...' : 'Create Project'}
        </Button>
      </Card>

      <Card>
        <h3 className="mb-4 text-lg font-semibold">Existing Projects</h3>
        <DataTable
          columns={[
            { key: 'id', header: 'ID', render: (r: ProjectOut) => <span className="font-mono">#{r.id}</span> },
            { key: 'name', header: 'Name', render: (r: ProjectOut) => <span className="font-medium text-content-primary">{r.name}</span> },
            { key: 'industry', header: 'Industry' },
            { key: 'currency', header: 'Currency' },
            { key: 'revenue_per_hour', header: 'Rev/Hour', render: (r: ProjectOut) => r.revenue_per_hour.toLocaleString() },
            { key: 'actions', header: '', render: (r: ProjectOut) => <Button size="sm" onClick={() => handleSelect(r)}>Open</Button> },
          ]}
          data={projects}
          keyField="id"
          emptyMessage="No projects yet. Create your first project above."
        />
      </Card>
    </div>
  );
}

import { useEffect, useState, useCallback } from 'react';
import { useApp } from '../../../app/context';
import { get, post, del } from '../../../shared/api/client';
import { Card, Button, Badge, DataTable, Modal, Input, Select, LoadingSpinner } from '../../../shared/ui';

type SBOM = { id: number; project_id: number; package_name: string; version: string; ecosystem: string; license: string; direct_dependency: boolean; vulnerability_count: number; risk_score: number; latest_version: string; outdated: boolean };
type Vuln = { id: number; sbom_entry_id: number; project_id: number; cve_id: string; severity: string; cvss: number | null; description: string; fixed_version: string; status: string; exploitable: boolean };

export function SupplyChainMain() {
  const { projectId } = useApp();
  const [entries, setEntries] = useState<SBOM[]>([]);
  const [vulns, setVulns] = useState<Vuln[]>([]);
  const [loading, setLoading] = useState(true);
  const [sbomModal, setSbomModal] = useState(false);
  const [vulnModal, setVulnModal] = useState(false);
  const [sbomForm, setSbomForm] = useState({ project_id: 0, package_name: '', version: '', ecosystem: 'npm', license: 'MIT', direct_dependency: true, vulnerability_count: 0, risk_score: 0, latest_version: '', outdated: false });
  const [vulnForm, setVulnForm] = useState({ sbom_entry_id: 0, project_id: 0, cve_id: '', severity: 'medium', cvss: null as number | null, description: '', fixed_version: '', status: 'open', exploitable: false });

  const refresh = useCallback(() => {
    if (!projectId) return; setLoading(true);
    Promise.all([get<SBOM[]>(`/sbom-entries?project_id=${projectId}`), get<Vuln[]>(`/supply-chain-vulns?project_id=${projectId}`)])
      .then(([s, v]) => { setEntries(s); setVulns(v); }).catch(() => {}).finally(() => setLoading(false));
  }, [projectId]);
  useEffect(refresh, [refresh]);

  const saveSbom = async () => { await post('/sbom-entries', { ...sbomForm, project_id: projectId }); setSbomModal(false); refresh(); };
  const saveVuln = async () => { await post('/supply-chain-vulns', { ...vulnForm, project_id: projectId }); setVulnModal(false); refresh(); };
  const deleteSbom = async (id: number) => { await del(`/sbom-entries/${id}`); refresh(); };
  const deleteVuln = async (id: number) => { await del(`/supply-chain-vulns/${id}`); refresh(); };

  if (loading) return <LoadingSpinner size="lg" label="Loading supply chain data..." className="py-20" />;

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div><h1 className="text-2xl font-bold">Software Supply Chain Risk</h1><p className="text-sm text-content-tertiary">SBOM analysis, dependency vulnerabilities, and license compliance</p></div>
        <div className="flex gap-2"><Button variant="secondary" onClick={() => { setSbomForm({ project_id: projectId!, package_name: '', version: '', ecosystem: 'npm', license: 'MIT', direct_dependency: true, vulnerability_count: 0, risk_score: 0, latest_version: '', outdated: false }); setSbomModal(true); }}>+ Package</Button>
          <Button onClick={() => { setVulnForm({ sbom_entry_id: entries[0]?.id || 0, project_id: projectId!, cve_id: '', severity: 'medium', cvss: null, description: '', fixed_version: '', status: 'open', exploitable: false }); setVulnModal(true); }}>+ Vulnerability</Button></div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card hover={false} className="text-center"><div className="text-2xl font-bold text-accent">{entries.length}</div><div className="text-xs text-content-tertiary">Packages</div></Card>
        <Card hover={false} className="text-center"><div className="text-2xl font-bold text-status-warning">{entries.filter(e => e.outdated).length}</div><div className="text-xs text-content-tertiary">Outdated</div></Card>
        <Card hover={false} className="text-center"><div className="text-2xl font-bold text-status-danger">{vulns.length}</div><div className="text-xs text-content-tertiary">Vulnerabilities</div></Card>
        <Card hover={false} className="text-center"><div className="text-2xl font-bold text-status-danger">{vulns.filter(v => v.exploitable).length}</div><div className="text-xs text-content-tertiary">Exploitable</div></Card>
      </div>

      <Card className="mb-6"><h3 className="mb-3 font-semibold">SBOM Inventory</h3>
        <DataTable columns={[
          { key: 'package_name', header: 'Package', render: (r: SBOM) => <span className="font-mono text-sm font-medium text-content-primary">{r.package_name}</span> },
          { key: 'version', header: 'Version', render: (r: SBOM) => <span className="font-mono text-xs">{r.version}</span> },
          { key: 'ecosystem', header: 'Ecosystem', render: (r: SBOM) => <Badge>{r.ecosystem}</Badge> },
          { key: 'license', header: 'License' },
          { key: 'vulnerability_count', header: 'Vulns', render: (r: SBOM) => <span className={r.vulnerability_count > 0 ? 'font-bold text-status-danger' : 'text-content-tertiary'}>{r.vulnerability_count}</span> },
          { key: 'outdated', header: 'Status', render: (r: SBOM) => r.outdated ? <Badge className="bg-yellow-500/15 text-status-warning border-yellow-500/30">Outdated</Badge> : <Badge className="bg-emerald-500/15 text-status-success border-emerald-500/30">Current</Badge> },
          { key: 'actions', header: '', render: (r: SBOM) => <Button size="sm" variant="danger" onClick={() => deleteSbom(r.id)}>Del</Button> },
        ]} data={entries} keyField="id" emptyMessage="No packages tracked." />
      </Card>

      <Card><h3 className="mb-3 font-semibold">Known Vulnerabilities</h3>
        <DataTable columns={[
          { key: 'severity', header: 'Sev', render: (r: Vuln) => <Badge severity={r.severity}>{r.severity}</Badge> },
          { key: 'cve_id', header: 'CVE', render: (r: Vuln) => <span className="font-mono text-xs font-medium text-content-primary">{r.cve_id}</span> },
          { key: 'description', header: 'Description', render: (r: Vuln) => <span className="text-xs truncate max-w-[200px] inline-block">{r.description}</span> },
          { key: 'fixed_version', header: 'Fix Version' },
          { key: 'exploitable', header: 'Exploitable', render: (r: Vuln) => r.exploitable ? <span className="text-status-danger font-bold">Yes</span> : <span className="text-content-tertiary">No</span> },
          { key: 'status', header: 'Status', render: (r: Vuln) => <Badge>{r.status}</Badge> },
          { key: 'actions', header: '', render: (r: Vuln) => <Button size="sm" variant="danger" onClick={() => deleteVuln(r.id)}>Del</Button> },
        ]} data={vulns} keyField="id" emptyMessage="No vulnerabilities found." />
      </Card>

      <Modal open={sbomModal} onClose={() => setSbomModal(false)} title="Add Package" footer={<><Button variant="secondary" onClick={() => setSbomModal(false)}>Cancel</Button><Button onClick={saveSbom}>Save</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Package Name" value={sbomForm.package_name} onChange={e => setSbomForm({ ...sbomForm, package_name: e.target.value })} />
          <Input label="Version" value={sbomForm.version} onChange={e => setSbomForm({ ...sbomForm, version: e.target.value })} />
          <Select label="Ecosystem" value={sbomForm.ecosystem} onChange={e => setSbomForm({ ...sbomForm, ecosystem: e.target.value })} options={[{ value: 'npm', label: 'npm' }, { value: 'pip', label: 'pip' }, { value: 'maven', label: 'Maven' }, { value: 'nuget', label: 'NuGet' }, { value: 'go', label: 'Go' }]} />
          <Input label="License" value={sbomForm.license} onChange={e => setSbomForm({ ...sbomForm, license: e.target.value })} />
        </div>
      </Modal>
      <Modal open={vulnModal} onClose={() => setVulnModal(false)} title="Add Vulnerability" footer={<><Button variant="secondary" onClick={() => setVulnModal(false)}>Cancel</Button><Button onClick={saveVuln}>Save</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="CVE ID" value={vulnForm.cve_id} onChange={e => setVulnForm({ ...vulnForm, cve_id: e.target.value })} placeholder="CVE-2024-XXXXX" />
          <Select label="Severity" value={vulnForm.severity} onChange={e => setVulnForm({ ...vulnForm, severity: e.target.value })} options={[{ value: 'critical', label: 'Critical' }, { value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }]} />
          <Input label="Fixed Version" value={vulnForm.fixed_version} onChange={e => setVulnForm({ ...vulnForm, fixed_version: e.target.value })} />
          <Input label="Description" value={vulnForm.description} onChange={e => setVulnForm({ ...vulnForm, description: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}

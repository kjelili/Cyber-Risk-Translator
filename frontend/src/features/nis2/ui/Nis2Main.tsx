import { useEffect, useState, useCallback } from 'react';
import { useApp } from '../../../app/context';
import { get, post, put, del } from '../../../shared/api/client';
import { Card, Button, Badge, DataTable, Modal, Input, Select, Textarea, LoadingSpinner } from '../../../shared/ui';

type Article = { id: number; project_id: number; article_number: string; title: string; description: string; status: string; evidence_notes: string; responsible_party: string; due_date: string | null; last_reviewed: string | null };
type NIS2Inc = { id: number; project_id: number; incident_type: string; severity: string; title: string; description: string; detected_at: string; reported_at: string | null; reporting_deadline: string; status: string; authority_notified: boolean; affected_services: string };

const NIS2_ARTICLES = [
  { num: '21', title: 'Cybersecurity risk-management measures' },
  { num: '23', title: 'Reporting obligations' },
  { num: '24', title: 'Use of European cybersecurity certification schemes' },
  { num: '25', title: 'Standardisation' },
  { num: '26', title: 'Peer reviews' },
  { num: '28', title: 'Database of domain name registration data' },
  { num: '29', title: 'Cybersecurity information-sharing arrangements' },
  { num: '32', title: 'Supervisory and enforcement measures (essential entities)' },
  { num: '33', title: 'Supervisory and enforcement measures (important entities)' },
  { num: '34', title: 'General conditions for imposing administrative fines' },
];

export function Nis2Main() {
  const { projectId } = useApp();
  const [articles, setArticles] = useState<Article[]>([]);
  const [incidents, setIncidents] = useState<NIS2Inc[]>([]);
  const [loading, setLoading] = useState(true);
  const [artModal, setArtModal] = useState(false);
  const [incModal, setIncModal] = useState(false);
  const [artForm, setArtForm] = useState({ project_id: 0, article_number: '21', title: '', description: '', status: 'not_assessed', evidence_notes: '', responsible_party: '', due_date: '' });
  const [incForm, setIncForm] = useState({ project_id: 0, incident_type: 'cyber_attack', severity: 'medium', title: '', description: '', detected_at: '', reporting_deadline: '', status: 'detected', authority_notified: false, affected_services: '' });

  const refresh = useCallback(() => {
    if (!projectId) return; setLoading(true);
    Promise.all([get<Article[]>(`/nis2-articles?project_id=${projectId}`), get<NIS2Inc[]>(`/nis2-incidents?project_id=${projectId}`)])
      .then(([a, i]) => { setArticles(a); setIncidents(i); }).catch(() => {}).finally(() => setLoading(false));
  }, [projectId]);
  useEffect(refresh, [refresh]);

  const saveArt = async () => { await post('/nis2-articles', { ...artForm, project_id: projectId }); setArtModal(false); refresh(); };
  const saveInc = async () => { await post('/nis2-incidents', { ...incForm, project_id: projectId }); setIncModal(false); refresh(); };
  const deleteArt = async (id: number) => { await del(`/nis2-articles/${id}`); refresh(); };
  const deleteInc = async (id: number) => { await del(`/nis2-incidents/${id}`); refresh(); };
  const updateArtStatus = async (art: Article, status: string) => { await put(`/nis2-articles/${art.id}`, { ...art, status }); refresh(); };

  if (loading) return <LoadingSpinner size="lg" label="Loading NIS2 data..." className="py-20" />;

  const compliant = articles.filter(a => a.status === 'compliant').length;
  const pct = articles.length > 0 ? Math.round((compliant / articles.length) * 100) : 0;
  const overdueInc = incidents.filter(i => !i.authority_notified && i.reporting_deadline && new Date(i.reporting_deadline) < new Date()).length;

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div><h1 className="text-2xl font-bold">NIS2 Compliance</h1><p className="text-sm text-content-tertiary">NIS2 Directive compliance tracking and incident reporting</p></div>
        <div className="flex gap-2"><Button variant="secondary" onClick={() => { setArtForm({ project_id: projectId!, article_number: '21', title: NIS2_ARTICLES[0].title, description: '', status: 'not_assessed', evidence_notes: '', responsible_party: '', due_date: '' }); setArtModal(true); }}>+ Article</Button>
          <Button onClick={() => { setIncForm({ project_id: projectId!, incident_type: 'cyber_attack', severity: 'medium', title: '', description: '', detected_at: new Date().toISOString().slice(0, 10), reporting_deadline: '', status: 'detected', authority_notified: false, affected_services: '' }); setIncModal(true); }}>+ Incident</Button></div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card hover={false} className="text-center"><div className="text-2xl font-bold text-accent">{articles.length}</div><div className="text-xs text-content-tertiary">Articles Tracked</div></Card>
        <Card hover={false} className="text-center"><div className="text-2xl font-bold text-status-success">{compliant}</div><div className="text-xs text-content-tertiary">Compliant</div></Card>
        <Card hover={false} className="text-center"><div className="text-2xl font-bold text-accent">{pct}%</div><div className="text-xs text-content-tertiary">Compliance Score</div></Card>
        <Card hover={false} className="text-center"><div className="text-2xl font-bold text-status-danger">{overdueInc}</div><div className="text-xs text-content-tertiary">Overdue Reports</div></Card>
      </div>

      <Card className="mb-6"><h3 className="mb-3 font-semibold">NIS2 Article Compliance</h3>
        <DataTable columns={[
          { key: 'article_number', header: 'Article', render: (r: Article) => <span className="font-mono font-medium text-content-primary">Art. {r.article_number}</span> },
          { key: 'title', header: 'Title', render: (r: Article) => <span className="font-medium text-content-primary">{r.title}</span> },
          { key: 'status', header: 'Status', render: (r: Article) => (
            <select value={r.status} onChange={e => updateArtStatus(r, e.target.value)} className="rounded border border-border bg-surface-tertiary px-2 py-1 text-xs text-content-primary">
              <option value="compliant">Compliant</option><option value="non_compliant">Non-Compliant</option><option value="partial">Partial</option><option value="not_assessed">Not Assessed</option>
            </select>
          )},
          { key: 'responsible_party', header: 'Owner' },
          { key: 'due_date', header: 'Due Date' },
          { key: 'actions', header: '', render: (r: Article) => <Button size="sm" variant="danger" onClick={() => deleteArt(r.id)}>Del</Button> },
        ]} data={articles} keyField="id" emptyMessage="No NIS2 articles tracked yet." />
      </Card>

      <Card><h3 className="mb-3 font-semibold">NIS2 Incident Reporting</h3>
        <DataTable columns={[
          { key: 'severity', header: 'Sev', render: (r: NIS2Inc) => <Badge severity={r.severity}>{r.severity}</Badge> },
          { key: 'title', header: 'Incident', render: (r: NIS2Inc) => <span className="font-medium text-content-primary">{r.title}</span> },
          { key: 'detected_at', header: 'Detected' },
          { key: 'reporting_deadline', header: 'Deadline', render: (r: NIS2Inc) => {
            const overdue = r.reporting_deadline && new Date(r.reporting_deadline) < new Date() && !r.authority_notified;
            return <span className={overdue ? 'font-bold text-status-danger' : ''}>{r.reporting_deadline || '-'}</span>;
          }},
          { key: 'authority_notified', header: 'Notified', render: (r: NIS2Inc) => r.authority_notified ? <span className="text-status-success">Yes</span> : <span className="text-status-danger">No</span> },
          { key: 'actions', header: '', render: (r: NIS2Inc) => <Button size="sm" variant="danger" onClick={() => deleteInc(r.id)}>Del</Button> },
        ]} data={incidents} keyField="id" emptyMessage="No NIS2 incidents reported." />
      </Card>

      <Modal open={artModal} onClose={() => setArtModal(false)} title="Add NIS2 Article" footer={<><Button variant="secondary" onClick={() => setArtModal(false)}>Cancel</Button><Button onClick={saveArt}>Save</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Article" value={artForm.article_number} onChange={e => { const a = NIS2_ARTICLES.find(x => x.num === e.target.value); setArtForm({ ...artForm, article_number: e.target.value, title: a?.title || '' }); }} options={NIS2_ARTICLES.map(a => ({ value: a.num, label: `Art. ${a.num} - ${a.title}` }))} />
          <Input label="Responsible Party" value={artForm.responsible_party} onChange={e => setArtForm({ ...artForm, responsible_party: e.target.value })} />
          <Input label="Due Date" type="date" value={artForm.due_date} onChange={e => setArtForm({ ...artForm, due_date: e.target.value })} />
          <div className="sm:col-span-2"><Textarea label="Evidence Notes" value={artForm.evidence_notes} onChange={e => setArtForm({ ...artForm, evidence_notes: e.target.value })} /></div>
        </div>
      </Modal>
      <Modal open={incModal} onClose={() => setIncModal(false)} title="Report NIS2 Incident" size="lg" footer={<><Button variant="secondary" onClick={() => setIncModal(false)}>Cancel</Button><Button onClick={saveInc}>Save</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Title" value={incForm.title} onChange={e => setIncForm({ ...incForm, title: e.target.value })} />
          <Select label="Severity" value={incForm.severity} onChange={e => setIncForm({ ...incForm, severity: e.target.value })} options={[{ value: 'critical', label: 'Critical' }, { value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }]} />
          <Input label="Detected At" type="date" value={incForm.detected_at} onChange={e => setIncForm({ ...incForm, detected_at: e.target.value })} />
          <Input label="Reporting Deadline" type="date" value={incForm.reporting_deadline} onChange={e => setIncForm({ ...incForm, reporting_deadline: e.target.value })} />
          <div className="sm:col-span-2"><Input label="Affected Services" value={incForm.affected_services} onChange={e => setIncForm({ ...incForm, affected_services: e.target.value })} /></div>
          <div className="sm:col-span-2"><Textarea label="Description" value={incForm.description} onChange={e => setIncForm({ ...incForm, description: e.target.value })} /></div>
        </div>
      </Modal>
    </div>
  );
}

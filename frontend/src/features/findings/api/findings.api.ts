import { get, post } from '../../../shared/api/client';

export type FindingOut = {
  id: number; project_id: number; title: string; severity: string;
  cvss: number | null; asset: string; endpoint: string | null;
  owasp: string | null; cwe: string | null;
};

export type TicketJSON = {
  summary: string; description_markdown: string; root_cause_hypothesis: string;
  steps_to_reproduce: string[]; remediation_steps: string[]; acceptance_criteria: string[];
  priority: string; labels: string[];
};

export type ExecJSON = {
  one_liner: string; business_impact: string; likelihood: string; impact: string;
  estimated_exposure: { currency: string; point: number; low: number; high: number;
    drivers: { name: string; value: number }[]; assumptions: string[] };
  recommended_decision: string; board_questions: string[];
};

export const listFindings = (projectId: number) => get<FindingOut[]>(`/projects/${projectId}/findings`);
export const getFinding = (id: number) => get<FindingOut>(`/findings/${id}`);
export const genDev = (id: number) => post<TicketJSON>(`/findings/${id}/generate/dev`);
export const genExec = (id: number) => post<ExecJSON>(`/findings/${id}/generate/exec`);

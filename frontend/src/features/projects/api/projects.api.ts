import { get, post } from '../../../shared/api/client';

export type ProjectOut = {
  id: number;
  name: string;
  industry: string;
  currency: string;
  revenue_per_hour: number;
};

export type ProjectCreate = {
  name: string;
  industry: string;
  currency: string;
  revenue_per_hour: number;
};

export const listProjects = () => get<ProjectOut[]>('/projects');
export const createProject = (data: ProjectCreate) => post<ProjectOut>('/projects', data);

import { API_BASE } from '../config';

class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function handleResponse<T>(r: Response): Promise<T> {
  const text = await r.text();
  let data: unknown;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }
  if (!r.ok) {
    const detail = data && typeof data === 'object' && 'detail' in data
      ? (data as { detail: string }).detail
      : r.statusText || `Request failed (${r.status})`;
    throw new ApiError(String(detail), r.status, data);
  }
  return data as T;
}

export async function get<T>(path: string): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`);
  return handleResponse<T>(r);
}

export async function post<T>(path: string, body?: unknown): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(r);
}

export async function put<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(r);
}

export async function del<T = void>(path: string): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`, { method: 'DELETE' });
  return handleResponse<T>(r);
}

export async function upload<T>(path: string, file: File): Promise<T> {
  const fd = new FormData();
  fd.append('file', file);
  const r = await fetch(`${API_BASE}${path}`, { method: 'POST', body: fd });
  return handleResponse<T>(r);
}

export async function healthCheck(): Promise<boolean> {
  try {
    const r = await fetch(`${API_BASE}/health`);
    return r.ok;
  } catch {
    return false;
  }
}

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Route, RouteParams } from '../shared/types';

type AppState = {
  route: Route;
  params: RouteParams;
  projectId: number | null;
  projectName: string;
  navigate: (route: Route, params?: RouteParams) => void;
  setProject: (id: number | null, name?: string) => void;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>('landing');
  const [params, setParams] = useState<RouteParams>({});
  const [projectId, setProjectId] = useState<number | null>(null);
  const [projectName, setProjectName] = useState('');

  const navigate = useCallback((r: Route, p?: RouteParams) => {
    setRoute(r);
    setParams(p || {});
  }, []);

  const setProject = useCallback((id: number | null, name?: string) => {
    setProjectId(id);
    setProjectName(name || '');
  }, []);

  return (
    <AppContext.Provider value={{ route, params, projectId, projectName, navigate, setProject }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

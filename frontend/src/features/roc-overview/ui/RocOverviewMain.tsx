import { useEffect, useState } from 'react';
import { useApp } from '../../../app/context';
import { Card, Badge, Button, LoadingSpinner } from '../../../shared/ui';
import { get } from '../../../shared/api/client';

type ModuleStatus = { module: string; icon: string; route: string; items: number; critical: number; status: 'healthy' | 'warning' | 'critical' };

export function RocOverviewMain() {
  const { projectId, navigate } = useApp();
  const [modules, setModules] = useState<ModuleStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) { setLoading(false); return; }
    get<{ count: number }>(`/projects/${projectId}/stats`).then(stats => {
      setModules([
        { module: 'Risk Assessment', icon: '🔍', route: 'findings', items: stats.count, critical: 0, status: stats.count > 0 ? 'warning' : 'healthy' },
        { module: 'Endpoint Security', icon: '💻', route: 'endpoint-security', items: 0, critical: 0, status: 'healthy' },
        { module: 'Compliance', icon: '✅', route: 'compliance', items: 0, critical: 0, status: 'healthy' },
        { module: 'PCI DSS', icon: '💳', route: 'pci-compliance', items: 0, critical: 0, status: 'healthy' },
        { module: 'Cloud Security', icon: '☁️', route: 'cloud-security', items: 0, critical: 0, status: 'healthy' },
        { module: 'DevSecOps', icon: '🔧', route: 'devops', items: 0, critical: 0, status: 'healthy' },
        { module: 'Threat Protection', icon: '⚡', route: 'threat-protection', items: 0, critical: 0, status: 'healthy' },
        { module: 'Supply Chain', icon: '📦', route: 'supply-chain', items: 0, critical: 0, status: 'healthy' },
        { module: 'NIS2', icon: '🇪🇺', route: 'nis2', items: 0, critical: 0, status: 'healthy' },
      ]);
    }).catch(() => {
      setModules([
        { module: 'Risk Assessment', icon: '🔍', route: 'findings', items: 0, critical: 0, status: 'healthy' },
        { module: 'Endpoint Security', icon: '💻', route: 'endpoint-security', items: 0, critical: 0, status: 'healthy' },
        { module: 'Compliance', icon: '✅', route: 'compliance', items: 0, critical: 0, status: 'healthy' },
        { module: 'PCI DSS', icon: '💳', route: 'pci-compliance', items: 0, critical: 0, status: 'healthy' },
        { module: 'Cloud Security', icon: '☁️', route: 'cloud-security', items: 0, critical: 0, status: 'healthy' },
        { module: 'DevSecOps', icon: '🔧', route: 'devops', items: 0, critical: 0, status: 'healthy' },
        { module: 'Threat Protection', icon: '⚡', route: 'threat-protection', items: 0, critical: 0, status: 'healthy' },
        { module: 'Supply Chain', icon: '📦', route: 'supply-chain', items: 0, critical: 0, status: 'healthy' },
        { module: 'NIS2', icon: '🇪🇺', route: 'nis2', items: 0, critical: 0, status: 'healthy' },
      ]);
    }).finally(() => setLoading(false));
  }, [projectId]);

  if (loading) return <LoadingSpinner size="lg" label="Loading dashboard..." className="py-20" />;

  const statusColor = (s: string) => s === 'critical' ? 'text-status-danger' : s === 'warning' ? 'text-status-warning' : 'text-status-success';

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Cybersecurity Risk Operation Centre</h1>
        <p className="text-sm text-content-tertiary">Unified view across all security modules</p>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card hover={false} className="text-center"><div className="text-2xl font-bold text-accent">{modules.length}</div><div className="text-xs text-content-tertiary">Active Modules</div></Card>
        <Card hover={false} className="text-center"><div className="text-2xl font-bold text-status-danger">{modules.filter(m => m.status === 'critical').length}</div><div className="text-xs text-content-tertiary">Critical Alerts</div></Card>
        <Card hover={false} className="text-center"><div className="text-2xl font-bold text-status-warning">{modules.filter(m => m.status === 'warning').length}</div><div className="text-xs text-content-tertiary">Warnings</div></Card>
        <Card hover={false} className="text-center"><div className="text-2xl font-bold text-status-success">{modules.filter(m => m.status === 'healthy').length}</div><div className="text-xs text-content-tertiary">Healthy</div></Card>
      </div>

      {/* Module grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map(m => (
          <Card key={m.module} className="cursor-pointer" onClick={() => navigate(m.route as any)}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{m.icon}</span>
                <div>
                  <div className="font-semibold text-content-primary">{m.module}</div>
                  <div className="text-xs text-content-tertiary">{m.items} items tracked</div>
                </div>
              </div>
              <span className={`text-lg ${statusColor(m.status)}`}>{m.status === 'critical' ? '●' : m.status === 'warning' ? '●' : '●'}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

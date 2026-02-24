export const API_BASE = 'http://127.0.0.1:8000';

export const NAV_GROUPS: { label: string; items: { route: string; label: string; icon: string; requiresProject?: boolean }[] }[] = [
  {
    label: 'Overview',
    items: [
      { route: 'roc-overview' as const, label: 'CROC Dashboard', icon: '🛡️' },
    ],
  },
  {
    label: 'Risk Assessment',
    items: [
      { route: 'projects' as const, label: 'Projects', icon: '📁' },
      { route: 'upload' as const, label: 'Upload Scan', icon: '📤', requiresProject: true },
      { route: 'findings' as const, label: 'Findings', icon: '🔍', requiresProject: true },
      { route: 'exec-dashboard' as const, label: 'Executive View', icon: '📊', requiresProject: true },
    ],
  },
  {
    label: 'Security Operations',
    items: [
      { route: 'endpoint-security' as const, label: 'Endpoint Security', icon: '💻', requiresProject: true },
      { route: 'threat-protection' as const, label: 'Threat Protection', icon: '⚡', requiresProject: true },
    ],
  },
  {
    label: 'Compliance',
    items: [
      { route: 'compliance' as const, label: 'Compliance', icon: '✅', requiresProject: true },
      { route: 'pci-compliance' as const, label: 'PCI DSS', icon: '💳', requiresProject: true },
      { route: 'nis2' as const, label: 'NIS2', icon: '🇪🇺', requiresProject: true },
    ],
  },
  {
    label: 'Technology Risk',
    items: [
      { route: 'cloud-security' as const, label: 'Cloud Security', icon: '☁️', requiresProject: true },
      { route: 'devops' as const, label: 'DevSecOps', icon: '🔧', requiresProject: true },
      { route: 'supply-chain' as const, label: 'Supply Chain', icon: '📦', requiresProject: true },
    ],
  },
];

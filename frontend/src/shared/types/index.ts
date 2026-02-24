export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type Status = 'open' | 'in_progress' | 'resolved' | 'closed';
export type ComplianceStatus = 'compliant' | 'non_compliant' | 'partial' | 'not_assessed';
export type IRMaturity = 'Low' | 'Medium' | 'High';
export type CloudProvider = 'AWS' | 'Azure' | 'GCP';
export type ScanType = 'SAST' | 'DAST' | 'SCA' | 'Container';
export type IOCType = 'ip' | 'domain' | 'hash' | 'url';

export type Route =
  | 'landing'
  | 'roc-overview'
  | 'projects'
  | 'upload'
  | 'findings'
  | 'finding-detail'
  | 'exec-dashboard'
  | 'endpoint-security'
  | 'compliance'
  | 'pci-compliance'
  | 'cloud-security'
  | 'devops'
  | 'threat-protection'
  | 'supply-chain'
  | 'nis2';

export type RouteParams = Record<string, string | number>;

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export type NavItem = {
  route: Route;
  label: string;
  icon: string;
  requiresProject?: boolean;
};

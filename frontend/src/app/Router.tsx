import { useApp } from './context';
import { LandingMain } from '../features/landing';
import { ProjectsMain } from '../features/projects';
import { UploadMain } from '../features/upload';
import { FindingsMain } from '../features/findings';
import { ExecDashboardMain } from '../features/exec-dashboard';
import { RocOverviewMain } from '../features/roc-overview';
import { EndpointSecurityMain } from '../features/endpoint-security';
import { ComplianceMain } from '../features/compliance';
import { PciComplianceMain } from '../features/pci-compliance';
import { CloudSecurityMain } from '../features/cloud-security';
import { DevopsMain } from '../features/devops';
import { ThreatProtectionMain } from '../features/threat-protection';
import { SupplyChainMain } from '../features/supply-chain';
import { Nis2Main } from '../features/nis2';

export function Router() {
  const { route, params, projectId } = useApp();

  switch (route) {
    case 'landing':
      return <LandingMain />;
    case 'roc-overview':
      return <RocOverviewMain />;
    case 'projects':
      return <ProjectsMain />;
    case 'upload':
      return projectId ? <UploadMain /> : <ProjectsMain />;
    case 'findings':
      return projectId ? <FindingsMain /> : <ProjectsMain />;
    case 'finding-detail':
      return projectId && params.findingId ? <FindingsMain /> : <ProjectsMain />;
    case 'exec-dashboard':
      return projectId ? <ExecDashboardMain /> : <ProjectsMain />;
    case 'endpoint-security':
      return projectId ? <EndpointSecurityMain /> : <ProjectsMain />;
    case 'compliance':
      return projectId ? <ComplianceMain /> : <ProjectsMain />;
    case 'pci-compliance':
      return projectId ? <PciComplianceMain /> : <ProjectsMain />;
    case 'cloud-security':
      return projectId ? <CloudSecurityMain /> : <ProjectsMain />;
    case 'devops':
      return projectId ? <DevopsMain /> : <ProjectsMain />;
    case 'threat-protection':
      return projectId ? <ThreatProtectionMain /> : <ProjectsMain />;
    case 'supply-chain':
      return projectId ? <SupplyChainMain /> : <ProjectsMain />;
    case 'nis2':
      return projectId ? <Nis2Main /> : <ProjectsMain />;
    default:
      return <LandingMain />;
  }
}

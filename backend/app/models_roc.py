"""Data models for all 8 CROC security modules."""
from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field

# ── Endpoint Security ──
class Endpoint(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(index=True)
    hostname: str
    ip_address: str = ""
    os: str = ""
    edr_status: str = "unknown"   # active|inactive|not_installed|unknown
    av_status: str = "unknown"
    patch_status: str = "unknown"  # up_to_date|outdated|critical_missing
    risk_score: float = 0.0
    department: str = ""
    criticality: str = "medium"
    last_seen: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class EndpointAlert(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    endpoint_id: int = Field(index=True)
    project_id: int = Field(index=True)
    alert_type: str = "malware"
    severity: str = "medium"
    title: str
    description: str = ""
    status: str = "open"
    detected_at: str = ""
    resolved_at: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# ── Compliance ──
class ComplianceFramework(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(index=True)
    name: str          # ISO27001, SOC2, NIST_CSF
    version: str = ""
    status: str = "in_progress"
    overall_score: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ComplianceControl(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    framework_id: int = Field(index=True)
    project_id: int = Field(index=True)
    control_id: str        # e.g. "A.5.1"
    title: str
    description: str = ""
    status: str = "not_assessed"  # compliant|non_compliant|partial|not_assessed
    evidence_notes: str = ""
    owner: str = ""
    due_date: Optional[str] = None
    last_assessed: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# ── PCI Compliance ──
class PCIRequirement(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(index=True)
    requirement_number: int   # 1-12
    sub_requirement: str = ""
    title: str
    description: str = ""
    status: str = "not_assessed"
    compensating_control: str = ""
    evidence_notes: str = ""
    assessor_notes: str = ""
    last_assessed: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# ── Cloud Security ──
class CloudAccount(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(index=True)
    provider: str = "AWS"     # AWS|Azure|GCP
    account_id: str = ""
    account_name: str
    region: str = ""
    status: str = "active"
    risk_score: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CloudFinding(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    account_id: int = Field(index=True)
    project_id: int = Field(index=True)
    service: str = ""
    resource_id: str = ""
    title: str
    severity: str = "medium"
    description: str = ""
    recommendation: str = ""
    status: str = "open"
    compliance_standard: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

# ── DevOps ──
class Pipeline(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(index=True)
    name: str
    repo_url: str = ""
    branch: str = "main"
    last_scan_date: Optional[str] = None
    status: str = "active"
    sast_enabled: bool = False
    dast_enabled: bool = False
    sca_enabled: bool = False
    container_scan_enabled: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PipelineFinding(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    pipeline_id: int = Field(index=True)
    project_id: int = Field(index=True)
    scan_type: str = "SAST"   # SAST|DAST|SCA|Container
    title: str
    severity: str = "medium"
    file_path: str = ""
    line_number: Optional[int] = None
    description: str = ""
    remediation: str = ""
    status: str = "open"
    created_at: datetime = Field(default_factory=datetime.utcnow)

# ── Threat Protection ──
class ThreatIntel(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(index=True)
    ioc_type: str = "ip"      # ip|domain|hash|url
    ioc_value: str
    threat_actor: str = ""
    confidence: str = "medium"
    severity: str = "medium"
    source: str = ""
    first_seen: str = ""
    last_seen: str = ""
    status: str = "active"    # active|expired
    tags: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ThreatIncident(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(index=True)
    title: str
    severity: str = "medium"
    description: str = ""
    status: str = "detected"  # detected|investigating|contained|eradicated|recovered
    detected_at: str = ""
    resolved_at: Optional[str] = None
    impact: str = ""
    indicators: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

# ── Supply Chain ──
class SBOMEntry(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(index=True)
    package_name: str
    version: str = ""
    ecosystem: str = "npm"    # npm|pip|maven|nuget|go
    license: str = ""
    direct_dependency: bool = True
    vulnerability_count: int = 0
    risk_score: float = 0.0
    latest_version: str = ""
    outdated: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SupplyChainVuln(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    sbom_entry_id: int = Field(index=True)
    project_id: int = Field(index=True)
    cve_id: str = ""
    severity: str = "medium"
    cvss: Optional[float] = None
    description: str = ""
    fixed_version: str = ""
    status: str = "open"      # open|patched|accepted
    exploitable: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

# ── NIS2 ──
class NIS2Article(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(index=True)
    article_number: str
    title: str
    description: str = ""
    status: str = "not_assessed"
    evidence_notes: str = ""
    responsible_party: str = ""
    due_date: Optional[str] = None
    last_reviewed: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class NIS2Incident(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(index=True)
    incident_type: str = ""
    severity: str = "medium"
    title: str
    description: str = ""
    detected_at: str = ""
    reported_at: Optional[str] = None
    reporting_deadline: str = ""
    status: str = "detected"
    authority_notified: bool = False
    affected_services: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

import json
from typing import List
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from .db import init_db, get_session
from .models import Project, Finding
from .schemas import (
    ProjectCreate, ProjectOut, FindingOut, UploadResponse,
    TicketJSON, ExecutiveJSON, ImpactSimInput, ImpactSimOutput
)
from .parsers import detect_and_parse
from .llm import generate_dev_ticket, generate_exec_summary
from .risk import estimate_exposure
from .jira import create_jira_issue_stub
from .crud import make_crud_router
from .models_roc import (
    Endpoint, EndpointAlert, ComplianceFramework, ComplianceControl,
    PCIRequirement, CloudAccount, CloudFinding, Pipeline, PipelineFinding,
    ThreatIntel, ThreatIncident, SBOMEntry, SupplyChainVuln,
    NIS2Article, NIS2Incident,
)

app = FastAPI(title="Cybersecurity Risk Operation Centre API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def _startup():
    init_db()

# ---- CROC Module Routers ----
app.include_router(make_crud_router(Endpoint, "/endpoints", "Endpoint Security"))
app.include_router(make_crud_router(EndpointAlert, "/endpoint-alerts", "Endpoint Security"))
app.include_router(make_crud_router(ComplianceFramework, "/compliance-frameworks", "Compliance"))
app.include_router(make_crud_router(ComplianceControl, "/compliance-controls", "Compliance"))
app.include_router(make_crud_router(PCIRequirement, "/pci-requirements", "PCI Compliance"))
app.include_router(make_crud_router(CloudAccount, "/cloud-accounts", "Cloud Security"))
app.include_router(make_crud_router(CloudFinding, "/cloud-findings", "Cloud Security"))
app.include_router(make_crud_router(Pipeline, "/pipelines", "DevOps"))
app.include_router(make_crud_router(PipelineFinding, "/pipeline-findings", "DevOps"))
app.include_router(make_crud_router(ThreatIntel, "/threat-intel", "Threat Protection"))
app.include_router(make_crud_router(ThreatIncident, "/threat-incidents", "Threat Protection"))
app.include_router(make_crud_router(SBOMEntry, "/sbom-entries", "Supply Chain"))
app.include_router(make_crud_router(SupplyChainVuln, "/supply-chain-vulns", "Supply Chain"))
app.include_router(make_crud_router(NIS2Article, "/nis2-articles", "NIS2"))
app.include_router(make_crud_router(NIS2Incident, "/nis2-incidents", "NIS2"))

# ---- Project Stats ----
@app.get("/projects/{project_id}/stats")
def project_stats(project_id: int, session: Session = Depends(get_session)):
    findings = session.exec(select(Finding).where(Finding.project_id == project_id)).all()
    return {"count": len(findings)}

@app.get("/health")
def health():
    return {"ok": True}

# ---- Projects ----
@app.post("/projects", response_model=ProjectOut)
def create_project(payload: ProjectCreate, session: Session = Depends(get_session)):
    p = Project(
        name=payload.name,
        industry=payload.industry,
        currency=payload.currency,
        revenue_per_hour=payload.revenue_per_hour
    )
    session.add(p)
    session.commit()
    session.refresh(p)
    return ProjectOut(id=p.id, name=p.name, industry=p.industry, currency=p.currency, revenue_per_hour=p.revenue_per_hour)

@app.get("/projects", response_model=List[ProjectOut])
def list_projects(session: Session = Depends(get_session)):
    projects = session.exec(select(Project).order_by(Project.created_at.desc())).all()
    return [ProjectOut(id=p.id, name=p.name, industry=p.industry, currency=p.currency, revenue_per_hour=p.revenue_per_hour) for p in projects]

# ---- Upload ----
@app.post("/projects/{project_id}/upload", response_model=UploadResponse)
async def upload_scan(project_id: int, file: UploadFile = File(...), session: Session = Depends(get_session)):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")

    raw = await file.read()
    filename = file.filename or ""
    content_type = file.content_type or ""

    try:
        normalized_list = detect_and_parse(raw, filename, content_type)
    except ValueError as exc:
        raise HTTPException(400, str(exc))
    except Exception as exc:
        raise HTTPException(400, f"Failed to parse file: {exc}")

    if not normalized_list:
        raise HTTPException(
            400,
            "No findings could be extracted from this file. "
            "For Excel: ensure the first row contains headers (Title, Severity, etc.). "
            "For PDF: ensure the report contains numbered findings or severity keywords."
        )

    counts = {"critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0}
    for n in normalized_list:
        sev = n["severity"]
        if sev not in counts:
            sev = "info"
        counts[sev] += 1
        f = Finding(
            project_id=project_id,
            tool=n["tool"],
            title=n["title"],
            severity=sev,
            cvss=n.get("cvss"),
            owasp=n.get("owasp"),
            cwe=n.get("cwe"),
            asset=n.get("asset", ""),
            endpoint=n.get("endpoint"),
            evidence_json=json.dumps(n.get("evidence", {})),
            raw_json=json.dumps(n),
        )
        session.add(f)
    session.commit()
    return UploadResponse(
        project_id=project_id,
        ingested=len(normalized_list),
        critical=counts["critical"],
        high=counts["high"],
        medium=counts["medium"],
        low=counts["low"],
        info=counts["info"],
    )

# ---- Findings ----
@app.get("/projects/{project_id}/findings", response_model=List[FindingOut])
def list_findings(project_id: int, session: Session = Depends(get_session)):
    findings = session.exec(select(Finding).where(Finding.project_id == project_id).order_by(Finding.created_at.desc())).all()
    return [
        FindingOut(
            id=f.id, project_id=f.project_id, title=f.title, severity=f.severity, cvss=f.cvss,
            asset=f.asset, endpoint=f.endpoint, owasp=f.owasp, cwe=f.cwe
        ) for f in findings
    ]

@app.get("/findings/{finding_id}", response_model=FindingOut)
def get_finding(finding_id: int, session: Session = Depends(get_session)):
    f = session.get(Finding, finding_id)
    if not f:
        raise HTTPException(404, "Finding not found")
    return FindingOut(
        id=f.id, project_id=f.project_id, title=f.title, severity=f.severity, cvss=f.cvss,
        asset=f.asset, endpoint=f.endpoint, owasp=f.owasp, cwe=f.cwe
    )

# ---- Generation ----
@app.post("/findings/{finding_id}/generate/dev", response_model=TicketJSON)
def gen_dev(finding_id: int, session: Session = Depends(get_session)):
    f = session.get(Finding, finding_id)
    if not f:
        raise HTTPException(404, "Finding not found")
    normalized = json.loads(f.raw_json)
    return generate_dev_ticket(normalized)

@app.post("/findings/{finding_id}/generate/exec", response_model=ExecutiveJSON)
def gen_exec(finding_id: int, session: Session = Depends(get_session)):
    f = session.get(Finding, finding_id)
    if not f:
        raise HTTPException(404, "Finding not found")
    project = session.get(Project, f.project_id)
    normalized = json.loads(f.raw_json)
    pctx = {"currency": project.currency, "revenue_per_hour": project.revenue_per_hour}
    return generate_exec_summary(normalized, pctx)

@app.post("/findings/{finding_id}/jira")
def create_jira(finding_id: int, session: Session = Depends(get_session)):
    f = session.get(Finding, finding_id)
    if not f:
        raise HTTPException(404, "Finding not found")
    normalized = json.loads(f.raw_json)
    ticket = generate_dev_ticket(normalized).model_dump()
    return create_jira_issue_stub(ticket)

# ---- Impact simulator ----
@app.post("/impact/simulate", response_model=ImpactSimOutput)
def impact_simulate(payload: ImpactSimInput, session: Session = Depends(get_session)):
    project = session.get(Project, payload.project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    finding = session.get(Finding, payload.finding_id)
    if not finding:
        raise HTTPException(404, "Finding not found")
    exposure = estimate_exposure(
        currency=project.currency,
        revenue_per_hour=project.revenue_per_hour,
        severity=finding.severity,
        downtime_hours=payload.downtime_hours,
        records_exposed=payload.records_exposed,
        jurisdiction=payload.jurisdiction,
        churn_pct=payload.churn_pct,
        ir_maturity=payload.ir_maturity
    )
    return ImpactSimOutput(estimated_exposure=exposure)

from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field

Severity = Literal["critical", "high", "medium", "low", "info"]

class ProjectCreate(BaseModel):
    name: str
    industry: str = "generic"
    currency: str = "GBP"
    revenue_per_hour: float = 50000.0

class ProjectOut(BaseModel):
    id: int
    name: str
    industry: str
    currency: str
    revenue_per_hour: float

class FindingOut(BaseModel):
    id: int
    project_id: int
    title: str
    severity: str
    cvss: Optional[float] = None
    asset: str = ""
    endpoint: Optional[str] = None
    owasp: Optional[str] = None
    cwe: Optional[str] = None

class UploadResponse(BaseModel):
    project_id: int
    ingested: int
    critical: int
    high: int
    medium: int
    low: int
    info: int

class TicketJSON(BaseModel):
    summary: str
    description_markdown: str
    root_cause_hypothesis: str
    steps_to_reproduce: List[str]
    remediation_steps: List[str]
    acceptance_criteria: List[str]
    priority: Literal["P0", "P1", "P2", "P3"]
    labels: List[str]

class ExposureDriver(BaseModel):
    name: str
    value: float

class EstimatedExposure(BaseModel):
    currency: str
    point: float
    low: float
    high: float
    drivers: List[ExposureDriver]
    assumptions: List[str]

class ExecutiveJSON(BaseModel):
    one_liner: str
    business_impact: str
    likelihood: Literal["Low", "Med", "High"]
    impact: Literal["Low", "Med", "High"]
    estimated_exposure: EstimatedExposure
    recommended_decision: str
    board_questions: List[str]

class ImpactSimInput(BaseModel):
    project_id: int
    finding_id: int
    downtime_hours: float = Field(ge=0, le=720)  # up to 30 days
    records_exposed: int = Field(ge=0)
    jurisdiction: str = "GDPR"
    churn_pct: float = Field(default=2.0, ge=0, le=50)
    ir_maturity: Literal["Low", "Medium", "High"] = "Medium"

class ImpactSimOutput(BaseModel):
    estimated_exposure: EstimatedExposure

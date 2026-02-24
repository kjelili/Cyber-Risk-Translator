from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field

class Project(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    industry: str = "generic"
    currency: str = "GBP"
    revenue_per_hour: float = 50000.0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Finding(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(index=True)
    tool: str = "generic"
    title: str
    severity: str
    cvss: Optional[float] = None
    owasp: Optional[str] = None
    cwe: Optional[str] = None
    asset: str = ""
    endpoint: Optional[str] = None
    evidence_json: str = "{}"  # store raw evidence snippet
    raw_json: str = "{}"  # store normalized finding blob as JSON text
    created_at: datetime = Field(default_factory=datetime.utcnow)

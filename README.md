# Cybersecurity Risk Operation Centre (CROC)

Enterprise-grade cyber risk management platform with 9 integrated security modules. Translates technical vulnerabilities into business intelligence across every security domain.

## Modules

| Module | Description |
|--------|-------------|
| **Risk Assessment** | Upload vulnerability scans (JSON/Excel/PDF), generate dev tickets and executive summaries, simulate financial impact |
| **Endpoint Security** | Track EDR/AV coverage, patch status, device inventory, and endpoint alerts |
| **Compliance** | ISO 27001, SOC2, NIST CSF control tracking with gap analysis and evidence management |
| **PCI DSS** | All 12 PCI DSS requirements with sub-requirements, SAQ tracking, and compensating controls |
| **Cloud Security** | Multi-cloud posture monitoring (AWS/Azure/GCP) with misconfiguration detection |
| **DevSecOps** | CI/CD pipeline security scanning (SAST/DAST/SCA/Container) with finding management |
| **Threat Protection** | IOC tracking, incident lifecycle management, threat actor intelligence |
| **Supply Chain Risk** | SBOM analysis, dependency vulnerability tracking, license compliance, exploitability |
| **NIS2** | NIS2 Directive compliance tracking with incident reporting deadlines and authority notification |

## Tech Stack

- **Backend**: Python 3.8+ / FastAPI / SQLModel / SQLite
- **Frontend**: React 18 / TypeScript / Tailwind CSS / Vite
- **Architecture**: Vertical slice (feature-based) per cursor rules

## Quick Start

### 1. Backend

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API docs: http://127.0.0.1:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

### 3. Sample Data

Upload `sample.json` or `sample.xlsx` through the Upload page to populate findings.

## Project Structure

```
backend/
  app/
    main.py           # FastAPI app + all routers
    models.py          # Risk assessment models
    models_roc.py      # All 8 CROC module models (16 tables)
    crud.py            # Generic CRUD router factory
    schemas.py         # Pydantic schemas
    parsers.py         # JSON/Excel/PDF parsers
    risk.py            # Financial exposure calculator
    llm.py             # LLM integration (mock)
    jira.py            # Jira stub
    db.py              # Database setup

frontend/
  src/
    app/               # App shell, layout, router, context
    features/          # Vertical slice modules
      landing/         # Landing page
      projects/        # Project management
      upload/          # Multi-format scan upload
      findings/        # Findings list + detail + reports
      exec-dashboard/  # Executive dashboard + impact sim
      roc-overview/    # Unified CROC dashboard
      endpoint-security/
      compliance/
      pci-compliance/
      cloud-security/
      devops/
      threat-protection/
      supply-chain/
      nis2/
    shared/
      ui/              # Design system (Button, Card, Badge, etc.)
      api/             # Typed HTTP client
      lib/             # Utilities
      types/           # Global types
      config/          # Constants
```

## Design System

- **Theme**: Dark mode with high-contrast accessibility
- **Typography**: Inter (single font, defined scale)
- **Spacing**: Tailwind 4px-based scale
- **Colors**: Severity-coded (critical=red, high=orange, medium=yellow, low=blue)
- **Responsive**: Mobile-first, touch-friendly (40px minimum targets)

## Build Verification

```bash
# TypeScript check
cd frontend && npx tsc --noEmit

# Production build
cd frontend && npm run build
```

Both pass with zero errors.

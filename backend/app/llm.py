import os
from typing import Dict, Any
from .schemas import TicketJSON, ExecutiveJSON
from .risk import estimate_exposure

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "mock")  # mock|openai

def generate_dev_ticket(normalized: Dict[str, Any]) -> TicketJSON:
    # MVP mock: deterministic from finding fields
    sev = normalized.get("severity", "info")
    priority = "P0" if sev == "critical" else "P1" if sev == "high" else "P2" if sev == "medium" else "P3"
    title = normalized.get("title", "Finding")
    endpoint = normalized.get("endpoint") or "unknown endpoint"
    asset = normalized.get("asset", "unknown asset")
    return TicketJSON(
        summary=f"Fix: {title} on {asset}",
        description_markdown=(
            f"## Finding\n**{title}**\n\n"
            f"**Asset:** {asset}\n\n"
            f"**Endpoint:** {endpoint}\n\n"
            f"## Evidence\n```json\n{normalized.get('evidence', {})}\n```\n"
        ),
        root_cause_hypothesis="Insufficient validation/authorization checks around the affected component.",
        steps_to_reproduce=[
            "Use the provided evidence to reproduce against a safe environment.",
            f"Attempt the action at {endpoint} without required authorization controls."
        ],
        remediation_steps=[
            "Enforce server-side authorization checks on every object-level access.",
            "Add negative tests for unauthorized access.",
            "Log and monitor repeated access violations."
        ],
        acceptance_criteria=[
            "Unauthorized users cannot access or modify resources outside their permissions.",
            "Automated test coverage includes at least one negative test case.",
            "Security regression test passes in CI."
        ],
        priority=priority,
        labels=["risktranslator", f"sev-{sev}"]
    )

def generate_exec_summary(normalized: Dict[str, Any], project: Dict[str, Any]) -> ExecutiveJSON:
    # MVP rules-based exposure + templated narrative
    exposure = estimate_exposure(
        currency=project["currency"],
        revenue_per_hour=project["revenue_per_hour"],
        severity=normalized.get("severity", "info"),
        downtime_hours=8,
        records_exposed=250000,
        jurisdiction="GDPR",
        churn_pct=2.0,
        ir_maturity="Medium"
    )
    sev = normalized.get("severity", "info")
    likelihood = "High" if sev in ("critical", "high") else "Med" if sev == "medium" else "Low"
    impact = "High" if sev == "critical" else "Med" if sev in ("high", "medium") else "Low"
    title = normalized.get("title", "Finding")
    asset = normalized.get("asset", "key system")
    return ExecutiveJSON(
        one_liner=f"{title} could lead to material business loss if exploited.",
        business_impact=f"If exploited on {asset}, this may cause service disruption and/or data exposure.",
        likelihood=likelihood,
        impact=impact,
        estimated_exposure=exposure,
        recommended_decision="Fix immediately" if sev in ("critical", "high") else "Fix next sprint",
        board_questions=[
            "What customer-facing services are affected and for how long?",
            "What is the remediation ETA and who owns delivery?",
            "What compensating controls exist until fixed?"
        ],
    )

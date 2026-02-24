from typing import List, Tuple
from .schemas import EstimatedExposure, ExposureDriver

def _severity_multiplier(sev: str) -> float:
    return {
        "critical": 1.0,
        "high": 0.7,
        "medium": 0.3,
        "low": 0.1,
        "info": 0.05,
    }.get(sev, 0.1)

def estimate_exposure(
    currency: str,
    revenue_per_hour: float,
    severity: str,
    downtime_hours: float,
    records_exposed: int,
    jurisdiction: str,
    churn_pct: float,
    ir_maturity: str
) -> EstimatedExposure:
    """
    MVP: simple rules-based estimator.
    Replace later with calibrated models + sector benchmarks.
    """
    sev_mult = _severity_multiplier(severity)
    # Downtime cost
    downtime_cost = revenue_per_hour * downtime_hours * sev_mult
    # Regulatory: very rough GDPR-style: scales with records + severity
    reg_base = 50000.0 if jurisdiction.upper() == "GDPR" else 25000.0
    regulatory = reg_base + (records_exposed * 0.5) * sev_mult  # £0.50/record * sev_mult
    # Legal/IR: maturity reduces cost
    maturity_factor = {"Low": 1.2, "Medium": 1.0, "High": 0.8}.get(ir_maturity, 1.0)
    legal_ir = (75000.0 + (records_exposed * 0.1)) * sev_mult * maturity_factor
    # Reputation proxy: churn * a notional monthly revenue proxy
    reputation = (churn_pct / 100.0) * (revenue_per_hour * 24 * 30) * 0.25 * sev_mult
    point = downtime_cost + regulatory + legal_ir + reputation
    low = point * 0.7
    high = point * 1.6
    assumptions = [
        f"Revenue/hour = {currency} {revenue_per_hour:,.0f}",
        f"Downtime_hours = {downtime_hours}",
        f"Records_exposed = {records_exposed}",
        f"Jurisdiction = {jurisdiction}",
        f"Churn % = {churn_pct}",
        f"IR maturity = {ir_maturity}",
        "Estimator is rules-based MVP (not calibrated)."
    ]
    drivers = [
        ExposureDriver(name="Downtime", value=float(downtime_cost)),
        ExposureDriver(name="Regulatory", value=float(regulatory)),
        ExposureDriver(name="Legal_IR", value=float(legal_ir)),
        ExposureDriver(name="Reputation_proxy", value=float(reputation)),
    ]
    return EstimatedExposure(
        currency=currency,
        point=float(point),
        low=float(low),
        high=float(high),
        drivers=drivers,
        assumptions=assumptions,
    )

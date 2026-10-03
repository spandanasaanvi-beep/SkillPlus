from __future__ import annotations

from typing import Dict, List, Tuple


DEMAND_WEIGHT_CONFIG = {
    "job_postings": 0.4,
    "hiring_growth": 0.25,
    "industry_demand": 0.2,
    "employment_signal": 0.15,
}

SUPPLY_WEIGHT_CONFIG = {
    "training_seats": 0.35,
    "trained_candidates": 0.3,
    "certified_candidates": 0.2,
    "existing_workforce": 0.15,
}


def clamp(value: float, minimum: float = 0.0, maximum: float = 100.0) -> float:
    return max(minimum, min(maximum, value))


def safe_percentage(value: float, max_value: float) -> float:
    if max_value <= 0:
        return 0.0
    return clamp((value / max_value) * 100.0)


def compute_demand_index(record: Dict[str, float | int], max_job_postings: float = 1000.0) -> float:
    job_postings_signal = safe_percentage(float(record.get("job_postings", 0)), max_job_postings)
    hiring_growth_signal = clamp(float(record.get("hiring_growth", 0)) * 3.5)
    industry_signal = clamp(float(record.get("industry_demand", 0)))
    employment_signal = clamp(float(record.get("employment_signal", 0)))

    demand_index = (
        DEMAND_WEIGHT_CONFIG["job_postings"] * job_postings_signal
        + DEMAND_WEIGHT_CONFIG["hiring_growth"] * hiring_growth_signal
        + DEMAND_WEIGHT_CONFIG["industry_demand"] * industry_signal
        + DEMAND_WEIGHT_CONFIG["employment_signal"] * employment_signal
    )

    return round(demand_index, 2)


def compute_supply_index(record: Dict[str, float | int], max_training: float = 1000.0) -> float:
    training_signal = safe_percentage(float(record.get("training_seats", 0)), max_training)
    trained_signal = safe_percentage(float(record.get("trained_candidates", 0)), max_training)
    certified_signal = safe_percentage(float(record.get("certified_candidates", 0)), max_training)
    workforce_signal = safe_percentage(float(record.get("existing_workforce", 0)), max_training)

    supply_index = (
        SUPPLY_WEIGHT_CONFIG["training_seats"] * training_signal
        + SUPPLY_WEIGHT_CONFIG["trained_candidates"] * trained_signal
        + SUPPLY_WEIGHT_CONFIG["certified_candidates"] * certified_signal
        + SUPPLY_WEIGHT_CONFIG["existing_workforce"] * workforce_signal
    )

    return round(supply_index, 2)


def compute_gap(demand_index: float, supply_index: float) -> float:
    return round(demand_index - supply_index, 2)


def compute_gap_pct(gap_value: float, demand_index: float) -> float:
    if demand_index == 0:
        return 0.0
    return round((gap_value / demand_index) * 100.0, 2)


def classify_gap(gap_value: float) -> str:
    if gap_value >= 25:
        return "Critical Shortage"
    if gap_value >= 10:
        return "Moderate Shortage"
    if gap_value <= -25:
        return "Critical Oversupply"
    if gap_value <= -10:
        return "Moderate Oversupply"
    return "Balanced"


def classify_alert(gap_value: float, forecast_gap: float) -> str:
    if forecast_gap >= 30 or gap_value >= 30:
        return "CRITICAL_SHORTAGE"
    if forecast_gap >= 15 or gap_value >= 15:
        return "SHORTAGE_RISK"
    if forecast_gap <= -20 or gap_value <= -20:
        return "OVERSUPPLY_RISK"
    if abs(forecast_gap) <= 5 and abs(gap_value) <= 5:
        return "STABLE"
    return "EMERGING_DEMAND"


def status_color(status: str) -> str:
    mapping = {
        "Critical Shortage": "bg-red-100 text-red-700",
        "Moderate Shortage": "bg-amber-100 text-amber-700",
        "Balanced": "bg-emerald-100 text-emerald-700",
        "Moderate Oversupply": "bg-violet-100 text-violet-700",
        "Critical Oversupply": "bg-slate-200 text-slate-700",
    }
    return mapping.get(status, "bg-slate-100 text-slate-700")

from __future__ import annotations

from typing import Any, Dict, List


def compute_priority_score(row: Dict[str, Any]) -> float:
    gap_magnitude = abs(float(row.get("gap_value", 0.0)))
    demand_growth = float(row.get("hiring_growth", 0.0)) * 1.8
    forecast_shortage = max(0.0, float(row.get("forecast_gap", 0.0))) * 2.5
    mismatch = abs(float(row.get("gap_value", 0.0))) * 1.2
    score = gap_magnitude + demand_growth + forecast_shortage + mismatch
    return round(score, 2)


def rank_priorities(rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    ranked = []
    for row in rows:
        row["priority_score"] = compute_priority_score(row)
        ranked.append(row)
    return sorted(ranked, key=lambda item: item.get("priority_score", 0), reverse=True)

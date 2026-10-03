from __future__ import annotations

from typing import Any, Dict, List


def generate_alerts(rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    alerts: List[Dict[str, Any]] = []
    for row in rows:
        gap = float(row.get("gap_value", 0.0))
        forecast_gap = float(row.get("forecast_gap", gap))

        if forecast_gap >= 30 or gap >= 30:
            alert = "CRITICAL_SHORTAGE"
            reason = "Labour demand remains substantially above the available training and workforce supply."
        elif forecast_gap >= 15 or gap >= 15:
            alert = "SHORTAGE_RISK"
            reason = "Demand has begun to outpace supply and may create a workforce gap within the next planning cycle."
        elif forecast_gap <= -20 or gap <= -20:
            alert = "OVERSUPPLY_RISK"
            reason = "Training pipeline is outgrowing local labour demand and may create surplus capacity."
        elif abs(forecast_gap) <= 5 and abs(gap) <= 5:
            alert = "STABLE"
            reason = "Current demand and supply are broadly aligned, suggesting stable conditions." 
        else:
            alert = "EMERGING_DEMAND"
            reason = "The sector is trending upward and should be monitored for tightening supply conditions."

        alerts.append(
            {
                "district": row.get("district", ""),
                "sector": row.get("sector", ""),
                "trade": row.get("trade", ""),
                "current_gap": round(gap, 2),
                "forecast_gap": round(forecast_gap, 2),
                "reason": reason,
                "alert_type": alert,
            }
        )

    return alerts

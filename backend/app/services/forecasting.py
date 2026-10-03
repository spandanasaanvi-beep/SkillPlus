from __future__ import annotations

from typing import Dict, List

import numpy as np
from sklearn.linear_model import LinearRegression


def forecast_demand_series(history: List[float]) -> Dict[str, object]:
    if len(history) < 2:
        latest = history[-1] if history else 0.0
        return {
            "historical": history,
            "forecast": [latest, latest, latest],
            "growth_trend": 0.0,
            "confidence": 0.4,
        }

    x = np.arange(len(history)).reshape(-1, 1)
    y = np.asarray(history, dtype=float)
    model = LinearRegression()
    model.fit(x, y)

    future_years = np.array([len(history), len(history) + 1, len(history) + 2], dtype=float).reshape(-1, 1)
    forecast = model.predict(future_years).tolist()
    variance = float(np.std(y))
    confidence = round(max(0.2, 1.0 - (variance / max(1.0, max(y) * 2))), 2)
    growth_trend = round(((forecast[-1] - y[-1]) / max(1.0, y[-1])) * 100, 2)

    return {
        "historical": [round(v, 2) for v in history],
        "forecast": [round(v, 2) for v in forecast],
        "growth_trend": growth_trend,
        "confidence": confidence,
    }


def build_trade_forecast(records: List[Dict[str, object]]) -> Dict[str, object]:
    ordered = sorted(records, key=lambda item: int(item.get("year", 2022)))
    demand_values = [float(item.get("demand_index", 0.0)) for item in ordered]
    result = forecast_demand_series(demand_values)
    latest = ordered[-1]
    forecast_supply = float(latest.get("supply_index", 0.0))
    forecast_gap = [
        round(result["forecast"][i] - forecast_supply, 2)
        for i in range(len(result["forecast"]))
    ]
    result["forecast_gap"] = forecast_gap
    return result

from __future__ import annotations

import csv
import io
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, File, HTTPException, Query, UploadFile
from fastapi.responses import JSONResponse, StreamingResponse

from app.database.db import export_csv, fetch_all_records, fetch_overview, fetch_unique_values, get_connection
from app.services.alerts import generate_alerts
from app.services.indicators import classify_gap
from app.services.priority import rank_priorities
from app.services.upload import process_csv_records, validate_uploaded_csv

router = APIRouter(prefix="/api")


@router.get("/health")
def health_check() -> Dict[str, str]:
    return {"status": "ok", "service": "SkillPlus API"}


@router.get("/overview")
def overview(
    state: Optional[str] = None,
    district: Optional[str] = None,
    sector: Optional[str] = None,
    trade: Optional[str] = None,
    year: Optional[int] = None,
) -> Dict[str, Any]:
    filters = {k: v for k, v in {"state": state, "district": district, "sector": sector, "trade": trade, "year": year}.items() if v is not None}
    return fetch_overview(filters)


@router.get("/states")
def states() -> List[str]:
    return fetch_unique_values("state")


@router.get("/districts")
def districts(state: Optional[str] = None) -> List[str]:
    filters = {"state": state} if state else None
    return fetch_unique_values("district", filters)


@router.get("/sectors")
def sectors() -> List[str]:
    return fetch_unique_values("sector")


@router.get("/trades")
def trades() -> List[str]:
    return fetch_unique_values("trade")


@router.get("/labour-market")
def labour_market(
    skill: Optional[str] = None,
    trade: Optional[str] = None,
    occupation: Optional[str] = None,
    qualification: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    sector: Optional[str] = None,
    year: Optional[int] = None,
) -> Dict[str, Any]:
    filter_skill = skill or trade or occupation
    filters = {k: v for k, v in {"state": state, "district": district, "sector": sector, "trade": filter_skill, "year": year}.items() if v is not None}
    rows = fetch_all_records(filters)

    if not rows:
        return {
            "filters": {"skill": filter_skill, "state": state, "district": district, "sector": sector, "qualification": qualification},
            "summary": {"demand": 0, "supply": 0, "gap": 0, "status": "Balanced", "forecast_demand": 0},
            "trend": [],
            "forecast": [],
            "stateData": [],
            "districtData": [],
            "alerts": [],
        }

    demand_total = round(sum(float(row["demand_index"]) for row in rows), 2)
    supply_total = round(sum(float(row["supply_index"]) for row in rows), 2)
    gap_total = round(demand_total - supply_total, 2)
    if gap_total >= 25:
        status = "Critical Shortage"
    elif gap_total >= 10:
        status = "Shortage Risk"
    elif gap_total <= -25:
        status = "Critical Oversupply"
    elif gap_total <= -10:
        status = "Oversupply Risk"
    else:
        status = "Balanced"

    trend = []
    for year_value in sorted({int(row["year"]) for row in rows}):
        year_rows = [row for row in rows if int(row["year"]) == year_value]
        trend.append({
            "year": year_value,
            "demand": round(sum(float(item["demand_index"]) for item in year_rows), 2),
            "supply": round(sum(float(item["supply_index"]) for item in year_rows), 2),
            "gap": round(sum(float(item["gap_value"]) for item in year_rows), 2),
        })

    forecast = []
    for row in rows[:10]:
        forecast.append({
            "year": int(row["year"]),
            "historical_demand": round(float(row["demand_index"]), 2),
            "forecast_demand": round(float(row.get("forecast_demand") or row["demand_index"]), 2),
            "forecast_gap": round(float(row.get("forecast_gap") or row["gap_value"]), 2),
        })

    state_map: Dict[str, Dict[str, Any]] = {}
    for row in rows:
        group = state_map.setdefault(row["state"], {"state": row["state"], "demand": 0.0, "supply": 0.0, "gap": 0.0, "status": "Balanced"})
        group["demand"] += float(row["demand_index"])
        group["supply"] += float(row["supply_index"])
        group["gap"] += float(row["gap_value"])
    state_data = []
    for state_name, summary in state_map.items():
        gap = float(summary["gap"])
        if gap >= 25:
            state_status = "Critical Shortage"
        elif gap >= 10:
            state_status = "Shortage Risk"
        elif gap <= -25:
            state_status = "Critical Oversupply"
        elif gap <= -10:
            state_status = "Oversupply Risk"
        else:
            state_status = "Balanced"
        state_data.append({
            "state": state_name,
            "demand": round(float(summary["demand"]), 2),
            "supply": round(float(summary["supply"]), 2),
            "gap": round(gap, 2),
            "status": state_status,
        })

    district_map: Dict[str, Dict[str, Any]] = {}
    for row in rows:
        group = district_map.setdefault(row["district"], {"district": row["district"], "demand": 0.0, "supply": 0.0, "gap": 0.0, "status": "Balanced"})
        group["demand"] += float(row["demand_index"])
        group["supply"] += float(row["supply_index"])
        group["gap"] += float(row["gap_value"])
    district_data = []
    for district_name, summary in district_map.items():
        gap = float(summary["gap"])
        district_data.append({
            "district": district_name,
            "demand": round(float(summary["demand"]), 2),
            "supply": round(float(summary["supply"]), 2),
            "gap": round(gap, 2),
            "status": "Critical Shortage" if gap >= 25 else "Shortage Risk" if gap >= 10 else "Critical Oversupply" if gap <= -25 else "Oversupply Risk" if gap <= -10 else "Balanced",
        })

    alerts = []
    for row in rows[:6]:
        alerts.append({
            "district": row["district"],
            "sector": row["sector"],
            "trade": row["trade"],
            "current_gap": round(float(row["gap_value"]), 2),
            "forecast_gap": round(float(row.get("forecast_gap") or row["gap_value"]), 2),
            "reason": f"{row['trade']} demand is moving relative to the local training pipeline in {row['district']}.",
            "alert_type": row["early_warning"],
        })

    return {
        "filters": {"skill": filter_skill, "state": state, "district": district, "sector": sector, "qualification": qualification},
        "summary": {
            "demand": demand_total,
            "supply": supply_total,
            "gap": gap_total,
            "status": status,
            "forecast_demand": round(sum(float(row.get("forecast_demand") or row["demand_index"]) for row in rows), 2),
        },
        "trend": trend,
        "forecast": forecast,
        "stateData": state_data,
        "districtData": district_data,
        "alerts": alerts,
    }


@router.get("/demand")
def demand(
    state: Optional[str] = None,
    district: Optional[str] = None,
    sector: Optional[str] = None,
    trade: Optional[str] = None,
    year: Optional[int] = None,
) -> List[Dict[str, Any]]:
    filters = {k: v for k, v in {"state": state, "district": district, "sector": sector, "trade": trade, "year": year}.items() if v is not None}
    rows = fetch_all_records(filters)
    return [{"state": row["state"], "district": row["district"], "sector": row["sector"], "trade": row["trade"], "demand_index": row["demand_index"], "year": row["year"]} for row in rows]


@router.get("/supply")
def supply(
    state: Optional[str] = None,
    district: Optional[str] = None,
    sector: Optional[str] = None,
    trade: Optional[str] = None,
    year: Optional[int] = None,
) -> List[Dict[str, Any]]:
    filters = {k: v for k, v in {"state": state, "district": district, "sector": sector, "trade": trade, "year": year}.items() if v is not None}
    rows = fetch_all_records(filters)
    return [{"state": row["state"], "district": row["district"], "sector": row["sector"], "trade": row["trade"], "supply_index": row["supply_index"], "year": row["year"]} for row in rows]


@router.get("/gaps")
def gaps(
    state: Optional[str] = None,
    district: Optional[str] = None,
    sector: Optional[str] = None,
    trade: Optional[str] = None,
    year: Optional[int] = None,
) -> List[Dict[str, Any]]:
    filters = {k: v for k, v in {"state": state, "district": district, "sector": sector, "trade": trade, "year": year}.items() if v is not None}
    rows = fetch_all_records(filters)
    return [
        {
            "state": row["state"],
            "district": row["district"],
            "sector": row["sector"],
            "trade": row["trade"],
            "demand": row["demand_index"],
            "supply": row["supply_index"],
            "gap": row["gap_value"],
            "gap_pct": row["gap_pct"],
            "status": row["gap_status"],
            "year": row["year"],
            "early_warning": row["early_warning"],
        }
        for row in rows
    ]


@router.get("/forecast")
def forecast(
    state: Optional[str] = None,
    district: Optional[str] = None,
    sector: Optional[str] = None,
    trade: Optional[str] = None,
    year: Optional[int] = None,
) -> List[Dict[str, Any]]:
    filters = {k: v for k, v in {"state": state, "district": district, "sector": sector, "trade": trade, "year": year}.items() if v is not None}
    rows = fetch_all_records(filters)
    return [{
        "state": row["state"],
        "district": row["district"],
        "sector": row["sector"],
        "trade": row["trade"],
        "historical_demand": [float(row["demand_index"])],
        "forecast_demand": row["forecast_demand"],
        "forecast_gap": row["forecast_gap"],
        "confidence": 0.78,
        "year": row["year"],
    } for row in rows]


@router.get("/alerts")
def alerts(
    state: Optional[str] = None,
    district: Optional[str] = None,
    sector: Optional[str] = None,
    trade: Optional[str] = None,
    year: Optional[int] = None,
) -> List[Dict[str, Any]]:
    filters = {k: v for k, v in {"state": state, "district": district, "sector": sector, "trade": trade, "year": year}.items() if v is not None}
    rows = fetch_all_records(filters)
    return generate_alerts(rows)


@router.get("/priorities")
def priorities(
    state: Optional[str] = None,
    district: Optional[str] = None,
    sector: Optional[str] = None,
    trade: Optional[str] = None,
    year: Optional[int] = None,
) -> List[Dict[str, Any]]:
    filters = {k: v for k, v in {"state": state, "district": district, "sector": sector, "trade": trade, "year": year}.items() if v is not None}
    rows = rank_priorities(fetch_all_records(filters))
    return [{
        "state": row["state"],
        "district": row["district"],
        "sector": row["sector"],
        "trade": row["trade"],
        "gap_value": row["gap_value"],
        "priority_score": row["priority_score"],
        "forecast_gap": row["forecast_gap"],
        "reason": "AI-generated planning priority based on available data.",
    } for row in rows[:15]]


@router.get("/trade/{trade_id}")
def trade_detail(trade_id: str) -> Dict[str, Any]:
    rows = fetch_all_records({"trade": trade_id})
    if not rows:
        raise HTTPException(status_code=404, detail="Trade not found")
    return {
        "trade": trade_id,
        "records": rows,
        "methodology": "Demand and supply indicators were calculated using historical job-posting, hiring-growth, and training signals.",
    }


@router.get("/district/{district_id}")
def district_detail(district_id: str) -> Dict[str, Any]:
    rows = fetch_all_records({"district": district_id})
    if not rows:
        raise HTTPException(status_code=404, detail="District not found")
    return {
        "district": district_id,
        "records": rows,
        "summary": {
            "avg_gap": round(sum(float(item["gap_value"]) for item in rows) / len(rows), 2),
            "shortage_trades": sum(1 for item in rows if item["gap_value"] > 10),
            "oversupply_trades": sum(1 for item in rows if item["gap_value"] < -10),
        },
    }


@router.post("/data/upload")
async def upload_data(file: UploadFile = File(...)) -> Dict[str, Any]:
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV uploads are supported.")

    content = await file.read()
    valid, errors, rows = validate_uploaded_csv(content)
    if not valid:
        return JSONResponse(status_code=400, content={"detail": errors})

    processed = process_csv_records(rows)
    return {
        "inserted": len(processed),
        "skipped": 0,
        "warnings": [],
        "sample_rows": processed[:5],
    }


@router.get("/data/export")
def export_analysis(
    state: Optional[str] = None,
    district: Optional[str] = None,
    sector: Optional[str] = None,
    trade: Optional[str] = None,
    year: Optional[int] = None,
) -> StreamingResponse:
    filters = {k: v for k, v in {"state": state, "district": district, "sector": sector, "trade": trade, "year": year}.items() if v is not None}
    rows = fetch_all_records(filters)
    csv_content = export_csv(rows)
    return StreamingResponse(
        iter([csv_content]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=skillplus-export.csv"},
    )


@router.get("/methodology")
def methodology() -> Dict[str, Any]:
    return {
        "title": "SkillPlus methodology",
        "sections": [
            {
                "source": "Data Sources",
                "process": "Sample demo labour-market data and planners' training signals are normalized into a common structure.",
                "formula": "Source data is standardised by state, district, sector, trade and date before any indicator calculation.",
                "interpretation": "Actual/sample data remains distinct from calculated indicators and model estimates.",
            },
            {
                "source": "Demand Index",
                "process": "Weighted demand signals combine job postings, hiring growth, industry demand and employment signal.",
                "formula": "0.40 × Job Posting Signal + 0.25 × Hiring Growth + 0.20 × Industry Demand + 0.15 × Employment Signal",
                "interpretation": "This highlights trades where employer demand is rising faster than supply.",
            },
            {
                "source": "Supply Index",
                "process": "Training capacity and current workforce signals are combined to estimate supply pressure.",
                "formula": "0.35 × Training Seats + 0.30 × Trained Candidates + 0.20 × Certified Candidates + 0.15 × Existing Workforce",
                "interpretation": "The index captures whether the training pipeline can meet current and near-term labour demand.",
            },
            {
                "source": "Gap Analysis",
                "process": "Demand and supply are compared to identify shortages versus oversupply.",
                "formula": "Gap = Demand Index − Supply Index",
                "interpretation": "Positive gaps signal shortage risk; negative gaps indicate oversupply risk.",
            },
            {
                "source": "Forecasting",
                "process": "A lightweight linear trend model uses the historical demand series to estimate near-term change.",
                "formula": "Future demand = Linear trend of historical demand indices for the next 1-3 years",
                "interpretation": "Forecasts are model-based estimates using available historical signals.",
            },
        ],
        "demand_index_formula": "0.40 × Job Posting Signal + 0.25 × Hiring Growth + 0.20 × Industry Demand + 0.15 × Employment Signal",
        "supply_index_formula": "0.35 × Training Seats + 0.30 × Trained Candidates + 0.20 × Certified Candidates + 0.15 × Existing Workforce",
        "gap_formula": "Gap = Demand − Supply",
        "forecast_note": "Forecasts are model-based estimates using available historical signals and should be used as planning intelligence rather than guaranteed projections.",
    }

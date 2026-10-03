from __future__ import annotations

import csv
import sqlite3
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

from app.config import settings
from app.data_providers.demo_provider import build_demo_records
from app.services.alerts import generate_alerts
from app.services.forecasting import build_trade_forecast
from app.services.indicators import classify_alert, classify_gap, compute_demand_index, compute_gap, compute_gap_pct, compute_supply_index
from app.services.normalization import normalize_record
from app.services.priority import rank_priorities

BASE_DIR = Path(__file__).resolve().parents[2]


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(settings.database_path)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    db_path = Path(settings.database_path)
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = get_connection()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS trade_metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            state TEXT NOT NULL,
            district TEXT NOT NULL,
            sector TEXT NOT NULL,
            trade TEXT NOT NULL,
            nco_code TEXT,
            nsqf_level INTEGER,
            year INTEGER NOT NULL,
            month INTEGER NOT NULL,
            job_postings INTEGER,
            hiring_growth REAL,
            industry_demand REAL,
            employment_signal REAL,
            training_seats INTEGER,
            trained_candidates INTEGER,
            certified_candidates INTEGER,
            existing_workforce INTEGER,
            demand_index REAL,
            supply_index REAL,
            gap_value REAL,
            gap_pct REAL,
            gap_status TEXT,
            early_warning TEXT,
            forecast_demand REAL,
            forecast_supply REAL,
            forecast_gap REAL,
            priority_score REAL
        )
        """
    )
    conn.execute("SELECT COUNT(*) FROM trade_metrics")
    if conn.execute("SELECT COUNT(*) FROM trade_metrics").fetchone()[0] == 0:
        seed_demo_data(conn)
    conn.commit()
    conn.close()


def seed_demo_data(conn: sqlite3.Connection) -> None:
    rows = build_demo_records()
    normalized = [normalize_record(record) for record in rows]
    max_job_postings = max((int(record["job_postings"]) for record in normalized), default=1)
    max_training = max((int(record["training_seats"]) for record in normalized), default=1)

    prepared: List[Dict[str, Any]] = []
    grouped: Dict[Tuple[str, str, str, str], List[Dict[str, Any]]] = {}

    for record in normalized:
        demand_index = compute_demand_index(record, max_job_postings)
        supply_index = compute_supply_index(record, max_training)
        gap_value = compute_gap(demand_index, supply_index)
        gap_pct = compute_gap_pct(gap_value, demand_index)
        gap_status = classify_gap(gap_value)
        prepared_row = {
            **record,
            "demand_index": demand_index,
            "supply_index": supply_index,
            "gap_value": gap_value,
            "gap_pct": gap_pct,
            "gap_status": gap_status,
            "forecast_demand": None,
            "forecast_supply": None,
            "forecast_gap": None,
            "priority_score": 0.0,
            "early_warning": "STABLE",
        }
        prepared.append(prepared_row)
        key = (str(record["state"]), str(record["district"]), str(record["sector"]), str(record["trade"]))
        grouped.setdefault(key, []).append(prepared_row)

    for key, group_rows in grouped.items():
        forecast = build_trade_forecast([
            {
                "year": int(row["year"]),
                "demand_index": float(row["demand_index"]),
                "supply_index": float(row["supply_index"]),
                "gap_value": float(row["gap_value"]),
            }
            for row in sorted(group_rows, key=lambda item: int(item["year"]))
        ])
        forecast_gap = forecast["forecast_gap"][-1] if forecast["forecast_gap"] else 0.0
        forecast_demand = forecast["forecast"][-1] if forecast["forecast"] else 0.0
        forecast_supply = float(sorted(group_rows, key=lambda item: int(item["year"]))[-1]["supply_index"])

        for row in group_rows:
            row["forecast_gap"] = forecast_gap
            row["forecast_demand"] = forecast_demand
            row["forecast_supply"] = forecast_supply
            row["early_warning"] = classify_alert(float(row["gap_value"]), float(forecast_gap))
            row["priority_score"] = float(row["gap_value"]) * 1.4 + float(row["demand_index"]) * 0.6 + float(forecast_gap) * 1.2

    for row in prepared:
        conn.execute(
            """
            INSERT INTO trade_metrics (
                state, district, sector, trade, nco_code, nsqf_level, year, month,
                job_postings, hiring_growth, industry_demand, employment_signal,
                training_seats, trained_candidates, certified_candidates, existing_workforce,
                demand_index, supply_index, gap_value, gap_pct, gap_status, early_warning,
                forecast_demand, forecast_supply, forecast_gap, priority_score
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                row["state"],
                row["district"],
                row["sector"],
                row["trade"],
                row.get("nco_code"),
                row.get("nsqf_level"),
                row["year"],
                row["month"],
                row["job_postings"],
                row["hiring_growth"],
                row["industry_demand"],
                row["employment_signal"],
                row["training_seats"],
                row["trained_candidates"],
                row["certified_candidates"],
                row["existing_workforce"],
                row["demand_index"],
                row["supply_index"],
                row["gap_value"],
                row["gap_pct"],
                row["gap_status"],
                row["early_warning"],
                row["forecast_demand"],
                row["forecast_supply"],
                row["forecast_gap"],
                row["priority_score"],
            ),
        )


def fetch_all_records(filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    conn = get_connection()
    query = "SELECT * FROM trade_metrics WHERE 1=1"
    params: List[Any] = []
    if filters:
        if filters.get("state"):
            query += " AND state = ?"
            params.append(filters["state"])
        if filters.get("district"):
            query += " AND district = ?"
            params.append(filters["district"])
        if filters.get("sector"):
            query += " AND sector = ?"
            params.append(filters["sector"])
        if filters.get("trade"):
            query += " AND trade = ?"
            params.append(filters["trade"])
        if filters.get("year"):
            query += " AND year = ?"
            params.append(filters["year"])
    query += " ORDER BY state, district, sector, trade, year"
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [dict(row) for row in rows]


def fetch_unique_values(column: str, filters: Optional[Dict[str, Any]] = None) -> List[str]:
    conn = get_connection()
    query = f"SELECT DISTINCT {column} FROM trade_metrics WHERE {column} IS NOT NULL"
    params: List[Any] = []
    if filters:
        if filters.get("state"):
            query += " AND state = ?"
            params.append(filters["state"])
        if filters.get("district"):
            query += " AND district = ?"
            params.append(filters["district"])
        if filters.get("sector"):
            query += " AND sector = ?"
            params.append(filters["sector"])
        if filters.get("trade"):
            query += " AND trade = ?"
            params.append(filters["trade"])
        if filters.get("year"):
            query += " AND year = ?"
            params.append(filters["year"])
    query += f" ORDER BY {column}"
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [row[0] for row in rows]


def fetch_overview(filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    rows = fetch_all_records(filters)
    total_states = len({row["state"] for row in rows})
    total_districts = len({row["district"] for row in rows})
    total_trades = len({row["trade"] for row in rows})
    shortage_trades = sum(1 for row in rows if row["gap_value"] > 10)
    oversupply_trades = sum(1 for row in rows if row["gap_value"] < -10)
    average_gap = round(sum(float(row["gap_value"]) for row in rows) / max(len(rows), 1), 2)
    return {
        "total_states": total_states,
        "total_districts": total_districts,
        "total_trades": total_trades,
        "shortage_trades": shortage_trades,
        "oversupply_trades": oversupply_trades,
        "average_gap": average_gap,
    }


def export_csv(rows: List[Dict[str, Any]]) -> str:
    fieldnames = [
        "State",
        "District",
        "Sector",
        "Trade",
        "Demand",
        "Supply",
        "Gap",
        "Gap Percentage",
        "Forecast Demand",
        "Forecast Supply",
        "Status",
        "Early Warning",
        "Planning Priority",
    ]
    lines = [",".join(fieldnames)]
    for row in rows:
        lines.append(
            ",".join(
                [
                    str(row.get("state", "")),
                    str(row.get("district", "")),
                    str(row.get("sector", "")),
                    str(row.get("trade", "")),
                    str(row.get("demand_index", "")),
                    str(row.get("supply_index", "")),
                    str(row.get("gap_value", "")),
                    str(row.get("gap_pct", "")),
                    str(row.get("forecast_demand", "")),
                    str(row.get("forecast_supply", "")),
                    str(row.get("gap_status", "")),
                    str(row.get("early_warning", "")),
                    str(row.get("priority_score", "")),
                ]
            )
        )
    return "\n".join(lines)

from __future__ import annotations

import csv
import io
from typing import Any, Dict, List, Tuple

import pandas as pd

from app.services.indicators import classify_alert, classify_gap, compute_demand_index, compute_gap, compute_gap_pct, compute_supply_index
from app.services.normalization import normalize_record

REQUIRED_COLUMNS = {
    "state",
    "district",
    "sector",
    "trade",
    "year",
    "job_postings",
    "hiring_growth",
    "industry_demand",
    "employment_signal",
    "training_seats",
    "trained_candidates",
    "certified_candidates",
    "existing_workforce",
}


def validate_uploaded_csv(file_bytes: bytes) -> Tuple[bool, List[str], List[Dict[str, Any]]]:
    try:
        text = file_bytes.decode("utf-8")
    except UnicodeDecodeError:
        return False, ["CSV file must use UTF-8 encoding."], []

    reader = csv.DictReader(io.StringIO(text))
    if reader.fieldnames is None:
        return False, ["CSV file appears to be empty or missing a header row."], []

    headers = [name.strip().lower() for name in reader.fieldnames]
    missing = sorted(REQUIRED_COLUMNS - set(headers))
    if missing:
        return False, [f"Missing required columns: {', '.join(missing)}"], []

    rows: List[Dict[str, Any]] = []
    for index, row in enumerate(reader, start=2):
        try:
            normalized = normalize_record({
                "state": row.get("state", ""),
                "district": row.get("district", ""),
                "sector": row.get("sector", ""),
                "trade": row.get("trade", ""),
                "year": int(row.get("year", 0)),
                "month": int(row.get("month", 6)) if row.get("month") else 6,
                "job_postings": int(float(row.get("job_postings", 0))),
                "hiring_growth": float(row.get("hiring_growth", 0)),
                "industry_demand": float(row.get("industry_demand", 0)),
                "employment_signal": float(row.get("employment_signal", 0)),
                "training_seats": int(float(row.get("training_seats", 0))),
                "trained_candidates": int(float(row.get("trained_candidates", 0))),
                "certified_candidates": int(float(row.get("certified_candidates", 0))),
                "existing_workforce": int(float(row.get("existing_workforce", 0))),
            })
        except Exception:
            return False, [f"Row {index} contains invalid values and could not be parsed."], []

        if not normalized.get("state") or not normalized.get("trade"):
            return False, [f"Row {index} is missing critical state or trade information."], []

        rows.append(normalized)

    return True, [], rows


def process_csv_records(rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    max_job_postings = max((int(r.get("job_postings", 0)) for r in rows), default=1)
    max_training = max((int(r.get("training_seats", 0)) for r in rows), default=1)
    processed: List[Dict[str, Any]] = []

    for row in rows:
        demand_index = compute_demand_index(row, max_job_postings)
        supply_index = compute_supply_index(row, max_training)
        gap_value = compute_gap(demand_index, supply_index)
        processed_row = {
            **row,
            "demand_index": demand_index,
            "supply_index": supply_index,
            "gap_value": gap_value,
            "gap_pct": round((gap_value / demand_index) * 100.0 if demand_index else 0.0, 2),
            "gap_status": classify_gap(gap_value),
            "early_warning": classify_alert(gap_value, gap_value),
        }
        processed.append(processed_row)

    return processed

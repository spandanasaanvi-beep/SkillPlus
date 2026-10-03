from __future__ import annotations

from typing import Dict, List


TRADE_ALIASES = {
    "data analyst": "Data Analyst",
    "data-analyst": "Data Analyst",
    "software developer": "Software Developer",
    "ai engineer": "AI Engineer",
    "solar technician": "Solar Technician",
    "solar pv technician": "Solar Technician",
    "solar panel technician": "Solar Technician",
    "ev technician": "EV Technician",
    "electric vehicle technician": "EV Technician",
    "lab technician": "Lab Technician",
    "nurse": "Nurse",
    "warehouse executive": "Warehouse Executive",
    "supply chain analyst": "Supply Chain Analyst",
    "mason": "Mason",
    "carpenter": "Carpenter",
    "cnc operator": "CNC Operator",
    "production supervisor": "Production Supervisor",
    "wind turbine technician": "Wind Turbine Technician",
    "auto service technician": "Auto Service Technician",
}

STATE_ALIASES = {
    "karnataka": "Karnataka",
    "ka": "Karnataka",
    "tamil nadu": "Tamil Nadu",
    "tn": "Tamil Nadu",
    "maharashtra": "Maharashtra",
    "mh": "Maharashtra",
    "gujarat": "Gujarat",
    "gj": "Gujarat",
    "telangana": "Telangana",
    "ts": "Telangana",
}

SECTOR_ALIASES = {
    "it/ites": "IT/ITeS",
    "it ites": "IT/ITeS",
    "healthcare": "Healthcare",
    "manufacturing": "Manufacturing",
    "renewable energy": "Renewable Energy",
    "automotive": "Automotive",
    "construction": "Construction",
    "logistics": "Logistics",
}


def normalize_text(value: str, alias_map: Dict[str, str] | None = None) -> str:
    if value is None:
        return ""
    text = str(value).strip()
    if not text:
        return ""
    lowered = text.lower()
    if alias_map:
        mapped = alias_map.get(lowered)
        if mapped:
            return mapped
    return text


def normalize_state(value: str) -> str:
    return normalize_text(value, STATE_ALIASES)


def normalize_sector(value: str) -> str:
    return normalize_text(value, SECTOR_ALIASES)


def normalize_trade(value: str) -> str:
    return normalize_text(value, TRADE_ALIASES)


def normalize_record(raw: Dict[str, object]) -> Dict[str, object]:
    return {
        **raw,
        "state": normalize_state(str(raw.get("state", ""))),
        "district": str(raw.get("district", "")).strip(),
        "sector": normalize_sector(str(raw.get("sector", ""))),
        "trade": normalize_trade(str(raw.get("trade", ""))),
    }

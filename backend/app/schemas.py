from typing import Any, List, Literal, Optional

from pydantic import BaseModel, Field


class Overview(BaseModel):
    total_states: int
    total_districts: int
    total_trades: int
    shortage_trades: int
    oversupply_trades: int
    average_gap: float


class MetricRecord(BaseModel):
    id: Optional[int] = None
    state: str
    district: str
    sector: str
    trade: str
    nco_code: Optional[str] = None
    nsqf_level: Optional[int] = None
    year: int
    month: int
    job_postings: int
    hiring_growth: float
    industry_demand: float
    employment_signal: float
    training_seats: int
    trained_candidates: int
    certified_candidates: int
    existing_workforce: int
    demand_index: float
    supply_index: float
    gap_value: float
    gap_pct: float
    gap_status: str
    early_warning: str
    forecast_gap: Optional[float] = None
    forecast_demand: Optional[float] = None
    forecast_supply: Optional[float] = None
    priority_score: Optional[float] = None


class FilterParams(BaseModel):
    state: Optional[str] = None
    district: Optional[str] = None
    sector: Optional[str] = None
    trade: Optional[str] = None
    year: Optional[int] = None


class DataUploadResponse(BaseModel):
    inserted: int
    skipped: int
    warnings: List[str]
    sample_rows: List[MetricRecord]


class AlertItem(BaseModel):
    district: str
    sector: str
    trade: str
    current_gap: float
    forecast_gap: float
    reason: str
    alert_type: Literal["CRITICAL_SHORTAGE", "SHORTAGE_RISK", "OVERSUPPLY_RISK", "STABLE", "EMERGING_DEMAND"]


class MethodologySection(BaseModel):
    source: str
    process: str
    formula: str
    interpretation: str


class MethodologyResponse(BaseModel):
    title: str
    sections: List[MethodologySection]
    demand_index_formula: str
    supply_index_formula: str
    gap_formula: str
    forecast_note: str

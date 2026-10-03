export type Language = 'en' | 'kn';

export type MetricRow = {
  id?: number;
  state: string;
  district: string;
  sector: string;
  trade: string;
  year: number;
  month: number;
  demand_index: number;
  supply_index: number;
  gap_value: number;
  gap_pct: number;
  gap_status: string;
  early_warning: string;
  forecast_demand?: number;
  forecast_supply?: number;
  forecast_gap?: number;
  priority_score?: number;
  hiring_growth?: number;
  industry_demand?: number;
  employment_signal?: number;
};

export type Overview = {
  total_states: number;
  total_districts: number;
  total_trades: number;
  shortage_trades: number;
  oversupply_trades: number;
  average_gap: number;
};

export type SkillPlusProfile = {
  name: string;
  qualification: string;
  skills: string[];
  preferredJob: string;
  sector: string;
  state: string;
  district: string;
};

export type AlertItem = {
  district: string;
  sector: string;
  trade: string;
  current_gap: number;
  forecast_gap: number;
  reason: string;
  alert_type: string;
};

export type MethodologySection = {
  source: string;
  process: string;
  formula: string;
  interpretation: string;
};

export type MethodologyResponse = {
  title: string;
  sections: MethodologySection[];
  demand_index_formula: string;
  supply_index_formula: string;
  gap_formula: string;
  forecast_note: string;
};

export type Filters = {
  state?: string;
  district?: string;
  sector?: string;
  trade?: string;
  year?: number;
};

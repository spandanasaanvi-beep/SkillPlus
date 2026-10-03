from __future__ import annotations

from typing import Any, Dict, List

from app.data_providers.interfaces import LabourDataProvider


class DemoDataProvider(LabourDataProvider):
    def get_records(self) -> List[Dict[str, Any]]:
        return build_demo_records()


def build_demo_records() -> List[Dict[str, Any]]:
    sectors = {
        "IT/ITeS": [
            ("Data Analyst", "2511", 5, 760, 16, 82, 72, 680, 520, 420, 3600),
            ("Software Developer", "2512", 5, 920, 14, 84, 75, 740, 610, 500, 4200),
            ("AI Engineer", "2512", 6, 610, 25, 87, 77, 330, 240, 210, 2800),
        ],
        "Healthcare": [
            ("Nurse", "2221", 5, 540, 11, 76, 65, 480, 360, 290, 5100),
            ("Lab Technician", "3212", 4, 430, 8, 71, 60, 410, 330, 260, 3900),
        ],
        "Manufacturing": [
            ("CNC Operator", "7223", 4, 410, 7, 68, 59, 560, 420, 310, 6600),
            ("Production Supervisor", "7222", 5, 290, 9, 63, 54, 230, 180, 140, 2600),
        ],
        "Renewable Energy": [
            ("Solar Technician", "7422", 4, 510, 22, 88, 73, 620, 500, 410, 3700),
            ("Wind Turbine Technician", "7421", 5, 260, 18, 78, 66, 220, 175, 150, 1800),
        ],
        "Automotive": [
            ("EV Technician", "7231", 4, 420, 24, 81, 68, 310, 220, 180, 2700),
            ("Auto Service Technician", "7232", 4, 380, 10, 70, 61, 360, 280, 220, 3100),
        ],
        "Construction": [
            ("Mason", "9312", 3, 330, 6, 60, 50, 620, 470, 340, 9200),
            ("Carpenter", "9313", 3, 280, 5, 57, 48, 460, 360, 270, 7600),
        ],
        "Logistics": [
            ("Warehouse Executive", "4321", 4, 440, 12, 74, 62, 540, 390, 310, 4100),
            ("Supply Chain Analyst", "4322", 5, 320, 18, 79, 69, 300, 220, 180, 2400),
        ],
    }

    states = {
        "Karnataka": [
            "Bengaluru Urban",
            "Mysuru",
            "Hubballi",
            "Mangaluru",
        ],
        "Tamil Nadu": [
            "Chennai",
            "Coimbatore",
            "Madurai",
            "Salem",
        ],
        "Maharashtra": [
            "Pune",
            "Mumbai",
            "Nagpur",
            "Nashik",
        ],
        "Gujarat": [
            "Ahmedabad",
            "Surat",
            "Vadodara",
            "Rajkot",
        ],
        "Telangana": [
            "Hyderabad",
            "Warangal",
            "Secunderabad",
            "Rangareddy",
        ],
    }

    records: List[Dict[str, Any]] = []
    years = [2022, 2023, 2024]

    for state, districts in states.items():
        for district in districts:
            for sector, trade_profiles in sectors.items():
                for trade_name, nco_code, nsqf, base_jobs, base_growth, base_industry, base_employment, base_training, base_trained, base_certified, base_workforce in trade_profiles:
                    state_multiplier = {
                        "Karnataka": 1.18,
                        "Tamil Nadu": 1.1,
                        "Maharashtra": 1.15,
                        "Gujarat": 1.05,
                        "Telangana": 1.08,
                    }[state]
                    district_multiplier = {
                        "Bengaluru Urban": 1.32,
                        "Mysuru": 1.0,
                        "Hubballi": 0.9,
                        "Mangaluru": 0.84,
                        "Chennai": 1.25,
                        "Coimbatore": 1.12,
                        "Madurai": 0.88,
                        "Salem": 0.78,
                        "Pune": 1.2,
                        "Mumbai": 1.28,
                        "Nagpur": 0.96,
                        "Nashik": 0.82,
                        "Ahmedabad": 1.14,
                        "Surat": 1.1,
                        "Vadodara": 0.9,
                        "Rajkot": 0.82,
                        "Hyderabad": 1.22,
                        "Warangal": 0.86,
                        "Secunderabad": 1.0,
                        "Rangareddy": 0.92,
                    }.get(district, 1.0)

                    for year in years:
                        demand_boost = 1 + (year - 2022) * 0.11
                        training_boost = 1 + (year - 2022) * 0.06
                        month = 6
                        job_postings = max(80, round(base_jobs * state_multiplier * district_multiplier * demand_boost))
                        hiring_growth = round(base_growth + (year - 2022) * 2.5, 1)
                        industry_demand = min(100.0, round(base_industry + (year - 2022) * 2.0, 1))
                        employment_signal = round(base_employment + (year - 2022) * 1.2, 1)

                        training_seats = max(120, round(base_training * state_multiplier * training_boost * 0.95))
                        trained_candidates = max(80, round(base_trained * state_multiplier * training_boost))
                        certified_candidates = max(50, round(base_certified * (0.9 + (year - 2022) * 0.04)))
                        existing_workforce = max(150, round(base_workforce * district_multiplier * (1.0 + (year - 2022) * 0.12)))

                        if trade_name in {"Mason", "Carpenter", "CNC Operator", "Lab Technician"}:
                            job_postings = max(120, int(job_postings * 0.72))
                            training_seats = int(training_seats * 1.4)
                            trained_candidates = int(trained_candidates * 1.5)

                        if trade_name in {"AI Engineer", "Solar Technician", "EV Technician", "Data Analyst"}:
                            job_postings = int(job_postings * 1.25)
                            hiring_growth = round(min(40.0, hiring_growth + 4), 1)
                            industry_demand = round(min(100.0, industry_demand + 6), 1)

                        records.append(
                            {
                                "state": state,
                                "district": district,
                                "sector": sector,
                                "trade": trade_name,
                                "nco_code": nco_code,
                                "nsqf_level": nsqf,
                                "year": year,
                                "month": month,
                                "job_postings": int(job_postings),
                                "hiring_growth": float(hiring_growth),
                                "industry_demand": float(industry_demand),
                                "employment_signal": float(employment_signal),
                                "training_seats": int(training_seats),
                                "trained_candidates": int(trained_candidates),
                                "certified_candidates": int(certified_candidates),
                                "existing_workforce": int(existing_workforce),
                            }
                        )

    return records

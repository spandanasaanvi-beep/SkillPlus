# SkillPlus

SkillPlus is an AI-enabled labour market intelligence and skill demand-supply forecasting prototype designed for public-sector skill planning. It helps planners identify where demand is rising, where training capacity is insufficient, and where oversupply risks are emerging.

## Problem statement

India generates large volumes of training output, but labour-market demand is not always aligned with the supply of workers. This mismatch can create shortages in evolving sectors such as AI, renewable energy and EV services while also creating oversupply risk in more mature occupations.

SkillPlus brings together:

- labour-demand signals
- training-supply indicators
- district-level market context
- explainable forecasting
- early-warning alerts
- planning prioritisation

## Architecture

The prototype separates concerns into a frontend, backend API, data-processing layer, forecasting layer and provider abstraction for external sources.

```text
Frontend (React + Vite + Tailwind)
  -> Backend API (FastAPI + Pydantic)
    -> Data processing / normalization
    -> Demand and supply index calculation
    -> Forecasting
    -> Early warning logic
    -> SQLite data store
```

## Tech stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, Recharts, React Router
- Backend: Python, FastAPI, Pydantic
- Data processing: Pandas, NumPy
- Forecasting: lightweight linear regression using historical demand signals
- Storage: SQLite for the prototype

## Folder structure

```text
SkillPlus/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── data_providers/
│   │   ├── database/
│   │   ├── services/
│   │   ├── config.py
│   │   ├── main.py
│   │   └── schemas.py
│   ├── data/
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── README.md
├── .gitignore
└── package-lock.json
```

## Setup instructions

### macOS/Linux

```bash
cd SkillPlus
python3 -m venv backend/.venv
source backend/.venv/bin/activate
pip install -r backend/requirements.txt
cd frontend && npm install && cd ..
```

### Windows PowerShell

```powershell
cd SkillPlus
python -m venv backend/.venv
.\backend\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
cd frontend
npm install
```

## Environment variables

Copy the example files and adjust values if needed.

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Frontend example:

```env
VITE_API_URL=http://localhost:8000
```

Backend example:

```env
APP_NAME=SkillPlus
APP_ENV=development
DATABASE_PATH=./app.db
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

## Run locally

Start the backend:

```bash
cd SkillPlus/backend
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Start the frontend:

```bash
cd SkillPlus/frontend
npm run dev -- --host 0.0.0.0 --port 5173
```

Open the frontend at http://localhost:5173.

## API documentation

The backend exposes a FastAPI REST API with endpoints such as:

- GET /api/health
- GET /api/overview
- GET /api/gaps
- GET /api/forecast
- GET /api/alerts
- GET /api/priorities
- POST /api/data/upload
- GET /api/data/export
- GET /api/methodology

Example call:

```bash
curl http://localhost:8000/api/overview
curl "http://localhost:8000/api/gaps?state=Karnataka&district=Bengaluru%20Urban"
```

## Data model

The prototype stores normalized records that include:

- state
- district
- sector
- trade
- NCO code
- NSQF level
- year/month
- demand signals
- training and certification data
- workforce context

## Forecasting methodology

SkillPlus uses a lightweight, explainable linear-trend approach based on historical demand signals. The forecast does not claim certainty; it provides model-based estimates for near-term planning.

Demand index formula:

```text
0.40 × Job Posting Signal
+ 0.25 × Hiring Growth
+ 0.20 × Industry Demand
+ 0.15 × Employment Signal
```

Supply index formula:

```text
0.35 × Training Seats
+ 0.30 × Trained Candidates
+ 0.20 × Certified Candidates
+ 0.15 × Existing Workforce
```

Gap formula:

```text
Gap = Demand Index - Supply Index
```

## Demo-data disclaimer

All dataset values in this prototype are clearly labelled as demo or sample data. They are not official government statistics and are intended to demonstrate the architecture, workflow and planning logic of the system.

## Future integration possibilities

The app is designed to work with real labour-market sources later, including:

- NCS labour data
- PLFS labour-force data
- e-Shram and employment datasets
- NSQF and NCO-coded training data
- industry recruitment and job-posting feeds

The data provider abstraction allows the system to swap in legitimate datasets without rewriting the frontend and API interfaces.

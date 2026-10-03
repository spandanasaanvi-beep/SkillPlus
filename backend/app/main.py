from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router as api_router
from app.config import settings
from app.database.db import init_db

app = FastAPI(title=settings.app_name, version="1.0.0")

origins = [origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.on_event("startup")
def startup_event() -> None:
    init_db()


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "SkillPlus API is running"}

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    app_name: str = "SkillPlus"
    app_env: str = "development"
    database_path: str = str(BASE_DIR / "app.db")
    cors_origins: str = (
        "http://localhost:5173,http://localhost:5174,http://localhost:5175,"
        "http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:5175"
    )

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()

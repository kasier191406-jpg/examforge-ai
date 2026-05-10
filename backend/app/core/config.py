from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "ExamForge AI"
    app_env: str = "development"
    debug: bool = True
    api_v1_prefix: str = "/api/v1"

    database_url: str = "sqlite:///./question_paper_generator.db"

    jwt_secret_key: str = Field(default="change-me-in-production", min_length=16)
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    backend_cors_origins: list[str] = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://examforge-ai-ebon.vercel.app",
]

    default_admin_username: str = "admin"
    default_admin_password: str = "Admin@123"
    default_admin_email: str = "admin@techuniversity.edu"
    default_institution_name: str = "Tech University"

    similarity_threshold: float = 0.80
    log_level: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @field_validator("backend_cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @field_validator("debug", mode="before")
    @classmethod
    def parse_debug(cls, value: bool | str) -> bool:
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"release", "production", "prod", "false", "0", "no"}:
                return False
            if normalized in {"debug", "development", "dev", "true", "1", "yes"}:
                return True
        return bool(value)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

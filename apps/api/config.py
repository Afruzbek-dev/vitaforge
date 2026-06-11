from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # App
    APP_ENV: str = "development"
    BASE_URL: str = "http://localhost:8000"
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "https://vitaforge.uz", "https://app.vitaforge.uz"]

    # Supabase
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str
    SUPABASE_ANON_KEY: str
    DATABASE_URL: str  # postgresql+asyncpg://...

    # Claude AI
    ANTHROPIC_API_KEY: str

    # Redis (Upstash)
    REDIS_URL: str

    # Firebase
    FCM_SERVER_KEY: str = ""

    # Security
    JWT_SECRET: str = "change-me-in-production-min-32-chars"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

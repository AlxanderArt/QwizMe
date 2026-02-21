from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SECRET_KEY: str
    DATABASE_URL: str = "sqlite:///./qwiz_me.db"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    ALGORITHM: str = "HS256"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_ORIGINS: str = "http://localhost:5173"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    ENCRYPTION_KEY: str = ""
    RESEND_API_KEY: str = ""
    FROM_EMAIL: str = "Qwiz Me <noreply@qwizme.app>"
    FRONTEND_URL: str = "http://localhost:5173"
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""
    FOUNDER_EMAIL: str = ""

    model_config = {"env_file": ".env"}


settings = Settings()

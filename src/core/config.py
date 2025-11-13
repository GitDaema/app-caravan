# src/core/config.py
import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    
    # 60 minutes * 24 hours * 8 days = 8 days
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    
    # It's recommended to load this from an environment variable
    # For development, a default value is provided.
    # Generate a good secret with: openssl rand -hex 32
    SECRET_KEY: str = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
    
    ALGORITHM: str = "HS256"

    # Database
    SQLALCHEMY_DATABASE_URI: str = os.getenv("DATABASE_URL", "sqlite:///./caravan_booking.db")

    # CORS
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "*")

    # Google OAuth
    # Set your OAuth Client ID from Google Cloud Console to enable
    # strict audience verification when validating ID tokens.
    # If not set, token verification will skip audience validation,
    # which is acceptable for local development only.
    GOOGLE_CLIENT_ID: str | None = os.getenv("GOOGLE_CLIENT_ID") or None
    # Firebase support (optional): set your Firebase Project ID to verify
    # Firebase Authentication ID tokens issued by securetoken.google.com.
    FIREBASE_PROJECT_ID: str | None = os.getenv("FIREBASE_PROJECT_ID") or None

    model_config = SettingsConfigDict(case_sensitive=True)

settings = Settings()

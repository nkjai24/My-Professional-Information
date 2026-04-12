# app/config.py
import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # API Configuration
    API_TITLE: str = "Smart Teacher Robot API"
    API_VERSION: str = "1.0.0"
    
    # OpenAI Configuration
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = "gpt-3.5-turbo"
    
    # File Upload Settings
    MAX_FILE_SIZE: int = 50000000  # 50MB
    ALLOWED_EXTENSIONS: List[str] = ["pdf", "docx", "doc", "xlsx", "xls", "csv", "txt", "png", "jpg", "jpeg"]
    UPLOAD_FOLDER: str = "uploads"
    
    # Voice Settings
    DEFAULT_VOICE_SPEED: int = 200
    DEFAULT_VOICE_VOLUME: float = 0.9
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS Settings
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ]
    
    # Database (SQLite for simplicity)
    DATABASE_URL: str = "sqlite:///./smart_teacher.db"
    
    class Config:
        env_file = ".env"

settings = Settings()
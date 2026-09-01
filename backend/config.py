import os
from typing import List

class Settings:
    ENV: str = os.getenv("SENTINELIQ_ENV", "development")
    HOST: str = os.getenv("SENTINELIQ_API_HOST", "0.0.0.0")
    PORT: int = int(os.getenv("SENTINELIQ_API_PORT", "8000"))
    LOG_LEVEL: str = os.getenv("SENTINELIQ_LOG_LEVEL", "INFO").upper()
    DATA_DIR: str = os.getenv("SENTINELIQ_DATA_DIR", "data")
    VERSION: str = "1.0"

    @property
    def cors_origins(self) -> List[str]:
        raw = os.getenv(
            "SENTINELIQ_CORS_ORIGINS",
            "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173"
        )
        if raw.strip() == "*":
            return ["*"]
        return [origin.strip() for origin in raw.split(",") if origin.strip()]

settings = Settings()

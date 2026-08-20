"""
VERDICT Data Pipeline Configuration
Loads environment variables and sets defaults for database, rate limits, proxies, and paths.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Base directory for pipeline
PIPELINE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = PIPELINE_DIR.parent

# Load .env file from project root or pipeline directory
env_path = PROJECT_DIR / ".env"
if not env_path.exists():
    env_path = PIPELINE_DIR / ".env"
load_dotenv(dotenv_path=env_path)

# Database Configuration
# Supports PostgreSQL with asyncpg driver, with SQLite async fallback for local zero-dependency runs
DEFAULT_DB_URL = "sqlite+aiosqlite:///" + str(PIPELINE_DIR / "verdict_pipeline.db").replace("\\", "/")
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_DB_URL)

# Ensure async driver for postgresql if supplied as postgresql://
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)

# Proxy Configuration
RAW_PROXIES = os.getenv("PROXY_LIST", "")
PROXY_LIST = [p.strip() for p in RAW_PROXIES.split(",") if p.strip()]

# Logging Configuration
LOG_LEVEL = os.getenv("PIPELINE_LOG_LEVEL", "INFO").upper()
LOGS_DIR = PIPELINE_DIR / "logs"
LOGS_DIR.mkdir(parents=True, exist_ok=True)

# Rate Limits (Requests per Second)
MYNETA_RPS = float(os.getenv("MYNETA_RPS", "0.33"))          # 1 req per 3s
SANSAD_RPS = float(os.getenv("SANSAD_RPS", "0.50"))          # 1 req per 2s
ECOURTS_RPS = float(os.getenv("ECOURTS_RPS", "0.20"))        # 1 req per 5s
WIKIPEDIA_RPS = float(os.getenv("WIKIPEDIA_RPS", "1.00"))    # 1 req per 1s
GOOGLE_NEWS_RPS = float(os.getenv("GOOGLE_NEWS_RPS", "0.50"))# 1 req per 2s

# Daily Quotas
MAX_DAILY_MYNETA_REQUESTS = int(os.getenv("MAX_DAILY_MYNETA_REQUESTS", "500"))
MAX_DAILY_ECOURTS_REQUESTS = int(os.getenv("MAX_DAILY_ECOURTS_REQUESTS", "200"))

# Default Data Paths
DATA_DIR = PIPELINE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
LOK_DHABA_CSV_PATH = os.getenv("LOK_DHABA_CSV_PATH", str(DATA_DIR / "lok_dhaba_sample.csv"))

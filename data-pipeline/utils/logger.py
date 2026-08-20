"""
Structured JSON and Console Logger
Emits structured JSON lines to disk and readable color-coded logs to stdout.
"""

import json
import logging
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Any, Dict
from config import LOG_LEVEL, LOGS_DIR


class JSONFormatter(logging.Formatter):
    """
    Formats log records as single-line JSON objects.
    """

    def format(self, record: logging.LogRecord) -> str:
        data: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "source": getattr(record, "source", "pipeline"),
            "politician_id": getattr(record, "politician_id", None),
            "message": record.getMessage(),
            "url": getattr(record, "url", None),
            "status_code": getattr(record, "status_code", None),
            "error": getattr(record, "error", None),
            "duration_ms": getattr(record, "duration_ms", None),
        }
        if record.exc_info and not data.get("error"):
            data["error"] = self.formatException(record.exc_info)
        return json.dumps(data)


class ConsoleFormatter(logging.Formatter):
    """
    Human-readable colored console formatter.
    """

    COLORS = {
        "DEBUG": "\033[36m",    # Cyan
        "INFO": "\033[32m",     # Green
        "WARNING": "\033[33m",  # Yellow
        "ERROR": "\033[31m",    # Red
        "CRITICAL": "\033[35m", # Magenta
        "RESET": "\033[0m",
    }

    def format(self, record: logging.LogRecord) -> str:
        color = self.COLORS.get(record.levelname, self.COLORS["RESET"])
        reset = self.COLORS["RESET"]
        source = getattr(record, "source", "pipeline")
        pol_id = getattr(record, "politician_id", None)
        pol_str = f" [Pol:{pol_id[:8]}]" if pol_id else ""
        time_str = datetime.now().strftime("%H:%M:%S")

        msg = f"{time_str} {color}[{record.levelname:<7}]{reset} [{source}]{pol_str} {record.getMessage()}"
        if getattr(record, "url", None):
            msg += f" (URL: {record.url})"
        if getattr(record, "error", None):
            msg += f" | Error: {record.error}"
        return msg


# Setup root pipeline logger
_logger = logging.getLogger("verdict_pipeline")
_logger.setLevel(getattr(logging, LOG_LEVEL, logging.INFO))
_logger.propagate = False

if not _logger.handlers:
    # Console Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(ConsoleFormatter())
    _logger.addHandler(console_handler)

    # Daily JSON File Handler
    today_str = datetime.now().strftime("%Y-%m-%d")
    log_file_path = LOGS_DIR / f"pipeline_{today_str}.log"
    file_handler = logging.FileHandler(str(log_file_path), encoding="utf-8")
    file_handler.setFormatter(JSONFormatter())
    _logger.addHandler(file_handler)


def get_logger() -> logging.Logger:
    return _logger


def log_event(
    source: str,
    message: str,
    level: str = "INFO",
    politician_id: Optional[str] = None,
    url: Optional[str] = None,
    status_code: Optional[int] = None,
    error: Optional[str] = None,
    duration_ms: Optional[float] = None,
) -> None:
    """
    Helper function to emit a structured log event.
    """
    extra = {
        "source": source,
        "politician_id": politician_id,
        "url": url,
        "status_code": status_code,
        "error": error,
        "duration_ms": duration_ms,
    }
    lvl = getattr(logging, level.upper(), logging.INFO)
    _logger.log(lvl, message, extra=extra)

import logging
import sys
from backend.config import settings

def get_logger(name: str = "sentineliq") -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            "[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    level = getattr(logging, settings.LOG_LEVEL, logging.INFO)
    logger.setLevel(level)
    return logger

logger = get_logger()

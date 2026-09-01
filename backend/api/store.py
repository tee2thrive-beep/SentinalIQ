import os
from typing import Dict, Any, Optional
from backend.reporting.evidence import load_reporting_datasets
from backend.reporting.generator import generate_incident_report
from backend.api.logger import logger

class IncidentDataStore:
    _instance: Optional["IncidentDataStore"] = None

    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        self.datasets = load_reporting_datasets(data_dir)
        self.priority_queue = self.datasets["priority_queue"]
        self.reports_cache: Dict[str, Dict[str, Any]] = {}
        self._build_cache()

    def _build_cache(self):
        logger.info(f"Building in-memory report cache for {len(self.priority_queue)} incidents...")
        for item in self.priority_queue:
            iid = item["incident_id"]
            self.reports_cache[iid] = generate_incident_report(iid, datasets=self.datasets)

    def reload(self):
        logger.info("Reloading IncidentDataStore in-memory cache...")
        self.datasets = load_reporting_datasets(self.data_dir)
        self.priority_queue = self.datasets["priority_queue"]
        self.reports_cache = {}
        self._build_cache()

    @classmethod
    def get_instance(cls, data_dir: str = "data") -> "IncidentDataStore":
        if cls._instance is None:
            cls._instance = cls(data_dir)
        return cls._instance

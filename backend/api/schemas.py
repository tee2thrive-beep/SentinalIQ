from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class HealthResponse(BaseModel):
    status: str = Field("ok", example="ok")
    service: str = Field("SentinelIQ", example="SentinelIQ")
    version: str = Field("1.0", example="1.0")

class IncidentSummaryItem(BaseModel):
    priority_rank: int
    incident_id: str
    risk_score: float
    risk_level: str
    priority_band: str
    incident_type: str
    first_seen: str
    alert_count: int
    affected_users: int
    dominant_factors: List[str]
    tie_group_id: Optional[str] = None

class IncidentListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    items: List[IncidentSummaryItem]

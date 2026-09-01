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

class CreateAlertRequest(BaseModel):
    alert_type: str = Field(..., example="Data Exfiltration Attempt")
    category: str = Field(..., example="Exfiltration")
    severity: float = Field(..., ge=0.0, le=100.0, example=95.0)
    confidence: float = Field(..., ge=0.0, le=100.0, example=90.0)
    source_ip: Optional[str] = Field("192.168.1.150", example="192.168.1.150")
    destination_ip: Optional[str] = Field("10.0.4.22", example="10.0.4.22")
    asset_id: Optional[str] = Field("AST-0001", example="AST-0001")
    user_id: Optional[str] = Field("USR-0005", example="USR-0005")

class CreateAlertResponse(BaseModel):
    success: bool
    alert_id: str
    incident_id: str
    priority_rank: int
    risk_score: float
    risk_level: str
    message: str


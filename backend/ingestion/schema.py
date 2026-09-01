import ipaddress
from dataclasses import dataclass, asdict
from datetime import datetime

VALID_STATUSES = {"open", "investigating", "closed"}

@dataclass
class Alert:
    alert_id: str
    timestamp: str
    alert_type: str
    source_ip: str
    destination_ip: str
    user_id: str
    asset_id: str
    severity: int
    description: str
    confidence: int
    status: str = "open"

    def __post_init__(self):
        # Type coercions
        self.severity = int(self.severity)
        self.confidence = int(self.confidence)

        # Basic validations
        if not self.alert_id or not isinstance(self.alert_id, str):
            raise ValueError(f"Invalid alert_id: {self.alert_id}")
        if not self.alert_type or not isinstance(self.alert_type, str):
            raise ValueError(f"Invalid alert_type for alert {self.alert_id}")
        if not self.user_id or not isinstance(self.user_id, str):
            raise ValueError(f"Invalid user_id for alert {self.alert_id}")
        if not self.asset_id or not isinstance(self.asset_id, str):
            raise ValueError(f"Invalid asset_id for alert {self.alert_id}")
        if self.status not in VALID_STATUSES:
            raise ValueError(f"Invalid status '{self.status}' for alert {self.alert_id}. Must be one of {VALID_STATUSES}")

        # Bounds validation
        if not (0 <= self.severity <= 100):
            raise ValueError(f"Severity out of 0-100 bounds: {self.severity} for alert {self.alert_id}")
        if not (0 <= self.confidence <= 100):
            raise ValueError(f"Confidence out of 0-100 bounds: {self.confidence} for alert {self.alert_id}")

        # Timestamp validation
        try:
            datetime.fromisoformat(self.timestamp)
        except Exception as e:
            raise ValueError(f"Invalid ISO 8601 timestamp '{self.timestamp}' for alert {self.alert_id}: {e}")

        # IP address validation
        try:
            ipaddress.ip_address(self.source_ip)
        except Exception as e:
            raise ValueError(f"Invalid source_ip '{self.source_ip}' for alert {self.alert_id}: {e}")

        try:
            ipaddress.ip_address(self.destination_ip)
        except Exception as e:
            raise ValueError(f"Invalid destination_ip '{self.destination_ip}' for alert {self.alert_id}: {e}")

    def to_dict(self) -> dict:
        return asdict(self)

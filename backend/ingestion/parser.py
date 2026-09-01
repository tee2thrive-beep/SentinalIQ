import json
import csv
from typing import List, Dict, Any
from backend.ingestion.schema import Alert

def parse_alert_dict(data: Dict[str, Any]) -> Alert:
    """Parses a dictionary record into a validated Alert object."""
    required_fields = ["alert_id", "timestamp", "alert_type", "source_ip", "destination_ip", "user_id", "asset_id", "severity", "description", "confidence"]
    for field in required_fields:
        if field not in data or data[field] is None:
            raise ValueError(f"Missing required field '{field}' in alert data: {data}")

    return Alert(
        alert_id=str(data["alert_id"]),
        timestamp=str(data["timestamp"]),
        alert_type=str(data["alert_type"]),
        source_ip=str(data["source_ip"]),
        destination_ip=str(data["destination_ip"]),
        user_id=str(data["user_id"]),
        asset_id=str(data["asset_id"]),
        severity=int(data["severity"]),
        description=str(data["description"]),
        confidence=int(data["confidence"]),
        status=str(data.get("status", "open"))
    )

def load_alerts_from_json(file_path: str) -> List[Alert]:
    """Loads and parses alerts from a JSON file."""
    with open(file_path, "r", encoding="utf-8") as f:
        records = json.load(f)
    
    if not isinstance(records, list):
        raise ValueError(f"Expected list of alerts in {file_path}, got {type(records)}")

    alerts = []
    for idx, rec in enumerate(records):
        try:
            alerts.append(parse_alert_dict(rec))
        except Exception as e:
            raise ValueError(f"Error parsing record at index {idx} in {file_path}: {e}")
            
    return alerts

def load_alerts_from_csv(file_path: str) -> List[Alert]:
    """Loads and parses alerts from a CSV file."""
    alerts = []
    with open(file_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row_idx, row in enumerate(reader):
            try:
                alerts.append(parse_alert_dict(row))
            except Exception as e:
                raise ValueError(f"Error parsing CSV row {row_idx + 1} in {file_path}: {e}")
                
    return alerts

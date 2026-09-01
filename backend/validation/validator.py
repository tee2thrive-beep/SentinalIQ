import json
from typing import List, Dict, Any, Tuple, Set
from backend.ingestion.schema import Alert

def validate_alert_batch(
    alerts: List[Alert],
    assets: List[Dict[str, Any]],
    users: List[Dict[str, Any]]
) -> Tuple[List[Alert], List[Dict[str, Any]]]:
    """
    Validates a list of Alert objects against:
    - Uniqueness of alert_id within the batch
    - Foreign key existence in assets list
    - Foreign key existence in users list
    - Internal schema constraints
    
    Returns:
        (valid_alerts, rejected_records_with_reasons)
    """
    valid_asset_ids: Set[str] = {a["asset_id"] for a in assets if "asset_id" in a}
    valid_user_ids: Set[str] = {u["user_id"] for u in users if "user_id" in u}

    seen_alert_ids: Set[str] = set()
    valid_alerts: List[Alert] = []
    rejected_records: List[Dict[str, Any]] = []

    for alert in alerts:
        errors = []

        # Duplicate ID check
        if alert.alert_id in seen_alert_ids:
            errors.append(f"Duplicate alert_id '{alert.alert_id}' found in batch.")
        else:
            seen_alert_ids.add(alert.alert_id)

        # Asset Foreign Key check
        if alert.asset_id not in valid_asset_ids:
            errors.append(f"Referenced asset_id '{alert.asset_id}' does not exist in assets repository.")

        # User Foreign Key check
        if alert.user_id not in valid_user_ids:
            errors.append(f"Referenced user_id '{alert.user_id}' does not exist in users repository.")

        if errors:
            rejected_records.append({
                "alert": alert.to_dict(),
                "errors": errors
            })
        else:
            valid_alerts.append(alert)

    return valid_alerts, rejected_records

def load_reference_data(assets_file: str = "data/assets.json", users_file: str = "data/users.json") -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """Helper utility to load reference assets and users from JSON files."""
    with open(assets_file, "r", encoding="utf-8") as f:
        assets = json.load(f)
    with open(users_file, "r", encoding="utf-8") as f:
        users = json.load(f)
    return assets, users

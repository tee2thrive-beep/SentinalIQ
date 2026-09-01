import os
import sys

_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _root not in sys.path:
    sys.path.insert(0, _root)

import json
import csv
from backend.ingestion.parser import load_alerts_from_json
from backend.validation.validator import validate_alert_batch, load_reference_data
from backend.normalization.normalizer import normalize_alert_batch

def process_normalization(
    alerts_path: str = "data/alerts.json",
    assets_path: str = "data/assets.json",
    users_path: str = "data/users.json",
    output_json_path: str = "data/normalized_alerts.json",
    output_csv_path: str = "data/normalized_alerts.csv"
):
    print("=" * 60)
    print("SENTINEL IQ — STEP 2 NORMALIZATION ENGINE EXECUTION")
    print("=" * 60)

    # 1. Load alerts and reference data
    alerts = load_alerts_from_json(alerts_path)
    assets, users = load_reference_data(assets_path, users_path)
    
    print(f"Loaded {len(alerts)} raw alerts from {alerts_path}")

    # 2. Validate alerts
    valid_alerts, rejected_records = validate_alert_batch(alerts, assets, users)
    
    print(f"Validated alerts: {len(valid_alerts)} valid, {len(rejected_records)} rejected")
    
    if rejected_records:
        print("WARNING: Rejected records found:")
        for rej in rejected_records:
            print(f"  - Alert {rej['alert'].get('alert_id')}: {rej['errors']}")

    # 3. Normalize valid alerts
    normalized_records = normalize_alert_batch(valid_alerts, assets)
    print(f"Normalized {len(normalized_records)} alert records.")

    # 4. Save normalized outputs
    os.makedirs(os.path.dirname(output_json_path), exist_ok=True)
    
    with open(output_json_path, "w", encoding="utf-8") as f:
        json.dump(normalized_records, f, indent=2)
        
    if normalized_records:
        with open(output_csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=normalized_records[0].keys())
            writer.writeheader()
            writer.writerows(normalized_records)

    print(f"Exported normalized alerts to {output_json_path} and {output_csv_path}")
    print("=" * 60)

    return len(alerts), len(valid_alerts), len(rejected_records)

if __name__ == "__main__":
    process_normalization()

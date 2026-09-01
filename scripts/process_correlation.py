import os
import sys

_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _root not in sys.path:
    sys.path.insert(0, _root)

import json
import csv
from backend.correlation.engine import correlate_alert_batch

def process_correlation(
    alerts_path: str = "data/normalized_alerts.json",
    output_json_path: str = "data/correlations.json",
    output_csv_path: str = "data/correlations.csv",
    output_graph_path: str = "data/correlation_graph.json",
    min_threshold: float = 25.0,
    window_seconds: float = 7200.0
):
    print("=" * 60)
    print("SENTINEL IQ — STEP 3 CORRELATION ENGINE EXECUTION")
    print("=" * 60)

    if not os.path.exists(alerts_path):
        raise FileNotFoundError(f"Normalized alerts file not found at {alerts_path}")

    with open(alerts_path, "r", encoding="utf-8") as f:
        alerts = json.load(f)

    print(f"Loaded {len(alerts)} normalized alerts from {alerts_path}")

    # Run correlation engine
    correlations, graph_payload = correlate_alert_batch(
        alerts,
        window_seconds=window_seconds,
        min_threshold=min_threshold
    )

    print(f"Discovered {len(correlations)} meaningful correlations above threshold ({min_threshold})")

    # Export correlations JSON
    os.makedirs(os.path.dirname(output_json_path), exist_ok=True)
    with open(output_json_path, "w", encoding="utf-8") as f:
        json.dump(correlations, f, indent=2)

    # Export correlations CSV
    if correlations:
        csv_records = []
        for c in correlations:
            csv_records.append({
                "alert_a": c["alert_a"],
                "alert_b": c["alert_b"],
                "correlation_score": c["correlation_score"],
                "same_user": c["signals"]["same_user"],
                "same_asset": c["signals"]["same_asset"],
                "same_source_ip": c["signals"]["same_source_ip"],
                "same_destination_ip": c["signals"]["same_destination_ip"],
                "temporal_proximity": c["signals"]["temporal_proximity"],
                "related_alert_types": c["signals"]["related_alert_types"],
                "attack_progression": c["signals"]["attack_progression"],
                "evidence_count": len(c["evidence"]),
                "evidence_summary": " | ".join(c["evidence"])
            })

        with open(output_csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=csv_records[0].keys())
            writer.writeheader()
            writer.writerows(csv_records)

    # Export Correlation Graph Payload
    with open(output_graph_path, "w", encoding="utf-8") as f:
        json.dump(graph_payload, f, indent=2)

    print(f"Exported correlation records to {output_json_path} and {output_csv_path}")
    print(f"Exported correlation graph payload to {output_graph_path}")
    
    if correlations:
        print("\nTop 5 Strongest Correlated Alert Pairs:")
        for top in correlations[:5]:
            print(f"  - {top['alert_a']} <-> {top['alert_b']} (Score: {top['correlation_score']}) | Evidence: {top['evidence']}")

    print("=" * 60)
    return len(alerts), len(correlations)

if __name__ == "__main__":
    process_correlation()

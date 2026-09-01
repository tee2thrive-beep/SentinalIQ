import os
import sys

_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _root not in sys.path:
    sys.path.insert(0, _root)

import json
import csv
from backend.clustering.engine import cluster_correlations_to_incidents

def process_clustering(
    alerts_path: str = "data/normalized_alerts.json",
    correlations_path: str = "data/correlations.json",
    output_json_path: str = "data/incidents.json",
    output_csv_path: str = "data/incidents.csv",
    output_graph_path: str = "data/incident_graph.json",
    clustering_threshold: float = 45.0
):
    print("=" * 60)
    print("SENTINEL IQ — STEP 4 INCIDENT CLUSTERING ENGINE EXECUTION")
    print("=" * 60)

    if not os.path.exists(alerts_path):
        raise FileNotFoundError(f"Normalized alerts file missing at {alerts_path}")
    if not os.path.exists(correlations_path):
        raise FileNotFoundError(f"Correlations file missing at {correlations_path}")

    with open(alerts_path, "r", encoding="utf-8") as f:
        alerts = json.load(f)
    with open(correlations_path, "r", encoding="utf-8") as f:
        correlations = json.load(f)

    print(f"Loaded {len(alerts)} alerts and {len(correlations)} correlation edges.")

    # Execute Clustering Engine
    incidents, incident_graph = cluster_correlations_to_incidents(
        alerts,
        correlations,
        clustering_threshold=clustering_threshold
    )

    print(f"Generated {len(incidents)} incident clusters.")

    # Export Incidents JSON
    os.makedirs(os.path.dirname(output_json_path), exist_ok=True)
    with open(output_json_path, "w", encoding="utf-8") as f:
        json.dump(incidents, f, indent=2)

    # Export Incidents CSV
    if incidents:
        csv_records = []
        for inc in incidents:
            csv_records.append({
                "incident_id": inc["incident_id"],
                "incident_type": inc["incident_type"],
                "alert_count": inc["alert_count"],
                "unique_users": inc["unique_users"],
                "unique_assets": inc["unique_assets"],
                "first_seen": inc["first_seen"],
                "last_seen": inc["last_seen"],
                "duration_seconds": inc["duration_seconds"],
                "maximum_severity": inc["maximum_severity"],
                "average_severity": inc["average_severity"],
                "maximum_confidence": inc["maximum_confidence"],
                "incident_confidence": inc["incident_confidence"],
                "affected_users": inc["affected_users"],
                "normalized_affected_users": inc["normalized_affected_users"],
                "incident_asset_importance": inc["incident_asset_importance"],
                "incident_data_sensitivity": inc["incident_data_sensitivity"],
                "incident_business_impact": inc["incident_business_impact"],
                "cluster_score": inc["cluster_score"],
                "observed_stages": " -> ".join(inc["observed_attack_stages"]),
                "alert_ids": ", ".join(inc["alert_ids"])
            })

        with open(output_csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=csv_records[0].keys())
            writer.writeheader()
            writer.writerows(csv_records)

    # Export Incident Graph Payload
    with open(output_graph_path, "w", encoding="utf-8") as f:
        json.dump(incident_graph, f, indent=2)

    print(f"Exported incidents to {output_json_path} and {output_csv_path}")
    print(f"Exported incident graph payload to {output_graph_path}")

    # Calculate Statistics
    singletons = [inc for inc in incidents if inc["alert_count"] == 1]
    multi_alerts = [inc for inc in incidents if inc["alert_count"] > 1]
    largest = max(incidents, key=lambda x: x["alert_count"]) if incidents else None
    avg_size = round(sum(inc["alert_count"] for inc in incidents) / len(incidents), 2) if incidents else 0

    print("\nSummary Statistics:")
    print(f"  - Total Incident Clusters: {len(incidents)}")
    print(f"  - Multi-Alert Incidents: {len(multi_alerts)}")
    print(f"  - Singleton Incidents: {len(singletons)}")
    print(f"  - Average Alerts per Incident: {avg_size}")
    if largest:
        print(f"  - Largest Incident Cluster: {largest['incident_id']} ({largest['incident_type']}) with {largest['alert_count']} alerts")

    print("=" * 60)
    return len(incidents)

if __name__ == "__main__":
    process_clustering()

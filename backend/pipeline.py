import os
import json

from backend.ingestion.parser import load_alerts_from_json
from backend.validation.validator import validate_alert_batch, load_reference_data
from backend.normalization.normalizer import normalize_alert_batch

from backend.correlation.engine import correlate_alert_batch
from backend.clustering.engine import cluster_correlations_to_incidents
from backend.scoring.engine import score_incident_batch
from backend.priority.queue import build_priority_queue

def run_in_memory_pipeline(data_dir: str = "data"):
    """Runs Steps 1-6 pipeline (normalize -> correlate -> cluster -> score -> queue) in memory & updates JSON files."""
    alerts_path = os.path.join(data_dir, "alerts.json")
    assets_path = os.path.join(data_dir, "assets.json")
    users_path = os.path.join(data_dir, "users.json")

    # Step 2: Normalization
    raw_alerts = load_alerts_from_json(alerts_path)
    ref_assets, ref_users = load_reference_data(assets_path, users_path)
    valid_alerts, _ = validate_alert_batch(raw_alerts, ref_assets, ref_users)
    normalized_alerts = normalize_alert_batch(valid_alerts, ref_assets)

    norm_path = os.path.join(data_dir, "normalized_alerts.json")
    with open(norm_path, "w", encoding="utf-8") as f:
        json.dump(normalized_alerts, f, indent=2)

    # Step 3: Correlation
    corr_records, _ = correlate_alert_batch(normalized_alerts)
    corr_path = os.path.join(data_dir, "correlations.json")
    with open(corr_path, "w", encoding="utf-8") as f:
        json.dump(corr_records, f, indent=2)

    # Step 4: Clustering
    incidents, _ = cluster_correlations_to_incidents(normalized_alerts, corr_records)
    inc_path = os.path.join(data_dir, "incidents.json")
    with open(inc_path, "w", encoding="utf-8") as f:
        json.dump(incidents, f, indent=2)

    # Step 5: Risk Scoring
    scored_incidents = score_incident_batch(incidents)
    scored_path = os.path.join(data_dir, "scored_incidents.json")
    with open(scored_path, "w", encoding="utf-8") as f:
        json.dump(scored_incidents, f, indent=2)

    # Step 6: Priority Queue
    priority_queue, _ = build_priority_queue(scored_incidents)
    queue_path = os.path.join(data_dir, "priority_queue.json")
    with open(queue_path, "w", encoding="utf-8") as f:
        json.dump(priority_queue, f, indent=2)

    return priority_queue

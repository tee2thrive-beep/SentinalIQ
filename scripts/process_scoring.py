import os
import sys

_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _root not in sys.path:
    sys.path.insert(0, _root)

import json
import csv
import statistics
from backend.scoring.engine import score_incident_batch

def process_scoring(
    incidents_path: str = "data/incidents.json",
    output_json_path: str = "data/scored_incidents.json",
    output_csv_path: str = "data/scored_incidents.csv"
):
    print("=" * 60)
    print("SENTINEL IQ — STEP 5 EXPLAINABLE RISK SCORING ENGINE EXECUTION")
    print("=" * 60)

    if not os.path.exists(incidents_path):
        raise FileNotFoundError(f"Incidents file missing at {incidents_path}")

    with open(incidents_path, "r", encoding="utf-8") as f:
        incidents = json.load(f)

    print(f"Loaded {len(incidents)} incident clusters from {incidents_path}")

    # Score incidents
    scored_incidents = score_incident_batch(incidents)

    # Sort scored incidents descending by risk_score
    scored_incidents.sort(key=lambda x: x["risk_score"], reverse=True)

    print(f"Scored {len(scored_incidents)} incidents.")

    # Export JSON
    os.makedirs(os.path.dirname(output_json_path), exist_ok=True)
    with open(output_json_path, "w", encoding="utf-8") as f:
        json.dump(scored_incidents, f, indent=2)

    # Export CSV
    if scored_incidents:
        csv_records = []
        for inc in scored_incidents:
            b = inc["risk_breakdown"]
            csv_records.append({
                "incident_id": inc["incident_id"],
                "incident_type": inc["incident_type"],
                "risk_score": inc["risk_score"],
                "risk_level": inc["risk_level"],
                "dominant_factors": " | ".join(inc["dominant_factors"]),
                "risk_explanation": inc["risk_explanation"],
                "sev_val": b["severity"]["value"],
                "sev_contrib": b["severity"]["contribution"],
                "asset_imp_val": b["asset_importance"]["value"],
                "asset_imp_contrib": b["asset_importance"]["contribution"],
                "aff_users_val": b["affected_users"]["value"],
                "aff_users_contrib": b["affected_users"]["contribution"],
                "data_sens_val": b["data_sensitivity"]["value"],
                "data_sens_contrib": b["data_sensitivity"]["contribution"],
                "attack_conf_val": b["attack_confidence"]["value"],
                "attack_conf_contrib": b["attack_confidence"]["contribution"],
                "biz_impact_val": b["business_impact"]["value"],
                "biz_impact_contrib": b["business_impact"]["contribution"],
                "alert_count": inc["alert_count"],
                "affected_users": inc["affected_users"],
                "cluster_score": inc["cluster_score"]
            })

        with open(output_csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=csv_records[0].keys())
            writer.writeheader()
            writer.writerows(csv_records)

    print(f"Exported scored incidents to {output_json_path} and {output_csv_path}")

    # Distribution Analysis
    scores = [inc["risk_score"] for inc in scored_incidents]
    min_s = min(scores) if scores else 0.0
    max_s = max(scores) if scores else 0.0
    avg_s = round(statistics.mean(scores), 2) if scores else 0.0
    med_s = round(statistics.median(scores), 2) if scores else 0.0

    low_cnt = sum(1 for s in scores if s < 25.0)
    med_cnt = sum(1 for s in scores if 25.0 <= s < 50.0)
    high_cnt = sum(1 for s in scores if 50.0 <= s < 75.0)
    crit_cnt = sum(1 for s in scores if s >= 75.0)

    print("\nScore Distribution Metrics:")
    print(f"  - Min Risk Score: {min_s}")
    print(f"  - Max Risk Score: {max_s}")
    print(f"  - Average Risk Score: {avg_s}")
    print(f"  - Median Risk Score: {med_s}")
    print(f"  - LOW (0-24.99): {low_cnt}")
    print(f"  - MEDIUM (25-49.99): {med_cnt}")
    print(f"  - HIGH (50-74.99): {high_cnt}")
    print(f"  - CRITICAL (75-100): {crit_cnt}")

    print("\nTop 10 Scored Incidents:")
    for top in scored_incidents[:10]:
        print(f"  - {top['incident_id']} ({top['incident_type']}): Risk Score {top['risk_score']} [{top['risk_level']}] | Dominant: {top['dominant_factors']} | Alerts: {top['alert_count']} | Users: {top['affected_users']}")

    print("=" * 60)
    return len(scored_incidents)

if __name__ == "__main__":
    process_scoring()

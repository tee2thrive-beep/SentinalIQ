import os
import json
import csv
from backend.priority.queue import build_priority_queue

def process_priority(
    incidents_path: str = "data/scored_incidents.json",
    output_json_path: str = "data/priority_queue.json",
    output_csv_path: str = "data/priority_queue.csv",
    output_summary_path: str = "data/priority_queue_summary.json"
):
    print("=" * 60)
    print("SENTINEL IQ — STEP 6 PRIORITY QUEUE ENGINE EXECUTION")
    print("=" * 60)

    if not os.path.exists(incidents_path):
        raise FileNotFoundError(f"Scored incidents file missing at {incidents_path}")

    with open(incidents_path, "r", encoding="utf-8") as f:
        scored_incidents = json.load(f)

    print(f"Loaded {len(scored_incidents)} scored incidents from {incidents_path}")

    # Build Priority Queue
    queue_items, summary = build_priority_queue(scored_incidents)

    print(f"Generated priority queue with {len(queue_items)} ranked incidents.")

    # Export JSON Queue
    os.makedirs(os.path.dirname(output_json_path), exist_ok=True)
    with open(output_json_path, "w", encoding="utf-8") as f:
        json.dump(queue_items, f, indent=2)

    # Export CSV Queue
    if queue_items:
        csv_records = []
        for item in queue_items:
            reason_data = item["ranking_reason"]
            comp_next = reason_data.get("compared_with_next") or {}
            csv_records.append({
                "priority_rank": item["priority_rank"],
                "incident_id": item["incident_id"],
                "risk_score": item["risk_score"],
                "risk_level": item["risk_level"],
                "priority_band": item["priority_band"],
                "incident_type": item["incident_type"],
                "alert_count": item["alert_count"],
                "affected_users": item["affected_users"],
                "first_seen": item["first_seen"],
                "tie_group_id": item["tie_group_id"] or "",
                "dominant_factors": " | ".join(item["dominant_factors"]),
                "primary_ranking_reason": reason_data.get("primary"),
                "deciding_factor": comp_next.get("deciding_factor", ""),
                "next_incident_id": comp_next.get("incident_id", ""),
                "score_difference": comp_next.get("score_difference", "")
            })

        with open(output_csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=csv_records[0].keys())
            writer.writeheader()
            writer.writerows(csv_records)

    # Export Summary JSON
    with open(output_summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print(f"Exported priority queue to {output_json_path} and {output_csv_path}")
    print(f"Exported summary payload to {output_summary_path}")

    print("\nPriority Queue Summary Metrics:")
    print(f"  - Total Queue Incidents: {summary['total_incidents']}")
    print(f"  - CRITICAL Band Incidents: {summary['critical_count']}")
    print(f"  - HIGH Band Incidents: {summary['high_count']}")
    print(f"  - MEDIUM Band Incidents: {summary['medium_count']}")
    print(f"  - LOW Band Incidents: {summary['low_count']}")
    print(f"  - Number of Tie Groups Detected: {summary['tie_group_count']}")

    print("\nTop 10 Priority Investigation Queue:")
    print(f"{'Rank':<5} | {'Incident ID':<10} | {'Type':<25} | {'Score':<7} | {'Level':<10} | {'Main Drivers'}")
    print("-" * 80)
    for top in summary["top_10_queue"]:
        drivers = ", ".join(top["dominant_factors"])
        print(f"{top['rank']:<5} | {top['incident_id']:<10} | {top['incident_type']:<25} | {top['risk_score']:<7.2f} | {top['risk_level']:<10} | {drivers}")

    print("=" * 60)
    return len(queue_items)

if __name__ == "__main__":
    process_priority()

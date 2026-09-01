from typing import List, Dict, Any

def build_incident_timeline(alerts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Builds a chronologically sorted event timeline for an incident cluster.
    """
    # Sort alerts chronologically
    sorted_alerts = sorted(alerts, key=lambda x: x.get("timestamp", ""))

    timeline = []
    for alt in sorted_alerts:
        timeline.append({
            "timestamp": alt.get("timestamp"),
            "alert_id": alt.get("alert_id"),
            "alert_type": alt.get("alert_type"),
            "severity": alt.get("severity"),
            "user_id": alt.get("user_id"),
            "asset_id": alt.get("asset_id"),
            "source_ip": alt.get("source_ip"),
            "destination_ip": alt.get("destination_ip"),
            "description": alt.get("description")
        })

    return timeline

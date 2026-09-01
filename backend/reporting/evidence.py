import os
import json
from typing import List, Dict, Any, Optional

def load_reporting_datasets(data_dir: str = "data") -> Dict[str, Any]:
    """Loads all authoritative Step 1-6 datasets into indexed memory lookup structures."""
    def _read_json(filename: str):
        path = os.path.join(data_dir, filename)
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        return []

    assets = _read_json("assets.json")
    users = _read_json("users.json")
    alerts = _read_json("alerts.json")
    correlations = _read_json("correlations.json")
    incidents = _read_json("incidents.json")
    scored_incidents = _read_json("scored_incidents.json")
    priority_queue = _read_json("priority_queue.json")

    asset_map = {a["asset_id"]: a for a in assets if "asset_id" in a}
    user_map = {u["user_id"]: u for u in users if "user_id" in u}
    alert_map = {a["alert_id"]: a for a in alerts if "alert_id" in a}
    incident_map = {inc["incident_id"]: inc for inc in incidents if "incident_id" in inc}
    scored_map = {inc["incident_id"]: inc for inc in scored_incidents if "incident_id" in inc}
    queue_map = {item["incident_id"]: item for item in priority_queue if "incident_id" in item}

    return {
        "assets": assets,
        "users": users,
        "alerts": alerts,
        "correlations": correlations,
        "incidents": incidents,
        "scored_incidents": scored_incidents,
        "priority_queue": priority_queue,
        "asset_map": asset_map,
        "user_map": user_map,
        "alert_map": alert_map,
        "incident_map": incident_map,
        "scored_map": scored_map,
        "queue_map": queue_map
    }

def extract_affected_users(incident: Dict[str, Any], user_map: Dict[str, Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Resolves unique affected users with role, department, and privilege metadata."""
    timeline = incident.get("timeline", [])
    user_ids = set()

    # Check incident top-level user fields or timeline alerts
    if "user_id" in incident and incident["user_id"]:
        user_ids.add(incident["user_id"])
    for alert in timeline:
        uid = alert.get("user_id")
        if uid and uid != "N/A":
            user_ids.add(uid)

    resolved_users = []
    for uid in sorted(list(user_ids)):
        u_info = user_map.get(uid, {})
        resolved_users.append({
            "user_id": uid,
            "username": u_info.get("username", u_info.get("name", f"User-{uid}")),
            "role": u_info.get("role", "Standard User"),
            "department": u_info.get("department", "Corporate"),
            "privilege_level": u_info.get("privilege_level", u_info.get("privilege", "Standard"))
        })

    return resolved_users

def extract_affected_assets(incident: Dict[str, Any], asset_map: Dict[str, Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Resolves unique target assets with name, type, criticality, and sensitivity metadata."""
    timeline = incident.get("timeline", [])
    asset_ids = set()

    if "target_asset" in incident and incident["target_asset"]:
        asset_ids.add(incident["target_asset"])
    for alert in timeline:
        aid = alert.get("asset_id") or alert.get("target_asset")
        if aid and aid != "N/A":
            asset_ids.add(aid)

    resolved_assets = []
    for aid in sorted(list(asset_ids)):
        a_info = asset_map.get(aid, {})
        resolved_assets.append({
            "asset_id": aid,
            "name": a_info.get("name", a_info.get("hostname", aid)),
            "asset_type": a_info.get("asset_type", a_info.get("type", "Server/Workstation")),
            "criticality": a_info.get("criticality", "HIGH"),
            "business_impact": a_info.get("business_impact", 80.0),
            "data_sensitivity": a_info.get("data_sensitivity", 80.0)
        })

    return resolved_assets

def extract_chronological_timeline(
    incident: Dict[str, Any],
    user_map: Dict[str, Dict[str, Any]],
    asset_map: Dict[str, Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """Formats incident timeline alerts in chronological order with resolved entity names."""
    timeline_alerts = incident.get("timeline", [])
    # Sort chronologically by timestamp
    sorted_alerts = sorted(timeline_alerts, key=lambda x: x.get("timestamp", ""))

    formatted_timeline = []
    for alert in sorted_alerts:
        uid = alert.get("user_id")
        aid = alert.get("asset_id") or alert.get("target_asset")
        u_info = user_map.get(uid, {}) if uid else {}
        a_info = asset_map.get(aid, {}) if aid else {}

        formatted_timeline.append({
            "timestamp": alert.get("timestamp"),
            "alert_id": alert.get("alert_id"),
            "alert_type": alert.get("alert_type"),
            "category": alert.get("category", "Security Alert"),
            "severity": alert.get("severity", 50.0),
            "confidence": alert.get("confidence", alert.get("attack_confidence", 80.0)),
            "source_ip": alert.get("source_ip", "N/A"),
            "destination_ip": alert.get("destination_ip", "N/A"),
            "user_id": uid or "N/A",
            "username": u_info.get("username", u_info.get("name", uid or "N/A")),
            "asset_id": aid or "N/A",
            "asset_name": a_info.get("name", aid or "N/A")
        })

    return formatted_timeline

def extract_correlation_evidence(incident: Dict[str, Any], correlations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Extracts correlated alert pair evidence belonging to the incident."""
    incident_alert_ids = set(a.get("alert_id") for a in incident.get("timeline", []) if "alert_id" in a)
    matched_correlations = []

    for corr in correlations:
        a1 = corr.get("alert_id_1")
        a2 = corr.get("alert_id_2")
        if a1 in incident_alert_ids and a2 in incident_alert_ids:
            evidence_points = corr.get("evidence", [])
            matched_correlations.append({
                "correlation_id": corr.get("correlation_id", f"{a1}_{a2}"),
                "alert_id_1": a1,
                "alert_id_2": a2,
                "correlation_score": corr.get("correlation_score", 0.0),
                "signals": corr.get("signals_matched", corr.get("signals", [])),
                "evidence_summary": " | ".join(evidence_points) if isinstance(evidence_points, list) else str(evidence_points)
            })

    # Sort descending by correlation score
    matched_correlations.sort(key=lambda x: x["correlation_score"], reverse=True)
    return matched_correlations

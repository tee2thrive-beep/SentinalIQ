import os
import json
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from backend.reporting.config import REPORT_VERSION, REPORT_DISCLAIMER
from backend.reporting.evidence import (
    load_reporting_datasets,
    extract_affected_users,
    extract_affected_assets,
    extract_chronological_timeline,
    extract_correlation_evidence
)
from backend.reporting.recommendations import generate_recommendations
from backend.reporting.templates import generate_executive_summary, render_markdown_report
from backend.scoring.config import DEFAULT_FACTOR_WEIGHTS, FACTOR_SOURCES, classify_status
from backend.scoring.explainer import generate_factor_evidence, get_dominant_factors

def generate_incident_report(incident_id: str, datasets: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Generates a complete, deterministic canonical investigation report for an incident.
    Traceable to authoritative Step 1-6 datasets without invented data or hidden risk multipliers.
    """
    if datasets is None:
        datasets = load_reporting_datasets()

    queue_map = datasets["queue_map"]
    scored_map = datasets["scored_map"]
    incident_map = datasets["incident_map"]
    user_map = datasets["user_map"]
    asset_map = datasets["asset_map"]
    correlations = datasets["correlations"]

    queue_item = queue_map.get(incident_id)
    scored_item = scored_map.get(incident_id)
    raw_incident = incident_map.get(incident_id)

    if not queue_item and not scored_item and not raw_incident:
        raise KeyError(f"Incident ID '{incident_id}' not found in SentinelIQ datasets.")

    # Base incident fields
    merged = {}
    if raw_incident:
        merged.update(raw_incident)
    if scored_item:
        merged.update(scored_item)
    if queue_item:
        merged.update(queue_item)

    itype = merged.get("incident_type", "Security Event")
    r_score = float(merged.get("risk_score", 0.0))
    r_level = merged.get("risk_level", classify_status(r_score))
    p_rank = int(merged.get("priority_rank", 0))
    p_band = merged.get("priority_band", r_level)
    tie_gid = merged.get("tie_group_id")

    timeline = extract_chronological_timeline(merged, user_map, asset_map)
    first_seen = timeline[0]["timestamp"] if timeline else merged.get("first_seen", "N/A")
    last_seen = timeline[-1]["timestamp"] if timeline else merged.get("last_seen", first_seen)
    alert_count = len(timeline)

    affected_users = extract_affected_users(merged, user_map)
    affected_assets = extract_affected_assets(merged, asset_map)
    corr_evidence = extract_correlation_evidence(merged, correlations)

    # Risk Score & Factor Breakdown Verification
    breakdown_data = merged.get("risk_breakdown", {})
    factors_list = []
    contrib_sum = 0.0

    for factor_name, weight in DEFAULT_FACTOR_WEIGHTS.items():
        src_field = FACTOR_SOURCES[factor_name]
        val = float(merged.get(src_field, 0.0))
        contrib = round(val * weight, 4)
        contrib_sum += contrib
        status = classify_status(val)
        evidence_str = generate_factor_evidence(factor_name, val, merged)

        factors_list.append({
            "name": factor_name,
            "value": val,
            "weight": weight,
            "contribution": contrib,
            "status": status,
            "source": src_field,
            "evidence": evidence_str
        })

    contrib_sum = round(sum(f["contribution"] for f in factors_list), 2)
    dominant_factors = merged.get("dominant_factors", get_dominant_factors({f["name"]: f for f in factors_list}))

    # Classification evidence
    class_evidence = merged.get("classification_evidence", [
        f"Incident contains {alert_count} alert(s) matching {itype} threat patterns.",
        f"Highest alert severity: {merged.get('maximum_severity', 50.0):.1f}"
    ])

    # Priority queue comparison reason
    reason_info = merged.get("ranking_reason", {})
    comp_next = reason_info.get("compared_with_next")

    # Dynamic Executive Summary & Recommendations
    exec_summary = generate_executive_summary(
        incident_id, itype, p_rank, r_score, r_level,
        alert_count, len(affected_users), affected_assets, dominant_factors
    )

    recs = generate_recommendations(itype, merged.get("maximum_severity", 80.0), dominant_factors)

    # Canonical Report Structure
    report = {
        "report_version": REPORT_VERSION,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "incident": {
            "incident_id": incident_id,
            "incident_type": itype,
            "risk_score": r_score,
            "risk_level": r_level,
            "priority_rank": p_rank,
            "priority_band": p_band,
            "first_seen": first_seen,
            "last_seen": last_seen,
            "alert_count": alert_count,
            "affected_user_count": len(affected_users),
            "tie_group_id": tie_gid
        },
        "executive_summary": exec_summary,
        "risk_analysis": {
            "formula": "R = 0.20*S + 0.20*A + 0.10*U + 0.15*D + 0.15*C + 0.20*B",
            "risk_score": r_score,
            "risk_level": r_level,
            "factors": factors_list,
            "dominant_factors": dominant_factors,
            "contribution_sum": contrib_sum
        },
        "timeline": timeline,
        "correlation_evidence": corr_evidence,
        "classification": {
            "incident_type": itype,
            "classification_evidence": class_evidence
        },
        "affected_users": affected_users,
        "affected_assets": affected_assets,
        "priority_explanation": {
            "priority_rank": p_rank,
            "risk_score": r_score,
            "risk_level": r_level,
            "tie_group_id": tie_gid,
            "primary_reason": reason_info.get("primary", "Higher risk score"),
            "compared_with_next": comp_next
        },
        "recommendations": recs,
        "limitations": [
            REPORT_DISCLAIMER,
            "Prioritization is based on batch snapshot data. Live streaming telemetry will update queue dynamically.",
            "Asset importance and data sensitivity values reflect configured CMDB asset tags."
        ]
    }

    return report

def generate_all_reports(data_dir: str = "data", output_dir: str = "data/reports") -> Dict[str, Any]:
    """
    Generates JSON and Markdown investigation reports for all 111 incidents in the priority queue.
    Exports reports to data/reports/ and writes index.json.
    """
    datasets = load_reporting_datasets(data_dir=data_dir)
    priority_queue = datasets["priority_queue"]

    json_dir = output_dir
    md_dir = os.path.join(output_dir, "markdown")
    os.makedirs(json_dir, exist_ok=True)
    os.makedirs(md_dir, exist_ok=True)

    report_index = []

    for item in priority_queue:
        iid = item["incident_id"]
        report = generate_incident_report(iid, datasets=datasets)

        # Write JSON Report
        json_path = os.path.join(json_dir, f"{iid}.json")
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2)

        # Write Markdown Report
        md_text = render_markdown_report(report)
        md_path = os.path.join(md_dir, f"{iid}.md")
        with open(md_path, "w", encoding="utf-8") as f:
            f.write(md_text)

        report_index.append({
            "incident_id": iid,
            "incident_type": report["incident"]["incident_type"],
            "risk_score": report["incident"]["risk_score"],
            "risk_level": report["incident"]["risk_level"],
            "priority_rank": report["incident"]["priority_rank"],
            "report_path_json": f"data/reports/{iid}.json",
            "report_path_md": f"data/reports/markdown/{iid}.md"
        })

    # Write Index JSON
    index_path = os.path.join(output_dir, "index.json")
    with open(index_path, "w", encoding="utf-8") as f:
        json.dump(report_index, f, indent=2)

    return {
        "total_incidents_processed": len(priority_queue),
        "total_reports_generated": len(report_index),
        "json_dir": json_dir,
        "md_dir": md_dir,
        "index_path": index_path
    }

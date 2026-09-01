import math
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any

from backend.api.schemas import HealthResponse, IncidentListResponse, IncidentSummaryItem
from backend.api.app import IncidentDataStore

router = APIRouter()

VALID_RISK_LEVELS = {"LOW", "MEDIUM", "HIGH", "CRITICAL"}

@router.get("/health", response_model=HealthResponse)
def get_health():
    """Health check endpoint."""
    return HealthResponse(status="ok", service="SentinelIQ", version="1.0")

@router.get("/ready")
def get_readiness():
    """Readiness check endpoint verifying data store loading."""
    store = IncidentDataStore.get_instance()
    ready = len(store.priority_queue) > 0 and len(store.reports_cache) > 0
    if not ready:
        raise HTTPException(status_code=503, detail="SentinelIQ engine data store is initializing or incomplete.")
    return {
        "status": "ready",
        "service": "SentinelIQ",
        "incidents_indexed": len(store.priority_queue),
        "reports_cached": len(store.reports_cache)
    }


@router.get("/incidents", response_model=IncidentListResponse)
def list_incidents(
    page: int = Query(1, ge=1, description="Page number starting at 1"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page (max 100)"),
    risk_level: Optional[str] = Query(None, description="Filter by risk level (LOW, MEDIUM, HIGH, CRITICAL)"),
    incident_type: Optional[str] = Query(None, description="Filter by incident type")
):
    """Returns the ordered investigation priority queue with pagination and filtering."""
    if page < 1:
        raise HTTPException(status_code=400, detail="Page number must be >= 1.")
    if page_size < 1 or page_size > 100:
        raise HTTPException(status_code=400, detail="Page size must be between 1 and 100.")

    if risk_level:
        risk_level_upper = risk_level.upper()
        if risk_level_upper not in VALID_RISK_LEVELS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid risk_level '{risk_level}'. Valid options: {sorted(list(VALID_RISK_LEVELS))}"
            )

    store = IncidentDataStore.get_instance()
    queue = store.priority_queue

    # Apply filters preserving Step 6 priority rank order
    filtered = queue
    if risk_level:
        filtered = [item for item in filtered if item["risk_level"] == risk_level.upper()]
    if incident_type:
        filtered = [item for item in filtered if incident_type.lower() in item["incident_type"].lower()]

    total = len(filtered)
    total_pages = math.ceil(total / page_size) if total > 0 else 1

    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    page_items = filtered[start_idx:end_idx]

    summary_items = []
    for item in page_items:
        summary_items.append(IncidentSummaryItem(
            priority_rank=item["priority_rank"],
            incident_id=item["incident_id"],
            risk_score=item["risk_score"],
            risk_level=item["risk_level"],
            priority_band=item["priority_band"],
            incident_type=item["incident_type"],
            first_seen=item.get("first_seen", ""),
            alert_count=item.get("alert_count", 1),
            affected_users=item.get("affected_users", 1),
            dominant_factors=item.get("dominant_factors", []),
            tie_group_id=item.get("tie_group_id")
        ))

    return IncidentListResponse(
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        items=summary_items
    )

@router.get("/incidents/{incident_id}")
def get_incident_report(incident_id: str):
    """Returns the complete canonical investigation report for a specific incident."""
    store = IncidentDataStore.get_instance()
    report = store.reports_cache.get(incident_id)
    if not report:
        raise HTTPException(status_code=404, detail=f"Incident ID '{incident_id}' not found.")
    return report

@router.get("/incidents/{incident_id}/timeline")
def get_incident_timeline(incident_id: str):
    """Returns only the chronological timeline of alerts for a specific incident."""
    store = IncidentDataStore.get_instance()
    report = store.reports_cache.get(incident_id)
    if not report:
        raise HTTPException(status_code=404, detail=f"Incident ID '{incident_id}' not found.")
    return report["timeline"]

@router.get("/incidents/{incident_id}/risk")
def get_incident_risk_analysis(incident_id: str):
    """Returns the risk score breakdown and six-factor analysis for a specific incident."""
    store = IncidentDataStore.get_instance()
    report = store.reports_cache.get(incident_id)
    if not report:
        raise HTTPException(status_code=404, detail=f"Incident ID '{incident_id}' not found.")
    return report["risk_analysis"]

@router.get("/incidents/{incident_id}/correlations")
def get_incident_correlations(incident_id: str):
    """Returns correlation evidence relationships for a specific incident."""
    store = IncidentDataStore.get_instance()
    report = store.reports_cache.get(incident_id)
    if not report:
        raise HTTPException(status_code=404, detail=f"Incident ID '{incident_id}' not found.")
    return report["correlation_evidence"]

@router.get("/incidents/{incident_id}/recommendations")
def get_incident_recommendations(incident_id: str):
    """Returns rule-based investigation & containment recommendations for a specific incident."""
    store = IncidentDataStore.get_instance()
    report = store.reports_cache.get(incident_id)
    if not report:
        raise HTTPException(status_code=404, detail=f"Incident ID '{incident_id}' not found.")
    return report["recommendations"]

@router.get("/simulations/scenarios")
def get_simulation_scenarios():
    """Returns Step 7 predefined simulation scenario comparisons and top movers."""
    import os, json
    path = os.path.join("data", "simulation", "scenario_summary.json")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    raise HTTPException(status_code=404, detail="Simulation scenario summary file not found.")

@router.get("/simulations/sensitivity")
def get_simulation_sensitivity():
    """Returns Step 7 factor sensitivity analysis rankings (+/- 5% perturbations)."""
    import os, json
    path = os.path.join("data", "simulation", "sensitivity_analysis.json")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    raise HTTPException(status_code=404, detail="Simulation sensitivity analysis file not found.")

from backend.api.schemas import CreateAlertRequest, CreateAlertResponse
import os, json, datetime

@router.post("/alerts", response_model=CreateAlertResponse)
def ingest_custom_alert(payload: CreateAlertRequest):
    """Ingests a new custom raw security alert, appends it to data/alerts.json, re-runs normalization, correlation, clustering, risk scoring, and priority queue ranking live in memory."""
    data_dir = "data"
    alerts_file = os.path.join(data_dir, "alerts.json")

    existing_alerts = []
    if os.path.exists(alerts_file):
        with open(alerts_file, "r", encoding="utf-8") as f:
            existing_alerts = json.load(f)

    alert_num = len(existing_alerts) + 1
    new_alert_id = f"ALT-CUSTOM-{alert_num:04d}"
    now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()

    new_alert = {
        "alert_id": new_alert_id,
        "timestamp": now_str,
        "alert_type": payload.alert_type,
        "category": payload.category,
        "severity": float(payload.severity),
        "confidence": float(payload.confidence),
        "source_ip": payload.source_ip or "192.168.1.150",
        "destination_ip": payload.destination_ip or "10.0.4.22",
        "asset_id": payload.asset_id or "AST-0001",
        "user_id": payload.user_id or "USR-0005"
    }

    existing_alerts.append(new_alert)
    with open(alerts_file, "w", encoding="utf-8") as f:
        json.dump(existing_alerts, f, indent=2)

    # Re-run fast Steps 1-6 pipeline scripts to re-compute normalization, correlation, clustering, scoring & priority queue (0.2s)
    from scripts.process_normalization import process_normalization
    from scripts.process_correlation import process_correlation
    from scripts.process_clustering import process_clustering
    from scripts.process_scoring import process_scoring
    from scripts.process_priority import process_priority

    process_normalization()
    process_correlation()
    process_clustering()
    process_scoring()
    process_priority()

    # Reload in-memory DataStore cache
    store = IncidentDataStore.get_instance()
    store.reload()

    # Locate incident containing the new alert
    matched_item = None
    for item in store.priority_queue:
        iid = item["incident_id"]
        # Check incident alerts list directly
        inc_data = store.datasets.get("incident_map", {}).get(iid, {})
        if new_alert_id in inc_data.get("alerts", []) or new_alert_id.lower() in [a.lower() for a in inc_data.get("alerts", [])]:
            matched_item = item
            break

    if not matched_item:
        # Fallback to top priority item if single standalone
        matched_item = store.priority_queue[0]


    return CreateAlertResponse(
        success=True,
        alert_id=new_alert_id,
        incident_id=matched_item["incident_id"],
        priority_rank=matched_item["priority_rank"],
        risk_score=matched_item["risk_score"],
        risk_level=matched_item["risk_level"],
        message=f"Successfully ingested custom alert '{new_alert_id}'. Assigned to Incident '{matched_item['incident_id']}' at Priority Rank #{matched_item['priority_rank']} with Risk Score {matched_item['risk_score']:.2f}."
    )



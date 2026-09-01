import math
from datetime import datetime
from collections import deque
from typing import List, Dict, Any, Set, Tuple, Optional

from backend.correlation.taxonomy import KILL_CHAIN_STAGES, STAGE_NAMES
from backend.clustering.timeline import build_incident_timeline
from backend.clustering.classifier import classify_incident_type

def normalize_affected_users_count(affected_users: int, ref_max: int = 1000) -> float:
    """
    Logarithmic normalization for unique affected users onto 0-100 scale.
    Formula: 100.0 * log10(1 + affected_users) / log10(1 + ref_max)
    Bounded strictly to [0.0, 100.0].
    """
    if affected_users <= 0:
        return 0.0
    val = 100.0 * (math.log10(1.0 + affected_users) / math.log10(1.0 + ref_max))
    return round(float(max(0.0, min(100.0, val))), 2)

def cluster_correlations_to_incidents(
    alerts: List[Dict[str, Any]],
    correlations: List[Dict[str, Any]],
    clustering_threshold: float = 45.0,
    weak_bridge_threshold: float = 55.0,
    ref_max_users: int = 1000
) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Converts pairwise alert correlations into unified Incident Clusters.
    Uses graph connected components with weak bridge pruning, timeline sorting,
    deferred factor resolution, and deterministic metric aggregations.
    """
    alerts_lookup = {alt["alert_id"]: alt for alt in alerts if "alert_id" in alt}
    all_alert_ids = list(alerts_lookup.keys())

    # Build adjacency list with weak bridge pruning
    adj: Dict[str, Set[str]] = {aid: set() for aid in all_alert_ids}
    cluster_edges: Dict[Tuple[str, str], Dict[str, Any]] = {}

    for corr in correlations:
        score = corr.get("correlation_score", 0.0)
        if score < clustering_threshold:
            continue

        a = corr.get("alert_a")
        b = corr.get("alert_b")
        if not a or not b or a not in alerts_lookup or b not in alerts_lookup:
            continue

        # Weak bridge check: prune edge if score < weak_bridge_threshold AND only 1 active signal
        signals = corr.get("signals", {})
        active_signal_count = sum(1 for v in signals.values() if v > 0.0)
        
        if score < weak_bridge_threshold and active_signal_count <= 1:
            # Prune weak bridge edge
            continue

        adj[a].add(b)
        adj[b].add(a)

        edge_key = (min(a, b), max(a, b))
        cluster_edges[edge_key] = corr

    # Graph Connected Components via BFS
    visited: Set[str] = set()
    components: List[List[str]] = []

    for aid in all_alert_ids:
        if aid not in visited:
            component = []
            queue = deque([aid])
            visited.add(aid)

            while queue:
                curr = queue.popleft()
                component.append(curr)
                for neighbor in adj[curr]:
                    if neighbor not in visited:
                        visited.add(neighbor)
                        queue.append(neighbor)

            components.append(component)

    # Sort components chronologically by earliest alert timestamp for deterministic ordering
    def get_comp_first_seen(comp: List[str]) -> str:
        timestamps = [alerts_lookup[aid].get("timestamp", "") for aid in comp if aid in alerts_lookup]
        return min(timestamps) if timestamps else ""

    def get_comp_max_severity(comp: List[str]) -> int:
        sevs = [alerts_lookup[aid].get("severity", 0) for aid in comp if aid in alerts_lookup]
        return max(sevs) if sevs else 0

    components.sort(key=lambda c: (get_comp_first_seen(c), -get_comp_max_severity(c), c[0]))

    # Build Incident Dictionaries
    raw_incidents = []

    for comp in components:
        comp_alerts = [alerts_lookup[aid] for aid in comp if aid in alerts_lookup]
        if not comp_alerts:
            continue

        # Timeline & Timestamps
        timeline = build_incident_timeline(comp_alerts)
        timestamps = [t["timestamp"] for t in timeline if t.get("timestamp")]
        first_seen = timestamps[0] if timestamps else ""
        last_seen = timestamps[-1] if timestamps else ""

        duration_seconds = 0
        if first_seen and last_seen:
            try:
                t1 = datetime.fromisoformat(first_seen)
                t2 = datetime.fromisoformat(last_seen)
                duration_seconds = int(abs((t2 - t1).total_seconds()))
            except Exception:
                duration_seconds = 0

        # Entity Counts
        users = {a.get("user_id") for a in comp_alerts if a.get("user_id")}
        assets = {a.get("asset_id") for a in comp_alerts if a.get("asset_id")}
        src_ips = {a.get("source_ip") for a in comp_alerts if a.get("source_ip")}
        dst_ips = {a.get("destination_ip") for a in comp_alerts if a.get("destination_ip")}

        affected_users = len(users)
        norm_affected_users = normalize_affected_users_count(affected_users, ref_max=ref_max_users)

        # Asset Aggregations (Max of normalized asset factors)
        asset_importances = [a.get("normalized_asset_importance") for a in comp_alerts if a.get("normalized_asset_importance") is not None]
        data_sensitivities = [a.get("normalized_data_sensitivity") for a in comp_alerts if a.get("normalized_data_sensitivity") is not None]
        biz_impacts = [a.get("normalized_business_impact") for a in comp_alerts if a.get("normalized_business_impact") is not None]

        inc_asset_importance = round(max(asset_importances), 2) if asset_importances else 0.0
        inc_data_sensitivity = round(max(data_sensitivities), 2) if data_sensitivities else 0.0
        inc_business_impact = round(max(biz_impacts), 2) if biz_impacts else 0.0

        # Severity Aggregation
        severities = [a.get("severity", 0) for a in comp_alerts]
        max_severity = max(severities) if severities else 0
        avg_severity = round(sum(severities) / len(severities), 2) if severities else 0.0

        # Confidence Aggregation
        confidences = [a.get("confidence", 0) for a in comp_alerts]
        max_confidence = max(confidences) if confidences else 0
        avg_confidence = round(sum(confidences) / len(confidences), 2) if confidences else 0.0
        
        # Corroborated incident confidence (max + 2 points per extra corroborating alert, max 100)
        inc_confidence = min(100.0, max_confidence + 2.0 * (len(comp_alerts) - 1))

        # Attack Progression & Stages
        observed_stages_ordered = []
        seen_stages = set()
        for t_entry in timeline:
            atype = t_entry.get("alert_type")
            stage_idx = KILL_CHAIN_STAGES.get(atype)
            if stage_idx and stage_idx not in seen_stages:
                seen_stages.add(stage_idx)
                observed_stages_ordered.append(STAGE_NAMES[stage_idx])

        earliest_stage = observed_stages_ordered[0] if observed_stages_ordered else None
        latest_stage = observed_stages_ordered[-1] if observed_stages_ordered else None
        attack_progression_observed = len(observed_stages_ordered) >= 2

        # Incident Classification
        inc_type = classify_incident_type(comp_alerts, observed_stages_ordered)

        # Internal Edges & Cluster Score
        internal_edges = []
        comp_set = set(comp)
        for i_idx in range(len(comp)):
            for j_idx in range(i_idx + 1, len(comp)):
                ekey = (min(comp[i_idx], comp[j_idx]), max(comp[i_idx], comp[j_idx]))
                if ekey in cluster_edges:
                    internal_edges.append(cluster_edges[ekey])

        if internal_edges:
            edge_scores = [e["correlation_score"] for e in internal_edges]
            cluster_score = round(sum(edge_scores) / len(edge_scores), 2)
            min_corr = round(min(edge_scores), 2)
            max_corr = round(max(edge_scores), 2)
        else:
            cluster_score = 100.0 # Singletons have 100% self-coherence
            min_corr = 100.0
            max_corr = 100.0

        cluster_quality = {
            "correlation_edges": len(internal_edges),
            "average_correlation": cluster_score,
            "minimum_correlation": min_corr,
            "maximum_correlation": max_corr,
            "independent_users": len(users),
            "independent_assets": len(assets),
            "independent_ips": len(src_ips | dst_ips)
        }

        raw_incidents.append({
            "first_seen": first_seen,
            "max_severity": max_severity,
            "alert_ids": [a["alert_id"] for a in comp_alerts],
            "data": {
                "incident_type": inc_type,
                "alert_ids": [a["alert_id"] for a in comp_alerts],
                "alert_count": len(comp_alerts),
                "unique_users": len(users),
                "unique_assets": len(assets),
                "unique_source_ips": len(src_ips),
                "unique_destination_ips": len(dst_ips),
                "first_seen": first_seen,
                "last_seen": last_seen,
                "duration_seconds": duration_seconds,
                "maximum_severity": max_severity,
                "average_severity": avg_severity,
                "maximum_confidence": max_confidence,
                "average_confidence": avg_confidence,
                "incident_severity": max_severity,
                "incident_confidence": inc_confidence,
                "affected_users": affected_users,
                "normalized_affected_users": norm_affected_users,
                "incident_asset_importance": inc_asset_importance,
                "incident_data_sensitivity": inc_data_sensitivity,
                "incident_business_impact": inc_business_impact,
                "observed_attack_stages": observed_stages_ordered,
                "earliest_attack_stage": earliest_stage,
                "latest_attack_stage": latest_stage,
                "attack_progression_observed": attack_progression_observed,
                "cluster_score": cluster_score,
                "cluster_quality": cluster_quality,
                "correlation_edges": internal_edges,
                "timeline": timeline
            }
        })

    # Sort final incidents deterministically
    raw_incidents.sort(key=lambda x: (x["first_seen"], -x["max_severity"], x["alert_ids"][0]))

    incidents: List[Dict[str, Any]] = []
    for inc_idx, item in enumerate(raw_incidents, start=1):
        inc_data = item["data"]
        inc_data["incident_id"] = f"INC-{inc_idx:04d}"
        
        # Move incident_id to first field position
        ordered_inc = {"incident_id": inc_data["incident_id"]}
        ordered_inc.update(inc_data)
        incidents.append(ordered_inc)

    # Build Incident Graph Payload (Nodes = Incidents, Edges = Shared Entities between Incidents)
    inc_nodes = []
    for inc in incidents:
        inc_nodes.append({
            "id": inc["incident_id"],
            "label": inc["incident_type"],
            "alert_count": inc["alert_count"],
            "maximum_severity": inc["maximum_severity"],
            "cluster_score": inc["cluster_score"],
            "affected_users": inc["affected_users"]
        })

    inc_edges = []
    num_inc = len(incidents)
    for i in range(num_inc):
        for j in range(i + 1, num_inc):
            inc1 = incidents[i]
            inc2 = incidents[j]

            # Check shared users or assets
            u1 = {t["user_id"] for t in inc1["timeline"] if t.get("user_id")}
            u2 = {t["user_id"] for t in inc2["timeline"] if t.get("user_id")}
            shared_users = list(u1 & u2)

            a1 = {t["asset_id"] for t in inc1["timeline"] if t.get("asset_id")}
            a2 = {t["asset_id"] for t in inc2["timeline"] if t.get("asset_id")}
            shared_assets = list(a1 & a2)

            if shared_users or shared_assets:
                inc_edges.append({
                    "source": inc1["incident_id"],
                    "target": inc2["incident_id"],
                    "shared_users": shared_users,
                    "shared_assets": shared_assets
                })

    incident_graph_payload = {
        "nodes": inc_nodes,
        "edges": inc_edges
    }

    return incidents, incident_graph_payload

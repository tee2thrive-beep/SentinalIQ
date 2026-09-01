from datetime import datetime
from typing import List, Dict, Any, Set, Tuple, Optional

from backend.correlation.signals import (
    signal_same_user,
    signal_same_asset,
    signal_same_source_ip,
    signal_same_destination_ip,
    signal_temporal_proximity,
    signal_related_alert_types,
    signal_attack_progression
)

DEFAULT_SIGNAL_WEIGHTS: Dict[str, float] = {
    "same_user": 0.20,
    "same_asset": 0.20,
    "same_source_ip": 0.15,
    "same_destination_ip": 0.10,
    "temporal_proximity": 0.15,
    "related_alert_types": 0.10,
    "attack_progression": 0.10
}

def calculate_pair_correlation(
    alert_a: Dict[str, Any],
    alert_b: Dict[str, Any],
    weights: Optional[Dict[str, float]] = None,
    window_seconds: float = 7200.0
) -> Dict[str, Any]:
    """Calculates weighted correlation score and structured evidence for two alerts."""
    if weights is None:
        weights = DEFAULT_SIGNAL_WEIGHTS

    # Evaluate individual signals
    s_user, ev_user = signal_same_user(alert_a, alert_b)
    s_asset, ev_asset = signal_same_asset(alert_a, alert_b)
    s_src_ip, ev_src_ip = signal_same_source_ip(alert_a, alert_b)
    s_dst_ip, ev_dst_ip = signal_same_destination_ip(alert_a, alert_b)
    s_temp, ev_temp = signal_temporal_proximity(alert_a, alert_b, window_seconds=window_seconds)
    s_rel_types, ev_rel_types = signal_related_alert_types(alert_a, alert_b)
    s_prog, ev_prog = signal_attack_progression(alert_a, alert_b)

    signals_map = {
        "same_user": s_user,
        "same_asset": s_asset,
        "same_source_ip": s_src_ip,
        "same_destination_ip": s_dst_ip,
        "temporal_proximity": s_temp,
        "related_alert_types": s_rel_types,
        "attack_progression": s_prog
    }

    # Calculate weighted correlation score (0 - 100)
    weighted_sum = sum(signals_map[key] * weights.get(key, 0.0) for key in signals_map)
    total_weight = sum(weights.get(key, 0.0) for key in signals_map)
    
    if total_weight > 0:
        normalized_score = (weighted_sum / total_weight) * 100.0
    else:
        normalized_score = 0.0

    correlation_score = round(float(max(0.0, min(100.0, normalized_score))), 2)

    # Collect non-empty evidence statements
    evidence_list = []
    for ev in [ev_user, ev_asset, ev_src_ip, ev_dst_ip, ev_temp, ev_rel_types, ev_prog]:
        if ev:
            evidence_list.append(ev)

    return {
        "alert_a": alert_a.get("alert_id"),
        "alert_b": alert_b.get("alert_id"),
        "correlation_score": correlation_score,
        "signals": signals_map,
        "evidence": evidence_list
    }

def generate_candidate_pairs(
    alerts: List[Dict[str, Any]],
    window_seconds: float = 7200.0
) -> Set[Tuple[int, int]]:
    """
    Generates candidate alert index pairs (i, j) with i < j by bucketing
    alerts on user_id, asset_id, source_ip, destination_ip within time window.
    Prevents O(N^2) exhaustive evaluations.
    """
    n = len(alerts)
    if n < 2:
        return set()

    # Pre-parse timestamps
    parsed_ts = []
    for alt in alerts:
        try:
            parsed_ts.append(datetime.fromisoformat(alt["timestamp"]))
        except Exception:
            parsed_ts.append(None)

    buckets: Dict[str, List[int]] = {}

    def add_to_bucket(key: str, idx: int):
        if key:
            buckets.setdefault(key, []).append(idx)

    for i, alt in enumerate(alerts):
        if alt.get("user_id"):
            add_to_bucket(f"user:{alt['user_id']}", i)
        if alt.get("asset_id"):
            add_to_bucket(f"asset:{alt['asset_id']}", i)
        if alt.get("source_ip"):
            add_to_bucket(f"src:{alt['source_ip']}", i)
        if alt.get("destination_ip"):
            add_to_bucket(f"dst:{alt['destination_ip']}", i)

    candidate_pairs: Set[Tuple[int, int]] = set()

    for key, indices in buckets.items():
        m = len(indices)
        for i_idx in range(m):
            idx_a = indices[i_idx]
            ts_a = parsed_ts[idx_a]
            for j_idx in range(i_idx + 1, m):
                idx_b = indices[j_idx]
                ts_b = parsed_ts[idx_b]

                if ts_a and ts_b:
                    if abs((ts_a - ts_b).total_seconds()) <= window_seconds:
                        pair = (min(idx_a, idx_b), max(idx_a, idx_b))
                        candidate_pairs.add(pair)

    return candidate_pairs

def correlate_alert_batch(
    alerts: List[Dict[str, Any]],
    weights: Optional[Dict[str, float]] = None,
    window_seconds: float = 7200.0,
    min_threshold: float = 25.0
) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Executes correlation engine over a batch of normalized alerts.
    
    Returns:
        (correlations_above_threshold, correlation_graph_payload)
    """
    candidate_pairs = generate_candidate_pairs(alerts, window_seconds=window_seconds)
    correlations: List[Dict[str, Any]] = []

    for idx_a, idx_b in candidate_pairs:
        alt_a = alerts[idx_a]
        alt_b = alerts[idx_b]
        res = calculate_pair_correlation(alt_a, alt_b, weights=weights, window_seconds=window_seconds)
        if res["correlation_score"] >= min_threshold:
            correlations.append(res)

    # Sort correlations descending by score
    correlations.sort(key=lambda x: x["correlation_score"], reverse=True)

    # Build Graph Payload (Nodes & Edges)
    nodes = []
    seen_nodes = set()

    for alt in alerts:
        aid = alt.get("alert_id")
        if aid and aid not in seen_nodes:
            seen_nodes.add(aid)
            nodes.append({
                "id": aid,
                "label": alt.get("alert_type"),
                "timestamp": alt.get("timestamp"),
                "severity": alt.get("severity"),
                "asset_id": alt.get("asset_id"),
                "user_id": alt.get("user_id")
            })

    edges = []
    for corr in correlations:
        edges.append({
            "source": corr["alert_a"],
            "target": corr["alert_b"],
            "weight": corr["correlation_score"],
            "signals": corr["signals"],
            "evidence": corr["evidence"]
        })

    graph_payload = {
        "nodes": nodes,
        "edges": edges
    }

    return correlations, graph_payload

import math
from datetime import datetime
from typing import Dict, Any, Tuple, Optional
from backend.correlation.taxonomy import are_alert_types_related, check_attack_progression

def signal_same_user(alert_a: Dict[str, Any], alert_b: Dict[str, Any]) -> Tuple[float, Optional[str]]:
    """Evaluates if both alerts share the same non-empty user_id."""
    u_a = alert_a.get("user_id")
    u_b = alert_b.get("user_id")
    if u_a and u_b and u_a == u_b:
        return 1.0, f"Same user involved ({u_a})"
    return 0.0, None

def signal_same_asset(alert_a: Dict[str, Any], alert_b: Dict[str, Any]) -> Tuple[float, Optional[str]]:
    """Evaluates if both alerts share the same non-empty asset_id."""
    ast_a = alert_a.get("asset_id")
    ast_b = alert_b.get("asset_id")
    if ast_a and ast_b and ast_a == ast_b:
        return 1.0, f"Same target asset affected ({ast_a})"
    return 0.0, None

def signal_same_source_ip(alert_a: Dict[str, Any], alert_b: Dict[str, Any]) -> Tuple[float, Optional[str]]:
    """Evaluates if both alerts originate from the same non-empty source IP address."""
    ip_a = alert_a.get("source_ip")
    ip_b = alert_b.get("source_ip")
    if ip_a and ip_b and ip_a == ip_b:
        return 1.0, f"Same source IP address ({ip_a})"
    return 0.0, None

def signal_same_destination_ip(alert_a: Dict[str, Any], alert_b: Dict[str, Any]) -> Tuple[float, Optional[str]]:
    """Evaluates if both alerts target the same non-empty destination IP address."""
    ip_a = alert_a.get("destination_ip")
    ip_b = alert_b.get("destination_ip")
    if ip_a and ip_b and ip_a == ip_b:
        return 1.0, f"Same destination IP address ({ip_a})"
    return 0.0, None

def signal_temporal_proximity(
    alert_a: Dict[str, Any],
    alert_b: Dict[str, Any],
    window_seconds: float = 7200.0
) -> Tuple[float, Optional[str]]:
    """
    Evaluates temporal proximity using an exponential decay function:
    score = exp(-delta_t / tau) where tau = window_seconds / 3.0.
    Returns 0.0 if delta_t exceeds window_seconds.
    """
    ts_a_str = alert_a.get("timestamp")
    ts_b_str = alert_b.get("timestamp")
    if not ts_a_str or not ts_b_str:
        return 0.0, None

    try:
        ts_a = datetime.fromisoformat(ts_a_str)
        ts_b = datetime.fromisoformat(ts_b_str)
    except Exception:
        return 0.0, None

    delta_t = abs((ts_a - ts_b).total_seconds())

    if delta_t > window_seconds:
        return 0.0, None

    tau = window_seconds / 3.0
    score = math.exp(-delta_t / tau)
    score = round(float(max(0.0, min(1.0, score))), 4)

    minutes = round(delta_t / 60.0, 1)
    if minutes == 0:
        evidence = "Occurred simultaneously"
    else:
        evidence = f"Occurred within {minutes} minutes of each other"

    return score, evidence

def signal_related_alert_types(alert_a: Dict[str, Any], alert_b: Dict[str, Any]) -> Tuple[float, Optional[str]]:
    """Evaluates if the threat categories of both alerts are taxonomically related."""
    type_a = alert_a.get("alert_type")
    type_b = alert_b.get("alert_type")
    if type_a and type_b and are_alert_types_related(type_a, type_b):
        return 1.0, f"Related alert categories ({type_a} and {type_b})"
    return 0.0, None

def signal_attack_progression(alert_a: Dict[str, Any], alert_b: Dict[str, Any]) -> Tuple[float, Optional[str]]:
    """
    Evaluates directional attack stage progression (Chronological A -> B or B -> A).
    Returns 1.0 if alerts form a plausible kill-chain sequence.
    """
    type_a = alert_a.get("alert_type")
    type_b = alert_b.get("alert_type")
    ts_a_str = alert_a.get("timestamp")
    ts_b_str = alert_b.get("timestamp")

    if not type_a or not type_b or not ts_a_str or not ts_b_str:
        return 0.0, None

    try:
        ts_a = datetime.fromisoformat(ts_a_str)
        ts_b = datetime.fromisoformat(ts_b_str)
    except Exception:
        return 0.0, None

    # Determine chronological order
    if ts_a <= ts_b:
        first, second = type_a, type_b
    else:
        first, second = type_b, type_a

    is_progression, desc = check_attack_progression(first, second)
    if is_progression and desc:
        return 1.0, desc

    return 0.0, None

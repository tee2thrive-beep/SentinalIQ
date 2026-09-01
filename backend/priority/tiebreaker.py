from typing import Dict, Any, Tuple, List, Optional
from backend.priority.config import FLOAT_TOLERANCE, TIE_BREAKER_HIERARCHY

def are_scores_equal(score_a: float, score_b: float, tolerance: float = FLOAT_TOLERANCE) -> bool:
    """Returns True if two scores are equal within floating-point tolerance."""
    return abs(float(score_a) - float(score_b)) <= tolerance

def compare_incidents(
    inc_a: Dict[str, Any],
    inc_b: Dict[str, Any],
    tolerance: float = FLOAT_TOLERANCE
) -> Tuple[int, str, Any, Any]:
    """
    Compares two scored incidents deterministically.
    Returns:
        (cmp_val, deciding_factor_name, val_a, val_b)
        cmp_val = -1 if inc_a ranks before inc_b
        cmp_val =  1 if inc_b ranks before inc_a
        cmp_val =  0 if identical
    """
    s_a = float(inc_a.get("risk_score", 0.0))
    s_b = float(inc_b.get("risk_score", 0.0))

    if not are_scores_equal(s_a, s_b, tolerance=tolerance):
        if s_a > s_b:
            return -1, "risk_score", s_a, s_b
        else:
            return 1, "risk_score", s_a, s_b

    # Primary risk scores are tied within tolerance -> Use 8-Level Tie-Breaker Hierarchy
    for field_name, direction in TIE_BREAKER_HIERARCHY:
        v_a = inc_a.get(field_name)
        v_b = inc_b.get(field_name)

        if v_a is None and v_b is None:
            continue
        if v_a is None:
            return 1, field_name, v_a, v_b
        if v_b is None:
            return -1, field_name, v_a, v_b

        if direction == "DESC":
            if v_a > v_b:
                return -1, field_name, v_a, v_b
            elif v_b > v_a:
                return 1, field_name, v_a, v_b
        elif direction == "ASC":
            if v_a < v_b:
                return -1, field_name, v_a, v_b
            elif v_b < v_a:
                return 1, field_name, v_a, v_b

    return 0, "identical", None, None

def assign_tie_groups(
    incidents: List[Dict[str, Any]],
    tolerance: float = FLOAT_TOLERANCE
) -> Dict[str, Optional[str]]:
    """
    Detects groups of incidents with equal primary risk_score within tolerance.
    Assigns deterministic tie_group_id (TG-0001, TG-0002...) to groups of size > 1.
    """
    tie_mapping: Dict[str, Optional[str]] = {inc["incident_id"]: None for inc in incidents if "incident_id" in inc}
    n = len(incidents)
    if n < 2:
        return tie_mapping

    visited = set()
    group_counter = 1

    for i in range(n):
        inc_i = incidents[i]
        iid_i = inc_i["incident_id"]
        if iid_i in visited:
            continue

        score_i = float(inc_i.get("risk_score", 0.0))
        current_group = [inc_i]

        for j in range(i + 1, n):
            inc_j = incidents[j]
            score_j = float(inc_j.get("risk_score", 0.0))
            if are_scores_equal(score_i, score_j, tolerance=tolerance):
                current_group.append(inc_j)

        if len(current_group) > 1:
            gid = f"TG-{group_counter:04d}"
            group_counter += 1
            for g_item in current_group:
                gid_item = g_item["incident_id"]
                tie_mapping[gid_item] = gid
                visited.add(gid_item)

    return tie_mapping

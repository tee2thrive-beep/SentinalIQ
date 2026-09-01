import functools
import statistics
from typing import List, Dict, Any, Tuple
from backend.priority.config import FLOAT_TOLERANCE, TIE_BREAKER_DISPLAY_NAMES
from backend.priority.tiebreaker import compare_incidents, assign_tie_groups, are_scores_equal

def build_priority_queue(
    scored_incidents: List[Dict[str, Any]],
    tolerance: float = FLOAT_TOLERANCE
) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Ranks scored incidents into a deterministic investigation priority queue.
    Assigns consecutive priority_rank (1..N), detects tie groups, generates adjacent
    comparison reasons, and verifies queue integrity.
    """
    n = len(scored_incidents)
    if n == 0:
        empty_summary = {
            "total_incidents": 0,
            "critical_count": 0,
            "high_count": 0,
            "medium_count": 0,
            "low_count": 0,
            "top_10_queue": [],
            "average_risk_score": 0.0,
            "highest_risk_score": 0.0,
            "lowest_risk_score": 0.0,
            "tie_group_count": 0
        }
        return [], empty_summary

    # Sort using multi-key deterministic comparator
    sorted_incidents = sorted(
        scored_incidents,
        key=functools.cmp_to_key(lambda a, b: compare_incidents(a, b, tolerance=tolerance)[0])
    )

    # Detect tie groups
    tie_groups_map = assign_tie_groups(sorted_incidents, tolerance=tolerance)

    queue_items: List[Dict[str, Any]] = []

    for i in range(n):
        curr = sorted_incidents[i]
        curr_id = curr["incident_id"]
        rank = i + 1
        tie_gid = tie_groups_map.get(curr_id)

        if i < n - 1:
            nxt = sorted_incidents[i + 1]
            cmp_val, dec_factor, val_a, val_b = compare_incidents(curr, nxt, tolerance=tolerance)
            score_diff = round(float(curr["risk_score"]) - float(nxt["risk_score"]), 4)

            if dec_factor == "risk_score":
                ranking_reason = {
                    "primary": "Higher risk score",
                    "compared_with_next": {
                        "incident_id": nxt["incident_id"],
                        "risk_score": nxt["risk_score"],
                        "score_difference": score_diff,
                        "deciding_factor": "risk_score"
                    }
                }
            else:
                tb_display = TIE_BREAKER_DISPLAY_NAMES.get(dec_factor, dec_factor)
                ranking_reason = {
                    "primary": "Risk scores are tied",
                    "tie_breaker": tb_display,
                    "this_value": val_a,
                    "other_value": val_b,
                    "compared_with_next": {
                        "incident_id": nxt["incident_id"],
                        "risk_score": nxt["risk_score"],
                        "score_difference": score_diff,
                        "deciding_factor": dec_factor
                    }
                }
        else:
            ranking_reason = {
                "primary": "Lowest priority item in queue",
                "compared_with_next": None
            }

        queue_item = {
            "priority_rank": rank,
            "incident_id": curr_id,
            "risk_score": curr["risk_score"],
            "risk_level": curr["risk_level"],
            "priority_band": curr["risk_level"],
            "incident_type": curr["incident_type"],
            "first_seen": curr.get("first_seen", ""),
            "alert_count": curr.get("alert_count", 1),
            "affected_users": curr.get("affected_users", 1),
            "dominant_factors": curr.get("dominant_factors", []),
            "tie_group_id": tie_gid,
            "ranking_reason": ranking_reason,
            "risk_explanation": curr.get("risk_explanation"),
            "risk_breakdown": curr.get("risk_breakdown")
        }
        queue_items.append(queue_item)

    # Queue Integrity Validation
    verify_queue_integrity(scored_incidents, queue_items)

    # Build Summary Payload
    scores = [item["risk_score"] for item in queue_items]
    levels = [item["risk_level"] for item in queue_items]
    unique_tgs = {item["tie_group_id"] for item in queue_items if item["tie_group_id"] is not None}

    summary = {
        "total_incidents": n,
        "critical_count": levels.count("CRITICAL"),
        "high_count": levels.count("HIGH"),
        "medium_count": levels.count("MEDIUM"),
        "low_count": levels.count("LOW"),
        "average_risk_score": round(statistics.mean(scores), 2),
        "highest_risk_score": max(scores),
        "lowest_risk_score": min(scores),
        "tie_group_count": len(unique_tgs),
        "top_10_queue": [
            {
                "rank": item["priority_rank"],
                "incident_id": item["incident_id"],
                "incident_type": item["incident_type"],
                "risk_score": item["risk_score"],
                "risk_level": item["risk_level"],
                "dominant_factors": item["dominant_factors"],
                "alert_count": item["alert_count"],
                "affected_users": item["affected_users"],
                "first_seen": item["first_seen"],
                "ranking_reason": item["ranking_reason"]["primary"]
            }
            for item in queue_items[:10]
        ]
    }

    return queue_items, summary

def verify_queue_integrity(
    input_incidents: List[Dict[str, Any]],
    queue_items: List[Dict[str, Any]]
) -> None:
    """Verifies that the generated priority queue adheres to strict integrity assertions."""
    if len(input_incidents) != len(queue_items):
        raise ValueError(f"Queue count mismatch: input {len(input_incidents)} != queue {len(queue_items)}")

    seen_ids = set()
    seen_ranks = set()
    input_scores = {inc["incident_id"]: inc["risk_score"] for inc in input_incidents}

    for idx, item in enumerate(queue_items, start=1):
        iid = item["incident_id"]
        rank = item["priority_rank"]

        if iid in seen_ids:
            raise ValueError(f"Duplicate incident ID '{iid}' found in priority queue!")
        seen_ids.add(iid)

        if rank != idx:
            raise ValueError(f"Non-consecutive priority rank '{rank}' at index {idx}!")
        seen_ranks.add(rank)

        if iid not in input_scores:
            raise ValueError(f"Unknown incident ID '{iid}' in priority queue!")

        if item["risk_score"] != input_scores[iid]:
            raise ValueError(f"Risk score altered for incident '{iid}': {input_scores[iid]} -> {item['risk_score']}")

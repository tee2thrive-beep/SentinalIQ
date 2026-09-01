from typing import List, Dict, Any, Tuple

def compare_simulation_with_baseline(
    baseline_queue: List[Dict[str, Any]],
    simulated_queue: List[Dict[str, Any]]
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Compares a simulated priority queue against the baseline queue.
    Calculates score deltas, rank changes (positive = moved UP), risk-level changes,
    dominant-factor changes, and identifies top 10 upward & downward movers.
    """
    b_map = {item["incident_id"]: item for item in baseline_queue if "incident_id" in item}

    comparison_records: List[Dict[str, Any]] = []

    for s_item in simulated_queue:
        iid = s_item["incident_id"]
        b_item = b_map.get(iid)
        if not b_item:
            continue

        b_rank = b_item["priority_rank"]
        s_rank = s_item["priority_rank"]
        rank_change = b_rank - s_rank # Positive = moved UP, Negative = moved DOWN

        b_score = float(b_item["risk_score"])
        s_score = float(s_item["risk_score"])
        score_delta = round(s_score - b_score, 4)

        b_level = b_item["risk_level"]
        s_level = s_item["risk_level"]
        risk_level_changed = (b_level != s_level)

        b_dom = b_item["dominant_factors"]
        s_dom = s_item["dominant_factors"]
        dom_changed = (b_dom != s_dom)

        record = {
            "incident_id": iid,
            "incident_type": s_item["incident_type"],
            "baseline_rank": b_rank,
            "simulated_rank": s_rank,
            "rank_change": rank_change,
            "baseline_score": b_score,
            "simulated_score": s_score,
            "score_delta": score_delta,
            "baseline_risk_level": b_level,
            "simulated_risk_level": s_level,
            "risk_level_changed": risk_level_changed,
            "baseline_dominant_factors": b_dom,
            "simulated_dominant_factors": s_dom,
            "dominant_factors_changed": dom_changed
        }
        comparison_records.append(record)

    # Top Upward Movers (rank_change > 0)
    upward = [r for r in comparison_records if r["rank_change"] > 0]
    upward.sort(key=lambda x: (-x["rank_change"], -abs(x["score_delta"]), -x["simulated_score"], x["incident_id"]))
    top_upward_movers = upward[:10]

    # Top Downward Movers (rank_change < 0)
    downward = [r for r in comparison_records if r["rank_change"] < 0]
    downward.sort(key=lambda x: (x["rank_change"], -abs(x["score_delta"]), -x["simulated_score"], x["incident_id"]))
    top_downward_movers = downward[:10]

    # Risk level changes & dominant factor changes
    level_changes = [r for r in comparison_records if r["risk_level_changed"]]
    dom_changes = [r for r in comparison_records if r["dominant_factors_changed"]]

    return comparison_records, top_upward_movers, top_downward_movers, level_changes, dom_changes

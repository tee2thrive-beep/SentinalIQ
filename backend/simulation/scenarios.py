import statistics
from typing import List, Dict, Any, Tuple
from backend.scoring.config import DEFAULT_FACTOR_WEIGHTS, FACTOR_ORDER
from backend.scoring.engine import validate_weights
from backend.priority.config import FLOAT_TOLERANCE
from backend.simulation.engine import simulate_scenario
from backend.simulation.comparison import compare_simulation_with_baseline

FACTOR_DISPLAY_NAMES = {
    "severity": "Severity",
    "asset_importance": "Asset Importance",
    "affected_users": "Affected Users",
    "data_sensitivity": "Data Sensitivity",
    "attack_confidence": "Attack Confidence",
    "business_impact": "Business Impact"
}

def perturb_factor_weights(base_weights: Dict[str, float], target_factor: str, delta: float) -> Dict[str, float]:
    """
    Perturbs target_factor weight by delta and redistributes the difference
    proportionally across the remaining 5 factors to maintain sum(weights) == 1.0.
    """
    if target_factor not in base_weights:
        raise ValueError(f"Target factor '{target_factor}' not found in weights.")

    new_weights = dict(base_weights)
    target_orig = base_weights[target_factor]
    new_target_w = round(max(0.0, min(1.0, target_orig + delta)), 6)
    actual_delta = new_target_w - target_orig

    remaining_sum = sum(v for k, v in base_weights.items() if k != target_factor)
    new_weights[target_factor] = new_target_w

    if remaining_sum > 0:
        for k, v in base_weights.items():
            if k != target_factor:
                # Proportional adjustment
                adj = actual_delta * (v / remaining_sum)
                new_weights[k] = round(max(0.0, min(1.0, v - adj)), 6)

    # Adjust rounding floating point error on last element
    tot = sum(new_weights.values())
    if abs(tot - 1.0) > 1e-6:
        other_key = next(k for k in new_weights if k != target_factor)
        new_weights[other_key] = round(new_weights[other_key] + (1.0 - tot), 6)

    validate_weights(new_weights)
    return new_weights

def run_sensitivity_analysis(
    scored_incidents: List[Dict[str, Any]],
    delta: float = 0.05,
    tolerance: float = FLOAT_TOLERANCE
) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
    """
    Executes proportional sensitivity analysis (+5% and -5% perturbations) for all 6 factors.
    Measures rank changes, score deltas, risk-level changes, and ranks factors by influence score.
    """
    # 1. Obtain baseline queue
    _, baseline_queue, _ = simulate_scenario(
        scored_incidents, "baseline", DEFAULT_FACTOR_WEIGHTS, tolerance=tolerance
    )

    sensitivity_results = {}
    ranking_data = []

    for fname in FACTOR_ORDER:
        base_w = DEFAULT_FACTOR_WEIGHTS[fname]
        dname = FACTOR_DISPLAY_NAMES.get(fname, fname)

        # Plus perturbation (+0.05)
        w_plus = perturb_factor_weights(DEFAULT_FACTOR_WEIGHTS, fname, +delta)
        _, queue_plus, _ = simulate_scenario(scored_incidents, f"{fname}_plus", w_plus, tolerance=tolerance)
        comp_plus, _, _, lvl_plus, _ = compare_simulation_with_baseline(baseline_queue, queue_plus)

        avg_abs_rank_plus = round(statistics.mean([abs(r["rank_change"]) for r in comp_plus]), 4) if comp_plus else 0.0
        max_rank_plus = max([abs(r["rank_change"]) for r in comp_plus]) if comp_plus else 0
        moved_plus = sum(1 for r in comp_plus if r["rank_change"] != 0)

        # Minus perturbation (-0.05)
        w_minus = perturb_factor_weights(DEFAULT_FACTOR_WEIGHTS, fname, -delta)
        _, queue_minus, _ = simulate_scenario(scored_incidents, f"{fname}_minus", w_minus, tolerance=tolerance)
        comp_minus, _, _, lvl_minus, _ = compare_simulation_with_baseline(baseline_queue, queue_minus)

        avg_abs_rank_minus = round(statistics.mean([abs(r["rank_change"]) for r in comp_minus]), 4) if comp_minus else 0.0
        max_rank_minus = max([abs(r["rank_change"]) for r in comp_minus]) if comp_minus else 0
        moved_minus = sum(1 for r in comp_minus if r["rank_change"] != 0)

        sensitivity_score = round(avg_abs_rank_plus + avg_abs_rank_minus, 4)

        explanation = (
            f"{dname} has a sensitivity score of {sensitivity_score:.4f}. "
            f"Increasing its weight by {int(delta*100)}% shifts average incident rank by {avg_abs_rank_plus:.2f} positions "
            f"({moved_plus} moved, max shift: {max_rank_plus}), while decreasing it shifts average rank by {avg_abs_rank_minus:.2f} positions "
            f"({moved_minus} moved, max shift: {max_rank_minus})."
        )

        factor_summary = {
            "factor": fname,
            "display_name": dname,
            "baseline_weight": base_w,
            "sensitivity_score": sensitivity_score,
            "plus_perturbation": {
                "weight": w_plus[fname],
                "average_absolute_rank_change": avg_abs_rank_plus,
                "maximum_rank_change": max_rank_plus,
                "incidents_moved": moved_plus,
                "risk_level_changes": len(lvl_plus)
            },
            "minus_perturbation": {
                "weight": w_minus[fname],
                "average_absolute_rank_change": avg_abs_rank_minus,
                "maximum_rank_change": max_rank_minus,
                "incidents_moved": moved_minus,
                "risk_level_changes": len(lvl_minus)
            },
            "explanation": explanation
        }

        sensitivity_results[fname] = factor_summary
        ranking_data.append((fname, sensitivity_score, max(max_rank_plus, max_rank_minus), base_w, FACTOR_ORDER.index(fname), factor_summary))

    # Rank factors by sensitivity_score DESC, then max_rank_change DESC, then baseline_weight DESC, then order index
    ranking_data.sort(key=lambda x: (-x[1], -x[2], -x[3], x[4]))

    factor_sensitivity_ranking = []
    for rank_idx, item in enumerate(ranking_data, start=1):
        summary_item = dict(item[5])
        summary_item["sensitivity_rank"] = rank_idx
        factor_sensitivity_ranking.append(summary_item)

    return sensitivity_results, factor_sensitivity_ranking

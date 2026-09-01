from typing import List, Dict, Any, Tuple, Optional
from backend.scoring.engine import validate_weights, score_incident_batch
from backend.priority.config import FLOAT_TOLERANCE
from backend.priority.queue import build_priority_queue

def simulate_scenario(
    incidents: List[Dict[str, Any]],
    scenario_name: str,
    weights: Dict[str, float],
    tolerance: float = FLOAT_TOLERANCE
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], Dict[str, Any]]:
    """
    Simulates risk scores and regenerates priority queue for a specific weight scenario.
    Does NOT modify the underlying incident factor values or original baseline files.
    """
    validate_weights(weights)

    # Calculate simulated risk scores and breakdowns
    simulated_scored_incidents = score_incident_batch(incidents, weights=weights)

    # Regenerate simulated priority queue using Step 6 deterministic tie-breaker
    simulated_priority_queue, summary = build_priority_queue(
        simulated_scored_incidents,
        tolerance=tolerance
    )

    # Baseline Equivalence Verification
    if scenario_name == "baseline":
        for i, item in enumerate(simulated_priority_queue):
            orig_score = float(incidents[i].get("risk_score", item["risk_score"]))
            sim_score = float(item["risk_score"])
            if abs(sim_score - orig_score) > 1e-6:
                raise ValueError(
                    f"Baseline Equivalence Failure for {item['incident_id']}: "
                    f"simulated baseline score {sim_score} != Step 5 score {orig_score}"
                )

    return simulated_scored_incidents, simulated_priority_queue, summary

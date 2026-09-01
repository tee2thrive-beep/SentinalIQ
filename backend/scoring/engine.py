from typing import List, Dict, Any, Optional

from backend.scoring.config import (
    DEFAULT_FACTOR_WEIGHTS,
    FACTOR_SOURCES,
    classify_status
)
from backend.scoring.explainer import (
    generate_factor_evidence,
    get_dominant_factors,
    generate_human_explanation
)

def validate_weights(weights: Dict[str, float]) -> None:
    """
    Validates scoring factor weights.
    Requirements:
    - Exactly 6 factors present
    - Every weight between 0.0 and 1.0
    - Sum of weights equals 1.0 within 1e-6 tolerance
    """
    required_factors = set(FACTOR_SOURCES.keys())
    provided_factors = set(weights.keys())

    if required_factors != provided_factors:
        missing = required_factors - provided_factors
        extra = provided_factors - required_factors
        raise ValueError(f"Invalid factor weights composition. Missing: {missing}, Extra: {extra}")

    total_weight = 0.0
    for factor, weight in weights.items():
        if not isinstance(weight, (int, float)):
            raise ValueError(f"Weight for '{factor}' must be numeric, got {type(weight)}")
        if not (0.0 <= weight <= 1.0):
            raise ValueError(f"Weight for '{factor}' out of [0.0, 1.0] bounds: {weight}")
        total_weight += weight

    if abs(total_weight - 1.0) > 1e-5:
        raise ValueError(f"Sum of factor weights must equal 1.0, got {total_weight:.6f}")

def score_incident(
    incident: Dict[str, Any],
    weights: Optional[Dict[str, float]] = None
) -> Dict[str, Any]:
    """
    Calculates transparent 6-factor risk score, factor contributions, breakdown,
    dominant factors, and human-readable explanation for an incident.
    """
    if weights is None:
        weights = DEFAULT_FACTOR_WEIGHTS
        
    validate_weights(weights)

    risk_breakdown: Dict[str, Dict[str, Any]] = {}
    total_contribution = 0.0

    for factor_name, source_field in FACTOR_SOURCES.items():
        raw_val = incident.get(source_field, 0.0)
        if raw_val is None:
            raw_val = 0.0
            
        val = round(float(max(0.0, min(100.0, raw_val))), 2)
        weight = weights[factor_name]
        contribution = val * weight
        total_contribution += contribution
        status = classify_status(val)
        evidence = generate_factor_evidence(factor_name, val, incident)

        risk_breakdown[factor_name] = {
            "value": val,
            "weight": weight,
            "contribution": round(contribution, 4),
            "status": status,
            "source": source_field,
            "evidence": evidence
        }

    # Internal precision score bounded [0.0, 100.0]
    raw_risk_score = max(0.0, min(100.0, total_contribution))
    risk_score = round(raw_risk_score, 2)

    # Score integrity check: sum of contributions equals risk score
    sum_contribs = sum(b["contribution"] for b in risk_breakdown.values())
    if abs(sum_contribs - raw_risk_score) > 1e-3:
        raise ValueError(f"Score integrity failure: sum of contributions ({sum_contribs:.6f}) != risk_score ({raw_risk_score:.6f})")

    risk_level = classify_status(risk_score)
    dominant_factors = get_dominant_factors(risk_breakdown)
    risk_explanation = generate_human_explanation(risk_score, risk_level, dominant_factors, risk_breakdown)

    # Preserve all existing incident fields and append scoring results
    scored_inc = dict(incident)
    scored_inc["risk_score"] = risk_score
    scored_inc["risk_level"] = risk_level
    scored_inc["dominant_factors"] = dominant_factors
    scored_inc["risk_explanation"] = risk_explanation
    scored_inc["risk_breakdown"] = risk_breakdown

    return scored_inc

def score_incident_batch(
    incidents: List[Dict[str, Any]],
    weights: Optional[Dict[str, float]] = None
) -> List[Dict[str, Any]]:
    """Scores a batch of incident clusters using the six-factor risk engine."""
    if weights is None:
        weights = DEFAULT_FACTOR_WEIGHTS
        
    validate_weights(weights)
    return [score_incident(inc, weights=weights) for inc in incidents]

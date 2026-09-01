from typing import Dict

# Default Configurable Six-Factor Weights (Sum = 1.0)
DEFAULT_FACTOR_WEIGHTS: Dict[str, float] = {
    "severity": 0.20,
    "asset_importance": 0.20,
    "affected_users": 0.10,
    "data_sensitivity": 0.15,
    "attack_confidence": 0.15,
    "business_impact": 0.20
}

# Incident Feature Source Field Mappings
FACTOR_SOURCES: Dict[str, str] = {
    "severity": "maximum_severity",
    "asset_importance": "incident_asset_importance",
    "affected_users": "normalized_affected_users",
    "data_sensitivity": "incident_data_sensitivity",
    "attack_confidence": "incident_confidence",
    "business_impact": "incident_business_impact"
}

# Fixed Tie-Breaking Order for Dominant Factor Ranking
FACTOR_ORDER: list[str] = [
    "severity",
    "business_impact",
    "asset_importance",
    "data_sensitivity",
    "attack_confidence",
    "affected_users"
]

def classify_status(score: float) -> str:
    """Classifies a factor value or overall risk score into a status tier."""
    val = round(float(score), 2)
    if val < 25.0:
        return "LOW"
    elif val < 50.0:
        return "MEDIUM"
    elif val < 75.0:
        return "HIGH"
    else:
        return "CRITICAL"

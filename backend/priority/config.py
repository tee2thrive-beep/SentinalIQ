from typing import List, Tuple

# Floating-Point Score Equality Tolerance
FLOAT_TOLERANCE: float = 1e-6

# Deterministic Tie-Breaker Hierarchy (Field Name, Sort Direction)
TIE_BREAKER_HIERARCHY: List[Tuple[str, str]] = [
    ("maximum_severity", "DESC"),
    ("incident_asset_importance", "DESC"),
    ("incident_business_impact", "DESC"),
    ("incident_data_sensitivity", "DESC"),
    ("incident_confidence", "DESC"),
    ("normalized_affected_users", "DESC"),
    ("first_seen", "ASC"),
    ("incident_id", "ASC")
]

TIE_BREAKER_DISPLAY_NAMES = {
    "maximum_severity": "Higher maximum severity",
    "incident_asset_importance": "Higher target asset importance",
    "incident_business_impact": "Higher potential business impact",
    "incident_data_sensitivity": "Higher asset data sensitivity",
    "incident_confidence": "Higher attack confidence",
    "normalized_affected_users": "Higher normalized affected users",
    "first_seen": "Earlier first seen timestamp",
    "incident_id": "Lower incident ID lexicographically"
}

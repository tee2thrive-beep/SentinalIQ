from typing import Dict, Any, List
from backend.scoring.config import FACTOR_ORDER, classify_status

FACTOR_DISPLAY_NAMES = {
    "severity": "Severity",
    "asset_importance": "Asset Importance",
    "affected_users": "Affected Users",
    "data_sensitivity": "Data Sensitivity",
    "attack_confidence": "Attack Confidence",
    "business_impact": "Business Impact"
}

def generate_factor_evidence(factor_name: str, value: float, incident: Dict[str, Any]) -> str:
    """Generates a data-backed evidence statement for a specific scoring factor."""
    if factor_name == "severity":
        avg_sev = incident.get("average_severity", value)
        return f"Maximum alert severity is {value} (average alert severity: {avg_sev})."
    elif factor_name == "asset_importance":
        return f"Target asset normalized importance rating is {value}."
    elif factor_name == "affected_users":
        raw_users = incident.get("affected_users", 0)
        return f"{raw_users} unique user(s) affected, logarithmically normalized to {value}."
    elif factor_name == "data_sensitivity":
        return f"Target asset data sensitivity rating is {value}."
    elif factor_name == "attack_confidence":
        max_conf = incident.get("maximum_confidence", value)
        return f"Corroborated incident attack confidence is {value} (max alert confidence: {max_conf})."
    elif factor_name == "business_impact":
        return f"Potential business impact rating is {value}."
    return f"Factor {factor_name} score is {value}."

def get_dominant_factors(factor_breakdown: Dict[str, Any]) -> List[str]:
    """
    Selects the top 3 dominant risk factors sorted by contribution descending.
    Uses deterministic tie-breaking:
    1. Higher contribution first
    2. Higher raw factor value second
    3. Fixed FACTOR_ORDER preference third
    """
    factors_info = []
    for fname, data in factor_breakdown.items():
        contrib = data["contribution"]
        val = data["value"]
        order_idx = FACTOR_ORDER.index(fname) if fname in FACTOR_ORDER else 99
        factors_info.append((fname, contrib, val, order_idx))

    # Sort: -contrib, -val, order_idx
    factors_info.sort(key=lambda x: (-x[1], -x[2], x[3]))
    return [x[0] for x in factors_info[:3]]

def generate_human_explanation(
    risk_score: float,
    risk_level: str,
    dominant_factors: List[str],
    factor_breakdown: Dict[str, Any]
) -> str:
    """Dynamically generates a human-readable natural language risk explanation."""
    top_drivers = []
    for df in dominant_factors:
        fdata = factor_breakdown.get(df, {})
        dname = FACTOR_DISPLAY_NAMES.get(df, df)
        contrib = fdata.get("contribution", 0.0)
        status = fdata.get("status", "UNKNOWN")
        top_drivers.append(f"{dname} ({contrib:.2f} pts, {status})")

    drivers_str = ", ".join(top_drivers)
    return (
        f"{risk_level} risk level ({risk_score:.2f}/100). "
        f"Primary risk drivers are {drivers_str}."
    )

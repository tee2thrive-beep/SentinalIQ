import math
from typing import Dict, Any, List, Optional
from backend.ingestion.schema import Alert

def normalize_severity(severity: int) -> float:
    """Normalizes raw severity to 0-100 scale (preserved directly)."""
    return round(float(max(0, min(100, severity))), 2)

def normalize_confidence(confidence: int) -> float:
    """Normalizes raw confidence to 0-100 scale (preserved directly)."""
    return round(float(max(0, min(100, confidence))), 2)

def normalize_affected_users_count(user_count: int, ref_max: int = 1000) -> float:
    """
    Logarithmic normalization for user impact count onto 0-100 scale.
    Formula: 100.0 * log(1 + user_count) / log(1 + ref_max)
    Bounded strictly to [0.0, 100.0].
    
    Note: Alert-level alerts reference single users; aggregated multi-user
    normalization is performed after incident clustering.
    """
    if user_count <= 0:
        return 0.0
    val = 100.0 * (math.log(1.0 + user_count) / math.log(1.0 + ref_max))
    return round(float(max(0.0, min(100.0, val))), 2)

def derive_asset_importance(asset_meta: Optional[Dict[str, Any]]) -> Optional[float]:
    """
    Derives alert-level normalized asset importance from asset metadata.
    Formula: 0.6 * criticality + 0.4 * business_value
    """
    if not asset_meta:
        return None
    crit = asset_meta.get("criticality", 0)
    biz = asset_meta.get("business_value", 0)
    score = (0.6 * crit) + (0.4 * biz)
    return round(float(max(0.0, min(100.0, score))), 2)

def derive_data_sensitivity(asset_meta: Optional[Dict[str, Any]]) -> Optional[float]:
    """
    Derives alert-level normalized data sensitivity from asset metadata.
    Formula: 1.0 * data_sensitivity
    """
    if not asset_meta:
        return None
    sens = asset_meta.get("data_sensitivity", 0)
    return round(float(max(0.0, min(100.0, sens))), 2)

def derive_business_impact(asset_meta: Optional[Dict[str, Any]]) -> Optional[float]:
    """
    Derives alert-level normalized business impact from asset metadata.
    Formula: 0.5 * criticality + 0.3 * business_value + 0.2 * data_sensitivity
    """
    if not asset_meta:
        return None
    crit = asset_meta.get("criticality", 0)
    biz = asset_meta.get("business_value", 0)
    sens = asset_meta.get("data_sensitivity", 0)
    score = (0.5 * crit) + (0.3 * biz) + (0.2 * sens)
    return round(float(max(0.0, min(100.0, score))), 2)

def normalize_alert(alert: Alert, assets_lookup: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
    """
    Normalizes an Alert object using reference asset metadata.
    Preserves all original alert fields and adds normalized fields.
    """
    asset_meta = assets_lookup.get(alert.asset_id)
    record = alert.to_dict()

    record["normalized_severity"] = normalize_severity(alert.severity)
    record["normalized_confidence"] = normalize_confidence(alert.confidence)
    record["normalized_asset_importance"] = derive_asset_importance(asset_meta)
    record["normalized_data_sensitivity"] = derive_data_sensitivity(asset_meta)
    record["normalized_business_impact"] = derive_business_impact(asset_meta)

    return record

def normalize_alert_batch(alerts: List[Alert], assets: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Normalizes a batch of Alert objects into dictionaries with normalized features."""
    assets_lookup = {a["asset_id"]: a for a in assets if "asset_id" in a}
    return [normalize_alert(alt, assets_lookup) for alt in alerts]

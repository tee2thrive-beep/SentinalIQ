from typing import Dict, Any
from backend.scoring.config import DEFAULT_FACTOR_WEIGHTS

PREDEFINED_SCENARIOS: Dict[str, Dict[str, Any]] = {
    "baseline": {
        "name": "baseline",
        "title": "Baseline (Standard Balanced Model)",
        "weights": dict(DEFAULT_FACTOR_WEIGHTS),
        "purpose": "Default balanced multi-attribute reference configuration."
    },
    "user_impact_focus": {
        "name": "user_impact_focus",
        "title": "User Impact Focus",
        "weights": {
            "severity": 0.15,
            "asset_importance": 0.15,
            "affected_users": 0.25,
            "data_sensitivity": 0.15,
            "attack_confidence": 0.15,
            "business_impact": 0.15
        },
        "purpose": "Prioritizes incidents affecting larger numbers of users."
    },
    "data_protection_focus": {
        "name": "data_protection_focus",
        "title": "Data Protection Focus",
        "weights": {
            "severity": 0.15,
            "asset_importance": 0.15,
            "affected_users": 0.10,
            "data_sensitivity": 0.30,
            "attack_confidence": 0.15,
            "business_impact": 0.15
        },
        "purpose": "Prioritizes incidents targeting highly sensitive PII / confidential data."
    },
    "business_continuity_focus": {
        "name": "business_continuity_focus",
        "title": "Business Continuity Focus",
        "weights": {
            "severity": 0.15,
            "asset_importance": 0.20,
            "affected_users": 0.10,
            "data_sensitivity": 0.10,
            "attack_confidence": 0.15,
            "business_impact": 0.30
        },
        "purpose": "Prioritizes incidents with potential for severe operational downtime."
    },
    "high_confidence_focus": {
        "name": "high_confidence_focus",
        "title": "High Attack Confidence Focus",
        "weights": {
            "severity": 0.15,
            "asset_importance": 0.15,
            "affected_users": 0.10,
            "data_sensitivity": 0.15,
            "attack_confidence": 0.30,
            "business_impact": 0.15
        },
        "purpose": "Prioritizes threats with highest corroborated detection certainty."
    }
}

SENSITIVITY_PERTURBATION_DELTA: float = 0.05

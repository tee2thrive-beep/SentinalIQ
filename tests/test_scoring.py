import os
import json
import unittest

from backend.scoring.config import DEFAULT_FACTOR_WEIGHTS, classify_status
from backend.scoring.engine import score_incident, score_incident_batch, validate_weights
from backend.scoring.explainer import get_dominant_factors, generate_human_explanation

class TestStep5Scoring(unittest.TestCase):

    def setUp(self):
        self.sample_incident = {
            "incident_id": "INC-0001",
            "incident_type": "Data Exfiltration",
            "alert_count": 7,
            "maximum_severity": 98.0,
            "average_severity": 85.0,
            "incident_asset_importance": 94.0,
            "normalized_affected_users": 10.03,
            "affected_users": 1,
            "incident_data_sensitivity": 100.0,
            "incident_confidence": 93.0,
            "maximum_confidence": 95.0,
            "average_confidence": 90.0,
            "incident_business_impact": 96.0,
            "cluster_score": 88.5,
            "timeline": []
        }

    # 1. Six factors are present in breakdown
    def test_six_factors_present(self):
        scored = score_incident(self.sample_incident)
        self.assertIn("risk_breakdown", scored)
        breakdown = scored["risk_breakdown"]
        expected_factors = {"severity", "asset_importance", "affected_users", "data_sensitivity", "attack_confidence", "business_impact"}
        self.assertEqual(set(breakdown.keys()), expected_factors)

    # 2. Correct factor source mapping
    def test_factor_source_mapping(self):
        scored = score_incident(self.sample_incident)
        b = scored["risk_breakdown"]
        self.assertEqual(b["severity"]["value"], 98.0)
        self.assertEqual(b["asset_importance"]["value"], 94.0)
        self.assertEqual(b["affected_users"]["value"], 10.03)
        self.assertEqual(b["data_sensitivity"]["value"], 100.0)
        self.assertEqual(b["attack_confidence"]["value"], 93.0)
        self.assertEqual(b["business_impact"]["value"], 96.0)

    # 3. Correct default weights
    def test_default_weights(self):
        self.assertEqual(DEFAULT_FACTOR_WEIGHTS["severity"], 0.20)
        self.assertEqual(DEFAULT_FACTOR_WEIGHTS["asset_importance"], 0.20)
        self.assertEqual(DEFAULT_FACTOR_WEIGHTS["affected_users"], 0.10)
        self.assertEqual(DEFAULT_FACTOR_WEIGHTS["data_sensitivity"], 0.15)
        self.assertEqual(DEFAULT_FACTOR_WEIGHTS["attack_confidence"], 0.15)
        self.assertEqual(DEFAULT_FACTOR_WEIGHTS["business_impact"], 0.20)

    # 4. Weight sum validation
    def test_weight_sum_validation(self):
        validate_weights(DEFAULT_FACTOR_WEIGHTS) # Should pass

    # 5. Invalid weights
    def test_invalid_weights(self):
        bad_weights = dict(DEFAULT_FACTOR_WEIGHTS)
        bad_weights["severity"] = 0.50 # Sum > 1.0
        with self.assertRaises(ValueError):
            validate_weights(bad_weights)

        negative_weights = dict(DEFAULT_FACTOR_WEIGHTS)
        negative_weights["severity"] = -0.10
        negative_weights["asset_importance"] = 0.50
        with self.assertRaises(ValueError):
            validate_weights(negative_weights)

    # 6. Risk score calculation accuracy
    def test_risk_score_calculation(self):
        # 98*0.2 + 94*0.2 + 10.03*0.1 + 100*0.15 + 93*0.15 + 96*0.2
        # = 19.60 + 18.80 + 1.003 + 15.00 + 13.95 + 19.20 = 87.553 -> 87.55
        scored = score_incident(self.sample_incident)
        self.assertAlmostEqual(scored["risk_score"], 87.55, delta=0.01)

    # 7. Risk score remains 0-100
    def test_risk_score_bounds(self):
        scored = score_incident(self.sample_incident)
        self.assertTrue(0.0 <= scored["risk_score"] <= 100.0)

    # 8. Contribution calculation accuracy
    def test_contribution_calculation(self):
        scored = score_incident(self.sample_incident)
        b = scored["risk_breakdown"]
        self.assertAlmostEqual(b["severity"]["contribution"], 19.60, delta=0.01)
        self.assertAlmostEqual(b["business_impact"]["contribution"], 19.20, delta=0.01)

    # 9. Contribution sum equals risk score
    def test_contribution_sum_equals_risk_score(self):
        scored = score_incident(self.sample_incident)
        b = scored["risk_breakdown"]
        sum_contribs = sum(item["contribution"] for item in b.values())
        self.assertAlmostEqual(sum_contribs, scored["risk_score"], delta=0.01)

    # 10. Risk level classification
    def test_risk_level_classification(self):
        self.assertEqual(classify_status(10.0), "LOW")
        self.assertEqual(classify_status(35.0), "MEDIUM")
        self.assertEqual(classify_status(65.0), "HIGH")
        self.assertEqual(classify_status(85.0), "CRITICAL")

    # 11. Factor status classification
    def test_factor_status_classification(self):
        scored = score_incident(self.sample_incident)
        b = scored["risk_breakdown"]
        self.assertEqual(b["severity"]["status"], "CRITICAL")
        self.assertEqual(b["affected_users"]["status"], "LOW")

    # 12. Dominant factor ordering
    def test_dominant_factor_ordering(self):
        scored = score_incident(self.sample_incident)
        dom = scored["dominant_factors"]
        self.assertEqual(len(dom), 3)
        self.assertEqual(dom, ["severity", "business_impact", "asset_importance"])

    # 13. Deterministic tie-breaking
    def test_deterministic_tie_breaking(self):
        tie_incident = {
            "maximum_severity": 80.0,
            "incident_business_impact": 80.0, # Equal contrib (16.0)
            "incident_asset_importance": 50.0,
            "normalized_affected_users": 50.0,
            "incident_data_sensitivity": 50.0,
            "incident_confidence": 50.0
        }
        scored = score_incident(tie_incident)
        dom = scored["dominant_factors"]
        # severity comes before business_impact in FACTOR_ORDER tie-breaking
        self.assertEqual(dom[0], "severity")
        self.assertEqual(dom[1], "business_impact")

    # 14. Explanation matches factor values
    def test_explanation_matches_values(self):
        scored = score_incident(self.sample_incident)
        expl = scored["risk_explanation"]
        self.assertIn("CRITICAL", expl)
        self.assertIn("87.55", expl)
        self.assertIn("Severity", expl)

    # 15. Explanation contains actual dominant factors
    def test_explanation_contains_dominant_factors(self):
        scored = score_incident(self.sample_incident)
        expl = scored["risk_explanation"]
        for df in scored["dominant_factors"]:
            self.assertIn(df.replace("_", " ").title(), expl)

    # 16. Zero-value factors
    def test_zero_value_factors(self):
        zero_inc = {
            "maximum_severity": 0.0,
            "incident_asset_importance": 0.0,
            "normalized_affected_users": 0.0,
            "incident_data_sensitivity": 0.0,
            "incident_confidence": 0.0,
            "incident_business_impact": 0.0
        }
        scored = score_incident(zero_inc)
        self.assertEqual(scored["risk_score"], 0.0)
        self.assertEqual(scored["risk_level"], "LOW")

    # 17. Maximum-value factors
    def test_maximum_value_factors(self):
        max_inc = {
            "maximum_severity": 100.0,
            "incident_asset_importance": 100.0,
            "normalized_affected_users": 100.0,
            "incident_data_sensitivity": 100.0,
            "incident_confidence": 100.0,
            "incident_business_impact": 100.0
        }
        scored = score_incident(max_inc)
        self.assertEqual(scored["risk_score"], 100.0)
        self.assertEqual(scored["risk_level"], "CRITICAL")

    # 18. Deterministic results
    def test_deterministic_scoring(self):
        run1 = score_incident(self.sample_incident)
        run2 = score_incident(self.sample_incident)
        self.assertEqual(run1, run2)

    # 19. Missing factor handling
    def test_missing_factor_handling(self):
        sparse_inc = {"maximum_severity": 50.0} # other 5 missing
        scored = score_incident(sparse_inc)
        self.assertEqual(scored["risk_score"], 10.0) # 50 * 0.20 = 10.0
        self.assertEqual(scored["risk_level"], "LOW")

    # 20. Batch scoring preserves input incidents
    def test_batch_scoring(self):
        batch = [self.sample_incident]
        scored_batch = score_incident_batch(batch)
        self.assertEqual(len(scored_batch), 1)
        self.assertEqual(scored_batch[0]["incident_id"], "INC-0001")

if __name__ == "__main__":
    unittest.main()

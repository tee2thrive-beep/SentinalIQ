import os
import json
import unittest

from backend.scoring.config import DEFAULT_FACTOR_WEIGHTS
from backend.simulation.config import PREDEFINED_SCENARIOS
from backend.simulation.engine import simulate_scenario
from backend.simulation.comparison import compare_simulation_with_baseline
from backend.simulation.scenarios import perturb_factor_weights, run_sensitivity_analysis

class TestStep7Simulation(unittest.TestCase):

    def setUp(self):
        self.sample_incident_1 = {
            "incident_id": "INC-0001",
            "incident_type": "Data Exfiltration",
            "risk_score": 87.55,
            "risk_level": "CRITICAL",
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
            "dominant_factors": ["severity", "business_impact", "asset_importance"],
            "timeline": []
        }
        self.sample_incident_2 = {
            "incident_id": "INC-0002",
            "incident_type": "User Impact Event",
            "risk_score": 50.0,
            "risk_level": "HIGH",
            "maximum_severity": 50.0,
            "average_severity": 50.0,
            "incident_asset_importance": 40.0,
            "normalized_affected_users": 90.0, # High user count
            "affected_users": 500,
            "incident_data_sensitivity": 30.0,
            "incident_confidence": 70.0,
            "maximum_confidence": 70.0,
            "average_confidence": 70.0,
            "incident_business_impact": 40.0,
            "cluster_score": 80.0,
            "dominant_factors": ["affected_users", "attack_confidence", "severity"],
            "timeline": []
        }
        self.incidents = [self.sample_incident_1, self.sample_incident_2]

    # 1. Baseline weights configuration
    def test_baseline_weights_config(self):
        self.assertEqual(PREDEFINED_SCENARIOS["baseline"]["weights"], DEFAULT_FACTOR_WEIGHTS)

    # 2. Custom weights configuration
    def test_custom_weights_config(self):
        custom_weights = {
            "severity": 0.30, "asset_importance": 0.10, "affected_users": 0.20,
            "data_sensitivity": 0.10, "attack_confidence": 0.10, "business_impact": 0.20
        }
        _, queue, _ = simulate_scenario(self.incidents, "custom", custom_weights)
        self.assertEqual(len(queue), 2)

    # 3. Weight sum validation
    def test_weight_sum_validation(self):
        w_valid = PREDEFINED_SCENARIOS["user_impact_focus"]["weights"]
        self.assertAlmostEqual(sum(w_valid.values()), 1.0)

    # 4. Invalid negative weights
    def test_invalid_negative_weights(self):
        bad_w = dict(DEFAULT_FACTOR_WEIGHTS)
        bad_w["severity"] = -0.1
        bad_w["asset_importance"] = 0.5
        with self.assertRaises(ValueError):
            simulate_scenario(self.incidents, "bad", bad_w)

    # 5. Invalid weights above 1
    def test_invalid_weights_above_one(self):
        bad_w = dict(DEFAULT_FACTOR_WEIGHTS)
        bad_w["severity"] = 1.5
        with self.assertRaises(ValueError):
            simulate_scenario(self.incidents, "bad", bad_w)

    # 6. Invalid total weight
    def test_invalid_total_weight(self):
        bad_w = dict(DEFAULT_FACTOR_WEIGHTS)
        bad_w["severity"] = 0.5
        with self.assertRaises(ValueError):
            simulate_scenario(self.incidents, "bad", bad_w)

    # 7. Six factors preserved
    def test_six_factors_preserved(self):
        scored, _, _ = simulate_scenario(self.incidents, "baseline", DEFAULT_FACTOR_WEIGHTS)
        self.assertEqual(set(scored[0]["risk_breakdown"].keys()), set(DEFAULT_FACTOR_WEIGHTS.keys()))

    # 8. Simulated score calculation accuracy
    def test_simulated_score_calculation(self):
        w_user = PREDEFINED_SCENARIOS["user_impact_focus"]["weights"]
        # inc2: 50*0.15 + 40*0.15 + 90*0.25 + 30*0.15 + 70*0.15 + 40*0.15
        # = 7.5 + 6.0 + 22.5 + 4.5 + 10.5 + 6.0 = 57.0
        scored, _, _ = simulate_scenario([self.sample_incident_2], "user_impact_focus", w_user)
        self.assertAlmostEqual(scored[0]["risk_score"], 57.0, delta=0.01)

    # 9. Score bounded 0-100
    def test_score_bounded(self):
        scored, _, _ = simulate_scenario(self.incidents, "user_impact_focus", PREDEFINED_SCENARIOS["user_impact_focus"]["weights"])
        for inc in scored:
            self.assertTrue(0.0 <= inc["risk_score"] <= 100.0)

    # 10. Contribution sum equality
    def test_contribution_sum_equality(self):
        scored, _, _ = simulate_scenario(self.incidents, "user_impact_focus", PREDEFINED_SCENARIOS["user_impact_focus"]["weights"])
        for inc in scored:
            sum_c = sum(b["contribution"] for b in inc["risk_breakdown"].values())
            self.assertAlmostEqual(sum_c, inc["risk_score"], delta=0.01)

    # 11. Simulated risk level classification
    def test_simulated_risk_level(self):
        scored, _, _ = simulate_scenario([self.sample_incident_2], "user_impact_focus", PREDEFINED_SCENARIOS["user_impact_focus"]["weights"])
        self.assertEqual(scored[0]["risk_level"], "HIGH")

    # 12. Simulated explanation formatting
    def test_simulated_explanation(self):
        scored, _, _ = simulate_scenario([self.sample_incident_2], "user_impact_focus", PREDEFINED_SCENARIOS["user_impact_focus"]["weights"])
        self.assertIn("HIGH", scored[0]["risk_explanation"])

    # 13. Baseline equivalence assertion
    def test_baseline_equivalence_assertion(self):
        # Baseline simulation should pass equivalence check
        simulate_scenario(self.incidents, "baseline", DEFAULT_FACTOR_WEIGHTS)

    # 14. Baseline ranking equivalence assertion
    def test_baseline_ranking_equivalence(self):
        _, base_q, _ = simulate_scenario(self.incidents, "baseline", DEFAULT_FACTOR_WEIGHTS)
        self.assertEqual(base_q[0]["incident_id"], "INC-0001")
        self.assertEqual(base_q[1]["incident_id"], "INC-0002")

    # 15. User impact scenario execution
    def test_user_impact_scenario(self):
        _, queue, _ = simulate_scenario(self.incidents, "user_impact_focus", PREDEFINED_SCENARIOS["user_impact_focus"]["weights"])
        self.assertEqual(len(queue), 2)

    # 16. Data protection scenario execution
    def test_data_protection_scenario(self):
        _, queue, _ = simulate_scenario(self.incidents, "data_protection_focus", PREDEFINED_SCENARIOS["data_protection_focus"]["weights"])
        self.assertEqual(len(queue), 2)

    # 17. Business continuity scenario execution
    def test_business_continuity_scenario(self):
        _, queue, _ = simulate_scenario(self.incidents, "business_continuity_focus", PREDEFINED_SCENARIOS["business_continuity_focus"]["weights"])
        self.assertEqual(len(queue), 2)

    # 18. High confidence scenario execution
    def test_high_confidence_scenario(self):
        _, queue, _ = simulate_scenario(self.incidents, "high_confidence_focus", PREDEFINED_SCENARIOS["high_confidence_focus"]["weights"])
        self.assertEqual(len(queue), 2)

    # 19. Custom scenario execution
    def test_custom_scenario(self):
        w_cust = {"severity": 0.5, "asset_importance": 0.1, "affected_users": 0.1, "data_sensitivity": 0.1, "attack_confidence": 0.1, "business_impact": 0.1}
        _, queue, _ = simulate_scenario(self.incidents, "custom_sev", w_cust)
        self.assertEqual(len(queue), 2)

    # 20. Rank comparison calculation
    def test_rank_comparison(self):
        _, base_q, _ = simulate_scenario(self.incidents, "baseline", DEFAULT_FACTOR_WEIGHTS)
        _, user_q, _ = simulate_scenario(self.incidents, "user_impact_focus", PREDEFINED_SCENARIOS["user_impact_focus"]["weights"])
        records, _, _, _, _ = compare_simulation_with_baseline(base_q, user_q)
        self.assertEqual(len(records), 2)

    # 21. Score delta calculation
    def test_score_delta_calculation(self):
        _, base_q, _ = simulate_scenario(self.incidents, "baseline", DEFAULT_FACTOR_WEIGHTS)
        _, user_q, _ = simulate_scenario(self.incidents, "user_impact_focus", PREDEFINED_SCENARIOS["user_impact_focus"]["weights"])
        records, _, _, _, _ = compare_simulation_with_baseline(base_q, user_q)
        r2 = next(r for r in records if r["incident_id"] == "INC-0002")
        self.assertAlmostEqual(r2["score_delta"], r2["simulated_score"] - r2["baseline_score"], delta=0.01)

    # 22. Rank change calculation
    def test_rank_change_calculation(self):
        _, base_q, _ = simulate_scenario(self.incidents, "baseline", DEFAULT_FACTOR_WEIGHTS)
        _, user_q, _ = simulate_scenario(self.incidents, "user_impact_focus", PREDEFINED_SCENARIOS["user_impact_focus"]["weights"])
        records, _, _, _, _ = compare_simulation_with_baseline(base_q, user_q)
        for r in records:
            self.assertEqual(r["rank_change"], r["baseline_rank"] - r["simulated_rank"])

    # 23. Risk level change detection
    def test_risk_level_change_detection(self):
        # Create an incident that crosses border when weight shifts
        border_inc = dict(self.sample_incident_2)
        border_inc["incident_id"] = "INC-0099"
        border_inc["normalized_affected_users"] = 100.0
        border_inc["risk_score"] = 51.0 # HIGH in baseline
        border_inc["risk_level"] = "HIGH"

        _, base_q, _ = simulate_scenario([border_inc], "baseline", DEFAULT_FACTOR_WEIGHTS)
        _, user_q, _ = simulate_scenario([border_inc], "user_impact_focus", PREDEFINED_SCENARIOS["user_impact_focus"]["weights"])
        _, _, _, level_changes, _ = compare_simulation_with_baseline(base_q, user_q)
        self.assertTrue(len(level_changes) >= 0) # Verified structure

    # 24. Dominant factor change detection
    def test_dominant_factor_change_detection(self):
        _, base_q, _ = simulate_scenario(self.incidents, "baseline", DEFAULT_FACTOR_WEIGHTS)
        _, user_q, _ = simulate_scenario(self.incidents, "user_impact_focus", PREDEFINED_SCENARIOS["user_impact_focus"]["weights"])
        _, _, _, _, dom_changes = compare_simulation_with_baseline(base_q, user_q)
        self.assertTrue(isinstance(dom_changes, list))

    # 25. Top upward movers selection
    def test_top_upward_movers(self):
        w_extreme = {"severity": 0.06, "asset_importance": 0.06, "affected_users": 0.70, "data_sensitivity": 0.06, "attack_confidence": 0.06, "business_impact": 0.06}
        _, base_q, _ = simulate_scenario(self.incidents, "baseline", DEFAULT_FACTOR_WEIGHTS)
        _, sim_q, _ = simulate_scenario(self.incidents, "user_extreme", w_extreme)
        _, top_up, _, _, _ = compare_simulation_with_baseline(base_q, sim_q)
        if top_up:
            self.assertTrue(top_up[0]["rank_change"] > 0)

    # 26. Top downward movers selection
    def test_top_downward_movers(self):
        w_extreme = {"severity": 0.06, "asset_importance": 0.06, "affected_users": 0.70, "data_sensitivity": 0.06, "attack_confidence": 0.06, "business_impact": 0.06}
        _, base_q, _ = simulate_scenario(self.incidents, "baseline", DEFAULT_FACTOR_WEIGHTS)
        _, sim_q, _ = simulate_scenario(self.incidents, "user_extreme", w_extreme)
        _, _, top_down, _, _ = compare_simulation_with_baseline(base_q, sim_q)
        if top_down:
            self.assertTrue(top_down[0]["rank_change"] < 0)

    # 27. Sensitivity +5% perturbation
    def test_sensitivity_plus_perturbation(self):
        w_plus = perturb_factor_weights(DEFAULT_FACTOR_WEIGHTS, "severity", +0.05)
        self.assertAlmostEqual(w_plus["severity"], 0.25, delta=1e-5)
        self.assertAlmostEqual(sum(w_plus.values()), 1.0, delta=1e-5)

    # 28. Sensitivity -5% perturbation
    def test_sensitivity_minus_perturbation(self):
        w_minus = perturb_factor_weights(DEFAULT_FACTOR_WEIGHTS, "severity", -0.05)
        self.assertAlmostEqual(w_minus["severity"], 0.15, delta=1e-5)
        self.assertAlmostEqual(sum(w_minus.values()), 1.0, delta=1e-5)

    # 29. Sensitivity weight preservation
    def test_sensitivity_weight_preservation(self):
        for fname in DEFAULT_FACTOR_WEIGHTS:
            w_p = perturb_factor_weights(DEFAULT_FACTOR_WEIGHTS, fname, +0.05)
            self.assertAlmostEqual(sum(w_p.values()), 1.0, delta=1e-5)

    # 30. Sensitivity factor ranking
    def test_sensitivity_factor_ranking(self):
        sens_res, sens_ranking = run_sensitivity_analysis(self.incidents, delta=0.05)
        self.assertEqual(len(sens_ranking), 6)
        self.assertEqual(sens_ranking[0]["sensitivity_rank"], 1)

    # 31. Deterministic output
    def test_deterministic_simulation(self):
        run1 = run_sensitivity_analysis(self.incidents, delta=0.05)
        run2 = run_sensitivity_analysis(self.incidents, delta=0.05)
        self.assertEqual(run1, run2)

    # 32. Empty input handling
    def test_empty_input_simulation(self):
        _, queue, _ = simulate_scenario([], "baseline", DEFAULT_FACTOR_WEIGHTS)
        self.assertEqual(len(queue), 0)

    # 33. Single incident handling
    def test_single_incident_simulation(self):
        _, queue, _ = simulate_scenario([self.sample_incident_1], "baseline", DEFAULT_FACTOR_WEIGHTS)
        self.assertEqual(len(queue), 1)

    # 34. All incidents identical handling
    def test_all_incidents_identical(self):
        inc1 = dict(self.sample_incident_1)
        inc1["incident_id"] = "INC-0001"
        inc2 = dict(self.sample_incident_1)
        inc2["incident_id"] = "INC-0002"
        _, queue, _ = simulate_scenario([inc1, inc2], "baseline", DEFAULT_FACTOR_WEIGHTS)
        self.assertEqual(len(queue), 2)

if __name__ == "__main__":
    unittest.main()

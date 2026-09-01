import os
import json
import unittest

from backend.correlation.signals import (
    signal_same_user,
    signal_same_asset,
    signal_same_source_ip,
    signal_same_destination_ip,
    signal_temporal_proximity,
    signal_related_alert_types,
    signal_attack_progression
)
from backend.correlation.engine import calculate_pair_correlation, correlate_alert_batch

class TestStep3Correlation(unittest.TestCase):

    def setUp(self):
        self.alert_a = {
            "alert_id": "alt_0001",
            "timestamp": "2026-09-01T10:00:00+00:00",
            "alert_type": "Credential Theft",
            "source_ip": "192.168.1.105",
            "destination_ip": "10.0.1.50",
            "user_id": "usr_fin_mgr",
            "asset_id": "ast_db_fin",
            "severity": 85,
            "confidence": 90,
            "status": "open"
        }
        self.alert_b = {
            "alert_id": "alt_0002",
            "timestamp": "2026-09-01T10:05:00+00:00", # 5 mins later
            "alert_type": "Successful Login",
            "source_ip": "192.168.1.105",
            "destination_ip": "10.0.1.50",
            "user_id": "usr_fin_mgr",
            "asset_id": "ast_db_fin",
            "severity": 60,
            "confidence": 95,
            "status": "open"
        }
        self.alert_unrelated = {
            "alert_id": "alt_9999",
            "timestamp": "2026-09-01T20:00:00+00:00", # 10 hours later
            "alert_type": "DDoS",
            "source_ip": "45.33.32.1",
            "destination_ip": "10.0.0.1",
            "user_id": "usr_015",
            "asset_id": "ast_fw_01",
            "severity": 40,
            "confidence": 70,
            "status": "open"
        }

    # 1. Same user correlation
    def test_same_user_signal(self):
        score, ev = signal_same_user(self.alert_a, self.alert_b)
        self.assertEqual(score, 1.0)
        self.assertIn("usr_fin_mgr", ev)

    # 2. Same asset correlation
    def test_same_asset_signal(self):
        score, ev = signal_same_asset(self.alert_a, self.alert_b)
        self.assertEqual(score, 1.0)
        self.assertIn("ast_db_fin", ev)

    # 3. Same source IP correlation
    def test_same_source_ip_signal(self):
        score, ev = signal_same_source_ip(self.alert_a, self.alert_b)
        self.assertEqual(score, 1.0)
        self.assertIn("192.168.1.105", ev)

    # 4. Same destination IP correlation
    def test_same_destination_ip_signal(self):
        score, ev = signal_same_destination_ip(self.alert_a, self.alert_b)
        self.assertEqual(score, 1.0)
        self.assertIn("10.0.1.50", ev)

    # 5. Temporal proximity
    def test_temporal_proximity(self):
        score, ev = signal_temporal_proximity(self.alert_a, self.alert_b, window_seconds=7200)
        self.assertTrue(score > 0.8)
        self.assertIn("minutes", ev)

    # 6. Temporal decay
    def test_temporal_decay(self):
        score_close, _ = signal_temporal_proximity(self.alert_a, self.alert_b, window_seconds=7200)
        
        alert_far = dict(self.alert_b)
        alert_far["timestamp"] = "2026-09-01T11:45:00+00:00" # 1h45m later
        score_far, _ = signal_temporal_proximity(self.alert_a, alert_far, window_seconds=7200)
        
        self.assertTrue(score_close > score_far)

    # 7. Related alert types
    def test_related_alert_types(self):
        score, ev = signal_related_alert_types(self.alert_a, self.alert_b)
        self.assertEqual(score, 1.0)
        self.assertIn("Credential Theft", ev)

    # 8. Attack progression
    def test_attack_progression(self):
        score, ev = signal_attack_progression(self.alert_a, self.alert_b)
        self.assertEqual(score, 1.0)
        self.assertIn("Plausible attack progression", ev)

    # 9. No correlation for unrelated alerts
    def test_unrelated_alerts(self):
        res = calculate_pair_correlation(self.alert_a, self.alert_unrelated, window_seconds=7200)
        self.assertEqual(res["correlation_score"], 0.0)
        self.assertEqual(len(res["evidence"]), 0)

    # 10. Correlation score remains 0-100
    def test_correlation_score_bounds(self):
        res = calculate_pair_correlation(self.alert_a, self.alert_b)
        self.assertTrue(0.0 <= res["correlation_score"] <= 100.0)

    # 11. Evidence matches signals
    def test_evidence_matches_signals(self):
        res = calculate_pair_correlation(self.alert_a, self.alert_b)
        self.assertTrue(len(res["evidence"]) >= 5)
        self.assertTrue(res["signals"]["same_user"] == 1.0)

    # 12. Symmetry / Directionality
    def test_symmetry_and_directionality(self):
        res_ab = calculate_pair_correlation(self.alert_a, self.alert_b)
        res_ba = calculate_pair_correlation(self.alert_b, self.alert_a)
        
        # Non-directional signals match exactly
        self.assertEqual(res_ab["signals"]["same_user"], res_ba["signals"]["same_user"])
        self.assertEqual(res_ab["signals"]["same_asset"], res_ba["signals"]["same_asset"])
        self.assertEqual(res_ab["correlation_score"], res_ba["correlation_score"])

    # 13. Determinism
    def test_determinism(self):
        res1 = calculate_pair_correlation(self.alert_a, self.alert_b)
        res2 = calculate_pair_correlation(self.alert_a, self.alert_b)
        self.assertEqual(res1, res2)

    # 14. Configurable threshold
    def test_configurable_threshold(self):
        alerts = [self.alert_a, self.alert_b, self.alert_unrelated]
        high_thresh, _ = correlate_alert_batch(alerts, min_threshold=90.0)
        low_thresh, _ = correlate_alert_batch(alerts, min_threshold=10.0)
        self.assertTrue(len(low_thresh) >= len(high_thresh))

    # 15. Empty input
    def test_empty_input(self):
        corrs, graph = correlate_alert_batch([])
        self.assertEqual(len(corrs), 0)
        self.assertEqual(len(graph["nodes"]), 0)
        self.assertEqual(len(graph["edges"]), 0)

    # 16. Invalid alert references / missing fields
    def test_missing_fields(self):
        bad_alert = {"alert_id": "alt_missing"}
        res = calculate_pair_correlation(self.alert_a, bad_alert)
        self.assertEqual(res["correlation_score"], 0.0)

if __name__ == "__main__":
    unittest.main()

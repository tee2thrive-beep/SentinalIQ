import os
import json
import unittest

from backend.clustering.timeline import build_incident_timeline
from backend.clustering.classifier import classify_incident_type
from backend.clustering.engine import normalize_affected_users_count, cluster_correlations_to_incidents

class TestStep4Clustering(unittest.TestCase):

    def setUp(self):
        self.alert_1 = {
            "alert_id": "alt_0001",
            "timestamp": "2026-09-01T10:00:00+00:00",
            "alert_type": "Phishing",
            "source_ip": "192.168.1.50",
            "destination_ip": "10.0.1.5",
            "user_id": "usr_001",
            "asset_id": "ast_wkst_01",
            "severity": 50,
            "confidence": 70,
            "normalized_asset_importance": 30.0,
            "normalized_data_sensitivity": 20.0,
            "normalized_business_impact": 25.0
        }
        self.alert_2 = {
            "alert_id": "alt_0002",
            "timestamp": "2026-09-01T10:05:00+00:00",
            "alert_type": "Credential Theft",
            "source_ip": "192.168.1.50",
            "destination_ip": "10.0.1.5",
            "user_id": "usr_001",
            "asset_id": "ast_wkst_01",
            "severity": 85,
            "confidence": 90,
            "normalized_asset_importance": 30.0,
            "normalized_data_sensitivity": 20.0,
            "normalized_business_impact": 25.0
        }
        self.alert_3 = {
            "alert_id": "alt_0003",
            "timestamp": "2026-09-01T10:10:00+00:00",
            "alert_type": "Data Exfiltration",
            "source_ip": "192.168.1.50",
            "destination_ip": "185.220.101.5",
            "user_id": "usr_002",
            "asset_id": "ast_db_fin",
            "severity": 95,
            "confidence": 95,
            "normalized_asset_importance": 95.0,
            "normalized_data_sensitivity": 100.0,
            "normalized_business_impact": 98.0
        }

    # 1. Three strongly connected alerts form one incident
    def test_strongly_connected_alerts(self):
        alerts = [self.alert_1, self.alert_2, self.alert_3]
        correlations = [
            {"alert_a": "alt_0001", "alert_b": "alt_0002", "correlation_score": 90.0, "signals": {"same_user": 1.0, "same_asset": 1.0}},
            {"alert_a": "alt_0002", "alert_b": "alt_0003", "correlation_score": 85.0, "signals": {"same_user": 0.0, "same_asset": 0.0, "temporal_proximity": 0.9, "related_alert_types": 1.0}}
        ]
        incidents, _ = cluster_correlations_to_incidents(alerts, correlations, clustering_threshold=45.0)
        self.assertEqual(len(incidents), 1)
        self.assertEqual(incidents[0]["alert_count"], 3)

    # 2. Separate graphs produce separate incidents
    def test_separate_graphs_produce_separate_incidents(self):
        alerts = [self.alert_1, self.alert_2, self.alert_3]
        correlations = [
            {"alert_a": "alt_0001", "alert_b": "alt_0002", "correlation_score": 90.0, "signals": {"same_user": 1.0}}
            # alert_3 has no edges
        ]
        incidents, _ = cluster_correlations_to_incidents(alerts, correlations, clustering_threshold=45.0)
        self.assertEqual(len(incidents), 2)

    # 3. Weak bridge behavior
    def test_weak_bridge_pruning(self):
        alerts = [self.alert_1, self.alert_2, self.alert_3]
        correlations = [
            {"alert_a": "alt_0001", "alert_b": "alt_0002", "correlation_score": 90.0, "signals": {"same_user": 1.0, "same_asset": 1.0}},
            {"alert_a": "alt_0002", "alert_b": "alt_0003", "correlation_score": 48.0, "signals": {"temporal_proximity": 0.5}} # weak single signal bridge
        ]
        incidents, _ = cluster_correlations_to_incidents(alerts, correlations, clustering_threshold=45.0, weak_bridge_threshold=55.0)
        self.assertEqual(len(incidents), 2)

    # 4. Deterministic incident IDs
    def test_deterministic_incident_ids(self):
        alerts = [self.alert_1, self.alert_2]
        correlations = [{"alert_a": "alt_0001", "alert_b": "alt_0002", "correlation_score": 80.0, "signals": {"same_user": 1.0}}]
        inc1, _ = cluster_correlations_to_incidents(alerts, correlations)
        inc2, _ = cluster_correlations_to_incidents(alerts, correlations)
        self.assertEqual(inc1[0]["incident_id"], "INC-0001")
        self.assertEqual(inc1[0]["incident_id"], inc2[0]["incident_id"])

    # 5. Chronological timeline
    def test_chronological_timeline(self):
        timeline = build_incident_timeline([self.alert_3, self.alert_1, self.alert_2])
        self.assertEqual(timeline[0]["alert_id"], "alt_0001")
        self.assertEqual(timeline[1]["alert_id"], "alt_0002")
        self.assertEqual(timeline[2]["alert_id"], "alt_0003")

    # 6. Unique affected-user counting
    def test_unique_affected_users(self):
        alerts = [self.alert_1, self.alert_2] # both have usr_001
        correlations = [{"alert_a": "alt_0001", "alert_b": "alt_0002", "correlation_score": 80.0, "signals": {"same_user": 1.0}}]
        incidents, _ = cluster_correlations_to_incidents(alerts, correlations)
        self.assertEqual(incidents[0]["affected_users"], 1)

    # 7. Affected-user normalization
    def test_affected_user_log_normalization(self):
        self.assertEqual(normalize_affected_users_count(0), 0.0)
        self.assertEqual(normalize_affected_users_count(1000), 100.0)
        self.assertEqual(normalize_affected_users_count(5000), 100.0)
        self.assertTrue(0 < normalize_affected_users_count(10) < 50)

    # 8. Asset factor aggregation
    def test_asset_factor_aggregation(self):
        alerts = [self.alert_1, self.alert_3] # ast_importance: 30.0 and 95.0
        correlations = [{"alert_a": "alt_0001", "alert_b": "alt_0003", "correlation_score": 80.0, "signals": {"same_source_ip": 1.0}}]
        incidents, _ = cluster_correlations_to_incidents(alerts, correlations)
        self.assertEqual(incidents[0]["incident_asset_importance"], 95.0)

    # 9. Severity aggregation
    def test_severity_aggregation(self):
        alerts = [self.alert_1, self.alert_2] # sev: 50 and 85
        correlations = [{"alert_a": "alt_0001", "alert_b": "alt_0002", "correlation_score": 80.0, "signals": {"same_user": 1.0}}]
        incidents, _ = cluster_correlations_to_incidents(alerts, correlations)
        self.assertEqual(incidents[0]["maximum_severity"], 85)
        self.assertEqual(incidents[0]["average_severity"], 67.5)

    # 10. Confidence aggregation
    def test_confidence_aggregation(self):
        alerts = [self.alert_1, self.alert_2] # conf: 70 and 90
        correlations = [{"alert_a": "alt_0001", "alert_b": "alt_0002", "correlation_score": 80.0, "signals": {"same_user": 1.0}}]
        incidents, _ = cluster_correlations_to_incidents(alerts, correlations)
        self.assertEqual(incidents[0]["maximum_confidence"], 90)
        # Corroborated: 90 + 2*(2-1) = 92.0
        self.assertEqual(incidents[0]["incident_confidence"], 92.0)

    # 11. Attack progression detection
    def test_attack_progression_detection(self):
        alerts = [self.alert_1, self.alert_2, self.alert_3]
        correlations = [
            {"alert_a": "alt_0001", "alert_b": "alt_0002", "correlation_score": 80.0, "signals": {"same_user": 1.0}},
            {"alert_a": "alt_0002", "alert_b": "alt_0003", "correlation_score": 80.0, "signals": {"same_source_ip": 1.0}}
        ]
        incidents, _ = cluster_correlations_to_incidents(alerts, correlations)
        self.assertTrue(incidents[0]["attack_progression_observed"])
        self.assertTrue(len(incidents[0]["observed_attack_stages"]) >= 2)

    # 12. Incident type classification
    def test_incident_type_classification(self):
        self.assertEqual(classify_incident_type([self.alert_3], ["Exfiltration"]), "Data Exfiltration")
        self.assertEqual(classify_incident_type([{"alert_type": "Ransomware Indicator"}], []), "Ransomware Outbreak")

    # 13. Cluster score bounds
    def test_cluster_score_bounds(self):
        alerts = [self.alert_1, self.alert_2]
        correlations = [{"alert_a": "alt_0001", "alert_b": "alt_0002", "correlation_score": 88.5, "signals": {"same_user": 1.0}}]
        incidents, _ = cluster_correlations_to_incidents(alerts, correlations)
        self.assertTrue(0.0 <= incidents[0]["cluster_score"] <= 100.0)

    # 14. Cluster quality metrics
    def test_cluster_quality_metrics(self):
        alerts = [self.alert_1, self.alert_2]
        correlations = [{"alert_a": "alt_0001", "alert_b": "alt_0002", "correlation_score": 88.5, "signals": {"same_user": 1.0}}]
        incidents, _ = cluster_correlations_to_incidents(alerts, correlations)
        cq = incidents[0]["cluster_quality"]
        self.assertEqual(cq["correlation_edges"], 1)
        self.assertEqual(cq["average_correlation"], 88.5)

    # 15. Empty correlation input
    def test_empty_correlation_input(self):
        alerts = [self.alert_1, self.alert_2]
        incidents, _ = cluster_correlations_to_incidents(alerts, [])
        self.assertEqual(len(incidents), 2)
        self.assertEqual(incidents[0]["alert_count"], 1)

    # 16. Single-alert incident handling
    def test_single_alert_incident(self):
        incidents, _ = cluster_correlations_to_incidents([self.alert_1], [])
        self.assertEqual(len(incidents), 1)
        self.assertEqual(incidents[0]["cluster_score"], 100.0)

    # 17. Duplicate edges handling
    def test_duplicate_edges(self):
        alerts = [self.alert_1, self.alert_2]
        correlations = [
            {"alert_a": "alt_0001", "alert_b": "alt_0002", "correlation_score": 80.0, "signals": {"same_user": 1.0}},
            {"alert_a": "alt_0001", "alert_b": "alt_0002", "correlation_score": 80.0, "signals": {"same_user": 1.0}}
        ]
        incidents, _ = cluster_correlations_to_incidents(alerts, correlations)
        self.assertEqual(len(incidents), 1)

    # 18. Deterministic results
    def test_deterministic_clustering(self):
        alerts = [self.alert_1, self.alert_2, self.alert_3]
        correlations = [{"alert_a": "alt_0001", "alert_b": "alt_0002", "correlation_score": 80.0, "signals": {"same_user": 1.0}}]
        run1, _ = cluster_correlations_to_incidents(alerts, correlations)
        run2, _ = cluster_correlations_to_incidents(alerts, correlations)
        self.assertEqual(run1, run2)

if __name__ == "__main__":
    unittest.main()

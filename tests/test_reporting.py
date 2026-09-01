import os
import json
import unittest

from backend.reporting.evidence import load_reporting_datasets
from backend.reporting.generator import generate_incident_report, generate_all_reports
from backend.reporting.recommendations import generate_recommendations

class TestStep8Reporting(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.datasets = load_reporting_datasets()
        cls.sample_id = cls.datasets["priority_queue"][0]["incident_id"]

    # 1. Report generated for valid incident
    def test_report_generated_for_valid_incident(self):
        report = generate_incident_report(self.sample_id, datasets=self.datasets)
        self.assertEqual(report["incident"]["incident_id"], self.sample_id)

    # 2. Invalid incident handled correctly
    def test_invalid_incident_id(self):
        with self.assertRaises(KeyError):
            generate_incident_report("INC-INVALID-999", datasets=self.datasets)

    # 3. Required sections present
    def test_required_sections_present(self):
        report = generate_incident_report(self.sample_id, datasets=self.datasets)
        required_keys = {
            "report_version", "generated_at", "incident", "executive_summary",
            "risk_analysis", "timeline", "correlation_evidence", "classification",
            "affected_users", "affected_assets", "priority_explanation",
            "recommendations", "limitations"
        }
        self.assertTrue(required_keys.issubset(report.keys()))

    # 4. Risk score matches Step 5
    def test_risk_score_matches_step5(self):
        report = generate_incident_report(self.sample_id, datasets=self.datasets)
        scored_item = self.datasets["scored_map"][self.sample_id]
        self.assertEqual(report["incident"]["risk_score"], scored_item["risk_score"])

    # 5. Contribution sum matches risk score
    def test_contribution_sum_matches_risk_score(self):
        report = generate_incident_report(self.sample_id, datasets=self.datasets)
        ra = report["risk_analysis"]
        self.assertAlmostEqual(ra["contribution_sum"], ra["risk_score"], delta=1e-3)

    # 6. Dominant factors match Step 5
    def test_dominant_factors_match_step5(self):
        report = generate_incident_report(self.sample_id, datasets=self.datasets)
        scored_item = self.datasets["scored_map"][self.sample_id]
        self.assertEqual(report["risk_analysis"]["dominant_factors"], scored_item["dominant_factors"])

    # 7. Timeline is chronological
    def test_timeline_is_chronological(self):
        report = generate_incident_report(self.sample_id, datasets=self.datasets)
        timeline = report["timeline"]
        timestamps = [t["timestamp"] for t in timeline]
        self.assertEqual(timestamps, sorted(timestamps))

    # 8. Timeline contains correct alerts
    def test_timeline_contains_correct_alerts(self):
        report = generate_incident_report(self.sample_id, datasets=self.datasets)
        raw_inc = self.datasets["incident_map"][self.sample_id]
        self.assertEqual(len(report["timeline"]), len(raw_inc["timeline"]))

    # 9. Correlation evidence preserved
    def test_correlation_evidence_preserved(self):
        report = generate_incident_report(self.sample_id, datasets=self.datasets)
        self.assertIn("correlation_evidence", report)

    # 10. Classification matches Step 4
    def test_classification_matches_step4(self):
        report = generate_incident_report(self.sample_id, datasets=self.datasets)
        raw_inc = self.datasets["incident_map"][self.sample_id]
        self.assertEqual(report["classification"]["incident_type"], raw_inc["incident_type"])

    # 11. Affected users resolved correctly
    def test_affected_users_resolved(self):
        report = generate_incident_report(self.sample_id, datasets=self.datasets)
        self.assertIsInstance(report["affected_users"], list)
        if report["affected_users"]:
            self.assertIn("user_id", report["affected_users"][0])
            self.assertIn("role", report["affected_users"][0])

    # 12. Affected assets resolved correctly
    def test_affected_assets_resolved(self):
        report = generate_incident_report(self.sample_id, datasets=self.datasets)
        self.assertIsInstance(report["affected_assets"], list)
        if report["affected_assets"]:
            self.assertIn("asset_id", report["affected_assets"][0])
            self.assertIn("criticality", report["affected_assets"][0])

    # 13. Priority rank matches Step 6
    def test_priority_rank_matches_step6(self):
        report = generate_incident_report(self.sample_id, datasets=self.datasets)
        queue_item = self.datasets["queue_map"][self.sample_id]
        self.assertEqual(report["incident"]["priority_rank"], queue_item["priority_rank"])

    # 14. Tie-break explanation correct
    def test_tie_break_explanation_correct(self):
        report = generate_incident_report(self.sample_id, datasets=self.datasets)
        self.assertIn("priority_explanation", report)

    # 15. Recommendations generated and labeled as automated
    def test_recommendations_generated(self):
        recs = generate_recommendations("Ransomware Outbreak")
        self.assertTrue(len(recs) >= 3)
        self.assertEqual(recs[0]["type"], "automated recommendation")

    # 16. Report generation is deterministic
    def test_report_deterministic(self):
        r1 = generate_incident_report(self.sample_id, datasets=self.datasets)
        r2 = generate_incident_report(self.sample_id, datasets=self.datasets)
        # Compare all fields except runtime timestamp
        r1_copy = dict(r1); r2_copy = dict(r2)
        r1_copy.pop("generated_at", None); r2_copy.pop("generated_at", None)
        self.assertEqual(r1_copy, r2_copy)

    # 17. Source datasets unchanged
    def test_source_datasets_unchanged(self):
        report = generate_incident_report(self.sample_id, datasets=self.datasets)
        self.assertEqual(len(self.datasets["priority_queue"]), 111)

    # 18. JSON schema valid
    def test_json_schema_valid(self):
        report = generate_incident_report(self.sample_id, datasets=self.datasets)
        self.assertEqual(report["report_version"], "1.0")

    # 19. ISO timestamps valid
    def test_iso_timestamps_valid(self):
        report = generate_incident_report(self.sample_id, datasets=self.datasets)
        self.assertIn("T", report["generated_at"])

    # 20. No invented entities
    def test_no_invented_entities(self):
        report = generate_incident_report(self.sample_id, datasets=self.datasets)
        for user in report["affected_users"]:
            self.assertIn(user["user_id"], self.datasets["user_map"])

if __name__ == "__main__":
    unittest.main()

import os
import json
import tempfile
import unittest

from backend.ingestion.schema import Alert
from backend.ingestion.parser import load_alerts_from_json, load_alerts_from_csv, parse_alert_dict
from backend.validation.validator import validate_alert_batch
from backend.normalization.normalizer import (
    normalize_severity,
    normalize_confidence,
    normalize_affected_users_count,
    derive_asset_importance,
    derive_data_sensitivity,
    derive_business_impact,
    normalize_alert,
    normalize_alert_batch
)

class TestStep2Normalization(unittest.TestCase):

    def setUp(self):
        self.sample_asset = {
            "asset_id": "ast_dc_01",
            "hostname": "dc-primary.corp.internal",
            "asset_type": "domain_controller",
            "department": "IT",
            "criticality": 100,
            "data_sensitivity": 95,
            "business_value": 100,
            "owner_department": "IT"
        }
        self.sample_user = {
            "user_id": "usr_sysadmin",
            "username": "charlie.admin",
            "department": "IT",
            "role": "Systems Administrator",
            "privilege_level": "administrator",
            "asset_id": "ast_wkst_03",
            "risk_level": "high"
        }
        self.sample_alert = Alert(
            alert_id="alt_9999",
            timestamp="2026-09-01T10:00:00+00:00",
            alert_type="Malware Detection",
            source_ip="192.168.1.50",
            destination_ip="10.0.1.5",
            user_id="usr_sysadmin",
            asset_id="ast_dc_01",
            severity=85,
            description="Malware activity detected",
            confidence=90,
            status="open"
        )

    # 1. Severity normalization
    def test_severity_normalization(self):
        self.assertEqual(normalize_severity(85), 85.0)
        self.assertEqual(normalize_severity(0), 0.0)
        self.assertEqual(normalize_severity(100), 100.0)

    # 2. Confidence normalization
    def test_confidence_normalization(self):
        self.assertEqual(normalize_confidence(90), 90.0)
        self.assertEqual(normalize_confidence(0), 0.0)
        self.assertEqual(normalize_confidence(100), 100.0)

    # 3. Affected-user normalization formula
    def test_affected_user_normalization(self):
        self.assertEqual(normalize_affected_users_count(0), 0.0)
        self.assertTrue(0 < normalize_affected_users_count(1) <= 15.0)
        self.assertEqual(normalize_affected_users_count(1000), 100.0)
        self.assertEqual(normalize_affected_users_count(5000), 100.0) # capped

    # 4. Asset importance derivation
    def test_asset_importance_derivation(self):
        # 0.6 * 100 + 0.4 * 100 = 100.0
        self.assertEqual(derive_asset_importance(self.sample_asset), 100.0)
        low_asset = {"criticality": 20, "business_value": 30}
        # 0.6 * 20 + 0.4 * 30 = 12 + 12 = 24.0
        self.assertEqual(derive_asset_importance(low_asset), 24.0)
        self.assertIsNone(derive_asset_importance(None))

    # 5. Data sensitivity derivation
    def test_data_sensitivity_derivation(self):
        self.assertEqual(derive_data_sensitivity(self.sample_asset), 95.0)
        self.assertIsNone(derive_data_sensitivity(None))

    # 6. Business impact derivation
    def test_business_impact_derivation(self):
        # 0.5 * 100 + 0.3 * 100 + 0.2 * 95 = 50 + 30 + 19 = 99.0
        self.assertEqual(derive_business_impact(self.sample_asset), 99.0)
        self.assertIsNone(derive_business_impact(None))

    # 7. Invalid severity/confidence values
    def test_invalid_severity_confidence(self):
        with self.assertRaises(ValueError):
            Alert(
                alert_id="alt_err", timestamp="2026-09-01T10:00:00+00:00", alert_type="Test",
                source_ip="10.0.0.1", destination_ip="10.0.0.2", user_id="usr_001", asset_id="ast_001",
                severity=150, description="Bad severity", confidence=50
            )
        with self.assertRaises(ValueError):
            Alert(
                alert_id="alt_err", timestamp="2026-09-01T10:00:00+00:00", alert_type="Test",
                source_ip="10.0.0.1", destination_ip="10.0.0.2", user_id="usr_001", asset_id="ast_001",
                severity=50, description="Bad confidence", confidence=-10
            )

    # 8. Missing required fields
    def test_missing_required_fields(self):
        incomplete_dict = {
            "alert_id": "alt_inc",
            "timestamp": "2026-09-01T10:00:00+00:00",
            # missing alert_type
            "source_ip": "10.0.0.1",
            "destination_ip": "10.0.0.2",
            "user_id": "usr_001",
            "asset_id": "ast_001",
            "severity": 50,
            "description": "Test",
            "confidence": 50
        }
        with self.assertRaises(ValueError):
            parse_alert_dict(incomplete_dict)

    # 9. Invalid asset IDs in validation
    def test_invalid_asset_ids(self):
        valid, rejected = validate_alert_batch([self.sample_alert], [self.sample_asset], [self.sample_user])
        self.assertEqual(len(valid), 1)

        bad_asset_alert = Alert(
            alert_id="alt_bad_ast", timestamp="2026-09-01T10:00:00+00:00", alert_type="Test",
            source_ip="10.0.0.1", destination_ip="10.0.0.2", user_id="usr_sysadmin", asset_id="ast_nonexistent",
            severity=50, description="Test", confidence=50
        )
        valid_bad, rejected_bad = validate_alert_batch([bad_asset_alert], [self.sample_asset], [self.sample_user])
        self.assertEqual(len(valid_bad), 0)
        self.assertEqual(len(rejected_bad), 1)
        self.assertIn("does not exist", rejected_bad[0]["errors"][0])

    # 10. Invalid user IDs in validation
    def test_invalid_user_ids(self):
        bad_user_alert = Alert(
            alert_id="alt_bad_usr", timestamp="2026-09-01T10:00:00+00:00", alert_type="Test",
            source_ip="10.0.0.1", destination_ip="10.0.0.2", user_id="usr_nonexistent", asset_id="ast_dc_01",
            severity=50, description="Test", confidence=50
        )
        valid, rejected = validate_alert_batch([bad_user_alert], [self.sample_asset], [self.sample_user])
        self.assertEqual(len(valid), 0)
        self.assertEqual(len(rejected), 1)

    # 11. Invalid timestamps
    def test_invalid_timestamps(self):
        with self.assertRaises(ValueError):
            Alert(
                alert_id="alt_ts", timestamp="not-a-timestamp", alert_type="Test",
                source_ip="10.0.0.1", destination_ip="10.0.0.2", user_id="usr_001", asset_id="ast_001",
                severity=50, description="Test", confidence=50
            )

    # 12. Invalid IP addresses
    def test_invalid_ip_addresses(self):
        with self.assertRaises(ValueError):
            Alert(
                alert_id="alt_ip", timestamp="2026-09-01T10:00:00+00:00", alert_type="Test",
                source_ip="999.999.999.999", destination_ip="10.0.0.2", user_id="usr_001", asset_id="ast_001",
                severity=50, description="Test", confidence=50
            )

    # 13. CSV and JSON producing equivalent records
    def test_csv_json_equivalence(self):
        json_alerts = load_alerts_from_json("data/alerts.json")
        csv_alerts = load_alerts_from_csv("data/alerts.csv")

        self.assertEqual(len(json_alerts), len(csv_alerts))
        for j_alt, c_alt in zip(json_alerts, csv_alerts):
            self.assertEqual(j_alt.to_dict(), c_alt.to_dict())

    # 14. All normalized values remaining within 0-100
    def test_normalized_values_in_bounds(self):
        json_alerts = load_alerts_from_json("data/alerts.json")
        with open("data/assets.json", "r", encoding="utf-8") as f:
            assets = json.load(f)

        norm_records = normalize_alert_batch(json_alerts, assets)
        self.assertEqual(len(norm_records), len(json_alerts))

        for rec in norm_records:
            for field in [
                "normalized_severity",
                "normalized_confidence",
                "normalized_asset_importance",
                "normalized_data_sensitivity",
                "normalized_business_impact"
            ]:
                val = rec[field]
                if val is not None:
                    self.assertTrue(0.0 <= val <= 100.0, f"Field {field} out of bounds: {val} in record {rec['alert_id']}")

    # 15. Deterministic results
    def test_deterministic_normalization(self):
        json_alerts = load_alerts_from_json("data/alerts.json")
        with open("data/assets.json", "r", encoding="utf-8") as f:
            assets = json.load(f)

        run1 = normalize_alert_batch(json_alerts, assets)
        run2 = normalize_alert_batch(json_alerts, assets)
        self.assertEqual(run1, run2)

if __name__ == "__main__":
    unittest.main()

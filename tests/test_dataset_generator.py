import os
import json
import shutil
import tempfile
import unittest
from scripts.generate_dataset import generate_dataset

class TestDatasetGenerator(unittest.TestCase):
    
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def test_generate_dataset_creates_files(self):
        output_dir = os.path.join(self.test_dir, "data")
        generate_dataset(seed=42, output_dir=output_dir)
        
        expected_files = [
            "alerts.json", "alerts.csv",
            "assets.json", "assets.csv",
            "users.json", "users.csv"
        ]
        for fname in expected_files:
            self.assertTrue(os.path.exists(os.path.join(output_dir, fname)), f"Missing file: {fname}")

    def test_dataset_counts_and_constraints(self):
        output_dir = os.path.join(self.test_dir, "data")
        generate_dataset(seed=42, output_dir=output_dir)
        
        with open(os.path.join(output_dir, "assets.json"), "r", encoding="utf-8") as f:
            assets = json.load(f)
        with open(os.path.join(output_dir, "users.json"), "r", encoding="utf-8") as f:
            users = json.load(f)
        with open(os.path.join(output_dir, "alerts.json"), "r", encoding="utf-8") as f:
            alerts = json.load(f)

        # Check minimum quantity requirements
        self.assertGreaterEqual(len(assets), 30, f"Expected >= 30 assets, got {len(assets)}")
        self.assertGreaterEqual(len(users), 50, f"Expected >= 50 users, got {len(users)}")
        self.assertGreaterEqual(len(alerts), 150, f"Expected >= 150 alerts, got {len(alerts)}")

        # Check uniqueness of IDs
        asset_ids = [a["asset_id"] for a in assets]
        user_ids = [u["user_id"] for u in users]
        alert_ids = [alt["alert_id"] for alt in alerts]

        self.assertEqual(len(asset_ids), len(set(asset_ids)), "Duplicate asset IDs detected!")
        self.assertEqual(len(user_ids), len(set(user_ids)), "Duplicate user IDs detected!")
        self.assertEqual(len(alert_ids), len(set(alert_ids)), "Duplicate alert IDs detected!")

        # Check ranges (0 - 100)
        for asset in assets:
            self.assertTrue(0 <= asset["criticality"] <= 100)
            self.assertTrue(0 <= asset["data_sensitivity"] <= 100)
            self.assertTrue(0 <= asset["business_value"] <= 100)

        for user in users:
            self.assertIn(user["privilege_level"], ["standard", "elevated", "administrator"])

        for alert in alerts:
            self.assertTrue(0 <= alert["severity"] <= 100)
            self.assertTrue(0 <= alert["confidence"] <= 100)
            self.assertIn(alert["user_id"], set(user_ids), f"Unknown user_id {alert['user_id']} in alert {alert['alert_id']}")
            self.assertIn(alert["asset_id"], set(asset_ids), f"Unknown asset_id {alert['asset_id']} in alert {alert['alert_id']}")

    def test_dataset_generator_determinism(self):
        dir1 = os.path.join(self.test_dir, "run1")
        dir2 = os.path.join(self.test_dir, "run2")
        
        generate_dataset(seed=42, output_dir=dir1)
        generate_dataset(seed=42, output_dir=dir2)
        
        with open(os.path.join(dir1, "alerts.json"), "r", encoding="utf-8") as f1, \
             open(os.path.join(dir2, "alerts.json"), "r", encoding="utf-8") as f2:
            alerts1 = json.load(f1)
            alerts2 = json.load(f2)
            
        self.assertEqual(alerts1, alerts2, "Generator with same seed produced non-deterministic output!")

if __name__ == "__main__":
    unittest.main()

import unittest
from fastapi.testclient import TestClient
from backend.api.app import app, IncidentDataStore

class TestStep8API(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        IncidentDataStore.get_instance().reload()
        cls.client = TestClient(app)
        cls.sample_id = IncidentDataStore.get_instance().priority_queue[0]["incident_id"]

    # 21. /api/health works
    def test_health_endpoint(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "ok")

    # 22. /api/incidents works
    def test_incidents_list_endpoint(self):
        res = self.client.get("/api/incidents")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("items", data)
        self.assertEqual(data["total"], 111)

    # 23. Pagination works
    def test_pagination(self):
        res = self.client.get("/api/incidents?page=1&page_size=5")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(len(data["items"]), 5)
        self.assertEqual(data["page_size"], 5)

    # 24. Risk-level filtering works
    def test_risk_level_filter(self):
        res = self.client.get("/api/incidents?risk_level=CRITICAL")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        for item in data["items"]:
            self.assertEqual(item["risk_level"], "CRITICAL")

    # 25. Incident type filtering works
    def test_incident_type_filter(self):
        res = self.client.get("/api/incidents?incident_type=Multi-stage")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        for item in data["items"]:
            self.assertIn("Multi-stage", item["incident_type"])

    # 26. Valid incident report endpoint works
    def test_valid_incident_report_endpoint(self):
        res = self.client.get(f"/api/incidents/{self.sample_id}")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["incident"]["incident_id"], self.sample_id)

    # 27. Invalid incident returns 404
    def test_invalid_incident_404(self):
        res = self.client.get("/api/incidents/INC-INVALID-999")
        self.assertEqual(res.status_code, 404)

    # 28. Timeline endpoint works
    def test_timeline_endpoint(self):
        res = self.client.get(f"/api/incidents/{self.sample_id}/timeline")
        self.assertEqual(res.status_code, 200)
        self.assertIsInstance(res.json(), list)

    # 29. Risk endpoint works
    def test_risk_endpoint(self):
        res = self.client.get(f"/api/incidents/{self.sample_id}/risk")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("risk_score", data)

    # 30. Correlations endpoint works
    def test_correlations_endpoint(self):
        res = self.client.get(f"/api/incidents/{self.sample_id}/correlations")
        self.assertEqual(res.status_code, 200)
        self.assertIsInstance(res.json(), list)

    # 31. Recommendations endpoint works
    def test_recommendations_endpoint(self):
        res = self.client.get(f"/api/incidents/{self.sample_id}/recommendations")
        self.assertEqual(res.status_code, 200)
        self.assertIsInstance(res.json(), list)

    # 32. Invalid parameters handled correctly
    def test_invalid_parameters_400(self):
        res1 = self.client.get("/api/incidents?page=0")
        self.assertEqual(res1.status_code, 422) # FastAPI validation error for ge=1

        res2 = self.client.get("/api/incidents?risk_level=INVALID_LEVEL")
        self.assertEqual(res2.status_code, 400)

if __name__ == "__main__":
    unittest.main()

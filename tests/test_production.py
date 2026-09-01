import unittest
from fastapi.testclient import TestClient
from backend.api.app import app
from backend.config import settings

class TestProductionHardening(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_01_health_endpoint(self):
        """Verify GET /api/health returns operational status."""
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "ok")
        self.assertEqual(data["service"], "SentinelIQ")
        self.assertEqual(data["version"], "1.0")

    def test_02_readiness_endpoint(self):
        """Verify GET /api/ready returns ready status and indexed count."""
        response = self.client.get("/api/ready")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "ready")
        self.assertEqual(data["incidents_indexed"], 111)
        self.assertEqual(data["reports_cached"], 111)

    def test_03_pagination_bounding_validation(self):
        """Verify invalid pagination query params return 422/400 Bad Request."""
        # page_size > 100 triggers FastAPI Pydantic 422 validation
        res1 = self.client.get("/api/incidents?page_size=150")
        self.assertEqual(res1.status_code, 422)
        data1 = res1.json()
        self.assertTrue(data1.get("error", False))
        self.assertIn("detail", data1)

        # page < 1 triggers FastAPI Pydantic 422 validation
        res2 = self.client.get("/api/incidents?page=0")
        self.assertEqual(res2.status_code, 422)


    def test_04_formatted_error_response_no_stacktrace(self):
        """Verify 404 response returns clean JSON without stack traces."""
        response = self.client.get("/api/incidents/INC-NONEXISTENT")
        self.assertEqual(response.status_code, 404)
        data = response.json()
        self.assertTrue(data.get("error", False))
        self.assertEqual(data["status_code"], 404)
        self.assertIn("not found", data["detail"])

    def test_05_configuration_settings(self):
        """Verify production configuration settings load cleanly."""
        self.assertEqual(settings.VERSION, "1.0")
        self.assertIn("data", settings.DATA_DIR)
        self.assertTrue(len(settings.cors_origins) > 0)

if __name__ == "__main__":
    unittest.main()

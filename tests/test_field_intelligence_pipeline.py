import tempfile
import unittest
from pathlib import Path
import json

import edge_server

WORKSPACE = Path(__file__).resolve().parent.parent


class TestFieldIntelligencePipeline(unittest.TestCase):
    def setUp(self):
        self.orig_db = edge_server.DATABASE
        self.temp = tempfile.TemporaryDirectory()
        edge_server.DATABASE = Path(self.temp.name) / "kisan_mitra.db"
        edge_server.initialise_database()
        with edge_server.state_lock:
            edge_server.sensor_data_received = True
            edge_server.latest_telemetry = edge_server.normalise_telemetry({})
        self.app = edge_server.app
        self.client = self.app.test_client()

    def tearDown(self):
        edge_server.DATABASE = self.orig_db
        self.temp.cleanup()

    def test_field_intelligence_for_structured_result(self):
        """Field Intelligence must interpret normalized sensor data into a structured result."""
        data = {
            "npk": {"n": 42.0, "p": 18.0, "k": 25.0},
            "moisture": 32.0,
            "ph": 6.8,
            "ec": 1.15,
            "organic_carbon": 0.65,
            "temperature": 25.5,
            "humidity": 68.0,
            "rainfall": 120.0,
        }
        result = edge_server.field_intelligence_for(data)

        # 1. Verification of structured keys
        self.assertIn("fertility", result)
        self.assertIn("crops", result)
        self.assertIn("health", result)
        self.assertIn("alerts", result)
        self.assertIn("recommendation", result)
        self.assertIn("nutrient_interpretation", result)
        self.assertIn("soil_condition", result)
        self.assertIn("soil_condition_detail", result)
        self.assertIn("moisture_interpretation", result)
        self.assertIn("environmental_context", result)
        self.assertIn("attention_items", result)
        self.assertIn("overview", result)
        self.assertIn("recommendations", result)
        self.assertIn("speech", result)
        self.assertIn("inputs", result)

        # 2. Moisture is 32% -> should flag irrigation attention
        self.assertTrue(any("irrigation" in item.lower() for item in result["attention_items"]))
        self.assertIn("critically low", result["moisture_interpretation"].lower())

        # 3. N is 42 (<50) -> should flag nitrogen replenishment
        self.assertTrue(any("nitrogen" in item.lower() for item in result["attention_items"]))

        # 4. Inputs preserved
        self.assertEqual(result["inputs"]["n"], 42.0)
        self.assertEqual(result["inputs"]["moisture"], 32.0)

    def test_field_intelligence_api_endpoint(self):
        """POST /api/models/field_intelligence must analyze sensors, record history & activity."""
        payload = {
            "n": 65,
            "p": 35,
            "k": 40,
            "moisture": 52,
            "ph": 6.7,
            "ec": 0.95,
            "organic_carbon": 0.72,
            "temperature": 24.0,
            "humidity": 60.0,
            "rainfall": 95.0,
        }
        res = self.client.post("/api/models/field_intelligence", json=payload)
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertIn("analysis_id", data)
        self.assertIn("health", data)
        self.assertIn("crops", data)
        self.assertIn("fertility", data)
        self.assertIn("speech", data)

        # Check recorded in analyses database
        analyses_res = self.client.get("/api/analyses")
        self.assertEqual(analyses_res.status_code, 200)
        analyses = analyses_res.get_json()
        latest = next(a for a in analyses if a["id"] == data["analysis_id"])
        self.assertEqual(latest["analysis_type"], "field_intelligence")
        self.assertEqual(latest["input"]["n"], 65.0)
        self.assertIn("health", latest["result"])

        # Check recorded in activity log
        activity_res = self.client.get("/api/activity")
        self.assertEqual(activity_res.status_code, 200)
        activities = activity_res.get_json()
        latest_act = next(a for a in activities if a["analysis_id"] == data["analysis_id"])
        self.assertEqual(latest_act["action"], "field_intelligence")

    def test_current_field_intelligence_get_endpoint(self):
        """GET /api/field_intelligence/current returns interpretation of current telemetry."""
        res = self.client.get("/api/field_intelligence/current")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("fertility", data)
        self.assertIn("crops", data)
        self.assertIn("health", data)
        self.assertIn("nutrient_interpretation", data)

    def test_frontend_wiring(self):
        """Frontend app.js must call /api/models/field_intelligence and have report rendering."""
        js = (WORKSPACE / "frontend" / "js" / "app.js").read_text(encoding="utf-8")
        self.assertIn('api("/api/models/field_intelligence"', js)
        self.assertIn("buildFieldIntelligenceReport", js)
        self.assertIn("renderHistoryFieldIntelligenceDetail", js)


if __name__ == "__main__":
    unittest.main()

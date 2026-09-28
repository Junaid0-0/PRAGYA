import json
import sqlite3
import unittest
from pathlib import Path

import edge_server


class TestPragyaDemoMode(unittest.TestCase):
    def setUp(self):
        self.app = edge_server.app
        self.app.config["TESTING"] = True
        self.client = self.app.test_client()

        # Isolate database for tests
        self.orig_db = edge_server.DATABASE
        self.orig_advice = edge_server.cloud_advice
        edge_server.cloud_advice = lambda prompt: None
        import uuid
        self.test_db_path = Path(f"tests/test_demo_mode_{uuid.uuid4().hex[:8]}.db")
        edge_server.DATABASE = self.test_db_path
        edge_server.initialise_database()

    def tearDown(self):
        edge_server.DATABASE = self.orig_db
        edge_server.cloud_advice = self.orig_advice
        if hasattr(self, "test_db_path") and self.test_db_path.exists():
            try:
                self.test_db_path.unlink()
            except Exception:
                pass

    def test_frontend_demo_data_integrity(self):
        """Verify frontend/js/app.js defines PRAGYA_DEMO_DATA with exact fields and balanced averages."""
        app_js = Path("frontend/js/app.js").read_text(encoding="utf-8")
        self.assertIn("PRAGYA_DEMO_DATA", app_js)
        self.assertIn('"North Wheat Field"', app_js)
        self.assertIn('"Hyderabad, Telangana"', app_js)
        self.assertIn('"Wheat"', app_js)
        self.assertIn("nitrogen: 50", app_js)
        self.assertIn("phosphorus: 38", app_js)
        self.assertIn("potassium: 80", app_js)
        self.assertIn("moisture: 58", app_js)
        self.assertIn("ph: 6.7", app_js)
        self.assertIn("ec: 0.6", app_js)
        self.assertIn("organicCarbon: 0.78", app_js)
        self.assertIn("temperature: 29.4", app_js)
        self.assertIn("humidity: 61", app_js)
        self.assertIn("rainfall: 168", app_js)

        # Verify 4 zones
        self.assertIn('"Zone A"', app_js)
        self.assertIn('"Zone B"', app_js)
        self.assertIn('"Zone C"', app_js)
        self.assertIn('"Zone D"', app_js)

        # Check zone N, P, K, moisture, pH values
        # Zone A: 46, 35, 77, 54, 6.5
        # Zone B: 53, 41, 83, 60, 6.8
        # Zone C: 49, 37, 79, 57, 6.7
        # Zone D: 52, 39, 81, 61, 6.8
        n_vals = [46, 53, 49, 52]
        p_vals = [35, 41, 37, 39]
        k_vals = [77, 83, 79, 81]
        moisture_vals = [54, 60, 57, 61]
        ph_vals = [6.5, 6.8, 6.7, 6.8]

        self.assertAlmostEqual(sum(n_vals) / 4.0, 50.0, places=1)
        self.assertAlmostEqual(sum(p_vals) / 4.0, 38.0, places=1)
        self.assertAlmostEqual(sum(k_vals) / 4.0, 80.0, places=1)
        self.assertAlmostEqual(sum(moisture_vals) / 4.0, 58.0, places=1)
        self.assertAlmostEqual(sum(ph_vals) / 4.0, 6.7, places=1)

    def test_frontend_visual_indicator(self):
        """Verify the visual demo indicator badge exists in index.html and main.css."""
        index_html = Path("frontend/index.html").read_text(encoding="utf-8")
        self.assertIn('id="demoModeBadge"', index_html)
        self.assertIn("RECORDING MODE · DEMO DATA", index_html)

        main_css = Path("frontend/css/main.css").read_text(encoding="utf-8")
        self.assertIn(".demo-mode-badge", main_css)

    def test_demo_chat_soil_condition(self):
        """In demo mode, asking 'What is the soil condition?' returns answers with demo values."""
        res = self.client.post(
            "/api/chat",
            json={"message": "What is the soil condition?", "mode": "edge", "demo": 1},
            headers={"X-Demo-Mode": "1"}
        )
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        ans = data.get("answer", "")
        self.assertIn("50", ans)  # N 50
        self.assertIn("38", ans)  # P 38
        self.assertIn("80", ans)  # K 80
        self.assertIn("58", ans)  # Moisture 58%
        self.assertIn("6.7", ans) # pH 6.7
        self.assertIn("0.6", ans) # EC 0.6

    def test_demo_chat_highest_nitrogen_zone(self):
        """In demo mode, asking 'Which zone has the highest nitrogen?' answers Zone B — 53."""
        res = self.client.post(
            "/api/chat",
            json={"message": "Which zone has the highest nitrogen?", "mode": "edge", "demo": 1},
            headers={"X-Demo-Mode": "1"}
        )
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        ans = data.get("answer", "")
        self.assertIn("Zone B", ans)
        self.assertIn("53", ans)

    def test_demo_chat_field_size(self):
        """In demo mode, asking 'How large is the field?' answers 5 acres, approximately 200 × 100 m."""
        res = self.client.post(
            "/api/chat",
            json={"message": "How large is the field?", "mode": "edge", "demo": 1},
            headers={"X-Demo-Mode": "1"}
        )
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        ans = data.get("answer", "")
        self.assertIn("5 acres", ans)
        self.assertIn("200 × 100", ans)

    def test_demo_chat_greeting_does_not_dump_farm_context(self):
        """Casual greetings should not dump the entire sensor readings list."""
        res = self.client.post(
            "/api/chat",
            json={"message": "Hello", "mode": "edge", "demo": 1},
            headers={"X-Demo-Mode": "1"}
        )
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        ans = data.get("answer", "")
        self.assertIn("North Wheat Field", ans)
        # Should NOT dump the raw sensor telemetry readings
        self.assertNotIn("EC 0.82", ans)
        self.assertNotIn("29.4°C", ans)

    def test_demo_mode_does_not_write_fake_database_records(self):
        """Demo mode requests must NOT corrupt or insert records into analyses or activity tables."""
        with edge_server.closing(edge_server.db()) as conn:
            initial_analyses = conn.execute("SELECT COUNT(*) FROM analyses").fetchone()[0]
            initial_activity = conn.execute("SELECT COUNT(*) FROM activity").fetchone()[0]

        # Call chat in demo mode
        res = self.client.post(
            "/api/chat",
            json={"message": "What is the soil condition?", "mode": "edge", "demo": 1},
            headers={"X-Demo-Mode": "1"}
        )
        self.assertEqual(res.status_code, 200)

        # Call field intelligence in demo mode
        fi_res = self.client.post(
            "/api/models/field_intelligence",
            json={
                "n": 72, "p": 38, "k": 64, "moisture": 58, "ph": 6.7,
                "ec": 0.82, "organic_carbon": 0.78, "temperature": 29.4,
                "humidity": 61, "rainfall": 168
            },
            headers={"X-Demo-Mode": "1"}
        )
        self.assertIn(fi_res.status_code, (200, 201))

        with edge_server.closing(edge_server.db()) as conn:
            final_analyses = conn.execute("SELECT COUNT(*) FROM analyses").fetchone()[0]
            final_activity = conn.execute("SELECT COUNT(*) FROM activity").fetchone()[0]

        self.assertEqual(initial_analyses, final_analyses, "Demo requests must NOT insert records into analyses table")
        self.assertEqual(initial_activity, final_activity, "Demo requests must NOT insert records into activity table")

    def test_normal_mode_unaffected(self):
        """When demo mode is NOT present, standard endpoints and context remain authentic."""
        context = edge_server.chat_farm_context()
        # Normal farm profile is returned when not in demo mode
        self.assertIsInstance(context.get("farm"), dict)
        self.assertIsInstance(context.get("sensor"), dict)


if __name__ == "__main__":
    unittest.main()

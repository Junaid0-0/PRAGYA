import unittest
import tempfile
from pathlib import Path
import edge_server

class TestOverviewDashboard(unittest.TestCase):
    def setUp(self):
        self.orig_db = edge_server.DATABASE
        self.temp = tempfile.TemporaryDirectory()
        edge_server.DATABASE = Path(self.temp.name) / "kisan_mitra.db"
        edge_server.initialise_database()
        self.client = edge_server.app.test_client()

    def tearDown(self):
        edge_server.DATABASE = self.orig_db
        self.temp.cleanup()

    def test_overview_html_structure(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        html = response.data.decode("utf-8")

        # 1. Health card with percentage and status badge
        self.assertIn('class="health-card"', html)
        self.assertIn('id="healthScore"', html)
        self.assertIn('id="healthStatusBadge"', html)
        self.assertIn('id="healthBar"', html)

        # 2. Priority / Mango card completely removed
        self.assertNotIn('id="priorityCard"', html)
        self.assertNotIn("Consider Mango", html)

        # 3. Conditions section completely removed
        self.assertNotIn('class="panel health-panel"', html)

        # 4. Recent activity section completely removed from Overview
        self.assertNotIn('class="panel activity-panel"', html)

        # 5. Weather context bar in snapshot
        self.assertIn('id="weatherContextBar"', html)
        self.assertIn('id="weatherContextText"', html)

        # 6. What needs attention? card
        self.assertIn('id="attentionPanel"', html)
        self.assertIn('id="attentionTitle"', html)
        self.assertIn('id="attentionHeadline"', html)
        self.assertIn('id="attentionDetail"', html)

        # 7. Soil Nutrients (NPK + EC) prominent section
        self.assertIn('id="overviewNutrientsPanel"', html)
        self.assertIn('id="overviewNValue"', html)
        self.assertIn('id="overviewPValue"', html)
        self.assertIn('id="overviewKValue"', html)
        self.assertIn('id="overviewEcValue"', html)
        self.assertIn('id="nRating"', html)
        self.assertIn('id="pRating"', html)
        self.assertIn('id="kRating"', html)
        self.assertIn('id="ecRating"', html)
        self.assertIn('id="nutrientSummaryBox"', html)
        self.assertIn('id="nutrientSummaryText"', html)
        # Exactly one Soil Nutrients section, duplicate bottom card completely removed
        self.assertEqual(html.count('id="overviewSoilTitle"'), 1)
        self.assertNotIn('id="soilTitle"', html)
        self.assertNotIn('class="panel soil-panel"', html)

        # 8. Alerts (renamed from Notices)
        self.assertIn('class="panel alerts-panel"', html)
        self.assertIn('id="alertsTitle"', html)
        self.assertIn('id="noticeList"', html)
        self.assertIn('id="alertsEmptyState"', html)

        # 9. Recommended crops (renamed from Crop Matches)
        self.assertIn('class="panel crops-panel"', html)
        self.assertIn('id="cropTitle"', html)
        self.assertIn('id="cropList"', html)

        # 10. Vertical section ordering: Soil Nutrients -> Field Conditions -> What needs attention? -> Alerts + Crops
        nutrients_pos = html.find('id="overviewNutrientsPanel"')
        conditions_pos = html.find('class="snapshot-card"')
        attention_pos = html.find('id="attentionPanel"')
        alerts_crops_pos = html.find('class="overview-grid"')
        self.assertTrue(
            nutrients_pos < conditions_pos < attention_pos < alerts_crops_pos,
            f"Expected order: nutrients ({nutrients_pos}) < conditions ({conditions_pos}) < attention ({attention_pos}) < alerts_crops ({alerts_crops_pos})"
        )

    def test_farm_health_and_alerts_calculation(self):
        data = {
            "moisture": 42.0,
            "temperature": 27.5,
            "humidity": 65.0,
            "ph": 6.5,
            "rainfall": 100.0,
            "npk": {"n": 35.0, "p": 21.0, "k": 48.0}
        }
        health = edge_server.health_for(data)
        self.assertIsInstance(health["overall"], int)
        self.assertGreaterEqual(health["overall"], 0)
        self.assertLessEqual(health["overall"], 100)

        alerts = edge_server.alerts_for(data)
        # N=35 (<40) and moisture=42 (<45) should produce actual data-driven alerts
        titles = [a["title"] for a in alerts]
        self.assertIn("Soil moisture is low", titles)
        self.assertIn("Nitrogen is low", titles)

    def test_calm_empty_alerts_when_all_healthy(self):
        optimal_data = {
            "moisture": 55.0,
            "temperature": 25.0,
            "humidity": 55.0,
            "ph": 6.5,
            "rainfall": 100.0,
            "npk": {"n": 65.0, "p": 35.0, "k": 40.0}
        }
        alerts = edge_server.alerts_for(optimal_data)
        # No fake alerts generated
        self.assertEqual(len(alerts), 0)

    def test_dynamic_health_calculation_responds_to_data(self):
        optimal = {
            "moisture": 55.0,
            "temperature": 25.0,
            "humidity": 55.0,
            "ph": 6.5,
            "rainfall": 100.0,
            "npk": {"n": 65.0, "p": 35.0, "k": 40.0}
        }
        degraded = {
            "moisture": 20.0,
            "temperature": 39.0,
            "humidity": 85.0,
            "ph": 4.5,
            "rainfall": 10.0,
            "npk": {"n": 10.0, "p": 8.0, "k": 12.0}
        }
        h_opt = edge_server.health_for(optimal)
        h_deg = edge_server.health_for(degraded)
        self.assertGreater(h_opt["overall"], 80)
        self.assertLess(h_deg["overall"], 50)
        # Verifies health score is not permanently hardcoded to 80%
        self.assertNotEqual(h_opt["overall"], h_deg["overall"])

    def test_frontend_overview_logic_implementation(self):
        app_js_path = Path(edge_server.ROOT) / "frontend" / "js" / "app.js"
        with open(app_js_path, "r", encoding="utf-8") as f:
            app_js = f.read()

        # 1. Single Field Data Source
        self.assertIn("function normalizeFieldState(", app_js)
        self.assertIn("FIELD_THRESHOLDS", app_js)

        # 2. Soil Nutrient Logic & Dynamic Summary
        self.assertIn("function classifyNutrient(", app_js)
        self.assertIn("function generateNutrientSummary(", app_js)
        self.assertIn("Your main nutrient requiring attention is", app_js)
        self.assertIn("are currently below their preferred ranges.", app_js)
        self.assertIn("Core soil nutrients are currently within the monitored ranges.", app_js)
        self.assertIn('rating: "high"', app_js)

        css_path = Path(edge_server.ROOT) / "frontend" / "css" / "main.css"
        with open(css_path, "r", encoding="utf-8") as f:
            css = f.read()
        self.assertIn(".npk-rating.rating-high", css)

        # 3. What Needs Attention Logic
        self.assertIn("function evaluateAttention(", app_js)
        self.assertIn("Nothing urgent detected", app_js)
        self.assertIn("Current monitored field conditions are within the configured ranges.", app_js)
        self.assertIn("Low soil moisture — current moisture is below the preferred range.", app_js)
        self.assertIn("Low nitrogen — nitrogen is below the preferred range.", app_js)

        # 4. Alerts Logic
        self.assertIn("function generateAlerts(", app_js)
        self.assertIn("No active field alerts.", app_js)

        # 5. Recommended Crops with Data-Driven Explanations
        self.assertIn("function generateCropExplanation(", app_js)
        self.assertIn("crop-explanation", app_js)
        self.assertIn("suitable based on", app_js)
        self.assertIn("require attention", app_js)

        # 6. Consistency in render pipeline
        self.assertIn("const fieldState = normalizeFieldState(data);", app_js)
        self.assertIn("calculateFieldHealth(fieldState", app_js)
        self.assertIn("generateNutrientSummary(fieldState)", app_js)
        self.assertIn("generateAlerts(fieldState)", app_js)
        self.assertIn("evaluateAttention(fieldState", app_js)
        self.assertIn("renderCrops(fieldState.crops, fieldState)", app_js)


if __name__ == "__main__":
    unittest.main()


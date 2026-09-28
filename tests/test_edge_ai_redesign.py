import unittest
from pathlib import Path
import edge_server

WORKSPACE = Path(__file__).resolve().parent.parent

class TestEdgeAiRedesign(unittest.TestCase):
    def setUp(self):
        self.html = (WORKSPACE / "frontend" / "index.html").read_text(encoding="utf-8")
        self.js = (WORKSPACE / "frontend" / "js" / "app.js").read_text(encoding="utf-8")
        self.css = (WORKSPACE / "frontend" / "css" / "main.css").read_text(encoding="utf-8")

    def test_page_identity(self):
        """Page identity must be EDGE AI with specified tagline, purpose and understated capability indicators."""
        self.assertIn("EDGE AI", self.html)
        self.assertIn("Intelligence that stays in the field.", self.html)
        self.assertIn("Run agricultural analysis locally on the device, even when connectivity is unavailable.", self.html)
        self.assertIn("LOCAL PROCESSING", self.html)
        self.assertIn("OFFLINE CAPABLE", self.html)
        self.assertIn("ON-DEVICE MODELS", self.html)
        self.assertIn("capability-pill", self.html)

    def test_three_capabilities_in_js(self):
        """Must define exactly 3 capabilities with updated IO descriptors."""
        self.assertIn("EDGE_CAPABILITIES", self.js)
        self.assertIn('"disease"', self.js)
        self.assertIn('"pest"', self.js)
        self.assertIn('"field_intelligence"', self.js)

        # Card 01: Disease Detection
        self.assertIn("Disease Detection", self.js)
        self.assertIn("See what the leaf is telling you.", self.js)
        self.assertIn("IMAGE → DISEASE ANALYSIS", self.js)

        # Card 02: Pest Screening
        self.assertIn("Pest Screening", self.js)
        self.assertIn("Find visible threats before they spread.", self.js)
        self.assertIn("IMAGE → PEST ANALYSIS", self.js)

        # Card 03: Field Intelligence
        self.assertIn("Field Intelligence", self.js)
        self.assertIn("Turn soil readings into field decisions.", self.js)
        self.assertIn("SENSORS → FIELD INSIGHT", self.js)

        # Status
        self.assertIn("ON-DEVICE · READY", self.js)

    def test_workflow_presence_and_logic(self):
        """Workflow strip must exist with INPUT -> LOCAL MODEL -> FIELD INSIGHT and dynamic updates."""
        self.assertIn('id="edgeWorkflow"', self.html)
        self.assertIn('id="wfInputVal"', self.html)
        self.assertIn('id="wfModelVal"', self.html)
        self.assertIn('id="wfInsightVal"', self.html)

        # Workflow dynamic logic in JS
        self.assertIn("updateWorkflow", self.js)
        self.assertIn("Leaf Image", self.js)
        self.assertIn("Crop Image", self.js)
        self.assertIn("Field Sensor Data", self.js)
        self.assertIn("Field Intelligence", self.js)
        self.assertIn("Field Overview & Priorities", self.js)

    def test_field_intelligence_ui_structure(self):
        """Field Intelligence must not show image upload and must show structured field readings panel."""
        self.assertIn('id="modelSensorForm"', self.html)
        self.assertIn('field-readings-form', self.html)
        self.assertIn('FIELD READINGS', self.html)
        self.assertIn('live_field_readings', self.html)
        self.assertIn('ANALYZE FIELD', self.html)
        self.assertIn('prominent-analyze-btn', self.html)

        # JS logic verifies Field Intelligence is not an image model
        self.assertIn('const isImageModel = id === "disease" || id === "pest"', self.js)

    def test_field_intelligence_sensor_fields(self):
        """Field Intelligence must combine NPK, pH, EC, organic carbon, moisture, temp, humidity, rainfall."""
        for field in ["n", "p", "k", "ph", "ec", "organic_carbon", "moisture", "temperature", "humidity", "rainfall"]:
            self.assertIn(f'"{field}"', self.js)

    def test_field_intelligence_8_report_sections(self):
        """Field Intelligence result must implement the 8 requested structured sections."""
        sections = [
            "FIELD OVERVIEW",
            "NUTRIENT STATUS",
            "SOIL CONDITION",
            "ENVIRONMENTAL CONTEXT",
            "WHAT NEEDS ATTENTION",
            "FIELD INTERPRETATION",
            "CROP SUITABILITY",
            "RECOMMENDED NEXT STEPS",
        ]
        for sec in sections:
            self.assertIn(sec, self.js)

    def test_card_styling_in_css(self):
        """Styles must include edge card numbering, consistent height, status badge, workflow bar, and field readings."""
        self.assertIn(".edge-model-grid", self.css)
        self.assertIn(".edge-model-card", self.css)
        self.assertIn(".edge-card-num", self.css)
        self.assertIn(".edge-card-badge", self.css)
        self.assertIn(".edge-card-io", self.css)
        self.assertIn(".edge-workflow", self.css)
        self.assertIn(".field-readings-form", self.css)
        self.assertIn(".prominent-analyze-btn", self.css)
        self.assertIn(".fi-report-container", self.css)

    def test_backend_routes_preserved(self):
        """Existing backend endpoints must remain fully operational."""
        client = edge_server.app.test_client()
        self.assertIn("/api/models", [rule.rule for rule in edge_server.app.url_map.iter_rules()])
        self.assertIn("/api/models/crop", [rule.rule for rule in edge_server.app.url_map.iter_rules()])
        self.assertIn("/api/models/soil", [rule.rule for rule in edge_server.app.url_map.iter_rules()])
        self.assertIn("/api/models/analyze", [rule.rule for rule in edge_server.app.url_map.iter_rules()])

if __name__ == "__main__":
    unittest.main()

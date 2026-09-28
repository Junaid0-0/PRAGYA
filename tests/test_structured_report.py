import unittest
import json
import tempfile
from pathlib import Path
from unittest import mock
from io import BytesIO

import edge_server

class TestStructuredAgriculturalReport(unittest.TestCase):
    def setUp(self):
        self.orig_db = edge_server.DATABASE
        self.temp = tempfile.TemporaryDirectory()
        edge_server.DATABASE = Path(self.temp.name) / "kisan_mitra.db"
        edge_server.initialise_database()
        edge_server.app.config["TESTING"] = True
        self.client = edge_server.app.test_client()

    def tearDown(self):
        edge_server.DATABASE = self.orig_db
        self.temp.cleanup()

    def test_parse_valid_json_report(self):
        sample = {
            "section_type": "pest",
            "title": "Red Spider Mite",
            "identification": {
                "label": "Likely Red Spider Mite",
                "confidence": "High",
                "basis": "Visible webbing and stippling on leaf undersides"
            },
            "about": "Red spider mites are tiny arachnids that feed on plant sap.",
            "why_it_occurs": ["Hot, dry weather conditions", "Water-stressed host plants"],
            "crop_damage": ["Yellow stippling on upper leaf surface", "Fine webbing on leaf undersides"],
            "what_to_check": ["Check underside of leaves", "Look for webbing", "Inspect nearby plants"],
            "prevention": ["Avoid plant moisture stress", "Monitor field margins"],
            "control_management": [
                {"step": "Confirm", "action": "Verify mite presence across 5 spots."},
                {"step": "Assess", "action": "Estimate percentage of canopy affected."},
                {"step": "Manage", "action": "Consider registered miticide or neem spray."},
                {"step": "Monitor", "action": "Recheck in 4 days."}
            ],
            "field_summary": {
                "likely_issue": "Red Spider Mite",
                "crop": "Tomato",
                "check_now": "Leaf undersides for webbing",
                "priority": "High",
                "next_step": "Isolate affected plants and scout plot"
            }
        }
        report = edge_server.parse_structured_report(json.dumps(sample), default_type="pest")
        self.assertEqual(report["section_type"], "pest")
        self.assertEqual(report["identification"]["label"], "Likely Red Spider Mite")
        self.assertEqual(len(report["what_to_check"]), 3)
        self.assertEqual(len(report["control_management"]), 4)
        self.assertEqual(report["control_management"][0]["step"], "Confirm")
        self.assertEqual(report["field_summary"]["crop"], "Tomato")

    def test_parse_markdown_wrapped_json(self):
        raw = """```json
{
  "title": "Late Blight",
  "identification": {"label": "Likely Late Blight", "confidence": "0.88"},
  "about": "A serious water mold disease affecting solanaceous crops.",
  "what_to_check": ["Check for dark water-soaked lesions"],
  "field_summary": {"likely_issue": "Late Blight", "crop": "Potato"}
}
```"""
        report = edge_server.parse_structured_report(raw, default_type="disease")
        self.assertEqual(report["title"], "Late Blight")
        self.assertEqual(report["identification"]["confidence"], "88%")
        self.assertIn("Check for dark water-soaked lesions", report["what_to_check"])

    def test_parse_malformed_json_fallback_safe(self):
        broken = "This is not JSON at all: Namaste farmer, your crop has visible leaf spot symptoms."
        report = edge_server.parse_structured_report(broken, default_type="disease")
        self.assertIsInstance(report, dict)
        self.assertIn("identification", report)
        self.assertIn("what_to_check", report)
        self.assertIn("field_summary", report)
        # Never crash
        speech = edge_server.report_to_speech(report)
        self.assertTrue(len(speech) > 0)
        self.assertNotIn("{", speech)

    def test_report_to_speech_logical_order(self):
        report = {
            "title": "Aphids",
            "identification": {"label": "Likely Aphid Infestation", "confidence": "Medium"},
            "about": "Small sap-sucking insects commonly clustered on young shoots.",
            "why_it_occurs": ["Excessive nitrogen fertilization", "Warm spring temperatures"],
            "crop_damage": ["Curled leaves and sticky honeydew"],
            "what_to_check": ["Inspect terminal growing points", "Check for ant activity"],
            "prevention": ["Avoid excessive nitrogen application"],
            "control_management": [
                {"step": "Confirm", "action": "Check 10 random plants."},
                {"step": "Assess", "action": "Determine if beneficial predators are present."},
                {"step": "Manage", "action": "Wash with water spray or soapy water."},
                {"step": "Monitor", "action": "Re-scout in 3 days."}
            ],
            "field_summary": {
                "likely_issue": "Aphids",
                "crop": "Chilli",
                "check_now": "Shoot tips",
                "priority": "Moderate",
                "next_step": "Wash with water spray"
            }
        }
        speech = edge_server.report_to_speech(report)
        self.assertIn("Likely Aphid Infestation", speech)
        self.assertIn("Small sap-sucking insects", speech)
        self.assertIn("Why it occurs:", speech)
        self.assertIn("Crop damage and symptoms:", speech)
        self.assertIn("What to check in the field:", speech)
        self.assertIn("Prevention:", speech)
        self.assertIn("Control and management:", speech)
        self.assertIn("Summary:", speech)
        # Ensure no technical code syntax
        self.assertNotIn("{", speech)
        self.assertNotIn("}", speech)
        self.assertNotIn("```", speech)

    def test_report_to_text_format(self):
        report = {
            "title": "Yellow Rust",
            "identification": {"label": "Likely Stripe Rust", "confidence": "High", "basis": "Linear yellow stripes on leaves"},
            "about": "Fungal pathogen that affects cereal crops.",
            "what_to_check": ["Examine upper leaf blades for yellow powder"],
            "field_summary": {"likely_issue": "Stripe Rust", "crop": "Wheat", "check_now": "Leaf blades", "next_step": "Scout"}
        }
        text = edge_server.report_to_text(report)
        self.assertIn("**Likely Stripe Rust**", text)
        self.assertIn("Visual Evidence: Linear yellow stripes on leaves", text)
        self.assertIn("✓ Examine upper leaf blades", text)

    def test_build_cloud_vision_prompt_hindi(self):
        prompt_en = edge_server.build_cloud_vision_prompt("pest", "What is this?", lang="en")
        self.assertIn("All descriptive text values in the JSON must be in clear, farmer-friendly English", prompt_en)
        self.assertNotIn("HINDI (हिंदी)", prompt_en)

        prompt_hi = edge_server.build_cloud_vision_prompt("pest", "यह क्या है?", lang="hi")
        self.assertIn("HINDI (हिंदी)", prompt_hi)
        self.assertIn("MUST be written in natural, fluent, farmer-friendly Hindi", prompt_hi)
        self.assertIn("The JSON keys MUST remain in English", prompt_hi)
        self.assertIn("Preserve scientific names", prompt_hi)

    def test_report_to_speech_hindi(self):
        sample_hi = {
            "title": "लाल मकड़ी का प्रकोप",
            "identification": {
                "label": "संभावित लाल मकड़ी (Tetranychidae)",
                "confidence": "High",
                "basis": "पत्तियों के निचले हिस्से में बारीक जाला और लाल धब्बे"
            },
            "about": "लाल मकड़ी सूक्ष्म कीट है जो पत्तियों का रस चूसती है।",
            "why_it_occurs": ["गर्म और शुष्क मौसम", "फसल में पानी की कमी"],
            "crop_damage": ["पत्तियों पर पीले या भूरे धब्बे", "पत्तियों का झड़ना"],
            "what_to_check": ["पत्तियों के निचले हिस्से की जांच करें", "बारीक जाले देखें"],
            "prevention": ["खेत में उचित नमी बनाए रखें"],
            "control_management": [
                {"step": "पुष्टि करें", "action": "खेत में कई स्थानों पर जांच करें।"},
                {"step": "आकलन करें", "action": "प्रभावित पत्तियों का प्रतिशत देखें।"},
                {"step": "प्रबंधन करें", "action": "नीम का तेल या अनुशंसित कीटनाशक का प्रयोग करें।"},
                {"step": "निगरानी करें", "action": "4 दिन बाद दोबारा जांच करें।"}
            ],
            "field_summary": {
                "likely_issue": "लाल मकड़ी",
                "crop": "टमाटर",
                "check_now": "पत्तियों के नीचे जाला",
                "priority": "तत्काल जांच",
                "next_step": "प्रभावित पौधों को अलग करें"
            }
        }
        speech = edge_server.report_to_speech(sample_hi, lang="hi")
        self.assertIn("संभावित लाल मकड़ी", speech)
        self.assertIn("यह क्यों होता है:", speech)
        self.assertIn("फसल को नुकसान और लक्षण:", speech)
        self.assertIn("खेत में क्या जाँचना चाहिए:", speech)
        self.assertIn("बचाव के उपाय:", speech)
        self.assertIn("नियंत्रण और प्रबंधन:", speech)
        self.assertIn("खेत सारांश:", speech)
        self.assertNotIn("{", speech)
        self.assertNotIn("```", speech)

    def test_report_to_text_hindi(self):
        sample_hi = {
            "title": "पत्ती का झुलसा रोग",
            "identification": {"label": "संभावित अगेती झुलसा", "basis": "पत्तियों पर गोलाकार छल्लेदार धब्बे"},
            "about": "यह फफूंद जनित रोग है।",
            "what_to_check": ["निचली पत्तियों पर गहरे भूरे धब्बे"],
            "field_summary": {"likely_issue": "अगेती झुलसा", "check_now": "निचली पत्तियां", "next_step": "संक्रमित पत्तियां हटाएं"}
        }
        text = edge_server.report_to_text(sample_hi, lang="hi")
        self.assertIn("**संभावित अगेती झुलसा**", text)
        self.assertIn("दृश्य साक्ष्य: पत्तियों पर गोलाकार छल्लेदार धब्बे", text)
        self.assertIn("परिचय: यह फफूंद जनित रोग है।", text)
        self.assertIn("क्या जांचें:", text)
        self.assertIn("खेत सारांश:", text)

    def test_translate_endpoint_validation(self):
        # Missing report
        res = self.client.post("/api/analyses/translate", json={"target_lang": "hi"})
        self.assertEqual(res.status_code, 400)

        # Invalid target_lang defaults to hi if starts with hi or en
        res = self.client.post("/api/analyses/translate", json={"report": "not a dict", "target_lang": "hi"})
        self.assertEqual(res.status_code, 400)

    @mock.patch.object(edge_server.cloud, "generate_result")
    def test_translate_endpoint_success(self, mock_gen):
        edge_server.cloud.key = "test-key"
        mock_gen.return_value = mock.Mock(text=json.dumps({
            "section_type": "pest",
            "title": "लाल मकड़ी",
            "identification": {"label": "संभावित लाल मकड़ी", "confidence": "High"},
            "about": "यह रस चूसने वाला कीट है।",
            "why_it_occurs": ["शुष्क मौसम"],
            "crop_damage": ["पत्तियों का पीला पड़ना"],
            "what_to_check": ["पत्तियों के नीचे जाला"],
            "prevention": ["पर्याप्त सिंचाई"],
            "control_management": [{"step": "पुष्टि करें", "action": "खेत में जांच करें"}],
            "field_summary": {"likely_issue": "लाल मकड़ी", "crop": "टमाटर"}
        }))

        res = self.client.post("/api/analyses/translate", json={
            "report": {"section_type": "pest", "title": "Red Spider Mite", "about": "A tiny mite."},
            "target_lang": "hi"
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["lang"], "hi")
        self.assertEqual(data["report"]["title"], "लाल मकड़ी")
        self.assertIn("लाल मकड़ी", data["speech"])
        self.assertIn("यह क्यों होता है:", data["speech"])

    def test_tts_endpoint_hindi(self):
        res = self.client.post("/api/tts", json={"text": "किसान मित्र खेत सारांश", "lang": "hi"})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["lang"], "hi")
        self.assertEqual(data["voice_lang"], "hi-IN")
        self.assertEqual(data["text"], "किसान मित्र खेत सारांश")

if __name__ == "__main__":
    unittest.main()

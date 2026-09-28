"""Tests verifying English/Hindi localization flow for PRAGYA AI Analysis, Chatbot, and TTS."""
import os
import sys
import json
import tempfile
import unittest
from pathlib import Path
from io import BytesIO
from unittest import mock

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

import edge_server

class TestLanguageLocalizationFlow(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        red_mite_path = ROOT / "tests" / "fixtures" / "red_spider_mite.jpg"
        assert red_mite_path.exists(), f"Fixture missing: {red_mite_path}"
        cls.red_mite_bytes = red_mite_path.read_bytes()

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

    # Case A: English selected -> full English report
    def test_case_a_english_report(self):
        # We test with mocked Gemini response to test deterministic structure and safety
        sample_report_en = {
            "section_type": "pest",
            "title": "Red Spider Mite Infestation",
            "identification": {
                "label": "Likely Red Spider Mite (Tetranychidae)",
                "confidence": "High",
                "basis": "Tiny reddish oval bodies and fine webbing visible on leaf undersides"
            },
            "about": "Red spider mites are tiny arachnids that pierce plant cells and extract sap.",
            "why_it_occurs": ["Hot and dry environmental conditions", "Foliage dust and water stress"],
            "crop_damage": ["Pale yellow stippling across leaf surfaces", "Fine webbing causing leaf drop"],
            "what_to_check": ["Examine leaf undersides with 10x lens", "Check nearby field margins"],
            "prevention": ["Maintain optimal irrigation", "Avoid broad-spectrum chemical sprays"],
            "control_management": [
                {"step": "Confirm", "action": "Verify pest identity in field."},
                {"step": "Assess", "action": "Estimate percentage of leaves damaged."},
                {"step": "Manage", "action": "Apply registered biological or neem formulation."},
                {"step": "Monitor", "action": "Recheck plot after 4 days."}
            ],
            "field_summary": {
                "likely_issue": "Red Spider Mite",
                "crop": "Tomato",
                "check_now": "Leaf undersides",
                "priority": "Scout today",
                "next_step": "Isolate affected section"
            }
        }
        with mock.patch.object(edge_server.cloud, "generate_result") as mock_gemini:
            mock_gemini.return_value = mock.Mock(model="gemini-3.1-flash-lite", text=json.dumps(sample_report_en))
            res = self.client.post(
                "/api/models/analyze",
                data={
                    "image": (BytesIO(self.red_mite_bytes), "red_spider_mite.jpg"),
                    "type": "pest",
                    "mode": "cloud",
                    "lang": "en"
                },
                content_type="multipart/form-data"
            )
            self.assertEqual(res.status_code, 201)
            data = res.json
            self.assertEqual(data["lang"], "en")
            report = data["report"]
            self.assertEqual(report["title"], "Red Spider Mite Infestation")
            self.assertIn("Why it occurs:", data["speech"])
            self.assertIn("What to check in the field:", data["speech"])
            self.assertIn("Visual Evidence:", data["analysis"])

    # Case B: Switch to Hindi -> translated report via /api/analyses/translate
    def test_case_b_switch_to_hindi(self):
        sample_report_hi = {
            "section_type": "pest",
            "title": "लाल मकड़ी का प्रकोप",
            "identification": {
                "label": "संभावित लाल मकड़ी (Tetranychidae)",
                "confidence": "High",
                "basis": "पत्तियों के निचले हिस्से पर बारीक जाला और लाल धब्बे"
            },
            "about": "लाल मकड़ी एक सूक्ष्म कीट है जो पौधों की कोशिकाओं से रस चूसता है।",
            "why_it_occurs": ["गर्म और शुष्क वातावरण", "फसल में पानी की कमी"],
            "crop_damage": ["पत्तियों पर पीले धब्बे", "पत्तियों का सूखना और गिरना"],
            "what_to_check": ["पत्तियों के नीचे 10x लेंस से देखें", "खेत की सीमाओं की जांच करें"],
            "prevention": ["खेत में पर्याप्त नमी बनाए रखें", "अनावश्यक रासायनिक छिड़काव से बचें"],
            "control_management": [
                {"step": "पुष्टि करें", "action": "खेत में कीट की पहचान सत्यापित करें।"},
                {"step": "आकलन करें", "action": "प्रभावित पत्तियों के प्रतिशत का अनुमान लगाएं।"},
                {"step": "प्रबंधन करें", "action": "नीम का तेल या अनुशंसित माइटिसाइड का प्रयोग करें।"},
                {"step": "निगरानी करें", "action": "4 दिन बाद दोबारा जांच करें।"}
            ],
            "field_summary": {
                "likely_issue": "लाल मकड़ी",
                "crop": "टमाटर",
                "check_now": "पत्तियों का निचला हिस्सा",
                "priority": "आज ही खेत का निरीक्षण करें",
                "next_step": "प्रभावित हिस्से को अलग करें"
            }
        }
        with mock.patch.object(edge_server.cloud, "generate_result") as mock_gemini:
            mock_gemini.return_value = mock.Mock(model="gemini-3.1-flash-lite", text=json.dumps(sample_report_hi))
            res = self.client.post(
                "/api/analyses/translate",
                json={
                    "report": {"section_type": "pest", "title": "Red Spider Mite Infestation"},
                    "target_lang": "hi"
                }
            )
            self.assertEqual(res.status_code, 200)
            data = res.json
            self.assertEqual(data["lang"], "hi")
            self.assertEqual(data["report"]["title"], "लाल मकड़ी का प्रकोप")
            self.assertIn("संभावित लाल मकड़ी", data["speech"])
            self.assertIn("यह क्यों होता है:", data["speech"])
            self.assertIn("नियंत्रण और प्रबंधन:", data["speech"])
            self.assertIn("खेत सारांश:", data["speech"])
            self.assertNotIn("{", data["speech"])

    # Case C: Hindi -> English switch
    def test_case_c_switch_to_english(self):
        sample_report_en = {
            "section_type": "pest",
            "title": "Red Spider Mite Infestation",
            "identification": {"label": "Likely Red Spider Mite (Tetranychidae)"},
            "about": "Red spider mites are tiny arachnids.",
            "why_it_occurs": ["Hot and dry conditions"],
            "crop_damage": ["Yellow stippling"],
            "what_to_check": ["Leaf undersides"],
            "prevention": ["Maintain irrigation"],
            "control_management": [{"step": "Confirm", "action": "Verify mite presence"}],
            "field_summary": {"likely_issue": "Red Spider Mite", "crop": "Tomato"}
        }
        with mock.patch.object(edge_server.cloud, "generate_result") as mock_gemini:
            mock_gemini.return_value = mock.Mock(model="gemini-3.1-flash-lite", text=json.dumps(sample_report_en))
            res = self.client.post(
                "/api/analyses/translate",
                json={
                    "report": {"section_type": "pest", "title": "लाल मकड़ी का प्रकोप"},
                    "target_lang": "en"
                }
            )
            self.assertEqual(res.status_code, 200)
            data = res.json
            self.assertEqual(data["lang"], "en")
            self.assertEqual(data["report"]["title"], "Red Spider Mite Infestation")
            self.assertIn("Why it occurs:", data["speech"])

    # Case D: Chatbot + image + Hindi -> complete Hindi agricultural analysis
    def test_case_d_chatbot_image_hindi(self):
        sample_report_hi = {
            "section_type": "pest",
            "title": "लाल मकड़ी का संक्रमण",
            "identification": {"label": "संभावित लाल मकड़ी (Tetranychidae)", "confidence": "High"},
            "about": "यह रस चूसने वाला सूक्ष्म कीट है।",
            "why_it_occurs": ["गर्म मौसम"],
            "crop_damage": ["पत्तियां पीली होना"],
            "what_to_check": ["पत्तियों के नीचे जाले"],
            "prevention": ["उचित सिंचाई"],
            "control_management": [{"step": "पुष्टि करें", "action": "खेत में जांच करें"}],
            "field_summary": {"likely_issue": "लाल मकड़ी", "crop": "टमाटर"}
        }
        with mock.patch.object(edge_server.cloud, "generate_result") as mock_gemini:
            mock_gemini.return_value = mock.Mock(model="gemini-3.1-flash-lite", text=json.dumps(sample_report_hi))
            res = self.client.post(
                "/api/chat/image",
                data={
                    "image": (BytesIO(self.red_mite_bytes), "red_spider_mite.jpg"),
                    "message": "इस पत्ती पर क्या है?",
                    "mode": "cloud",
                    "lang": "hi"
                },
                content_type="multipart/form-data"
            )
            self.assertEqual(res.status_code, 201)
            data = res.json
            self.assertEqual(data["lang"], "hi")
            self.assertIn("report", data)
            self.assertEqual(data["report"]["title"], "लाल मकड़ी का संक्रमण")
            self.assertIn("दृश्य साक्ष्य" if "दृश्य साक्ष्य" in data["answer"] else "लाल मकड़ी", data["answer"])
            self.assertIn("संभावित लाल मकड़ी", data["speech"])

    # Case E: Chatbot + image + English -> complete English agricultural analysis
    def test_case_e_chatbot_image_english(self):
        sample_report_en = {
            "section_type": "pest",
            "title": "Red Spider Mite Infestation",
            "identification": {"label": "Likely Red Spider Mite (Tetranychidae)"},
            "about": "Tiny sap-feeding mites.",
            "why_it_occurs": ["Dry weather"],
            "crop_damage": ["Yellow stippling"],
            "what_to_check": ["Leaf undersides"],
            "prevention": ["Proper irrigation"],
            "control_management": [{"step": "Confirm", "action": "Inspect foliage"}],
            "field_summary": {"likely_issue": "Red Spider Mite", "crop": "Field crop"}
        }
        with mock.patch.object(edge_server.cloud, "generate_result") as mock_gemini:
            mock_gemini.return_value = mock.Mock(model="gemini-3.1-flash-lite", text=json.dumps(sample_report_en))
            res = self.client.post(
                "/api/chat/image",
                data={
                    "image": (BytesIO(self.red_mite_bytes), "red_spider_mite.jpg"),
                    "message": "What is on this leaf?",
                    "mode": "cloud",
                    "lang": "en"
                },
                content_type="multipart/form-data"
            )
            self.assertEqual(res.status_code, 201)
            data = res.json
            self.assertEqual(data["lang"], "en")
            self.assertIn("report", data)
            self.assertEqual(data["report"]["title"], "Red Spider Mite Infestation")

    # Case F: TTS English
    def test_case_f_tts_english(self):
        res = self.client.post("/api/tts", json={"text": "Likely Red Spider Mite. Why it occurs: Dry weather.", "lang": "en"})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json["voice_lang"], "en-IN")
        self.assertEqual(res.json["lang"], "en")

    # Case G: TTS Hindi
    def test_case_g_tts_hindi(self):
        res = self.client.post("/api/tts", json={"text": "संभावित लाल मकड़ी। यह क्यों होता है: शुष्क मौसम।", "lang": "hi"})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json["voice_lang"], "hi-IN")
        self.assertEqual(res.json["lang"], "hi")

    # Edge AI in Hindi test
    def test_edge_ai_hindi_response(self):
        res = self.client.post(
            "/api/models/analyze",
            data={
                "image": (BytesIO(self.red_mite_bytes), "red_spider_mite.jpg"),
                "type": "pest",
                "mode": "edge",
                "lang": "hi"
            },
            content_type="multipart/form-data"
        )
        self.assertEqual(res.status_code, 201)
        data = res.json
        self.assertEqual(data["mode"], "edge")
        self.assertEqual(data["lang"], "hi")
        self.assertIn("एज एआई", data["title"])
        # Either recognized with hindi text or gracefully not recognized in Hindi
        if data.get("recognized"):
            self.assertIn("पाया गया", data["analysis"])
        else:
            self.assertIn("पहचाना नहीं गया", data["label"])

if __name__ == "__main__":
    unittest.main()

import re
import unittest
from pathlib import Path

WORKSPACE = Path(__file__).resolve().parent.parent

class TestAiEngineArchitecture(unittest.TestCase):
    def setUp(self):
        self.html = (WORKSPACE / "frontend" / "index.html").read_text(encoding="utf-8")
        self.js = (WORKSPACE / "frontend" / "js" / "app.js").read_text(encoding="utf-8")
        self.css = (WORKSPACE / "frontend" / "css" / "main.css").read_text(encoding="utf-8")

    def test_no_ai_mode_toggle_on_models_page(self):
        """AI Models page must NOT contain any AI mode/engine toggle."""
        self.assertNotIn("modeBtnCloud", self.html)
        self.assertNotIn("modeBtnEdge", self.html)
        self.assertNotIn("aiModeTitle", self.html)
        self.assertNotIn("ai-mode-card", self.html)

    def test_no_ai_mode_toggle_on_chat_page(self):
        """Chatbot page must NOT contain any AI mode/engine toggle."""
        self.assertNotIn("chatModeBar", self.html)
        self.assertNotIn("chatModeBtnCloud", self.html)
        self.assertNotIn("chatModeBtnEdge", self.html)

    def test_system_page_has_ai_engine_section(self):
        """System page must contain the AI Engine card with options and status line."""
        self.assertIn('id="aiEngineTitle"', self.html)
        self.assertIn('id="systemEngineBtnCloud"', self.html)
        self.assertIn('id="systemEngineBtnEdge"', self.html)
        self.assertIn('id="systemEngineStatusLine"', self.html)
        self.assertIn('data-i18n="ai_engine_desc"', self.html)
        self.assertIn('data-i18n="cloud_engine_desc"', self.html)
        self.assertIn('data-i18n="edge_engine_desc"', self.html)

    def test_translations_exist(self):
        """English and Hindi translations must exist for the AI Engine card."""
        for key in [
            "ai_engine_title",
            "ai_engine_desc",
            "cloud_engine_desc",
            "edge_engine_desc",
            "current_engine_cloud",
            "current_engine_edge",
        ]:
            self.assertIn(f'{key}:', self.js)

    def test_single_source_of_truth_in_js(self):
        """app.js must maintain aiEngine as the single source of truth."""
        self.assertIn("let aiEngine =", self.js)
        self.assertIn("function getAiEngine()", self.js)
        self.assertIn("function setAiEngine(", self.js)
        self.assertIn("function updateAiEngineUI()", self.js)
        self.assertIn('systemEngineBtnCloud', self.js)
        self.assertIn('systemEngineBtnEdge', self.js)
        self.assertIn('systemEngineStatusLine', self.js)

    def test_persistence_mechanism(self):
        """Storage key must persist across sessions."""
        self.assertIn('localStorage.setItem("kisan_ai_engine"', self.js)

    def test_models_and_chat_read_ai_engine(self):
        """Models page and Chatbot page must read getAiMode/getAiEngine."""
        self.assertIn('form.append("mode", getAiMode());', self.js)
        self.assertIn('const modeSelected = getAiMode();', self.js)

if __name__ == "__main__":
    unittest.main()

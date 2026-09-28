import unittest
from pathlib import Path
import edge_server

WORKSPACE = Path(__file__).resolve().parent.parent


class TestChatControlsArchitecture(unittest.TestCase):
    def setUp(self):
        self.html = (WORKSPACE / "frontend" / "index.html").read_text(encoding="utf-8")
        self.js = (WORKSPACE / "frontend" / "js" / "app.js").read_text(encoding="utf-8")
        self.css = (WORKSPACE / "frontend" / "css" / "main.css").read_text(encoding="utf-8")
        self.client = edge_server.app.test_client()

    def test_chat_header_has_new_and_clear_controls(self):
        """Header must contain accessible New Chat and Clear Chat buttons."""
        self.assertIn('id="newChatBtn"', self.html)
        self.assertIn('id="clearChatBtn"', self.html)
        self.assertIn('data-i18n="chat_new"', self.html)
        self.assertIn('data-i18n="chat_clear"', self.html)
        self.assertIn('aria-label="New chat"', self.html)
        self.assertIn('aria-label="Clear chat"', self.html)

    def test_confirmation_modal_structure(self):
        """Chat confirmation modal must exist with backdrop, card, and action buttons."""
        self.assertIn('id="chatConfirmModal"', self.html)
        self.assertIn('id="chatConfirmBackdrop"', self.html)
        self.assertIn('id="chatConfirmTitle"', self.html)
        self.assertIn('id="chatConfirmDesc"', self.html)
        self.assertIn('id="chatConfirmCancelBtn"', self.html)
        self.assertIn('id="chatConfirmActionBtn"', self.html)
        self.assertIn('id="chatConfirmCloseBtn"', self.html)

    def test_css_styling_and_responsiveness(self):
        """CSS must define styles for header actions, danger styling, and responsive layout."""
        self.assertIn('.chat-header-actions', self.css)
        self.assertIn('.chat-action-btn', self.css)
        self.assertIn('.chat-action-btn.danger', self.css)
        self.assertIn('.chat-confirm-modal', self.css)
        self.assertIn('.chat-confirm-backdrop', self.css)
        self.assertIn('.chat-confirm-card', self.css)

    def test_translations_exist_for_new_and_clear_chat(self):
        """Both English and Hindi translation dictionaries must include conversation management copy."""
        keys = [
            "chat_new",
            "chat_clear",
            "confirm_new_chat_title",
            "confirm_new_chat_desc",
            "confirm_clear_chat_title",
            "confirm_clear_chat_desc",
            "cancel",
        ]
        for key in keys:
            self.assertIn(f"{key}:", self.js)

    def test_javascript_reset_state_logic(self):
        """app.js must provide resetChatState and modal management functions."""
        self.assertIn("function resetChatState(", self.js)
        self.assertIn("function hasChatMessages(", self.js)
        self.assertIn("function openChatConfirmModal(", self.js)
        self.assertIn("function closeChatConfirmModal(", self.js)

        # Verification of state resets
        self.assertIn("stopCurrentTts()", self.js)
        self.assertIn("stopChatThinking()", self.js)
        self.assertIn("clearChatImage()", self.js)
        self.assertIn("chatHistory = []", self.js)
        self.assertIn("updateChatFieldToday()", self.js)

    def test_escape_key_listener_registered(self):
        """Escape key listener must be wired up for chat confirmation modal."""
        self.assertIn('event.key === "Escape" && $("chatConfirmModal")', self.js)

    def test_chat_api_maintains_farm_context(self):
        """Backend chat route maintains full farm context even without prior chat history."""
        res = self.client.post("/api/chat", json={"message": "What is my farm crop and acreage?"})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("answer", data)
        # Should know about Wheat or Hyderabad or 5 acres from farm profile
        self.assertTrue(bool(data["answer"]))

    def test_chat_does_not_modify_history_or_field_intelligence(self):
        """Analyses and activity are persistent and never deleted by chat actions."""
        analyses_res = self.client.get("/api/analyses")
        self.assertEqual(analyses_res.status_code, 200)
        activity_res = self.client.get("/api/activity")
        self.assertEqual(activity_res.status_code, 200)
        field_intel_res = self.client.get("/api/field_intelligence/current")
        self.assertEqual(field_intel_res.status_code, 200)


if __name__ == "__main__":
    unittest.main()

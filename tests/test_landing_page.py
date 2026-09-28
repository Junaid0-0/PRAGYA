import unittest
import tempfile
from pathlib import Path
import edge_server

class TestLandingPage(unittest.TestCase):
    def setUp(self):
        self.orig_db = edge_server.DATABASE
        self.temp = tempfile.TemporaryDirectory()
        edge_server.DATABASE = Path(self.temp.name) / "kisan_mitra.db"
        edge_server.initialise_database()
        self.client = edge_server.app.test_client()

    def tearDown(self):
        edge_server.DATABASE = self.orig_db
        self.temp.cleanup()

    def test_landing_page_html_structure(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        html = response.data.decode("utf-8")

        # 1. Rover hero visual with user-provided field rover image
        self.assertIn('assets/rover_field_hero.jpg', html)
        self.assertIn('class="landing-rover-img"', html)
        self.assertIn('class="landing-rover-frame"', html)

        # 2. Minimal text & identity in header
        self.assertIn("Predictive Robotics for Agricultural Growth &amp; Yield Analytics", html)
        self.assertIn("PRAGYA", html)
        self.assertIn('id="landingLangEn"', html)
        self.assertIn('id="landingLangHi"', html)

        # 3. Minimal left visual anchor and clean CTAs
        self.assertIn('class="landing-hero-eyebrow"', html)
        self.assertIn('class="landing-hero-title"', html)
        self.assertIn("SMART FARMING,", html)
        self.assertIn("BUILT FOR THE FIELD.", html)
        self.assertIn('class="landing-hero-tagline"', html)
        self.assertIn("Sense the field. Understand the crop. Act with confidence.", html)
        self.assertIn('id="landingSignup"', html)
        self.assertIn('id="landingLogin"', html)
        self.assertIn('id="landingNavSignup"', html)
        self.assertIn('id="landingNavLogin"', html)

        # 4. Restored content section and footer
        self.assertIn("From soil sensing to field action.", html)
        self.assertIn("Root-Depth Telemetry", html)
        self.assertIn("Multimodal Onboard Vision", html)
        self.assertIn("Physical Field Action", html)
        self.assertIn("AUTONOMOUS AGRICULTURAL HARDWARE &amp; INTELLIGENCE", html)

        # 5. Clutter and floating hero labels completely removed
        self.assertNotIn("Intelligence<br>for the field.", html)
        self.assertNotIn("AUTONOMOUS FIELD PLATFORM", html)
        self.assertNotIn("ONBOARD EDGE INFERENCE", html)
        self.assertNotIn("SMART FARMING ASSISTANT ROBOT", html)
        self.assertNotIn("OFF-GRID FIELD SENSING & DISPENSING", html)
        self.assertNotIn("feature-cloud", html)
        self.assertNotIn("One farm system, online or offline", html)

        # 6. Initial guest mode & dashboard containment
        self.assertIn('class="guest"', html)
        self.assertIn('id="overviewDashboardContent"', html)
        self.assertIn('class="dashboard-private overview-authenticated"', html)

        # Ensure attentionPanel is inside overviewDashboardContent and NOT in landingPanel
        landing_start = html.find('id="landingPanel"')
        landing_end = html.find('</section>', landing_start)
        landing_html = html[landing_start:landing_end]
        self.assertNotIn("What needs attention?", landing_html)
        self.assertNotIn("attentionPanel", landing_html)

    def test_rover_field_hero_image_asset_served(self):
        response = self.client.get("/assets/rover_field_hero.jpg")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content_type, "image/jpeg")
        self.assertGreater(len(response.data), 100000)

    def test_auth_modal_ui_and_ux(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        html = response.data.decode("utf-8")

        # Auth modal container & card
        self.assertIn('id="authModal"', html)
        self.assertIn('class="auth-card"', html)

        # Clearly visible close button with SVG X icon
        self.assertIn('id="closeAuthBtn"', html)
        self.assertIn('auth-close-btn', html)
        self.assertIn('aria-label="Close"', html)
        self.assertIn('<svg', html)

        # Copy preserved
        self.assertIn('id="authTitle"', html)
        self.assertIn('id="authHelp"', html)
        self.assertIn('id="authSubmitBtn"', html)
        self.assertIn('id="switchAuthBtn"', html)
        self.assertIn('data-i18n="have_account"', html)

        # No password-eye controls
        self.assertNotIn('password-eye', html)
        self.assertNotIn('toggle-password', html)

        # Check app.js for Escape key and backdrop click handlers
        js_response = self.client.get("/js/app.js")
        self.assertEqual(js_response.status_code, 200)
        js_text = js_response.data.decode("utf-8")
        self.assertIn('Escape', js_text)
        self.assertIn('closeAuth()', js_text)

if __name__ == "__main__":
    unittest.main()

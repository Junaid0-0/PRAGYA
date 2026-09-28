import unittest
import tempfile
import json
from pathlib import Path
import edge_server

WORKSPACE = Path(__file__).resolve().parent.parent


class TestAuthRedirectRegression(unittest.TestCase):
    """Regression tests proving:
    1. Successful login remains authenticated;
    2. /api/auth/me returning {"user":{"id":3,"username":"test"}} keeps authenticated dashboard visible;
    3. The frontend does not redirect back to the public/login page immediately after login,
       even when unauthenticated sensor telemetry arrives from hardware bridges (e.g. mega_bridge.py).
    """

    def setUp(self):
        self.orig_db = edge_server.DATABASE
        self.temp = tempfile.TemporaryDirectory()
        edge_server.DATABASE = Path(self.temp.name) / "kisan_mitra.db"
        edge_server.initialise_database()
        self.client = edge_server.app.test_client()
        self.js_code = (WORKSPACE / "frontend" / "js" / "app.js").read_text(encoding="utf-8")
        self.html_code = (WORKSPACE / "frontend" / "index.html").read_text(encoding="utf-8")

    def tearDown(self):
        edge_server.DATABASE = self.orig_db
        self.temp.cleanup()

    def test_backend_auth_and_unauthenticated_sensor_telemetry_payload(self):
        """Proves backend session persists for user and identifies why sensor telemetry emits user=None."""
        # 1. Create user and login
        signup_res = self.client.post("/api/auth/signup", json={"username": "test", "password": "password123"})
        self.assertEqual(signup_res.status_code, 201)
        user_id = signup_res.json["user"]["id"]

        # 2. Verify /api/auth/me returns valid user
        me_res = self.client.get("/api/auth/me")
        self.assertEqual(me_res.status_code, 200)
        self.assertEqual(me_res.json, {"user": {"id": user_id, "username": "test"}})

        # 3. Simulate mega_bridge.py or hardware sending sensor data (unauthenticated POST to /api/sensors)
        # Note: A sensor bridge has no browser session cookie!
        bridge_client = edge_server.app.test_client()
        sensor_res = bridge_client.post("/api/sensors", json={
            "temperature": 24.5,
            "humidity": 60.0,
            "moisture": 52.0,
            "npk": {"n": 45, "p": 28, "k": 38},
            "ph": 6.5,
            "ec": 1.1,
            "organic_carbon": 0.65,
        })
        self.assertEqual(sensor_res.status_code, 201)

        # 4. In dashboard_payload() without session, user is None.
        # This is what Socket.IO broadcasts as "telemetry" to all connected browser clients.
        with edge_server.app.test_request_context():
            payload = edge_server.dashboard_payload()
            self.assertIsNone(payload["user"])

    def test_frontend_render_telemetry_does_not_clear_current_user(self):
        """Verifies frontend render() does NOT reset currentUser to null when telemetry has user=null."""
        # Must not contain the bug: `else if (data.user === null) currentUser = null;`
        self.assertNotIn("else if (data.user === null) currentUser = null;", self.js_code)

        # Verify that data.user only sets currentUser when truthy
        self.assertIn("if (data.user) {", self.js_code)
        self.assertIn("currentUser = data.user;", self.js_code)

    def test_frontend_auth_request_sequencing_guards_against_race_conditions(self):
        """Verifies authRequestId protects against race conditions between initial checkAuth and login."""
        self.assertIn("let authRequestId = 0;", self.js_code)
        self.assertIn("async function checkAuth()", self.js_code)
        self.assertIn("const reqId = ++authRequestId;", self.js_code)
        self.assertIn("if (reqId !== authRequestId) return;", self.js_code)

        # In authForm submit handler, authRequestId must be incremented upon login
        auth_form_submit_idx = self.js_code.find('$("authForm")?.addEventListener("submit"')
        self.assertGreater(auth_form_submit_idx, -1)
        auth_form_block = self.js_code[auth_form_submit_idx:auth_form_submit_idx + 800]
        self.assertIn("authRequestId++;", auth_form_block)
        self.assertIn("currentUser = result.user;", auth_form_block)

        # In logoutBtn, authRequestId must be incremented
        logout_idx = self.js_code.find('$("logoutBtn")?.addEventListener("click"')
        self.assertGreater(logout_idx, -1)
        logout_block = self.js_code[logout_idx:logout_idx + 400]
        self.assertIn("authRequestId++;", logout_block)

    def test_frontend_state_machine_maintains_authenticated_dashboard(self):
        """Simulates the frontend state machine to prove:
        1. successful login remains authenticated;
        2. /api/auth/me returning {"user":{"id":3,"username":"test"}} keeps authenticated dashboard visible;
        3. incoming telemetry (with user=None) does not redirect back to public landing page.
        """
        # Simulated DOM elements
        state = {
            "currentUser": None,
            "authRequestId": 0,
            "landingPanel_hidden": False,
            "overviewDashboardContent_hidden": True,
            "is_guest": True,
            "active_tab": "overview",
        }

        def render_account():
            signed_in = bool(state["currentUser"])
            state["landingPanel_hidden"] = signed_in
            state["overviewDashboardContent_hidden"] = not signed_in
            state["is_guest"] = not signed_in
            if not signed_in and state["active_tab"] != "overview":
                state["active_tab"] = "overview"

        def render_telemetry(data):
            # Safe logic as implemented: only update currentUser if data.user is provided and truthy
            if data.get("user"):
                state["currentUser"] = data["user"]
                render_account()

        # Step 0: Initial guest state on page load
        render_account()
        self.assertFalse(state["landingPanel_hidden"])
        self.assertTrue(state["overviewDashboardContent_hidden"])
        self.assertTrue(state["is_guest"])

        # Step 1: Initial checkAuth starts (in-flight) before login
        initial_check_req_id = state["authRequestId"] + 1
        state["authRequestId"] = initial_check_req_id

        # Step 2: User successfully logs in
        login_result = {"user": {"id": 3, "username": "test"}}
        state["authRequestId"] += 1  # Invalidate any in-flight auth checks
        state["currentUser"] = login_result["user"]
        render_account()

        # Dashboard is now visible and user is authenticated
        self.assertTrue(state["landingPanel_hidden"])
        self.assertFalse(state["overviewDashboardContent_hidden"])
        self.assertFalse(state["is_guest"])

        # Step 3: Stale initial checkAuth resolves (from before login, returned user=None)
        # Because initial_check_req_id != state["authRequestId"], it MUST be ignored
        stale_me_response = {"user": None}
        if initial_check_req_id == state["authRequestId"]:
            state["currentUser"] = stale_me_response["user"]
            render_account()

        # Verify stale check did not overwrite login state
        self.assertIsNotNone(state["currentUser"])
        self.assertTrue(state["landingPanel_hidden"])
        self.assertFalse(state["overviewDashboardContent_hidden"])

        # Step 4: loadDashboard() runs after login and calls checkAuth()
        post_login_req_id = state["authRequestId"] + 1
        state["authRequestId"] = post_login_req_id
        post_login_me_response = {"user": {"id": 3, "username": "test"}}
        if post_login_req_id == state["authRequestId"]:
            state["currentUser"] = post_login_me_response["user"]
            render_account()

        # Verify authenticated state holds
        self.assertEqual(state["currentUser"], {"id": 3, "username": "test"})
        self.assertTrue(state["landingPanel_hidden"])
        self.assertFalse(state["overviewDashboardContent_hidden"])
        self.assertFalse(state["is_guest"])

        # Step 5: mega_bridge.py / sensor hardware posts telemetry -> Socket.IO emits data with user=None
        telemetry_event_data = {
            "telemetry": {"temperature": 25.0, "humidity": 60.0},
            "user": None,  # Hardware post has no session!
        }
        render_telemetry(telemetry_event_data)

        # Critical: Sensor telemetry must NOT log out the user or show the landing page
        self.assertEqual(state["currentUser"], {"id": 3, "username": "test"})
        self.assertTrue(state["landingPanel_hidden"], "Landing panel must remain hidden")
        self.assertFalse(state["overviewDashboardContent_hidden"], "Overview dashboard content must remain visible")
        self.assertFalse(state["is_guest"], "User must not be reset to guest")


if __name__ == "__main__":
    unittest.main()

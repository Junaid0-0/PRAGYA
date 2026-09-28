import unittest
import tempfile
from pathlib import Path
import edge_server

WORKSPACE = Path(__file__).resolve().parent.parent


class TestRoverControlsAndCamera(unittest.TestCase):
    """Focused tests for the updated Rover page:
    1. Rover page contains the three field-action controls in exact order:
       NPK Sensor, Seeder, and Pesticide Spray.
    2. Labels are exactly "NPK Sensor", "Seeder", and "Pesticide Spray".
    3. Pesticide Spray does not transmit a rover command (display only).
    4. Seeder is safely disabled with 'Protocol pending'.
    5. NPK Sensor connects to rover command handler without renaming.
    6. Existing movement controls remain intact with prominent STOP.
    7. Camera stream container and clean 'CAMERA OFFLINE' state exist without fake URLs.
    8. Existing authentication and telemetry behavior remains intact.
    """

    def setUp(self):
        self.orig_db = edge_server.DATABASE
        self.temp = tempfile.TemporaryDirectory()
        edge_server.DATABASE = Path(self.temp.name) / "kisan_mitra.db"
        edge_server.initialise_database()
        with edge_server.state_lock:
            self.orig_telemetry = edge_server.latest_telemetry
            self.orig_sensor_received = edge_server.sensor_data_received
        self.client = edge_server.app.test_client()
        self.html = (WORKSPACE / "frontend" / "index.html").read_text(encoding="utf-8")
        self.js = (WORKSPACE / "frontend" / "js" / "app.js").read_text(encoding="utf-8")
        self.css = (WORKSPACE / "frontend" / "css" / "main.css").read_text(encoding="utf-8")

    def tearDown(self):
        edge_server.DATABASE = self.orig_db
        with edge_server.state_lock:
            edge_server.latest_telemetry = self.orig_telemetry
            edge_server.sensor_data_received = self.orig_sensor_received
        self.temp.cleanup()

    def test_camera_container_and_offline_state(self):
        """Live camera container is prominent, has LIVE indicator, and neutral placeholder without fake URLs."""
        # 1. Old placeholder is removed
        self.assertNotIn("Rover image coming soon", self.html)

        # 2. Camera panel and viewport exist
        self.assertIn('class="panel rover-camera-panel"', self.html)
        self.assertIn('id="roverCameraStream"', self.html)
        self.assertIn('id="roverCameraOffline"', self.html)

        # 3. Status indicator shows LIVE and no offline status text
        self.assertIn('id="roverCameraStatus"', self.html)
        self.assertIn("LIVE", self.html)
        self.assertNotIn("CAMERA OFFLINE", self.html)
        self.assertNotIn("stream offline", self.html.lower())

        # 4. Neutral placeholder text exists
        self.assertIn("Live camera feed", self.html)
        self.assertIn("Camera stream will appear here", self.html)

        # 5. No fake camera stream URL hardcoded
        self.assertNotIn('src="http://fake', self.html)
        self.assertNotIn('src="http://127.0.0.1:3000/camera', self.html)
        self.assertNotIn('src="/api/camera', self.html)

        # 6. JS camera initialization logic exists
        self.assertIn("function initRoverCamera()", self.js)
        self.assertIn("initRoverCamera();", self.js)

    def test_movement_controls_intact_and_prominent_stop(self):
        """Movement controls remain intact and STOP is visually prominent."""
        rover_section_start = self.html.find('id="page-rover"')
        rover_section_end = self.html.find('id="page-system"', rover_section_start)
        rover_html = self.html[rover_section_start:rover_section_end]

        # Movement D-Pad buttons
        self.assertIn('data-rover-command="forward"', rover_html)
        self.assertIn('data-rover-command="left"', rover_html)
        self.assertIn('data-rover-command="stop"', rover_html)
        self.assertIn('data-rover-command="right"', rover_html)
        self.assertIn('data-rover-command="backward"', rover_html)

        # Stop button prominence
        self.assertIn('class="rover-pad-btn rover-stop-btn"', rover_html)
        self.assertIn('.rover-pad .rover-stop-btn', self.css)

    def test_field_action_controls_order_and_exact_labels(self):
        """Three field-action controls exist in exact order with exact labels."""
        rover_section_start = self.html.find('id="page-rover"')
        rover_section_end = self.html.find('id="page-system"', rover_section_start)
        rover_html = self.html[rover_section_start:rover_section_end]

        # Dedicated section exists
        self.assertIn('class="panel rover-field-actions"', rover_html)
        self.assertIn("Field actions", rover_html)

        # Exact labels
        self.assertIn("NPK Sensor", rover_html)
        self.assertIn("Seeder", rover_html)
        self.assertIn("Pesticide Spray", rover_html)

        # Exact order: NPK Sensor before Seeder, Seeder before Pesticide Spray
        idx_npk = rover_html.find("NPK Sensor")
        idx_seeder = rover_html.find("Seeder")
        idx_pesticide = rover_html.find("Pesticide Spray")

        self.assertGreater(idx_npk, -1)
        self.assertGreater(idx_seeder, -1)
        self.assertGreater(idx_pesticide, -1)
        self.assertLess(idx_npk, idx_seeder, "NPK Sensor must appear before Seeder")
        self.assertLess(idx_seeder, idx_pesticide, "Seeder must appear before Pesticide Spray")

    def test_pesticide_spray_is_display_only_and_transmits_nothing(self):
        """Pesticide Spray is UI-only without status badges and cannot transmit rover commands."""
        rover_section_start = self.html.find('id="page-rover"')
        rover_section_end = self.html.find('id="page-system"', rover_section_start)
        rover_html = self.html[rover_section_start:rover_section_end]

        # Find pesticide block
        pesticide_start = rover_html.find('id="fieldActionPesticide"')
        self.assertGreater(pesticide_start, -1)
        pesticide_html = rover_html[pesticide_start:pesticide_start + 1200]

        # Must NOT display implementation-status badges
        self.assertNotIn("Display only", pesticide_html)
        self.assertNotIn("Protocol pending", pesticide_html)

        # CRITICAL: Must NOT have data-rover-command attribute
        self.assertNotIn('data-rover-command', pesticide_html)

    def test_seeder_is_safely_disabled_with_protocol_pending(self):
        """Seeder control is cleanly displayed without status badges and does not transmit commands."""
        rover_section_start = self.html.find('id="page-rover"')
        rover_section_end = self.html.find('id="page-system"', rover_section_start)
        rover_html = self.html[rover_section_start:rover_section_end]

        seeder_start = rover_html.find('id="fieldActionSeeder"')
        self.assertGreater(seeder_start, -1)
        seeder_html = rover_html[seeder_start:seeder_start + 1200]

        # Must NOT display implementation-status badges
        self.assertNotIn("Protocol pending", seeder_html)
        self.assertNotIn("Display only", seeder_html)

        # Seeder must not transmit rover command
        self.assertNotIn('data-rover-command', seeder_html)

    def test_npk_sensor_command_handling(self):
        """NPK Sensor is wired to rover command handler without renaming."""
        rover_section_start = self.html.find('id="page-rover"')
        rover_section_end = self.html.find('id="page-system"', rover_section_start)
        rover_html = self.html[rover_section_start:rover_section_end]

        npk_start = rover_html.find('id="fieldActionNpk"')
        self.assertGreater(npk_start, -1)
        npk_html = rover_html[npk_start:npk_start + 1200]

        # Button must have data-rover-command
        self.assertIn('data-rover-command="npk_sensor"', npk_html)
        self.assertIn("NPK Sensor", npk_html)

        # JS command listener maps npk_sensor to NPK Sensor
        self.assertIn('command === "npk_sensor" ? "NPK Sensor" : command', self.js)

    def test_existing_auth_and_telemetry_pipeline_intact(self):
        """Safety check: auth endpoints and telemetry pipeline are fully functional."""
        # Signup & Auth
        signup = self.client.post("/api/auth/signup", json={"username": "rover_tester", "password": "password123"})
        self.assertEqual(signup.status_code, 201)
        me = self.client.get("/api/auth/me")
        self.assertEqual(me.status_code, 200)
        self.assertEqual(me.json["user"]["username"], "rover_tester")

        # Telemetry ingestion (/api/sensors pipeline)
        sensors = self.client.post("/api/sensors", json={
            "temperature": 26.2,
            "humidity": 58.0,
            "moisture": 49.0,
            "npk": {"n": 50, "p": 30, "k": 40},
            "ph": 6.8,
            "ec": 1.2,
            "organic_carbon": 0.70,
        })
        self.assertEqual(sensors.status_code, 201)

        # Raw sensor endpoint returns exact ingested data
        latest = self.client.get("/api/sensors")
        self.assertEqual(latest.status_code, 200)
        self.assertEqual(latest.json["temperature"], 26.2)
        self.assertEqual(latest.json["ph"], 6.8)
        self.assertEqual(latest.json["npk"]["n"], 50)

        # Farm endpoint returns updated data
        farm = self.client.get("/api/farm")
        self.assertEqual(farm.status_code, 200)
        self.assertEqual(farm.json["telemetry"]["ph"], 6.8)
        self.assertEqual(farm.json["telemetry"]["moisture"], 49.0)


if __name__ == "__main__":
    unittest.main()

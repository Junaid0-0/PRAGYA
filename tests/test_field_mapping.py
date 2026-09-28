import unittest
import tempfile
import json
from pathlib import Path
import edge_server
import field_service

WORKSPACE = Path(__file__).resolve().parent.parent


class TestFieldMapping(unittest.TestCase):
    """Comprehensive tests for PRAGYA Field Mapping:
    1. Mapping navigation exists and is placed logically near Rover/History.
    2. Mapping page renders with correct header, eyebrow, and supporting text.
    3. Field setup panel supports name, location, crop, area, length, width.
    4. Unit conversions work accurately (acres <-> hectares, metres <-> feet).
    5. Geometry calculations work for both rectangular dimensions and polygon boundary.
    6. Authoritative polygon calculation uses Shoelace formula and Euclidean perimeter.
    7. Field geometry, zones, and details can be stored via API.
    8. Existing farm data remains compatible (two-way sync between fields and farm_profile).
    9. Map layers architecture is future-ready without fabricating fake rover GPS or map data.
    10. Existing telemetry and Overview APIs remain intact and functional.
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

    # -------------------------------------------------------------------------
    # 1. Navigation & Page Rendering
    # -------------------------------------------------------------------------
    def test_mapping_navigation_exists_and_positioned_near_rover(self):
        """Sidebar includes Mapping navigation near Rover and History."""
        self.assertIn('data-tab="mapping"', self.html)
        self.assertIn('id="tab-mapping"', self.html)
        self.assertIn('data-i18n="nav_mapping"', self.html)

        rover_pos = self.html.find('data-tab="rover"')
        mapping_pos = self.html.find('data-tab="mapping"')
        history_pos = self.html.find('data-tab="history"')

        self.assertTrue(rover_pos != -1 and mapping_pos != -1 and history_pos != -1)
        self.assertTrue(rover_pos < mapping_pos < history_pos, "Mapping should be placed between Rover and History")

    def test_mapping_page_renders_with_professional_copy(self):
        """Mapping page has proper title, eyebrow, and supporting text."""
        self.assertIn('id="page-mapping"', self.html)
        self.assertIn('FIELD INTELLIGENCE', self.html)
        self.assertIn('Field mapping', self.html)
        self.assertIn('Build a spatial model of your field for sensing, scouting and rover operations.', self.html)

    def test_field_setup_and_summary_elements_present(self):
        """Field details form, zones panel, map layers, and summary cards are in DOM."""
        # Field Details Form Elements
        self.assertIn('id="mapFieldName"', self.html)
        self.assertIn('id="mapFieldLocation"', self.html)
        self.assertIn('id="mapFieldCrop"', self.html)
        self.assertIn('id="mapFieldArea"', self.html)
        self.assertIn('id="mapAreaUnit"', self.html)
        self.assertIn('id="mapFieldLength"', self.html)
        self.assertIn('id="mapFieldWidth"', self.html)
        self.assertIn('id="mapDimensionUnit"', self.html)

        # Geometry mode toggles
        self.assertIn('id="geomModeDimensionsBtn"', self.html)
        self.assertIn('id="geomModePolygonBtn"', self.html)

        # Map layers panel is completely removed
        self.assertNotIn('id="mapLayersPanel"', self.html)
        self.assertNotIn('layerBoundaryToggle', self.html)

        # Zones panel and automatic controls (manual text input is removed)
        self.assertIn('id="fieldZonesList"', self.html)
        self.assertIn('id="addZoneBtn"', self.html)
        self.assertNotIn('id="newZoneName"', self.html)

        # Field summary
        self.assertIn('id="summaryArea"', self.html)
        self.assertIn('id="summaryPerimeter"', self.html)
        self.assertIn('id="summaryDimensions"', self.html)
        self.assertIn('id="summaryLocation"', self.html)
        self.assertIn('id="summaryCrop"', self.html)

    # -------------------------------------------------------------------------
    # 2. Conversions & Mathematical Calculations
    # -------------------------------------------------------------------------
    def test_area_conversion_acres_and_hectares(self):
        """Acres <-> Hectares conversion works accurately."""
        # 1 acre = 0.40468564224 hectares
        ha = field_service.convert_area(5.0, "acres", "hectares")
        self.assertAlmostEqual(ha, 2.0234, places=2)

        # 2.0234 hectares = 5.0 acres
        acres = field_service.convert_area(ha, "hectares", "acres")
        self.assertAlmostEqual(acres, 5.0, places=2)

    def test_dimension_conversion_metres_and_feet(self):
        """Metres <-> Feet conversion works accurately."""
        # 100 m = 328.084 ft
        ft = field_service.convert_dimension(100.0, "metres", "feet")
        self.assertAlmostEqual(ft, 328.084, places=1)

        # 328.084 ft = 100 m
        m = field_service.convert_dimension(ft, "feet", "metres")
        self.assertAlmostEqual(m, 100.0, places=1)

    def test_rectangular_dimension_calculation(self):
        """200m x 100m rectangle calculates correct area and perimeter."""
        # 200 m * 100 m = 20,000 sq m
        # 20,000 sq m / 4046.85642 = ~4.942 acres
        stats_acres = field_service.calculate_rectangle(200.0, 100.0, "metres", "acres")
        self.assertAlmostEqual(stats_acres["area"], 4.94, places=1)
        self.assertEqual(stats_acres["perimeter"], 600.0)  # 2*(200+100) = 600 m
        self.assertEqual(len(stats_acres["coordinates"]), 4)

        # Test with hectares
        stats_ha = field_service.calculate_rectangle(200.0, 100.0, "metres", "hectares")
        self.assertAlmostEqual(stats_ha["area"], 2.0, places=2)  # 20,000 sq m = 2.0 ha

    def test_polygon_shoelace_area_and_euclidean_perimeter(self):
        """Arbitrary polygon calculates exact Shoelace area and Euclidean perimeter."""
        # A right-angled triangle (0,0), (300,0), (0,400)
        # Area = 0.5 * 300 * 400 = 60,000 sq m
        # Perimeter = 300 + 400 + 500 = 1200 m
        triangle_pts = [[0, 0], [300, 0], [0, 400]]
        stats = field_service.calculate_polygon_geometry(triangle_pts, "metres", "hectares")
        self.assertAlmostEqual(stats["area"], 6.0, places=2)  # 60,000 sq m = 6.0 ha
        self.assertAlmostEqual(stats["perimeter"], 1200.0, places=1)
        self.assertAlmostEqual(stats["length"], 400.0, places=1)
        self.assertAlmostEqual(stats["width"], 300.0, places=1)

    # -------------------------------------------------------------------------
    # 3. Field Storage & Backward Compatibility
    # -------------------------------------------------------------------------
    def test_get_field_endpoint_returns_initial_field(self):
        """GET /api/field returns an active field populated from initial seed/profile."""
        res = self.client.get("/api/field")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("field", data)
        field = data["field"]
        self.assertIn("name", field)
        self.assertIn("location", field)
        self.assertIn("crop", field)
        self.assertIn("area", field)
        self.assertIn("geometry", field)
        self.assertIn("zones", field)

    def test_post_field_stores_data_and_syncs_farm_profile(self):
        """POST /api/field saves field and synchronizes with farm_profile."""
        payload = {
            "name": "North Wheat Field",
            "location": "Hyderabad, Telangana",
            "crop": "Wheat",
            "area": 5.0,
            "area_unit": "acres",
            "length": 200.0,
            "width": 100.0,
            "dimension_unit": "metres",
            "perimeter": 600.0,
            "geometry": {
                "type": "Polygon",
                "coordinates": [[0, 0], [200, 0], [200, 100], [0, 100]]
            },
            "zones": [
                {"id": "zone-a", "name": "Zone A", "crop": "Wheat", "description": "High moisture block"}
            ]
        }
        res = self.client.post("/api/field", json=payload)
        self.assertEqual(res.status_code, 200)
        res_data = res.get_json()
        self.assertTrue(res_data.get("ok"))
        self.assertEqual(res_data["field"]["name"], "North Wheat Field")
        self.assertEqual(res_data["field"]["crop"], "Wheat")
        self.assertAlmostEqual(res_data["field"]["area"], 4.94, places=1)

        # Verify farm_profile was synchronized
        prof_res = self.client.get("/api/profile")
        self.assertEqual(prof_res.status_code, 200)
        farm_prof = prof_res.get_json()["farm"]
        self.assertEqual(farm_prof["name"], "North Wheat Field")
        self.assertEqual(farm_prof["crop"], "Wheat")
        self.assertEqual(farm_prof["location"], "Hyderabad, Telangana")
        self.assertAlmostEqual(farm_prof["acreage"], 4.94, places=1)

    def test_update_profile_syncs_to_active_field(self):
        """Updating farm profile via POST /api/profile syncs to the active field."""
        prof_payload = {
            "name": "South Rice Paddies",
            "location": "Warangal, Telangana",
            "crop": "Rice",
            "acreage": 8.5
        }
        res = self.client.post("/api/profile", json=prof_payload)
        self.assertEqual(res.status_code, 200)

        # Field endpoint reflects the profile changes
        field_res = self.client.get("/api/field")
        field = field_res.get_json()["field"]
        self.assertEqual(field["name"], "South Rice Paddies")
        self.assertEqual(field["crop"], "Rice")
        self.assertEqual(field["location"], "Warangal, Telangana")
        self.assertEqual(field["area"], 8.5)

    def test_polygon_geometry_authoritative_preservation(self):
        """User-drawn polygon is stored and not overwritten by a simple rectangle."""
        custom_polygon = [
            [10, 10], [180, 20], [210, 95], [120, 140], [30, 110]
        ]
        payload = {
            "name": "Irregular Boundary Field",
            "location": "Guntur, Andhra Pradesh",
            "crop": "Cotton",
            "geometry": {
                "type": "Polygon",
                "coordinates": custom_polygon
            },
            "dimension_unit": "metres",
            "area_unit": "acres"
        }
        res = self.client.post("/api/field", json=payload)
        self.assertEqual(res.status_code, 200)
        saved = res.get_json()["field"]
        self.assertEqual(saved["geometry"]["type"], "Polygon")
        self.assertEqual(len(saved["geometry"]["coordinates"]), 5)
        self.assertEqual(saved["geometry"]["coordinates"], custom_polygon)

    # -------------------------------------------------------------------------
    # 4. Calculation API Endpoint
    # -------------------------------------------------------------------------
    def test_api_field_calculate_endpoint(self):
        """POST /api/field/calculate provides server-side geometric calculations."""
        # Rectangle calculation
        req_rect = {
            "type": "rectangle",
            "length": 150.0,
            "width": 75.0,
            "dimension_unit": "metres",
            "area_unit": "acres"
        }
        res = self.client.post("/api/field/calculate", json=req_rect)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["perimeter"], 450.0)
        self.assertAlmostEqual(data["area"], 2.78, places=1)

        # Polygon calculation
        req_poly = {
            "type": "polygon",
            "coordinates": [[0, 0], [100, 0], [100, 100], [0, 100]],
            "dimension_unit": "metres",
            "area_unit": "hectares"
        }
        res = self.client.post("/api/field/calculate", json=req_poly)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["perimeter"], 400.0)
        self.assertAlmostEqual(data["area"], 1.0, places=2)  # 10,000 sq m = 1 ha

    # -------------------------------------------------------------------------
    # 5. Map Layers & Zero Fabrication
    # -------------------------------------------------------------------------
    def test_map_layers_are_future_ready_and_unfabricated(self):
        """GET /api/field/layers returns layers without fabricated GPS, rover or heatmap data."""
        res = self.client.get("/api/field/layers")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("layers", data)
        layers = {l["id"]: l for l in data["layers"]}

        # Field boundary is active
        self.assertTrue(layers["field_boundary"]["active"])

        # Rover & Sensor layers are future-ready and NOT active
        future_layer_keys = [
            "rover_position", "rover_path", "soil_moisture",
            "nitrogen", "phosphorus", "potassium", "ph", "ec",
            "disease_detections", "pest_detections", "sampling_points"
        ]
        for key in future_layer_keys:
            self.assertIn(key, layers, f"Layer {key} should exist in layers list")
            self.assertFalse(layers[key]["active"], f"Layer {key} must not be marked active without live data")
            self.assertEqual(layers[key]["status"], "future-ready")

        # Telemetry points table has no fake data
        self.assertEqual(data["point_count"], 0)

    # -------------------------------------------------------------------------
    # 6. Existing Dashboard & Telemetry Integrity
    # -------------------------------------------------------------------------
    def test_dashboard_payload_includes_field_without_breaking_overview(self):
        """GET /api/dashboard contains farm, telemetry, metrics, and new field model."""
        res = self.client.get("/api/dashboard")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()

        # Existing Overview fields exist
        self.assertIn("farm", data)
        self.assertIn("telemetry", data)
        self.assertIn("edge", data)
        self.assertIn("health", data)

        # Field model is seamlessly attached
        self.assertIn("field", data)
        self.assertIsInstance(data["field"], dict)
        self.assertIn("name", data["field"])
        self.assertIn("geometry", data["field"])

    # -------------------------------------------------------------------------
    # 7. Automatic Zone Grid Partitions & Sequential Naming
    # -------------------------------------------------------------------------
    def test_automatic_grid_partition_dimensions(self):
        """Grid calculation selects optimal rows x cols matching precision agriculture specs."""
        expected_grids = {
            1: (1, 1),
            2: (1, 2),
            3: (1, 3),
            4: (2, 2),
            5: (2, 3),
            6: (2, 3),
            7: (3, 3),
            8: (3, 3),
            9: (3, 3),
            10: (3, 4)
        }
        for n, expected in expected_grids.items():
            actual = field_service.compute_grid_dimensions(n)
            self.assertEqual(actual, expected, f"Failed for {n} zones: got {actual}, expected {expected}")

    def test_zone_naming_and_sequential_renumbering(self):
        """Zones are named sequentially alphabetically (Zone A, Zone B... Zone Z, Zone AA)."""
        self.assertEqual(field_service.get_zone_name(0), "Zone A")
        self.assertEqual(field_service.get_zone_name(1), "Zone B")
        self.assertEqual(field_service.get_zone_name(2), "Zone C")
        self.assertEqual(field_service.get_zone_name(3), "Zone D")
        self.assertEqual(field_service.get_zone_name(25), "Zone Z")
        self.assertEqual(field_service.get_zone_name(26), "Zone AA")

    def test_equal_area_zone_partitions_geometry(self):
        """Field rectangle partitions into equivalent equal-area grid cells."""
        rect_coords = [[0, 0], [200, 0], [200, 100], [0, 100]]

        # 4 zones -> 2 rows x 2 cols (each 100m x 50m)
        parts_4 = field_service.partition_zone_grid(rect_coords, 4)
        self.assertEqual(len(parts_4), 4)
        self.assertEqual(parts_4[0]["name"], "Zone A")
        self.assertEqual(parts_4[3]["name"], "Zone D")
        for p in parts_4:
            self.assertAlmostEqual(p["width"], 100.0)
            self.assertAlmostEqual(p["height"], 50.0)

        # 6 zones -> 2 rows x 3 cols (each 66.67m x 50m)
        parts_6 = field_service.partition_zone_grid(rect_coords, 6)
        self.assertEqual(len(parts_6), 6)
        self.assertEqual(parts_6[0]["name"], "Zone A")
        self.assertEqual(parts_6[5]["name"], "Zone F")
        for p in parts_6:
            self.assertAlmostEqual(p["width"], 66.67, places=1)
            self.assertAlmostEqual(p["height"], 50.0, places=1)

    # -------------------------------------------------------------------------
    # 8. Map Zoom Optimization & Full Visual Hierarchy
    # -------------------------------------------------------------------------
    def test_default_map_zoom_reduced_by_two_steps(self):
        """Default map zoom is reduced by exactly two zoom-out steps (1.25^2 = 1.5625 factor)."""
        self.assertIn("resetToDefaultView", self.js)
        self.assertIn("fitZoom / 1.5625", self.js)
        self.assertIn('$("mapResetViewBtn")?.addEventListener("click", resetToDefaultView);', self.js)
        self.assertIn('$("mapFitBtn")?.addEventListener("click", fitToField);', self.js)

    # -------------------------------------------------------------------------
    # 9. Soil Nutrient Heatmap Specifications
    # -------------------------------------------------------------------------
    def test_soil_nutrient_heatmap_structure_and_selectors(self):
        """Heatmap section is located below field summary with tabs for N, P, and K."""
        self.assertIn('id="soilHeatmapSection"', self.html)
        self.assertIn('Soil Nutrient Heatmap', self.html)
        self.assertIn('Spatial estimate of nutrient distribution across the field', self.html)
        self.assertIn('id="nutrientTabN"', self.html)
        self.assertIn('id="nutrientTabP"', self.html)
        self.assertIn('id="nutrientTabK"', self.html)
        self.assertIn('id="fieldHeatmapSvg"', self.html)
        self.assertIn('id="heatmapClipPolygon"', self.html)
        self.assertIn('id="heatmapInterpolationImage"', self.html)
        self.assertIn('heatmap-gradient-bar', self.html)
        self.assertIn('id="heatmapScaleLow"', self.html)
        self.assertIn('id="heatmapScaleMed"', self.html)
        self.assertIn('id="heatmapScaleHigh"', self.html)

        # Verification of disclaimer / model labeling
        self.assertIn('Spatial model estimate for scouting planning', self.html)

        # Heatmap appears AFTER the summary panel
        summary_idx = self.html.find('mapping-summary-panel')
        heatmap_idx = self.html.find('mapping-heatmap-panel')
        self.assertTrue(summary_idx != -1 and heatmap_idx != -1)
        self.assertTrue(summary_idx < heatmap_idx, "Heatmap section must be placed below field summary")

    def test_zone_nutrient_deterministic_benchmarks(self):
        """Nutrient benchmarks match specification for initial zones and crop."""
        # Zone A (0): N 82, P 46, K 71
        self.assertEqual(field_service.get_zone_nutrient_value(0, "N"), 82.0)
        self.assertEqual(field_service.get_zone_nutrient_value(0, "P"), 46.0)
        self.assertEqual(field_service.get_zone_nutrient_value(0, "K"), 71.0)

        # Zone B (1): N 120, P 62, K 54
        self.assertEqual(field_service.get_zone_nutrient_value(1, "N"), 120.0)
        self.assertEqual(field_service.get_zone_nutrient_value(1, "P"), 62.0)
        self.assertEqual(field_service.get_zone_nutrient_value(1, "K"), 54.0)

        # Zone C (2): N 45, P 28, K 39
        self.assertEqual(field_service.get_zone_nutrient_value(2, "N"), 45.0)
        self.assertEqual(field_service.get_zone_nutrient_value(2, "P"), 28.0)
        self.assertEqual(field_service.get_zone_nutrient_value(2, "K"), 39.0)

        # Zone D (3): N 96, P 55, K 83
        self.assertEqual(field_service.get_zone_nutrient_value(3, "N"), 96.0)
        self.assertEqual(field_service.get_zone_nutrient_value(3, "P"), 55.0)
        self.assertEqual(field_service.get_zone_nutrient_value(3, "K"), 83.0)

        # Full zones nutrient report
        dummy_zones = [{"id": "z1"}, {"id": "z2"}, {"id": "z3"}, {"id": "z4"}]
        report = field_service.generate_zone_nutrients(dummy_zones, "Wheat")
        self.assertTrue(report["is_model_estimate"])
        self.assertEqual(len(report["zones"]), 4)
        self.assertEqual(report["zones"][0]["nitrogen"], 82.0)

    # -------------------------------------------------------------------------
    # 10. Autonomous Rover Navigation Specifications
    # -------------------------------------------------------------------------
    def test_rover_navigation_structure_and_parameters(self):
        """Autonomous rover navigation section is positioned below heatmap with simulation controls."""
        self.assertIn('id="roverNavSection"', self.html)
        self.assertIn('Autonomous Rover Navigation', self.html)
        self.assertIn('Plan a systematic field survey across all zones.', self.html)
        self.assertIn('id="startSurveyBtn"', self.html)
        self.assertIn('Start autonomous survey', self.html)
        self.assertIn('id="resetSurveyBtn"', self.html)
        self.assertIn('Lawn mower / Serpentine', self.html)
        self.assertIn('5 m', self.html)
        self.assertIn('0.3 m/s', self.html)
        self.assertIn('id="roverNavSvg"', self.html)
        self.assertIn('id="roverSurveyPath"', self.html)
        self.assertIn('id="roverTraveledPath"', self.html)
        self.assertIn('id="roverSimMarker"', self.html)

        # Navigation appears AFTER heatmap
        heatmap_idx = self.html.find('mapping-heatmap-panel')
        rover_idx = self.html.find('mapping-rover-nav-panel')
        self.assertTrue(heatmap_idx != -1 and rover_idx != -1)
        self.assertTrue(heatmap_idx < rover_idx, "Rover navigation section must be placed below heatmap")

    def test_rover_serpentine_route_generation(self):
        """Serpentine route generates systematic parallel rows across sequential zones."""
        rect_coords = [[0, 0], [200, 0], [200, 100], [0, 100]]
        survey = field_service.generate_rover_survey_waypoints(rect_coords, 4, row_spacing_m=10.0)

        self.assertEqual(survey["pattern"], "Lawn mower / Serpentine")
        self.assertEqual(survey["speed_mps"], 0.3)
        self.assertEqual(survey["zone_sequence"], ["A", "B", "C", "D"])
        self.assertEqual(survey["zone_order_str"], "A → B → C → D")
        self.assertGreater(survey["waypoint_count"], 8)
        self.assertGreater(survey["total_distance_m"], 0.0)
        self.assertGreater(survey["estimated_duration_sec"], 0.0)

        # Waypoints visit zones in alphabetical order
        visited_zones = []
        for wp in survey["waypoints"]:
            if not visited_zones or visited_zones[-1] != wp["zone"]:
                visited_zones.append(wp["zone"])
        self.assertEqual(visited_zones, ["Zone A", "Zone B", "Zone C", "Zone D"])

    def test_future_sensor_observation_data_model(self):
        """Spatial observation model cleanly associates GPS, NPK, moisture, timestamp, and zone."""
        obs = field_service.record_spatial_observation(
            gps_lat=17.3850,
            gps_lon=78.4867,
            zone_id="zone-a",
            nitrogen=85.0,
            phosphorus=48.0,
            potassium=70.0,
            soil_moisture=34.5,
            timestamp="2026-09-28T16:00:00Z"
        )
        self.assertEqual(obs["source"], "telemetry_observation")
        self.assertEqual(obs["gps"]["lat"], 17.3850)
        self.assertEqual(obs["zone_id"], "zone-a")
        self.assertEqual(obs["nutrients"]["nitrogen"], 85.0)
        self.assertEqual(obs["soil_moisture_pct"], 34.5)


if __name__ == "__main__":
    unittest.main()


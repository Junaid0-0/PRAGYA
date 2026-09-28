"""PRAGYA Spatial and Field Mapping Service.

Provides geometry calculations, unit conversions, and spatial data models
for agricultural precision field mapping.
"""
from __future__ import annotations

import json
import math
from typing import Any

# Precise agricultural and geodetic conversion constants
ACRES_TO_HA = 0.4046856422405708
HA_TO_ACRES = 2.471053814671653
ACRES_TO_SQ_METRES = 4046.856422405708
HA_TO_SQ_METRES = 10000.0
SQ_METRES_TO_ACRES = 1.0 / ACRES_TO_SQ_METRES
SQ_METRES_TO_HA = 1.0 / HA_TO_SQ_METRES

METRES_TO_FEET = 3.280839895013123
FEET_TO_METRES = 0.3048
SQ_FEET_TO_ACRES = 1.0 / 43560.0


def convert_area(value: float, from_unit: str, to_unit: str) -> float:
    """Convert area between acres and hectares."""
    from_u = from_unit.lower().strip()
    to_u = to_unit.lower().strip()
    if from_u == to_u:
        return float(value)
    if from_u in ("acres", "acre", "ac") and to_u in ("hectares", "hectare", "ha"):
        return float(value) * ACRES_TO_HA
    if from_u in ("hectares", "hectare", "ha") and to_u in ("acres", "acre", "ac"):
        return float(value) * HA_TO_ACRES
    raise ValueError(f"Unsupported area conversion from '{from_unit}' to '{to_unit}'")


def convert_dimension(value: float, from_unit: str, to_unit: str) -> float:
    """Convert linear dimension between metres and feet."""
    from_u = from_unit.lower().strip()
    to_u = to_unit.lower().strip()
    if from_u == to_u:
        return float(value)
    if from_u in ("metres", "meters", "metre", "meter", "m") and to_u in ("feet", "foot", "ft"):
        return float(value) * METRES_TO_FEET
    if from_u in ("feet", "foot", "ft") and to_u in ("metres", "meters", "metre", "meter", "m"):
        return float(value) * FEET_TO_METRES
    raise ValueError(f"Unsupported dimension conversion from '{from_unit}' to '{to_unit}'")


def calculate_rectangle(
    length: float,
    width: float,
    dimension_unit: str = "metres",
    area_unit: str = "acres"
) -> dict[str, Any]:
    """Calculate area, perimeter, and bounding dimensions for a rectangular field."""
    if length <= 0 or width <= 0:
        raise ValueError("Length and width must be positive numbers")

    dim_u = "feet" if dimension_unit.lower().startswith("f") else "metres"
    area_u = "hectares" if area_unit.lower().startswith("h") else "acres"

    # Normalize to metres for standard calculation
    l_m = length * FEET_TO_METRES if dim_u == "feet" else length
    w_m = width * FEET_TO_METRES if dim_u == "feet" else width

    sq_m = l_m * w_m
    perimeter_m = 2.0 * (l_m + w_m)

    if area_u == "acres":
        area = sq_m * SQ_METRES_TO_ACRES
    else:
        area = sq_m * SQ_METRES_TO_HA

    # Perimeter in requested dimension unit
    perimeter = perimeter_m * METRES_TO_FEET if dim_u == "feet" else perimeter_m

    # Synthesize standard polygon coordinates (origin at 0, 0 in requested dimension unit)
    coordinates = [
        [0.0, 0.0],
        [round(length, 2), 0.0],
        [round(length, 2), round(width, 2)],
        [0.0, round(width, 2)]
    ]

    return {
        "area": round(area, 2),
        "area_unit": area_u,
        "perimeter": round(perimeter, 1),
        "perimeter_unit": dim_u,
        "length": round(length, 2),
        "width": round(width, 2),
        "dimension_unit": dim_u,
        "area_sq_m": round(sq_m, 2),
        "perimeter_m": round(perimeter_m, 2),
        "coordinates": coordinates,
        "geometry": {
            "type": "Polygon",
            "coordinates": coordinates
        }
    }


def calculate_polygon(
    coordinates: list[list[float]] | list[tuple[float, float]],
    dimension_unit: str = "metres",
    area_unit: str = "acres"
) -> dict[str, Any]:
    """Calculate area, perimeter, and approximate dimensions for a polygon.

    Uses the Shoelace formula for area and Euclidean distance for perimeter.
    Supports closed or unclosed coordinate lists.
    """
    if not coordinates or len(coordinates) < 3:
        raise ValueError("A polygon must have at least 3 distinct vertices")

    # Filter out duplicate closing point if present
    pts = [[float(p[0]), float(p[1])] for p in coordinates]
    if len(pts) > 3 and pts[0][0] == pts[-1][0] and pts[0][1] == pts[-1][1]:
        pts = pts[:-1]

    if len(pts) < 3:
        raise ValueError("A polygon must have at least 3 distinct vertices")

    dim_u = "feet" if dimension_unit.lower().startswith("f") else "metres"
    area_u = "hectares" if area_unit.lower().startswith("h") else "acres"

    n = len(pts)
    # Shoelace formula for area
    shoelace_sum = 0.0
    perimeter_raw = 0.0

    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    dim_x = max_x - min_x
    dim_y = max_y - min_y

    for i in range(n):
        j = (i + 1) % n
        shoelace_sum += (pts[i][0] * pts[j][1]) - (pts[j][0] * pts[i][1])
        edge_len = math.hypot(pts[j][0] - pts[i][0], pts[j][1] - pts[i][1])
        perimeter_raw += edge_len

    raw_sq_units = 0.5 * abs(shoelace_sum)

    # Convert to square metres if input was in feet
    if dim_u == "feet":
        sq_m = raw_sq_units * (FEET_TO_METRES ** 2)
        perimeter_m = perimeter_raw * FEET_TO_METRES
        length_dim = max(dim_x, dim_y)
        width_dim = min(dim_x, dim_y)
    else:
        sq_m = raw_sq_units
        perimeter_m = perimeter_raw
        length_dim = max(dim_x, dim_y)
        width_dim = min(dim_x, dim_y)

    if area_u == "acres":
        area = sq_m * SQ_METRES_TO_ACRES
    else:
        area = sq_m * SQ_METRES_TO_HA

    perimeter = perimeter_raw

    return {
        "area": round(area, 2),
        "area_unit": area_u,
        "perimeter": round(perimeter, 1),
        "perimeter_unit": dim_u,
        "length": round(length_dim, 1),
        "width": round(width_dim, 1),
        "dimension_unit": dim_u,
        "area_sq_m": round(sq_m, 2),
        "perimeter_m": round(perimeter_m, 2),
        "geometry": {
            "type": "Polygon",
            "coordinates": pts
        }
    }


def normalize_field_geometry(payload: dict[str, Any]) -> dict[str, Any]:
    """Validate and normalize field geometry from incoming user data."""
    geometry_mode = payload.get("geometry_mode") or "dimensions"
    area_unit = payload.get("area_unit") or "acres"
    dim_unit = payload.get("dimension_unit") or "metres"

    coords = None
    if isinstance(payload.get("geometry"), dict):
        coords = payload["geometry"].get("coordinates")
    elif isinstance(payload.get("geometry"), list):
        coords = payload["geometry"]
    elif isinstance(payload.get("coordinates"), list):
        coords = payload["coordinates"]

    # If polygon coordinates are provided and valid, polygon takes precedence
    if coords and len(coords) >= 3:
        poly_calc = calculate_polygon(coords, dimension_unit=dim_unit, area_unit=area_unit)
        return {
            "mode": "polygon",
            "area": poly_calc["area"],
            "area_unit": poly_calc["area_unit"],
            "length": poly_calc["length"],
            "width": poly_calc["width"],
            "dimension_unit": poly_calc["dimension_unit"],
            "perimeter": poly_calc["perimeter"],
            "geometry": poly_calc["geometry"]
        }

    # Otherwise calculate rectangular dimensions
    try:
        length = float(payload.get("length", 200.0))
        width = float(payload.get("width", 100.0))
    except (TypeError, ValueError):
        length = 200.0
        width = 100.0

    rect_calc = calculate_rectangle(length, width, dimension_unit=dim_unit, area_unit=area_unit)
    # If user provided explicit area override in dimensions mode, respect it if valid
    user_area = payload.get("area")
    if user_area is not None:
        try:
            f_area = float(user_area)
            if f_area > 0:
                rect_calc["area"] = round(f_area, 2)
        except (TypeError, ValueError):
            pass

    return {
        "mode": "dimensions",
        "area": rect_calc["area"],
        "area_unit": rect_calc["area_unit"],
        "length": rect_calc["length"],
        "width": rect_calc["width"],
        "dimension_unit": rect_calc["dimension_unit"],
        "perimeter": rect_calc["perimeter"],
        "geometry": rect_calc["geometry"]
    }


calculate_polygon_geometry = calculate_polygon


def get_zone_letter(index: int) -> str:
    """Return sequential zone letter: 0 -> 'A', 1 -> 'B', ... 25 -> 'Z', 26 -> 'AA'."""
    label = ""
    n = index
    while n >= 0:
        label = chr(65 + (n % 26)) + label
        n = (n // 26) - 1
    return label


def get_zone_name(index: int) -> str:
    """Return zone name with sequential alphabetic suffix."""
    return f"Zone {get_zone_letter(index)}"


def compute_grid_dimensions(n: int) -> tuple[int, int]:
    """Compute optimal (rows, cols) for n zones minimizing distortion and unused cells."""
    if n <= 1:
        return 1, 1
    if n <= 3:
        return 1, n

    best_r = 1
    best_c = n
    best_score = float("inf")
    max_r = math.ceil(math.sqrt(n))

    for r in range(1, max_r + 1):
        c = math.ceil(n / r)
        unused = (r * c) - n
        aspect_ratio = max(c / r, r / c)
        bias = 0.05 if r > c else 0.0
        score = (aspect_ratio * 1.5) + (unused * 0.8) + bias
        if score < best_score:
            best_score = score
            best_r = r
            best_c = c

    if best_r > best_c:
        best_r, best_c = best_c, best_r

    return best_r, best_c


def partition_zone_grid(
    coordinates: list[list[float]] | list[tuple[float, float]],
    n: int
) -> list[dict[str, Any]]:
    """Partition bounding box of coordinates into n equal-area rectangular grid cells."""
    if not coordinates or len(coordinates) < 3 or n <= 0:
        return []

    xs = [float(p[0]) for p in coordinates]
    ys = [float(p[1]) for p in coordinates]
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    total_w = max(max_x - min_x, 1.0)
    total_h = max(max_y - min_y, 1.0)

    rows, cols = compute_grid_dimensions(n)

    zones_per_row = []
    rem = n
    for r in range(rows):
        count = math.ceil(rem / (rows - r))
        zones_per_row.append(count)
        rem -= count

    partitions = []
    zone_idx = 0
    row_height = total_h / rows

    for r in range(rows):
        k = zones_per_row[r]
        col_width = total_w / k
        y0 = min_y + (r * row_height)
        y1 = y0 + row_height

        for c in range(k):
            if zone_idx >= n:
                break
            x0 = min_x + (c * col_width)
            x1 = x0 + col_width

            partitions.append({
                "index": zone_idx,
                "letter": get_zone_letter(zone_idx),
                "name": get_zone_name(zone_idx),
                "row": r,
                "col": c,
                "x0": round(x0, 2),
                "y0": round(y0, 2),
                "x1": round(x1, 2),
                "y1": round(y1, 2),
                "width": round(col_width, 2),
                "height": round(row_height, 2),
                "cx": round((x0 + x1) / 2.0, 2),
                "cy": round((y0 + y1) / 2.0, 2)
            })
            zone_idx += 1

    return partitions


def get_zone_nutrient_value(zone_index: int, nutrient: str) -> float:
    """Return deterministic spatial estimate for zone nutrients.

    Provides exact agricultural benchmarks for first 4 zones:
    Zone A (0): N 82, P 46, K 71
    Zone B (1): N 120, P 62, K 54
    Zone C (2): N 45, P 28, K 39
    Zone D (3): N 96, P 55, K 83
    """
    benchmarks = [
        {"N": 82.0, "P": 46.0, "K": 71.0},
        {"N": 120.0, "P": 62.0, "K": 54.0},
        {"N": 45.0, "P": 28.0, "K": 39.0},
        {"N": 96.0, "P": 55.0, "K": 83.0}
    ]
    nu = nutrient.upper().strip()
    if zone_index < len(benchmarks) and nu in benchmarks[zone_index]:
        return benchmarks[zone_index][nu]

    if nu == "N":
        return float(50 + (((zone_index * 37) + 19) % 75))
    if nu == "P":
        return float(25 + (((zone_index * 23) + 11) % 45))
    if nu == "K":
        return float(40 + (((zone_index * 41) + 17) % 60))
    return 50.0


def generate_zone_nutrients(zones: list[dict[str, Any]], crop: str = "Wheat") -> dict[str, Any]:
    """Generate estimated spatial nutrient distributions across all field zones.

    Clearly labeled as spatial model estimate / demo benchmark data.
    """
    zone_data = []
    n_count = len(zones) if zones else 1

    for i in range(n_count):
        letter = get_zone_letter(i)
        name = get_zone_name(i)
        zone_data.append({
            "index": i,
            "letter": letter,
            "name": name,
            "crop": crop,
            "nitrogen": get_zone_nutrient_value(i, "N"),
            "phosphorus": get_zone_nutrient_value(i, "P"),
            "potassium": get_zone_nutrient_value(i, "K"),
            "unit": "mg/kg",
            "status": "estimated_model"
        })

    return {
        "crop": crop,
        "is_model_estimate": True,
        "zones": zone_data,
        "unit": "mg/kg",
        "description": "Spatial estimate of nutrient distribution across field zones."
    }


def generate_rover_survey_waypoints(
    coordinates: list[list[float]] | list[tuple[float, float]],
    n_zones: int,
    row_spacing_m: float = 5.0
) -> dict[str, Any]:
    """Generate systematic serpentine / lawn-mower survey route across field zones.

    Respects automatic zone partitioning sequence (Zone A -> Zone B -> Zone C...).
    Within each zone, creates parallel survey rows in alternating directions.
    """
    partitions = partition_zone_grid(coordinates, n_zones)
    if not partitions:
        return {"waypoints": [], "total_distance_m": 0.0, "zone_sequence": []}

    waypoints = []
    zone_sequence = [p["letter"] for p in partitions]

    for p in partitions:
        margin_x = p["width"] * 0.08
        margin_y = p["height"] * 0.08
        left_x = p["x0"] + margin_x
        right_x = p["x1"] - margin_x
        top_y = p["y0"] + margin_y
        bot_y = p["y1"] - margin_y

        h = max(bot_y - top_y, row_spacing_m)
        num_rows = max(2, int(h / max(row_spacing_m, 1.0)) + 1)
        actual_row_h = (bot_y - top_y) / max(1, num_rows - 1) if num_rows > 1 else 0.0

        for r in range(num_rows):
            cur_y = top_y + (r * actual_row_h)
            if r % 2 == 0:
                waypoints.append({"x": round(left_x, 2), "y": round(cur_y, 2), "zone": p["name"], "zone_idx": p["index"]})
                waypoints.append({"x": round(right_x, 2), "y": round(cur_y, 2), "zone": p["name"], "zone_idx": p["index"]})
            else:
                waypoints.append({"x": round(right_x, 2), "y": round(cur_y, 2), "zone": p["name"], "zone_idx": p["index"]})
                waypoints.append({"x": round(left_x, 2), "y": round(cur_y, 2), "zone": p["name"], "zone_idx": p["index"]})

    # Total distance in field units (metres)
    total_dist = 0.0
    for i in range(len(waypoints) - 1):
        dx = waypoints[i + 1]["x"] - waypoints[i]["x"]
        dy = waypoints[i + 1]["y"] - waypoints[i]["y"]
        total_dist += math.hypot(dx, dy)

    return {
        "pattern": "Lawn mower / Serpentine",
        "row_spacing_m": row_spacing_m,
        "speed_mps": 0.3,
        "zone_sequence": zone_sequence,
        "zone_order_str": " → ".join(zone_sequence),
        "total_distance_m": round(total_dist, 1),
        "estimated_duration_sec": round(total_dist / 0.3, 1) if total_dist > 0 else 0.0,
        "waypoints": waypoints,
        "waypoint_count": len(waypoints)
    }


def record_spatial_observation(
    gps_lat: float | None = None,
    gps_lon: float | None = None,
    zone_id: str | None = None,
    nitrogen: float | None = None,
    phosphorus: float | None = None,
    potassium: float | None = None,
    soil_moisture: float | None = None,
    timestamp: str | None = None
) -> dict[str, Any]:
    """Data model structure for future spatial sensor telemetry integration.

    Rover GPS position + NPK measurement + soil moisture + timestamp + zone
    = spatial field observation.
    """
    return {
        "gps": {"lat": gps_lat, "lon": gps_lon} if gps_lat is not None and gps_lon is not None else None,
        "zone_id": zone_id,
        "nutrients": {
            "nitrogen": nitrogen,
            "phosphorus": phosphorus,
            "potassium": potassium,
            "unit": "mg/kg"
        },
        "soil_moisture_pct": soil_moisture,
        "timestamp": timestamp,
        "source": "telemetry_observation" if gps_lat is not None else "spatial_model_estimate"
    }



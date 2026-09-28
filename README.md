# PRAGYA — Predictive Robotics for Agricultural Growth & Yield Analytics

PRAGYA (Predictive Robotics for Agricultural Growth & Yield Analytics) is a Raspberry Pi-friendly farm dashboard. It accepts local sensor data from an Arduino, runs its core predictions on the device, stores farm history and uploaded analysis thumbnails in SQLite-backed local storage, and pushes live results to a lightweight browser UI. Disease, crop, soil, and pest image inference run offline. An optional Gemini key enables text chat and explanations; uploaded images are never sent to Gemini.

## Getting started

### What you need

- **Python 3.10+** (on the Pi: **64-bit Raspberry Pi OS** — `onnxruntime` has no wheels for 32-bit ARM).
- One-time internet access to `pip install` the dependencies. After that the whole app runs offline.
- Optional: an Arduino (or any serial device) sending JSON sensor readings, and an OpenWeatherMap API key for live weather.

### 1. Get the code

```bash
git clone https://github.com/Mustafyy8/kisan-mitra.git
cd kisan-mitra
```

### 2. Create the environment and install dependencies

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

On a fresh Raspberry Pi OS you may need `sudo apt install python3-venv` first.

### 3. Configure `.env`

```bash
cp .env.example .env
```

Then edit `.env`:

- **`KISAN_SECRET_KEY`** — any long random string; used to sign sessions. Generate one with `python -c "import secrets; print(secrets.token_hex(32))"`. If unset, the server uses a random per-boot key and warns on startup.
- **`KISAN_API_TOKEN`** *(optional)* — when set, non-auth writes (`POST /api/sensors`, `/api/disease`, `/api/profile`, `/api/models/*`, and `/api/chat/image`) require an `Authorization: Bearer <token>` header. A signed-in dashboard session also grants write access.
- **`OPENWEATHER_API_KEY`** / **`OPENWEATHER_CITY`** *(optional)* — live temperature/humidity/rainfall from OpenWeatherMap, with automatic fallback to local sensors when offline (see Production notes).
- **`GEMINI_API_KEY`** / **`GEMINI_MODEL`** *(optional)* — enables text chat and explanations of local model results. Image bytes are never sent to Gemini. All image screening works without a key.

### 4. Start the edge server

```bash
python edge_server.py
```

Open **http://localhost:3000**. The dashboard starts with clearly labelled demo telemetry until a real reading arrives.

### 5. Send a test sensor reading

```bash
curl -X POST http://localhost:3000/api/sensors \
  -H "Content-Type: application/json" \
  -d '{"npk":{"n":90,"p":42,"k":43},"moisture":42,"temperature":26,"humidity":65,"ph":6.8}'
```

(If you set `KISAN_API_TOKEN`, add `-H "Authorization: Bearer <token>"`.) The dashboard updates live over Socket.IO — no refresh needed. Upload a leaf photo in the **Leaf disease scan** panel to test the ONNX model.

### 6. Run the verification suite

```bash
python -m unittest discover -s tests -v
```

All tests run fully offline (the weather API is mocked/disabled in tests).

## Raspberry Pi 4 deployment

The one-command installer sets up everything and registers a systemd service so the dashboard starts on boot:

```bash
sudo ./deploy/deploy.sh
```

What it does:

1. Creates `.venv` and installs `requirements.txt`.
2. Runs the test suite — installation aborts if anything is broken.
3. Creates `.env` from the template if missing (with a generated `KISAN_SECRET_KEY`).
4. Installs `kisan-mitra.service`, enables it for boot, and starts it.

Useful commands:

```bash
systemctl status kisan-mitra        # is it running?
journalctl -u kisan-mitra -f        # follow the logs
sudo systemctl restart kisan-mitra  # restart after editing .env
```

Then open `http://<pi-ip-address>:3000` from any device on the farm's network. Expect roughly **1-3 seconds per leaf scan** on a Pi 4; scans are queued through a single background worker so the dashboard stays responsive.

## Arduino Mega ingestion

Send one JSON object per serial line, then run:

```bash
python serial_bridge.py /dev/ttyACM0 --baud 9600
# when the server requires a token:
python serial_bridge.py /dev/ttyACM0 --token <KISAN_API_TOKEN>
```

Useful telemetry fields are `npk.n`, `npk.p`, `npk.k`, `moisture`, `temperature`, `humidity`, `ph`, `ec`, `organic_carbon`, `rainfall`, and `gps`. The serial bridge posts them to Flask and Socket.IO updates connected dashboards without a refresh.

## Active ML models

All three expected ML capabilities are implemented in the same `MLService` interface in `ml_service.py`. The obsolete empty/broken `crop_model.pkl`, `soil_model.pkl`, and mislabeled `plant_disease_model.h5` files were removed.

| Model | Task | Strongest use | Do not use it for | Key trade-off | Choose it when |
| --- | --- | --- | --- | --- | --- |
| **Field-fine-tuned EfficientNetV2B0** (`plant_disease.onnx`, trained on PlantVillage + PlantDoc) | 15-class image classification with an out-of-distribution rejection gate | Real-world leaf photos of pepper, potato, and tomato diseases (65.7% on field photos, 94.3% on studio-style scans); returns diagnosis, confidence, and top 3 classes. Scans the model cannot place — other crops, blanks, ambiguous shots — return `"Not recognized"` instead of a made-up tomato diagnosis. | Crops outside its 15 labels, whole-field photos, or definitive pesticide decisions. | About 16 MB on disk; ONNX Runtime is fast and offline but image inference is heavier than tabular models. ~91% of known-class scans pass the gate (size, blank, feature-distance, and softmax-margin checks); the rest are honestly flagged as unrecognized. | You have a leaf photo of a supported crop and need rapid local triage. |
| **Crop Recommendation Random Forest** (`crop_recommendation.joblib`) | 22-class tabular crop suitability ranking | Ranking candidate crops from N, P, K, temperature, humidity, pH, and rainfall. It performed **99.32% held-out accuracy** using the fixed stratified split in `train_crop_model.py`. | Yield forecasting, market/profit prediction, variety selection, irrigation scheduling, or recommendations without meaningful rainfall/soil readings. It is trained on a compact benchmark dataset, not local farm history. | About 14 MB; extremely fast CPU inference and interpretable feature inputs, but classification confidence is not guaranteed field suitability. | Choosing crop candidates from a current soil-and-climate reading. |
| **Soil Fertility Random Forest** (`soil_fertility.joblib`) | 3-class tabular fertility classification | Classifying **Less fertile / Fertile / Highly fertile** from N, P, K, pH, EC, and organic carbon; it reached **94.19% held-out accuracy** in `train_soil_model.py`. | Soil texture/taxonomy, micronutrient deficiencies, fertilizer dosage, salinity diagnosis without reliable EC, or decisions outside the source dataset's geography and lab methods. | About 6.2 MB and fast on CPU; it uses six available sensor/lab inputs, so it is practical but less complete than a broad lab panel. | You have calibrated NPK, pH, EC, and organic-carbon measurements and need a broad fertility screening. |
| **IP102 YOLO11s** (`pest_yolo11s.onnx`) | Detects likely pest objects among 102 categories | Local screening of insect photos without an API key. Returns candidate labels, scores, and boxes. | Confirmed identification or treatment decisions. Leaf lesions can produce false boxes, so known leaf disease scans take precedence; unfamiliar pests may be missed. | About 36 MB on disk; ONNX Runtime on CPU. | You can photograph an insect clearly and verify the lead in the field. |

The pest model was exported to ONNX from the MIT-licensed [YOLO11s IP102 model](https://huggingface.co/underdogquality/yolo11s-pest-detection) by Winston Karanja Ngige. Its model card reports validation mAP@0.5 of 0.815, a benchmark on its own dataset rather than a guarantee for this app. The positive test fixture comes from the MIT-licensed [CerealPestAID dataset](https://huggingface.co/datasets/sheneman/CerealPestAID-dataset) by Luke Sheneman, University of Idaho.

### Model-selection guide

- Choose **disease classification** for an individual leaf image.
- Choose **crop recommendation** to decide which crops merit closer agronomic evaluation for measured conditions.
- Choose **soil fertility classification** to understand broad nutrient state before choosing fertilizer or crops.

They complement each other; none replaces a soil laboratory report, field scouting, pesticide label instructions, or a local agronomist.

## Model implementation and verification

All three models are available through the active Flask application:

1. Disease scan: browser upload -> `POST /api/disease` -> ONNX inference -> SQLite scan and analysis history -> Socket.IO update -> dashboard result.
2. Crop recommendation: AI Models -> `POST /api/models/crop` -> latest persisted Raspberry Pi reading -> `MLService.recommend_crops` -> SQLite analysis/activity history -> ranked crops and speech-ready result.
3. Soil fertility: AI Models -> `POST /api/models/soil` -> latest persisted Raspberry Pi reading -> `MLService.assess_soil_fertility` -> SQLite analysis/activity history -> fertility result.
4. Pest screening: image upload -> `POST /api/models/pest` -> local IP102 YOLO11s ONNX detection -> saved thumbnail, history, and activity. No API key or internet is required.
5. Speech: a model result is sent to `POST /api/tts`, then played locally with the browser's `speechSynthesis` engine (English or Hindi); Listen and Stop controls are shown together.
6. Accounts: signup/login uses a SQLite `users` table, Werkzeug password hashing, and a signed Flask session. The landing page exposes authentication while operational navigation is disabled for signed-out users.
7. Rover: the current page is a visual prototype. Its controls intentionally simulate activity without transmitting commands until a hardware protocol is supplied.
8. Chat images: the Chatbot accepts a JPG, PNG, or WEBP image with an optional question. Auto routing checks the local disease model first and uses the local pest detector for pest questions or unrecognized leaves. Only the selected model's text output and farm snapshot may go to Gemini for an optional explanation; image bytes stay on this device. The image, model result, and answer are saved in History. Disease and Pest can also be selected explicitly.

Run `python train_crop_model.py` or `python train_soil_model.py` to recreate the respective local model from its included training dataset.

## API surface

| Route | Purpose |
| --- | --- |
| `GET /api/farm` | Combined live dashboard payload including all model outputs. |
| `GET/POST /api/sensors` | Read or ingest validated local sensor telemetry. |
| `GET /api/soil` | Nutrients and soil-fertility model prediction. |
| `GET/POST /api/disease` | Read last scan or submit a leaf image. |
| `GET /api/recommendations` | Crop-model rankings and farmer-facing recommendation. |
| `GET /api/health` | Operational health: model readiness, sensor freshness, and database status. |
| `GET /api/climate`, `/api/alerts`, `/api/history` | Supporting local dashboard data. |
| `POST /api/profile` | Update farm profile (requires `KISAN_API_TOKEN` if configured). |
| `GET /api/models`, `/api/ai/status` | List local/prototype models and report optional cloud-AI availability. |
| `POST /api/models/crop`, `/api/models/soil` | Run a selected tabular model from the latest persisted sensor reading and save the result. Explicit JSON inputs remain accepted for API clients. |
| `POST /api/models/pest` | Run the local cereal-field insect classifier from an uploaded image. |
| `POST /api/chat` | Ask the farm assistant about the saved farm profile, timestamped sensor readings, recent model analyses, and activity. Gemini receives a bounded farm snapshot when configured; limited local answers remain available offline. Demo readings are labelled as demo. |
| `POST /api/chat/image` | Multipart `image` plus optional `message` and `route=auto|disease|pest`; run local image analysis, optionally give Gemini its text result, and persist the result. The image is never included in the Gemini request. |
| `POST /api/tts` | Validate model output and return the browser voice/language payload. |
| `POST /api/auth/signup`, `/api/auth/login`, `/api/auth/logout`, `GET /api/auth/me` | Create a user, manage the signed session, or inspect the current user. |
| `GET /api/activity` | Recent persisted model, scan, account, and profile activity. |
| `GET /api/analyses`, `/api/analyses/<id>`, `/api/analyses/<id>/image` | List/open saved analyses and retrieve their uploaded image thumbnail when present. |

## API contract: inputs and expected behaviour

Base URL: `http://<pi-ip>:3000`. All read endpoints return JSON and require no
authentication. Signup, login, logout, and TTS are not token-gated. When
`KISAN_API_TOKEN` is configured, sensor, disease, profile, and model-run write
endpoints require this header unless the request has a valid signed dashboard
session:

```http
Authorization: Bearer <KISAN_API_TOKEN>
```

### 1. Send sensor telemetry: `POST /api/sensors`

This is the main input to the system. The Arduino bridge sends one JSON record
per reading. Missing values use safe defaults, but send all fields below for
accurate ML outputs and weather decisions.

```json
{
  "npk": { "n": 90, "p": 42, "k": 43 },
  "moisture": 42,
  "temperature": 20.9,
  "humidity": 82,
  "ph": 6.5,
  "ec": 0.62,
  "organic_carbon": 0.7,
  "rainfall": 203,
  "gps": { "lat": 30.900000, "lng": 75.850000 },
  "source": "arduino-mega"
}
```

`n`, `p`, `k`, moisture, temperature, humidity, pH, EC, organic carbon, and
rainfall must be numeric. GPS is optional; omit it until the device has a real
fix. A successful request returns `201` with the normalized telemetry, stores
it in SQLite, recalculates alerts and model outputs, and broadcasts a
`telemetry` Socket.IO event to all open dashboards.

```bash
curl -X POST http://localhost:3000/api/sensors \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <KISAN_API_TOKEN>' \
  --data @telemetry.json
```

### 2. Scan a leaf image: `POST /api/disease`

Use multipart form data with exactly one `image` file. Accepted MIME types are
`image/jpeg`, `image/png`, and `image/webp`, up to 10 MB. Submit a close, well-lit image of
one leaf; the ONNX model runs locally and returns `201` with `label`, readable
`disease`, `healthy`, `confidence`, `treatment`, `top_predictions`, and
`inference_ms`, plus `recognized`. When the scan is not one of the 15 trained
classes (for example a real-world photo, a blank upload, or another crop), the
response is `{"label": "Unknown", "disease": "Not recognized",
"recognized": false, ...}` instead of a confident false tomato diagnosis. The
result is saved in `disease_scans` and immediately appears on the dashboard
through Socket.IO.

```bash
curl -X POST http://localhost:3000/api/disease \
  -H 'Authorization: Bearer <KISAN_API_TOKEN>' \
  -F 'image=@/path/to/leaf.jpg'
```

`GET /api/disease` returns model readiness, humidity-derived disease risk, and
the last saved scan. A missing image returns `400`; an unsupported file type
returns `415`; invalid images or unavailable local inference return `422`.

### 3. Update farm profile: `POST /api/profile`

Send any subset of `name`, `crop`, `acreage`, and `location` as JSON. Omitted
or `null` fields retain their existing value. `acreage` must be positive.
`location: ""` explicitly clears the saved location. The location is used for
OpenWeatherMap only when Arduino GPS is unavailable.

```json
{ "name": "Singh Family Farm", "crop": "Wheat", "acreage": 6.5, "location": "Ludhiana, IN" }
```

The endpoint returns `200` with `{ "ok": true, "farm": { ... } }`, clears the
weather cache, and broadcasts the updated farm payload.

### Read endpoints and their inputs

| Endpoint | Input | Expected result |
| --- | --- | --- |
| `GET /api/farm` | None | Complete dashboard payload: profile, enriched telemetry, weather source, health, crop rankings, soil assessment, alerts, and last disease scan. This is the first request the UI makes. |
| `GET /api/sensors` | None | Latest raw normalized sensor reading, without remote-weather overlay. |
| `GET /api/soil` | None | Current NPK, pH, EC, organic carbon, soil-health score, and the soil-fertility model result. |
| `GET /api/climate` | None | Current temperature, humidity, risk, and whether data came from local sensors or OpenWeatherMap. |
| `GET /api/recommendations` | None | Farmer-facing action plus the crop model's top three ranked crops and active alerts. |
| `GET /api/alerts` | None | Alerts derived from the current enriched telemetry. |
| `GET /api/history` | None | Up to 30 stored telemetry records, oldest to newest. |
| `GET /api/activity` | None | Up to 40 recent persisted actions, newest first. |
| `GET /api/analyses` | None | Up to 50 saved disease, crop, and soil analyses, newest first. |
| `GET /api/analyses/<id>` | Analysis id | One saved analysis with its input and result JSON for the History page. |
| `GET /api/health` | None | Service status, uptime, readiness of all models, sensor freshness, and SQLite health. Use this for deployment monitoring. |

### End-to-end data flow

1. Arduino emits one line of telemetry JSON; `serial_bridge.py` forwards it to
   `POST /api/sensors`.
2. Flask normalizes and persists the reading, optionally overlays live weather,
   and produces alerts, crop recommendations, and soil fertility results.
3. Flask emits one Socket.IO `telemetry` message. The browser refreshes all
   dashboard cards without a full page reload.
4. A farmer may upload a leaf image; `POST /api/disease` runs the local ONNX
   model in the single scan worker, stores the result, and broadcasts the new
   dashboard state.

SQLite state is created under `runtime/kisan_mitra.db`. Detailed source, licensing, and validation notes are in [MODEL_SOURCES.md](MODEL_SOURCES.md).

## Production notes

- **Leaf scans outside the 15 trained classes are rejected, not guessed.** The model is a closed-set classifier, so without a guard it reports a tomato disease for almost any image (a blank white image scored 99% `Tomato_Late_blight`). `MLService.diagnose` now rejects scans whose penultimate-layer features fall outside the envelope of the predicted class (calibrated by `python train_disease_ood.py`; see [MODEL_SOURCES.md](MODEL_SOURCES.md)); `/api/health` reports the gate's readiness under `models.disease.ood`. The model itself only knows pepper, potato, and tomato — supported-crop options and a swap procedure are documented in [MODEL_SOURCES.md](MODEL_SOURCES.md).
- **Use 64-bit Raspberry Pi OS (aarch64).** `onnxruntime` no longer publishes wheels for 32-bit ARM (armv7l), so `pip install -r requirements.txt` fails on 32-bit Pi OS. On a Pi 4 expect roughly **1-3 seconds per leaf scan** with the EfficientNetV2 model; scans are queued through a single background worker so the dashboard stays responsive. The Random Forest models are effectively instant.
- **Set `KISAN_SECRET_KEY`** (any long random string). Without it the server falls back to a random per-boot key and warns on startup.
- **Set `KISAN_API_TOKEN` to protect write endpoints.** When set, `POST /api/sensors`, `POST /api/disease`, `POST /api/profile`, and `POST /api/models/*` require an `Authorization: Bearer <token>` header unless the dashboard has a valid signed-in session. The read-only dashboard is intentionally open so farm staff can view it without credentials. To use protected device writes from the dashboard, enter the token under **System -> Write access**; it is kept only in that browser tab's session storage.
- **Optional live weather (offline-safe):** set `OPENWEATHER_API_KEY` in `.env` to enrich the dashboard with current temperature/humidity/rainfall from OpenWeatherMap. The weather location is resolved in this order: **GPS coordinates from the Arduino's telemetry, then the farm location saved on the dashboard** (System -> Farm location), then `OPENWEATHER_CITY` as the fallback. Fetches are cached for 30 minutes and time out after 3 seconds; if the request fails for any reason (offline, revoked key, rate limit) the app silently falls back to the local sensor readings, so the farm keeps working with no internet at all. The dashboard connection area shows the active source and city.
- The legacy Streamlit application and its committed third-party API keys (Roboflow, OpenWeatherMap, Google Gemini) were removed in this branch. If you ever used those keys, **revoke/rotate them** in the provider consoles; they are no longer referenced anywhere in the codebase.
- Sensor and scan history is stored in `runtime/kisan_mitra.db` (auto-created, git-ignored). The dashboard shows clearly labelled demo telemetry until real readings arrive.

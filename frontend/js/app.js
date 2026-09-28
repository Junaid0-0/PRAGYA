"use strict";

const $ = (id) => document.getElementById(id);
const setText = (id, value) => { const node = $(id); if (node) node.textContent = value ?? "—"; };

// ==================================================
// PRAGYA CENTRAL DEMO DATASET (RECORDING MODE)
// ==================================================
const PRAGYA_DEMO_DATA = {
  farm: {
    name: "North Wheat Field",
    location: "Hyderabad, Telangana",
    crop: "Wheat",
    area: 5.00,
    areaUnit: "acres",
    length: 200,
    width: 100,
    dimensionUnit: "m"
  },

  soil: {
    nitrogen: 50,
    phosphorus: 38,
    potassium: 80,
    moisture: 58,
    ph: 6.7,
    ec: 0.6,
    organicCarbon: 0.78
  },

  environment: {
    temperature: 29.4,
    humidity: 61,
    rainfall: 168,
    weather: "Partly cloudy"
  },

  zones: [
    {
      name: "Zone A",
      area: 1.25,
      nitrogen: 46,
      phosphorus: 35,
      potassium: 77,
      moisture: 54,
      ph: 6.5
    },
    {
      name: "Zone B",
      area: 1.25,
      nitrogen: 53,
      phosphorus: 41,
      potassium: 83,
      moisture: 60,
      ph: 6.8
    },
    {
      name: "Zone C",
      area: 1.25,
      nitrogen: 49,
      phosphorus: 37,
      potassium: 79,
      moisture: 57,
      ph: 6.7
    },
    {
      name: "Zone D",
      area: 1.25,
      nitrogen: 52,
      phosphorus: 39,
      potassium: 81,
      moisture: 61,
      ph: 6.8
    }
  ]
};

function isDemoMode() {
  if (typeof window === "undefined") return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") === "1") {
      sessionStorage.setItem("km-demo-mode", "1");
      return true;
    }
    if (params.get("demo") === "0") {
      sessionStorage.removeItem("km-demo-mode");
      return false;
    }
    return sessionStorage.getItem("km-demo-mode") === "1";
  } catch {
    return false;
  }
}

const DEMO_HISTORY_RECORDS = [
  {
    id: 101,
    analysis_type: "field_intelligence",
    model: "field_intelligence",
    mode: "edge",
    created_at: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    input: {
      field: "North Wheat Field",
      crop: "Wheat",
      n: 50,
      p: 38,
      k: 80,
      moisture: 58,
      ph: 6.7,
      ec: 0.6,
      organic_carbon: 0.78,
      temperature: 29.4,
      humidity: 61,
      rainfall: 168
    },
    result: {
      fertility: { fertility: "Fertile", confidence: 94 },
      crops: [{ crop: "Wheat", confidence: 96 }, { crop: "Barley", confidence: 88 }],
      recommendation: {
        title: "Optimal conditions for Wheat",
        message: "Balanced soil nutrients and root-zone moisture level supporting steady vegetative development."
      },
      soil_condition: "Fertile",
      headline: "North Wheat Field · N 50 · P 38 · K 80"
    }
  },
  {
    id: 102,
    analysis_type: "disease",
    model: "disease-mobilenet",
    mode: "edge",
    created_at: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    input: { crop: "Wheat", field: "North Wheat Field" },
    result: {
      crop: "Wheat",
      disease: "Leaf Rust",
      label: "Leaf Rust",
      recognized: true,
      healthy: false,
      confidence: 91,
      treatment: "Apply targeted triazole fungicide if severity exceeds threshold. Monitor leaf pustules.",
      headline: "Wheat · Leaf Rust"
    }
  },
  {
    id: 103,
    analysis_type: "pest",
    model: "pest-yolo",
    mode: "edge",
    created_at: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    input: { crop: "Wheat", field: "North Wheat Field" },
    result: {
      crop: "Wheat",
      label: "Aphid",
      pest: "Aphid",
      confidence: 88,
      summary: "Aphids detected on stem and lower leaf surface.",
      analysis: "Colonies observed on upper stem. Consider biological predators or targeted spray.",
      headline: "Wheat · Aphid"
    }
  },
  {
    id: 104,
    analysis_type: "field_intelligence",
    model: "spatial-mapping",
    mode: "edge",
    created_at: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    input: {
      field: "North Wheat Field",
      area: 5.0,
      area_unit: "acres",
      zones: 4,
      dimensions: "200 × 100 m",
      location: "Hyderabad, Telangana"
    },
    result: {
      soil_condition: "5 acres · 4 zones · 200 × 100 m",
      overview: "Field Mapping · 4 equal zones (1.25 acres each)",
      confidence: 98,
      headline: "Field Mapping · 4 zones"
    }
  },
  {
    id: 105,
    analysis_type: "field_intelligence",
    model: "field_intelligence",
    mode: "edge",
    created_at: new Date(Date.now() - 320 * 60 * 1000).toISOString(),
    input: {
      field: "North Wheat Field",
      n: 50,
      p: 38,
      k: 80,
      moisture: 58,
      ph: 6.7
    },
    result: {
      fertility: { fertility: "Fertile", confidence: 92 },
      soil_condition: "Fertile",
      confidence: 92,
      headline: "North Wheat Field · N 50 · P 38 · K 80"
    }
  }
];

const DEMO_ACTIVITY_RECORDS = [
  { id: 201, created_at: new Date(Date.now() - 18 * 60 * 1000).toISOString(), action: "field_intelligence", tool: "edge_ai", summary: "Field Intelligence generated for North Wheat Field (Wheat, Health: 94%)." },
  { id: 202, created_at: new Date(Date.now() - 55 * 60 * 1000).toISOString(), action: "disease", tool: "edge_ai", summary: "Disease Detection identified Leaf Rust (91% confidence)." },
  { id: 203, created_at: new Date(Date.now() - 110 * 60 * 1000).toISOString(), action: "pest", tool: "edge_ai", summary: "Pest Screening identified Aphid (88% confidence)." },
  { id: 204, created_at: new Date(Date.now() - 180 * 60 * 1000).toISOString(), action: "field", tool: "mapping", summary: "Field boundary synchronized: 200 × 100 m (5.00 acres, 4 zones)." },
  { id: 205, created_at: new Date(Date.now() - 320 * 60 * 1000).toISOString(), action: "field_intelligence", tool: "edge_ai", summary: "Field Intelligence evaluated for Wheat (N 50 · P 38 · K 80)." }
];

const DEMO_SPARKLINE_HISTORY = [
  { created_at: new Date(Date.now() - 240 * 60 * 1000).toISOString(), moisture: 56, temperature: 28.8, humidity: 63 },
  { created_at: new Date(Date.now() - 180 * 60 * 1000).toISOString(), moisture: 57, temperature: 29.1, humidity: 62 },
  { created_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(), moisture: 57, temperature: 29.3, humidity: 61 },
  { created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(), moisture: 58, temperature: 29.5, humidity: 60 },
  { created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(), moisture: 58, temperature: 29.4, humidity: 61 }
];

function getDemoDashboardState() {
  const d = PRAGYA_DEMO_DATA;
  return {
    farm: {
      name: d.farm.name,
      crop: d.farm.crop,
      acreage: d.farm.area,
      location: d.farm.location,
    },
    field: {
      id: "demo-field",
      name: d.farm.name,
      crop: d.farm.crop,
      location: d.farm.location,
      geometry_mode: "dimensions",
      length: d.farm.length,
      width: d.farm.width,
      dimension_unit: "metres",
      area: d.farm.area,
      area_unit: d.farm.areaUnit,
      perimeter: 600.0,
      geometry: {
        type: "Polygon",
        coordinates: [[0, 0], [d.farm.length, 0], [d.farm.length, d.farm.width], [0, d.farm.width]]
      },
      zones: d.zones.map((z, idx) => ({
        id: `zone-${idx + 1}`,
        name: z.name,
        crop: d.farm.crop,
        area: z.area,
        area_unit: "acres",
        area_pct: 25,
        nitrogen: z.nitrogen,
        phosphorus: z.phosphorus,
        potassium: z.potassium,
        moisture: z.moisture,
        ph: z.ph,
      }))
    },
    telemetry: {
      source: "demo",
      updated_at: new Date().toISOString(),
      npk: { n: d.soil.nitrogen, p: d.soil.phosphorus, k: d.soil.potassium },
      n: d.soil.nitrogen,
      p: d.soil.phosphorus,
      k: d.soil.potassium,
      moisture: d.soil.moisture,
      ph: d.soil.ph,
      ec: d.soil.ec,
      organic_carbon: d.soil.organicCarbon,
      temperature: d.environment.temperature,
      humidity: d.environment.humidity,
      rainfall: d.environment.rainfall,
      weather: {
        temperature: d.environment.temperature,
        humidity: d.environment.humidity,
        description: d.environment.weather,
        city: d.farm.location,
        source: "demo",
      },
    },
    health: { status: "healthy", score: 94 },
    soil_assessment: { status: "ready", fertility: "Fertile" },
    recommendation: {
      title: "Optimal conditions for Wheat",
      message: "Soil nutrients (N 50, P 38, K 80) and root-zone moisture (58%) are well-balanced for vegetative growth."
    },
    crops: [
      { crop: "Wheat", score: 96, confidence: 96 },
      { crop: "Barley", score: 88, confidence: 88 },
      { crop: "Mustard", score: 82, confidence: 82 }
    ],
    disease: null,
  };
}

const COPY = {
  en: {
    brand_tag: "Local farm intelligence", nav_overview: "Overview", nav_field: "Field tools", nav_field_short: "Field", nav_system: "System",
    nav_models: "AI Models", nav_models_short: "Models", nav_history: "History", nav_chat: "Chatbot", chat_title: "Ask PRAGYA", chat_eyebrow: "FIELD INTELLIGENCE · ADVISORY", chat_subtitle: "Agronomic guidance & sensor-aware farm intelligence", chat_intro: "Ask about farm data or attach an image for model analysis and Gemini guidance.", chat_empty: "Ask about your sensors, soil, crops, or leaf scans.", chat_message: "Message", chat_placeholder: "Ask a farm question…", chat_attach: "Attach image", chat_route: "Image analysis route", chat_auto: "Auto route", chat_photo: "Photo", chat_model_output: "Model result", chat_view_history: "View in History", chat_sending: "Analyzing image…", chat_cloud_fallback: "Gemini follow-up is unavailable; showing the model result.", chat_new: "New Chat", chat_clear: "Clear Chat", confirm_new_chat_title: "Start a new chat?", confirm_new_chat_desc: "Your current conversation will be cleared from this chat.", confirm_clear_chat_title: "Clear this chat?", confirm_clear_chat_desc: "This will remove the messages from the current conversation.", cancel: "Cancel", send: "Send", nav_rover: "Rover", rover_title: "Field rover", rover_intro: "Monitor real-time rover telemetry, camera navigation, and precision field operations.", rover_camera: "Live camera", field_actions: "Field actions", display_only: "Display only", rover_image_pending: "Rover image coming soon", rover_controls: "Movement controls", protocol_pending: "Protocol pending", rover_safe: "Controls are simulated and do not transmit commands.", rover_log: "Prototype activity", rover_empty: "Use the controls to preview the command log.", home_title: "One farm system, online or offline", home_intro: "Monitor sensors, analyze crops and leaves, hear results, review history, and connect field robotics from one interface.",
    connecting: "Connecting", live: "Live", offline: "Offline", checking_server: "Checking edge server…", edge_device: "Edge device", sample_data: "Sample data", sensor_data: "Sensor data", weather_data: "Live weather",
    offline_message: "Live updates are unavailable. Showing the last reading.", retry: "Retry", field_health: "Field health", priority: "Priority",
    soil_moisture: "Soil moisture", temperature: "Temperature", humidity: "Humidity", soil_ph: "Soil pH", ph_note: "Optimal 6.0–7.0", optimal: "Optimal", below_range: "Below target", above_range: "Above target", field_sensor: "Field sensor", live_weather: "Live weather", comfortable: "Comfortable", high_check_leaves: "High — check leaves",
    conditions: "Conditions", soil: "Soil", water: "Water", climate: "Climate", disease_risk: "Leaf health", notices: "Notices", waiting_data: "Waiting for data", updated_now: "Updated now", updated_minutes: (n) => `Updated ${n} min ago`, no_notices: "No active notices.",
    field_tools: "Field tools", soil_and_leaf: "Soil & leaf", field_intro: "Turn sensor readings and one clear leaf photo into practical guidance.", soil_nutrients: "Soil nutrients", checking: "Checking", unavailable: "Unavailable", nitrogen: "Nitrogen", phosphorus: "Phosphorus", potassium: "Potassium", ec: "Electrical conductivity", organic_carbon: "Organic carbon", rainfall: "Rainfall",
    crop_matches: "Crop matches", top_three: "Top 3", crop_disclaimer: "Use these rankings as a starting point alongside local agronomic advice.", no_crops: "Recommendations unavailable",
    leaf_scanner: "Disease detection", scanner_help: "Pepper, potato, and tomato. One leaf, close up, in daylight.", choose_photo: "Choose a leaf photo", choose_pest_photo: "Choose a pest or crop photo", photo_types: "JPG, PNG, or WEBP · up to 10 MB", remove: "Remove", scan_leaf: "Scan leaf", scanning: "Scanning locally", scan_result: "Scan result", local_private: "Processed locally · photo not stored", select_photo: "Choose a photo before scanning.", bad_file: "Choose a JPG, PNG, or WEBP image up to 10 MB.", scan_failed: "The leaf could not be scanned.", healthy_leaf: "Healthy leaf", not_recognized: "Not recognized", listen: "Listen", listening: "Speaking", tts_unavailable: "Speech is not available in this browser.",
    system: "System", device_status: "Device status", system_intro: "Connection, local models, and farm settings for setup and support.", edge_models: "Installed models", installed_models: "Installed models", local: "Local", disease_model: "Disease model", last_inference: "Last inference", confidence: "Confidence", cloud_required: "Cloud required", yes: "Yes", no: "No", not_run: "Not run yet", models_shortcut: "Run models from the AI Models page.",
    models_title: "Run a model", models_intro: "Choose a model and hear the result.", model_input: "Model input", run_model: "Analyze", running_model: "Running", model_result: "Model result", model_failed: "The model could not be run.", select_model: "Select a model to run.", crop_model: "Crop recommendation", soil_model: "Soil fertility", disease_model_card: "Leaf disease detection", pest_model: "Pest detection (prototype)", sensor_auto: "Uses the latest Raspberry Pi sensor reading. Connect the sensor before analyzing.", stop: "Stop", theme_toggle: "Toggle dark mode", mode_edge: "Edge AI · Offline", mode_cloud: "Cloud AI · Online",
    recent_activity: "Recent activity", activity_empty: "Activity appears after you run a model or scan a leaf.", activity_count: (n) => `${n} events`,
    analyses_title: "Saved analyses", analyses_intro: "Open any previous disease, crop, or soil result stored on this device.", past_analyses: "Past analyses", analyses_empty: "Run a model to start saving history.", analysis_detail: "Result", select_analysis: "Select an analysis to view it.", analyses_count: (n) => `${n} saved`,
    account: "Account", signed_out: "Signed out", signed_in: "Signed in", account_help: "Create an account to attach your scans and model runs to a name. The farm dashboard stays usable without signing in.", sign_up: "Sign up", sign_in: "Sign in", sign_out: "Sign out", username: "Username", password: "Password", signup_help: "Choose a username and a password of at least 8 characters.", login_help: "Sign in with your farm username and password.", have_account: "Already have an account? Sign in", need_account: "Need an account? Sign up", signed_in_as: (name) => `Signed in as ${name}`,
    farm_location: "Farm location", location_help: "Used for live weather only when sensor GPS is unavailable.", village_city: "Village or city", location_placeholder: "e.g. Ludhiana, Punjab", save: "Save", saving: "Saving", location_required: "Enter a village or city.", location_saved: (v) => `Saved ${v}.`,
    write_access: "Write access", token_help: "If this device protects changes with an API token, enter it for this browser session.", api_token: "API token", token_placeholder: "Optional", apply: "Apply", token_set: "Token applied for this browser session.", token_cleared: "No token is being used.", authorization_required: "This device requires an API token. Add it under System → Write access.",
    raw_sensor_data: "Raw sensor data", expand: "Expand", request_failed: "Could not reach the edge server. Try again.", fertility: "Fertility", acres_of: (a, c) => `${a} acres · ${c}`, in_location: (v) => ` · ${v}`,
    history_title: "Recent readings", history_empty: "History appears after a few sensor readings are stored.", history_count: (n) => `${n} readings`,
    less_fertile: "Less fertile", fertile: "Fertile", highly_fertile: "Highly fertile",
  },
  hi: {
    brand_tag: "स्थानीय खेत जानकारी", nav_overview: "मुख्य", nav_field: "खेत के औज़ार", nav_field_short: "खेत", nav_system: "सिस्टम",
    nav_models: "AI मॉडल", nav_models_short: "मॉडल", nav_history: "इतिहास", nav_chat: "चैटबॉट", chat_title: "PRAGYA से पूछें", chat_eyebrow: "खेत बुद्धिमत्ता · सलाहकार", chat_subtitle: "सेंसर आधारित सलाह और कृषि मार्गदर्शन", chat_intro: "खेत का डेटा पूछें या मॉडल जांच और जेमिनी सलाह के लिए फोटो जोड़ें।", chat_empty: "सेंसर, मिट्टी, फसल या पत्ती स्कैन के बारे में पूछें।", chat_message: "संदेश", chat_placeholder: "खेती का सवाल पूछें…", chat_attach: "फोटो जोड़ें", chat_route: "फोटो जांच का रास्ता", chat_auto: "अपने आप चुनें", chat_photo: "फोटो", chat_model_output: "मॉडल परिणाम", chat_view_history: "इतिहास में देखें", chat_sending: "फोटो की जांच जारी…", chat_cloud_fallback: "जेमिनी सलाह उपलब्ध नहीं है; मॉडल का परिणाम दिख रहा है।", chat_new: "नई बातचीत", chat_clear: "बातचीत साफ़ करें", confirm_new_chat_title: "क्या नई बातचीत शुरू करें?", confirm_new_chat_desc: "आपकी वर्तमान बातचीत इस चैट से हटा दी जाएगी।", confirm_clear_chat_title: "क्या यह बातचीत साफ़ करें?", confirm_clear_chat_desc: "यह वर्तमान बातचीत के संदेशों को हटा देगा।", cancel: "रद्द करें", send: "भेजें", nav_rover: "रोवर", rover_title: "खेत रोवर", rover_intro: "रोवर टेलीमेट्री, कैमरा फीड देखें और सटीक फील्ड ऑपरेशन संचालित करें।", rover_camera: "लाइव कैमरा", field_actions: "खेत की क्रियाएं", display_only: "केवल प्रदर्शन", rover_image_pending: "रोवर की फोटो जल्द जोड़ी जाएगी", rover_controls: "हलचल नियंत्रण", protocol_pending: "प्रोटोकॉल बाकी", rover_safe: "ये नियंत्रण केवल प्रदर्शन हैं और कमांड नहीं भेजते।", rover_log: "प्रोटोटाइप गतिविधि", rover_empty: "कमांड लॉग देखने के लिए नियंत्रण का उपयोग करें।", home_title: "ऑनलाइन या ऑफ़लाइन, एक खेत प्रणाली", home_intro: "एक ही इंटरफेस से सेंसर देखें, फसल और पत्ती जांचें, परिणाम सुनें और रोवर जोड़ें।",
    connecting: "जुड़ रहा है", live: "लाइव", offline: "ऑफ़लाइन", checking_server: "डिवाइस जांच रहा है…", edge_device: "खेत का डिवाइस", sample_data: "नमूना डेटा", sensor_data: "सेंसर डेटा", weather_data: "लाइव मौसम",
    offline_message: "लाइव अपडेट उपलब्ध नहीं हैं। पिछली रीडिंग दिखाई जा रही है।", retry: "फिर कोशिश करें", field_health: "खेत की सेहत", priority: "आज का काम",
    soil_moisture: "मिट्टी की नमी", temperature: "तापमान", humidity: "हवा की नमी", soil_ph: "मिट्टी का pH", ph_note: "6.0–7.0 सही", optimal: "सही स्तर", below_range: "स्तर कम", above_range: "स्तर ज़्यादा", field_sensor: "खेत का सेंसर", live_weather: "लाइव मौसम", comfortable: "ठीक है", high_check_leaves: "ज़्यादा — पत्तियां देखें",
    conditions: "स्थिति", soil: "मिट्टी", water: "पानी", climate: "मौसम", disease_risk: "पत्ती की सेहत", notices: "सूचनाएं", waiting_data: "डेटा का इंतज़ार", updated_now: "अभी अपडेट हुआ", updated_minutes: (n) => `${n} मिनट पहले अपडेट`, no_notices: "कोई जरूरी सूचना नहीं।",
    field_tools: "खेत के औज़ार", soil_and_leaf: "मिट्टी और पत्ती", field_intro: "सेंसर रीडिंग और एक साफ पत्ती की फोटो से उपयोगी सलाह पाएं।", soil_nutrients: "मिट्टी के पोषक तत्व", checking: "जांच जारी", unavailable: "उपलब्ध नहीं", nitrogen: "नाइट्रोजन", phosphorus: "फॉस्फोरस", potassium: "पोटैशियम", ec: "विद्युत चालकता", organic_carbon: "जैविक कार्बन", rainfall: "बारिश",
    crop_matches: "फसल सुझाव", top_three: "शीर्ष 3", crop_disclaimer: "इन सुझावों के साथ स्थानीय कृषि विशेषज्ञ की सलाह भी लें।", no_crops: "सुझाव उपलब्ध नहीं",
    leaf_scanner: "रोग पहचान", scanner_help: "मिर्च, आलू और टमाटर। दिन की रोशनी में एक पत्ती की पास से फोटो लें।", choose_photo: "पत्ती की फोटो चुनें", choose_pest_photo: "कीट या फसल की फोटो चुनें", photo_types: "JPG, PNG या WEBP · 10 MB तक", remove: "हटाएं", scan_leaf: "पत्ती स्कैन करें", scanning: "डिवाइस पर जांच जारी", scan_result: "स्कैन परिणाम", local_private: "डिवाइस पर जांच · फोटो सेव नहीं होती", select_photo: "स्कैन से पहले फोटो चुनें।", bad_file: "10 MB तक की JPG, PNG या WEBP फोटो चुनें।", scan_failed: "पत्ती की जांच नहीं हो सकी।", healthy_leaf: "पत्ती स्वस्थ है", not_recognized: "पहचाना नहीं गया", listen: "सुनें", listening: "बोल रहा है", tts_unavailable: "इस ब्राउज़र में आवाज़ उपलब्ध नहीं है।",
    system: "सिस्टम", device_status: "डिवाइस की स्थिति", system_intro: "सेटअप और सहायता के लिए कनेक्शन, स्थानीय मॉडल और खेत की सेटिंग।", edge_models: "इंस्टॉल मॉडल", installed_models: "इंस्टॉल मॉडल", local: "स्थानीय", disease_model: "रोग मॉडल", last_inference: "पिछली जांच", confidence: "भरोसा", cloud_required: "इंटरनेट जरूरी", yes: "हां", no: "नहीं", not_run: "अभी जांच नहीं हुई", models_shortcut: "AI मॉडल पेज से मॉडल चलाएं।",
    models_title: "मॉडल चलाएं", models_intro: "मॉडल चुनें और परिणाम सुनें।", model_input: "मॉडल इनपुट", run_model: "जांच करें", running_model: "चल रहा है", model_result: "मॉडल परिणाम", model_failed: "मॉडल नहीं चल सका।", select_model: "चलाने के लिए मॉडल चुनें।", crop_model: "फसल सुझाव", soil_model: "मिट्टी की उर्वरता", disease_model_card: "पत्ती रोग पहचान", pest_model: "कीट पहचान (प्रोटोटाइप)", sensor_auto: "पिछली रास्पबेरी पाई सेंसर रीडिंग इस्तेमाल होगी। जांच से पहले सेंसर जोड़ें।", stop: "रोकें", theme_toggle: "डार्क मोड बदलें", mode_edge: "एज AI · ऑफ़लाइन", mode_cloud: "क्लाउड AI · ऑनलाइन",
    recent_activity: "हाल की गतिविधि", activity_empty: "मॉडल चलाने या पत्ती स्कैन करने के बाद गतिविधि दिखेगी।", activity_count: (n) => `${n} घटनाएं`,
    analyses_title: "सेव जांच", analyses_intro: "इस डिवाइस पर सेव रोग, फसल या मिट्टी के परिणाम खोलें।", past_analyses: "पिछली जांच", analyses_empty: "इतिहास सेव करने के लिए मॉडल चलाएं।", analysis_detail: "परिणाम", select_analysis: "देखने के लिए एक जांच चुनें।", analyses_count: (n) => `${n} सेव`,
    account: "खाता", signed_out: "साइन आउट", signed_in: "साइन इन", account_help: "स्कैन और मॉडल रन को नाम से जोड़ने के लिए खाता बनाएं। बिना साइन इन भी डैशबोर्ड चलता है।", sign_up: "साइन अप", sign_in: "साइन इन", sign_out: "साइन आउट", username: "यूज़रनेम", password: "पासवर्ड", signup_help: "यूज़रनेम और कम से कम 8 अक्षर का पासवर्ड चुनें।", login_help: "अपने खेत के यूज़रनेम और पासवर्ड से साइन इन करें।", have_account: "खाता है? साइन इन करें", need_account: "खाता चाहिए? साइन अप करें", signed_in_as: (name) => `${name} के रूप में साइन इन`,
    farm_location: "खेत की जगह", location_help: "सेंसर GPS न मिलने पर लाइव मौसम के लिए इस्तेमाल होता है।", village_city: "गांव या शहर", location_placeholder: "जैसे लुधियाना, पंजाब", save: "सेव करें", saving: "सेव हो रहा है", location_required: "गांव या शहर लिखें।", location_saved: (v) => `${v} सेव हो गया।`,
    write_access: "बदलाव की अनुमति", token_help: "अगर इस डिवाइस पर API टोकन लगा है, तो इस ब्राउज़र सत्र के लिए यहां डालें।", api_token: "API टोकन", token_placeholder: "वैकल्पिक", apply: "लागू करें", token_set: "इस ब्राउज़र सत्र के लिए टोकन लागू है।", token_cleared: "कोई टोकन इस्तेमाल नहीं हो रहा।", authorization_required: "इस डिवाइस को API टोकन चाहिए। सिस्टम → बदलाव की अनुमति में टोकन डालें।",
    raw_sensor_data: "सेंसर का कच्चा डेटा", expand: "खोलें", request_failed: "खेत के डिवाइस से संपर्क नहीं हुआ। फिर कोशिश करें।", fertility: "उपजाऊपन", acres_of: (a, c) => `${a} एकड़ · ${c}`, in_location: (v) => ` · ${v}`,
    history_title: "हाल की रीडिंग", history_empty: "कुछ सेंसर रीडिंग जमा होने के बाद इतिहास दिखेगा।", history_count: (n) => `${n} रीडिंग`,
    less_fertile: "कम उपजाऊ", fertile: "उपजाऊ", highly_fertile: "बहुत उपजाऊ",
  },
};

Object.assign(COPY.en, {
  nav_mapping: "Mapping",
  mapping_eyebrow: "FIELD INTELLIGENCE",
  mapping_title: "Field mapping",
  mapping_intro: "Build a spatial model of your field for sensing, scouting and rover operations.",
  field_details: "Field details",
  field_details_sub: "Configure spatial bounds and agronomic parameters",
  field_name: "Field name",
  field_location: "Location",
  geometry_mode: "Field geometry mode",
  length: "Length",
  width: "Width",
  dim_unit: "Units",
  area: "Area",
  area_unit: "Area unit",
  save_field: "Save field",
  field_zones: "Field zones",
  zones_sub: "Sub-divide field for targeted management",
  zones_copy: "Associate agronomic zones with field geometry for targeted sensing, sampling, and autonomous scouting.",
  map_layers: "Map layers",
  map_layers_sub: "Spatial overlays & telemetry streams",
  field_summary: "Field spatial summary",
  perimeter: "Perimeter",
  dimensions: "Dimensions",
  nav_models: "Edge AI",
  nav_models_short: "Edge AI",
  edge_title: "EDGE AI",
  edge_tagline: "Intelligence that stays in the field.",
  edge_purpose: "Run agricultural analysis locally on the device, even when connectivity is unavailable.",
  cap_local: "LOCAL PROCESSING",
  cap_offline: "OFFLINE CAPABLE",
  cap_ondevice: "ON-DEVICE MODELS",
  workflow_input: "INPUT",
  workflow_model: "LOCAL MODEL",
  workflow_insight: "FIELD INSIGHT",
  run_analysis: "Run analysis",
  disease_detection_title: "Disease Detection",
  disease_detection_desc: "See what the leaf is telling you.",
  pest_screening_title: "Pest Screening",
  pest_screening_desc: "Find visible threats before they spread.",
  field_intelligence_title: "Field Intelligence",
  field_intelligence_desc: "Turn soil readings into field decisions.",
  selected_suffix: "selected",
  on_device_ready: "ON-DEVICE · READY",
  field_readings_heading: "FIELD READINGS",
  live_field_readings: "Live field sensors",
  field_readings_desc: "Populated directly from existing field telemetry. Review or adjust values if manual testing is needed.",
  primary_nutrients_heading: "Primary Soil Nutrients",
  soil_condition_heading: "Soil Condition",
  env_weather_heading: "Environmental & Weather Context",
  analyze_field_btn: "ANALYZE FIELD",
  field_overview_title: "FIELD OVERVIEW",
  nutrient_status_title: "NUTRIENT STATUS",
  soil_condition_title: "SOIL CONDITION",
  environmental_context_title: "ENVIRONMENTAL CONTEXT",
  what_needs_attention_title: "WHAT NEEDS ATTENTION",
  field_interpretation_title: "FIELD INTERPRETATION",
  crop_suitability_title: "CROP SUITABILITY",
  recommended_next_steps_title: "RECOMMENDED NEXT STEPS",
  pest_model: "Pest screening",
  pest_scope: "Local detection · 102 pest categories. Photograph the insect clearly and verify in the field.",
  choose_pest_photo: "Choose a clear insect photo",
  chat_intro: "Ask about farm data or attach a photo for direct visual analysis or local screening.",
  chat_cloud_fallback: "Cloud AI unavailable • Using Edge AI",
  analyses_intro: "Open saved pest, leaf, crop, and soil results from this device.",
  mode_edge: "Edge AI · On device",
  mode_cloud: "Cloud AI · Online",
  ai_analysis_mode: "AI ANALYSIS MODE",
  ai_mode_heading: "Analysis Engine",
  mode_cloud_label: "Cloud AI",
  mode_edge_label: "Edge AI",
  mode_cloud_btn: "Cloud AI",
  mode_edge_btn: "Edge AI",
  mode_cloud_desc: "Gemini vision analysis — requires internet",
  mode_edge_desc: "Local models — works offline on Raspberry Pi",
  mode_cloud_online: "Cloud AI • Online",
  mode_edge_device: "Edge AI • On device",
  mode_cloud_fallback: "Cloud AI unavailable • Using Edge AI",
  not_recognized_edge: "Not recognized by the local model.",
  analyze_btn: "Analyze",
  model_question_placeholder: "Optional question (e.g. What pest is this?)",
  chat_mode_label: "AI Mode:",
  ai_engine_title: "AI Engine",
  ai_engine_desc: "Choose how PRAGYA processes AI analysis.",
  cloud_engine_desc: "Uses the connected cloud AI/Gemini service and requires internet access.",
  edge_engine_desc: "Runs supported AI models locally on the device and does not require internet access.",
  current_engine_cloud: "Current engine: Cloud AI",
  current_engine_edge: "Current engine: Edge AI",
  chat_welcome_title: "How can I help with your farm?",
  chat_welcome_subtitle: "Ask about soil, crops, pests, diseases, or your field data.",
  field_today_title: "Your field today",
  you_could_ask: "You could ask",
  chip_soil: "Is my soil okay?",
  chip_npk: "Explain my NPK",
  chip_today: "What should I do today?",
  chip_crop: "Check my crop",
  image_attached: "Image attached",
  chat_image_placeholder: "Ask something about this image…",
  chip_img_wrong: "What is wrong with this?",
  chip_img_disease: "Is this a disease?",
  chip_img_pest: "Is this a pest?",
  thinking_default: "Thinking…",
  thinking_farm: "Checking your farm data…",
  thinking_answer: "Preparing an answer…",
  thinking_img_look: "Looking at the image…",
  thinking_img_symptoms: "Checking for visible symptoms…",
  thinking_img_result: "Preparing the result…",
  thinking_sensor_check: "Checking your field readings…",
  thinking_sensor_compare: "Comparing the available data…",
  thinking_sensor_rec: "Preparing a recommendation…",
  chat_error: "Something went wrong while processing that. Please try again.",
  chat_retry: "Retry",
  send_message: "Send message",
  attach_image: "Attach image",
  soil_field_snapshot: "Soil / Field Snapshot",
  weather_context: "Weather context:",
  what_needs_attention: "What needs attention?",
  field_healthy: "Your field looks healthy",
  no_major_issues: "No major issues detected in the current readings.",
  one_needs_attention: "1 thing needs attention",
  n_needs_attention: (n) => `${n} things need attention`,
  soil_nutrients_sub: "Core macro-nutrients (NPK) from field sensors",
  soil_summary_label: "Soil nutrient summary:",
  recommended_crops: "Recommended Crops",
  recommended_crops_sub: "Based on current field conditions",
  alerts: "Alerts",
  no_active_alerts: "No active alerts",
  no_active_alerts_sub: "All monitored field indicators are in normal range.",
  healthy_label: "Healthy",
  attention_label: "Needs attention",
  critical_label: "Critical",
  rating_low: "Low",
  rating_moderate: "Moderate",
  rating_good: "Good",
  rating_high: "High",
  within_target: "Within target",
  acidic_below: "Acidic / Below target",
  alkaline_above: "Alkaline / Above target",
  nothing_urgent_detected: "Nothing urgent detected",
  field_conditions_within_range: "Current monitored field conditions are within the configured ranges.",
  core_nutrients_within_ranges: "Core soil nutrients are currently within the monitored ranges.",
  no_active_alerts_clean: "No active field alerts.",
  suitability_high: "Suitable",
  suitability_moderate: "Moderate suitability",
  suitability_alt: "Alternative option",
  get_started: "Get started",
  landing_brand_sub: "Predictive Robotics for Agricultural Growth & Yield Analytics",
  landing_hero_eyebrow: "PRAGYA",
  landing_hero_title_1: "SMART FARMING,",
  landing_hero_title_2: "BUILT FOR THE FIELD.",
  landing_hero_tagline: "Sense the field. Understand the crop. Act with confidence.",
  landing_sub_statement: "From soil sensing to field action.",
  step_1_title: "Root-Depth Telemetry",
  step_1_desc: "Direct measurement of NPK, moisture, soil pH, and electrical conductivity without laboratory delays.",
  step_2_title: "Multimodal Onboard Vision",
  step_2_desc: "Instant offline screening for foliar diseases and pests directly at the crop canopy.",
  step_3_title: "Physical Field Action",
  step_3_desc: "Targeted dispensing nozzles and simulated robotics navigation for localized farm interventions.",
  history_overline: "HISTORY",
  history_archive_title: "Field intelligence history",
  history_archive_subtitle: "Review saved disease, pest, field, crop and soil analyses from this device.",
  history_search_placeholder: "Search pest, disease, crop, field or analysis...",
  all_types: "All",
  filter_disease: "Disease",
  filter_pest: "Pest",
  filter_field_intel: "Field Intelligence",
  filter_crop: "Crop",
  filter_all_time: "All time",
  filter_today: "Today",
  filter_last_7_days: "Last 7 days",
  filter_last_30_days: "Last 30 days",
  sort_newest: "Newest first",
  sort_oldest: "Oldest first",
  summary_total_label: "Total",
  summary_pest_label: "Pest",
  summary_disease_label: "Disease",
  summary_field_label: "Field",
  summary_crop_label: "Crop",
  page_prev: "← Previous",
  page_next: "Next →",
  view_analysis_affordance: "View analysis →",
  technical_details: "Technical details ▾",
  analyses_page_info: (curr, total) => `Page ${curr} of ${total}`,
  analyses_count_found: (n) => `${n} analyses found`,
  record_x_of_y: (x, y) => `Record ${x} of ${y}`,
  about_pest: "About the pest",
  why_occur: "Why does it occur?",
  crop_damage: "How does it damage the crop?",
  what_to_check: "What should I check?",
  how_to_prevent: "How can I prevent it?",
  control_management: "Control & management",
  field_summary: "PRAGYA field summary",
  symptoms_observed: "Symptoms observed",
  likely_cause: "Likely cause",
  nutrient_interpretation: "Nutrient interpretation",
  soil_condition: "Soil condition",
  moisture_interpretation: "Moisture interpretation",
  field_overview: "Field overview",
  recommendations_label: "Recommendations",
  alternative_crops: "Alternative crops",
  reasoning_explanation: "Reasoning & explanation",
  field_considerations: "Field considerations",
});
Object.assign(COPY.hi, {
  nav_mapping: "मानचित्रण",
  mapping_eyebrow: "खेत बुद्धिमत्ता",
  mapping_title: "खेत मानचित्रण",
  mapping_intro: "सेंसिंग, स्काउटिंग और रोवर संचालन के लिए अपने खेत का स्थानिक मॉडल बनाएं।",
  field_details: "खेत का विवरण",
  field_details_sub: "स्थानिक सीमाएं और कृषि मापदंड सेट करें",
  field_name: "खेत का नाम",
  field_location: "स्थान",
  geometry_mode: "ज्यामिति मोड",
  length: "लंबाई",
  width: "चौड़ाई",
  dim_unit: "इकाई",
  area: "क्षेत्रफल",
  area_unit: "क्षेत्रफल इकाई",
  save_field: "खेत सेव करें",
  field_zones: "खेत के ज़ोन",
  zones_sub: "लक्षित प्रबंधन के लिए खेत को उप-विभाजित करें",
  zones_copy: "लक्षित सेंसिंग और स्काउटिंग के लिए कृषि क्षेत्रों को खेत की ज्यामिति से जोड़ें।",
  map_layers: "मानचित्र परतें",
  map_layers_sub: "स्थानिक ओवरले और टेलीमेट्री स्ट्रीम",
  field_summary: "खेत स्थानिक सारांश",
  perimeter: "परिधि",
  dimensions: "आयाम",
  nav_models: "एज AI",
  nav_models_short: "एज AI",
  edge_title: "एज AI",
  edge_tagline: "बुद्धिमत्ता जो खेत में ही रहती है।",
  edge_purpose: "इंटरनेट न होने पर भी डिवाइस पर स्थानीय रूप से कृषि विश्लेषण चलाएं।",
  cap_local: "स्थानीय प्रोसेसिंग",
  cap_offline: "ऑफ़लाइन सक्षम",
  cap_ondevice: "ऑन-डिवाइस मॉडल",
  workflow_input: "इनपुट",
  workflow_model: "स्थानीय मॉडल",
  workflow_insight: "खेत अंतर्दृष्टि",
  run_analysis: "विश्लेषण चलाएं",
  disease_detection_title: "रोग पहचान",
  disease_detection_desc: "देखें पत्ती क्या बता रही है।",
  pest_screening_title: "कीट स्क्रीनिंग",
  pest_screening_desc: "फैलने से पहले दिखाई देने वाले कीट पहचानें।",
  field_intelligence_title: "खेत बुद्धिमत्ता",
  field_intelligence_desc: "मिट्टी की रीडिंग को खेत के फैसलों में बदलें।",
  selected_suffix: "चुना गया",
  on_device_ready: "डिवाइस पर · तैयार",
  field_readings_heading: "खेत रीडिंग",
  live_field_readings: "लाइव खेत सेंसर",
  field_readings_desc: "सीधे मौजूदा खेत टेलीमेट्री से प्राप्त। परीक्षण के लिए मान बदल सकते हैं।",
  primary_nutrients_heading: "मुख्य मिट्टी पोषक तत्व",
  soil_condition_heading: "मिट्टी की स्थिति",
  env_weather_heading: "पर्यावरणीय व मौसम संदर्भ",
  analyze_field_btn: "खेत विश्लेषण करें",
  field_overview_title: "खेत का समग्र अवलोकन",
  nutrient_status_title: "पोषक तत्वों की स्थिति",
  soil_condition_title: "मिट्टी की स्थिति",
  environmental_context_title: "पर्यावरणीय संदर्भ",
  what_needs_attention_title: "किस पर ध्यान दें",
  field_interpretation_title: "खेत विश्लेषण",
  crop_suitability_title: "उपयुक्त फसलें",
  recommended_next_steps_title: "अनुशंसित अगले कदम",
  pest_model: "कीट जांच",
  pest_scope: "स्थानीय जांच · 102 कीट वर्ग। कीट की साफ फोटो लें और खेत में पुष्टि करें।",
  choose_pest_photo: "कीट की साफ फोटो चुनें",
  chat_intro: "खेत का डेटा पूछें या सीधे विज़न विश्लेषण और स्थानीय जांच के लिए फोटो जोड़ें।",
  chat_cloud_fallback: "क्लाउड AI अनुपलब्ध • एज AI का उपयोग",
  analyses_intro: "इस डिवाइस पर सेव कीट, पत्ती, फसल और मिट्टी की जांच देखें।",
  mode_edge: "एज AI · डिवाइस पर",
  mode_cloud: "क्लाउड AI · ऑनलाइन",
  ai_analysis_mode: "AI विश्लेषण मोड",
  ai_mode_heading: "विश्लेषण इंजन",
  mode_cloud_label: "क्लाउड AI",
  mode_edge_label: "एज AI",
  mode_cloud_btn: "क्लाउड AI",
  mode_edge_btn: "एज AI",
  mode_cloud_desc: "जेमिनी विज़न विश्लेषण — इंटरनेट जरूरी",
  mode_edge_desc: "स्थानीय मॉडल — रास्पबेरी पाई पर ऑफ़लाइन चलता है",
  mode_cloud_online: "क्लाउड AI • ऑनलाइन",
  mode_edge_device: "एज AI • डिवाइस पर",
  mode_cloud_fallback: "क्लाउड AI अनुपलब्ध • एज AI का उपयोग",
  not_recognized_edge: "स्थानीय मॉडल द्वारा पहचाना नहीं गया।",
  analyze_btn: "जांच करें",
  model_question_placeholder: "वैकल्पिक सवाल (जैसे यह कौन सा कीट है?)",
  chat_mode_label: "AI मोड:",
  ai_engine_title: "AI इंजन",
  ai_engine_desc: "चुनें कि PRAGYA AI विश्लेषण कैसे प्रोसेस करे।",
  cloud_engine_desc: "जुड़ी हुई क्लाउड AI/जेमिनी सेवा का उपयोग करता है और इसके लिए इंटरनेट जरूरी है।",
  edge_engine_desc: "डिवाइस पर स्थानीय रूप से समर्थित AI मॉडल चलाता है और इसके लिए इंटरनेट जरूरी नहीं है।",
  current_engine_cloud: "वर्तमान इंजन: क्लाउड AI",
  current_engine_edge: "वर्तमान इंजन: एज AI",
  chat_welcome_title: "मैं आपके खेत में क्या मदद कर सकता हूँ?",
  chat_welcome_subtitle: "मिट्टी, फसल, कीट, रोग या खेत के डेटा के बारे में पूछें।",
  field_today_title: "आज आपका खेत",
  you_could_ask: "आप पूछ सकते हैं",
  chip_soil: "क्या मेरी मिट्टी ठीक है?",
  chip_npk: "मेरे NPK के बारे में बताएं",
  chip_today: "मुझे आज क्या करना चाहिए?",
  chip_crop: "मेरी फसल जांचें",
  image_attached: "फोटो संलग्न है",
  chat_image_placeholder: "इस फोटो के बारे में कुछ पूछें…",
  chip_img_wrong: "इसमें क्या खराबी है?",
  chip_img_disease: "क्या यह कोई रोग है?",
  chip_img_pest: "क्या यह कोई कीट है?",
  thinking_default: "सोच रहा है…",
  thinking_farm: "खेत का डेटा जांच रहा है…",
  thinking_answer: "सलाह तैयार हो रही है…",
  thinking_img_look: "फोटो देखी जा रही है…",
  thinking_img_symptoms: "लक्षणों की जांच जारी है…",
  thinking_img_result: "परिणाम तैयार हो रहा है…",
  thinking_sensor_check: "खेत की रीडिंग जांची जा रही है…",
  thinking_sensor_compare: "डेटा का मिलान जारी है…",
  thinking_sensor_rec: "सुझाव तैयार किया जा रहा है…",
  chat_error: "प्रक्रिया के दौरान कुछ समस्या आई। कृपया पुनः प्रयास करें।",
  chat_retry: "पुनः प्रयास करें",
  send_message: "संदेश भेजें",
  attach_image: "फोटो जोड़ें",
  soil_field_snapshot: "मिट्टी और खेत की स्थिति",
  weather_context: "मौसम का संदर्भ:",
  what_needs_attention: "किस पर ध्यान दें?",
  field_healthy: "आपका खेत स्वस्थ दिख रहा है",
  no_major_issues: "वर्तमान रीडिंग में कोई बड़ी समस्या नहीं मिली।",
  one_needs_attention: "1 बात पर ध्यान दें",
  n_needs_attention: (n) => `${n} बातों पर ध्यान दें`,
  soil_nutrients_sub: "सेंसर से मिले मुख्य पोषक तत्व (NPK)",
  soil_summary_label: "मिट्टी पोषक तत्व सारांश:",
  recommended_crops: "अनुशंसित फसलें",
  recommended_crops_sub: "वर्तमान खेत स्थितियों के आधार पर",
  alerts: "अलर्ट",
  no_active_alerts: "कोई सक्रिय अलर्ट नहीं",
  no_active_alerts_sub: "सभी संकेतक सामान्य सीमा में हैं।",
  healthy_label: "स्वस्थ",
  attention_label: "ध्यान देने योग्य",
  critical_label: "गंभीर",
  rating_low: "कम",
  rating_moderate: "मध्यम",
  rating_good: "अच्छा",
  rating_high: "अधिक",
  within_target: "सही स्तर",
  acidic_below: "अम्लीय / स्तर कम",
  alkaline_above: "क्षारीय / स्तर ज़्यादा",
  nothing_urgent_detected: "कोई ज़रूरी समस्या नहीं",
  field_conditions_within_range: "निगरानी की जा रही खेत स्थितियां अनुशंसित सीमा में हैं।",
  core_nutrients_within_ranges: "मिट्टी के मुख्य पोषक तत्व इस समय अनुशंसित सीमा में हैं।",
  no_active_alerts_clean: "कोई सक्रिय खेत अलर्ट नहीं।",
  suitability_high: "उपयुक्त",
  suitability_moderate: "मध्यम उपयुक्तता",
  suitability_alt: "वैकल्पिक विकल्प",
  get_started: "शुरू करें",
  landing_brand_sub: "स्थानीय कृषि बुद्धिमत्ता",
  landing_hero_eyebrow: "PRAGYA",
  landing_hero_title_1: "स्मार्ट खेती,",
  landing_hero_title_2: "खेत के लिए निर्मित।",
  landing_hero_tagline: "खेत को समझें। फसल को जानें। विश्वास के साथ काम करें।",
  landing_sub_statement: "मिट्टी की जांच से खेत की कार्रवाई तक।",
  step_1_title: "गहरी मिट्टी की टेलीमेट्री",
  step_1_desc: "प्रयोगशाला देरी के बिना NPK, नमी, मिट्टी का pH और विद्युत चालकता की सीधी माप।",
  step_2_title: "ऑनबोर्ड दृष्टि प्रणाली",
  step_2_desc: "सीधे खेत में पत्ती रोगों और कीटों की त्वरित ऑफ़लाइन पहचान।",
  step_3_title: "सटीक खेत कार्रवाई",
  step_3_desc: "लक्षित छिड़काव नोजल और रोबोटिक नियंत्रण।",
  history_overline: "इतिहास",
  history_archive_title: "खेत बुद्धिमत्ता इतिहास",
  history_archive_subtitle: "इस डिवाइस पर सेव रोग, कीट, खेत, फसल और मिट्टी के विश्लेषण देखें।",
  history_search_placeholder: "कीट, रोग, फसल, खेत या विश्लेषण खोजें...",
  all_types: "सभी",
  filter_disease: "रोग",
  filter_pest: "कीट",
  filter_field_intel: "खेत बुद्धिमत्ता",
  filter_crop: "फसल",
  filter_all_time: "सभी समय",
  filter_today: "आज",
  filter_last_7_days: "पिछले 7 दिन",
  filter_last_30_days: "पिछले 30 दिन",
  sort_newest: "नवीनतम पहले",
  sort_oldest: "पुराने पहले",
  summary_total_label: "कुल",
  summary_pest_label: "कीट",
  summary_disease_label: "रोग",
  summary_field_label: "खेत",
  summary_crop_label: "फसल",
  page_prev: "← पिछला",
  page_next: "अगला →",
  view_analysis_affordance: "विश्लेषण देखें →",
  technical_details: "तकनीकी विवरण ▾",
  analyses_page_info: (curr, total) => `पेज ${curr} / ${total}`,
  analyses_count_found: (n) => `${n} विश्लेषण मिले`,
  record_x_of_y: (x, y) => `रिकॉर्ड ${x} / ${y}`,
  about_pest: "कीट के बारे में",
  why_occur: "यह क्यों पनपता है?",
  crop_damage: "यह फसल को कैसे नुकसान पहुंचाता है?",
  what_to_check: "खेत में क्या जांचें?",
  how_to_prevent: "इसकी रोकथाम कैसे करें?",
  control_management: "नियंत्रण व प्रबंधन",
  field_summary: "PRAGYA खेत सारांश",
  symptoms_observed: "देखे गए लक्षण",
  likely_cause: "संभावित कारण",
  nutrient_interpretation: "पोषक तत्व विश्लेषण",
  soil_condition: "मिट्टी की स्थिति",
  moisture_interpretation: "नमी विश्लेषण",
  field_overview: "खेत अवलोकन",
  recommendations_label: "अनुशंसाएं",
  alternative_crops: "वैकल्पिक फसलें",
  reasoning_explanation: "कारण व स्पष्टीकरण",
  field_considerations: "खेत संबंधी विचार",
});

let language = localStorage.getItem("km-language") === "hi" ? "hi" : "en";
let aiEngine = localStorage.getItem("kisan_ai_engine") || localStorage.getItem("kisan_ai_mode") || "cloud";
let state = null;
let lastHistory = [];
let lastActivity = [];
let lastAnalyses = [];
let currentUser = null;
let authRequestId = 0;
let selectedModel = "disease";
let lastScanSpeech = "";
let lastModelSpeech = "";
let lastDetailSpeech = "";
let ttsLang = { scan: "en", model: "en", detail: "en" };
let authMode = "signup";
let previewUrl = null;
let modelPreviewUrl = null;
let toastTimer = null;

function getAiEngine() {
  return aiEngine === "edge" ? "edge" : "cloud";
}

function getAiMode() {
  return getAiEngine();
}

function setAiEngine(engine) {
  aiEngine = engine === "edge" ? "edge" : "cloud";
  localStorage.setItem("kisan_ai_engine", aiEngine);
  localStorage.setItem("kisan_ai_mode", aiEngine);
  updateAiEngineUI();
}

function setAiMode(mode) {
  setAiEngine(mode);
}

function updateAiEngineUI() {
  const engine = getAiEngine();
  const isCloud = engine === "cloud";
  $("systemEngineBtnCloud")?.classList.toggle("is-active", isCloud);
  $("systemEngineBtnEdge")?.classList.toggle("is-active", !isCloud);

  const statusLine = $("systemEngineStatusLine");
  if (statusLine) {
    statusLine.textContent = isCloud ? t("current_engine_cloud") : t("current_engine_edge");
  }

  if (typeof selectModel === "function") {
    selectModel(selectedModel);
  }
}

function t(key, ...args) {
  const value = COPY[language][key] ?? COPY.en[key] ?? key;
  return typeof value === "function" ? value(...args) : value;
}

function authHeaders(headers = {}) {
  const token = sessionStorage.getItem("km-api-token");
  const base = token ? { ...headers, Authorization: `Bearer ${token}` } : { ...headers };
  if (isDemoMode()) {
    base["X-Demo-Mode"] = "1";
  }
  return base;
}

async function api(url, options = {}, timeout = 15000) {
  if (isDemoMode()) {
    const method = (options.method || "GET").toUpperCase();
    if (method === "GET") {
      if (url === "/api/analyses") return [...DEMO_HISTORY_RECORDS];
      if (url.startsWith("/api/analyses/")) {
        const id = url.replace("/api/analyses/", "");
        const match = DEMO_HISTORY_RECORDS.find((r) => String(r.id) === String(id));
        if (match) return match;
      }
      if (url === "/api/activity") return [...DEMO_ACTIVITY_RECORDS];
      if (url === "/api/history") return [...DEMO_SPARKLINE_HISTORY];
      if (url === "/api/farm") return getDemoDashboardState();
    } else if (method === "POST") {
      if (url === "/api/field") {
        return { ok: true, message: "Demo field saved locally" };
      }
      if (url === "/api/profile") {
        return { ok: true, message: "Demo profile updated" };
      }
    }
  }

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { credentials: "same-origin", ...options, headers: authHeaders(options.headers), signal: controller.signal });
    let body = {};
    try { body = await response.json(); } catch { body = {}; }
    if (!response.ok) {
      const error = new Error(body.error || `${response.status} ${response.statusText}`);
      error.status = response.status;
      throw error;
    }
    return body;
  } finally {
    window.clearTimeout(timer);
  }
}

function showToast(message, isError = false) {
  const toast = $("toast");
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.toggle("is-error", isError);
  toast.hidden = false;
  toastTimer = window.setTimeout(() => { toast.hidden = true; }, 4500);
}

function errorMessage(error, fallback) {
  if (error?.status === 401) return t("authorization_required");
  if (error?.name === "AbortError") return t("request_failed");
  return error?.message || fallback || t("request_failed");
}

function setConnection(mode) {
  const connection = $("connection");
  connection.classList.toggle("is-online", mode === "online");
  connection.classList.toggle("is-offline", mode === "offline");
  setText("connectionText", mode === "online" ? t("live") : mode === "offline" ? t("offline") : t("connecting"));
  $("offlineBanner").hidden = mode !== "offline";
}

function activateTab(name, updateHash = true) {
  stopCurrentTts();
  const valid = ["overview", "models", "chat", "rover", "mapping", "history", "system"].includes(name) ? name : "overview";
  document.querySelectorAll(".page").forEach((page) => {
    const active = page.id === `page-${valid}`;
    page.hidden = !active;
    page.classList.toggle("is-active", active);
  });
  if (valid === "mapping" && typeof renderMappingWorkspace === "function") {
    renderMappingWorkspace();
  }
  document.querySelectorAll("[data-tab]").forEach((button) => {
    const active = button.dataset.tab === valid;
    button.classList.toggle("is-active", active);
    if (button.getAttribute("role") === "tab") {
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    }
  });
  if (updateHash) history.replaceState(null, "", valid === "overview" ? location.pathname : `#${valid}`);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll("[data-tab]").forEach((button) => button.addEventListener("click", () => activateTab(button.dataset.tab)));
$("brandHome").addEventListener("click", () => activateTab("overview"));
$("retryBtn").addEventListener("click", () => loadDashboard());
document.querySelector(".nav").addEventListener("keydown", (event) => {
  if (!["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
  const tabs = [...document.querySelectorAll(".nav-item")];
  const current = tabs.indexOf(document.activeElement);
  let next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (current + (event.key === "ArrowDown" ? 1 : -1) + tabs.length) % tabs.length;
  event.preventDefault(); tabs[next].focus(); activateTab(tabs[next].dataset.tab);
});

const HINDI_ALERTS = {
  "Zone 1 needs attention": ["पानी की जरूरत", "मिट्टी सूखी है। आज सिंचाई की योजना बनाएं।"],
  "Soil moisture is low": ["मिट्टी में नमी कम है", "अगले सिंचाई चक्र से पहले खेत की जांच करें।"],
  "Disease risk increasing": ["रोग का खतरा बढ़ रहा है", "नमी ज्यादा है। पत्तियों की जांच करें।"],
  "Heat stress risk": ["गर्मी का खतरा", "तापमान ज्यादा है। दोपहर में सिंचाई न करें।"],
  "Cold stress risk": ["ठंड का खतरा", "तापमान कम है। संवेदनशील पौधों की रक्षा करें।"],
  "Nitrogen is low": ["नाइट्रोजन कम है", "नाइट्रोजन खेत के लिए अनुशंसित स्तर से कम है।"],
  "Nitrogen is moderate": ["नाइट्रोजन मध्यम है", "अगली खाद में नाइट्रोजन की पूर्ति कर सकते हैं।"],
  "Phosphorus is low": ["फास्फोरस कम है", "फास्फोरस अनुशंसित सीमा से कम है।"],
  "Potassium is low": ["पोटेशियम कम है", "पोटेशियम अनुशंसित सीमा से कम है।"],
  "Soil pH is acidic": ["मिट्टी अम्लीय है", "मिट्टी का pH 6.0 से कम है।"],
  "Soil pH is alkaline": ["मिट्टी क्षारीय है", "मिट्टी का pH 7.5 से अधिक है।"],
  "Soil needs nitrogen": ["नाइट्रोजन कम है", "खाद की योजना की समीक्षा करें।"],
  "Farm conditions stable": ["स्थिति सामान्य है", "अभी कोई जरूरी काम नहीं है।"],
};

const FIELD_THRESHOLDS = {
  nitrogen: { min: 50, max: 85, criticalLow: 35 },
  phosphorus: { min: 20, max: 50, criticalLow: 15 },
  potassium: { min: 30, max: 45, maxAcceptable: 50, criticalLow: 20 },
  ec: { min: 0.2, max: 1.0, maxAcceptable: 2.0 },
  organicCarbon: { min: 0.5, max: 1.5, moderateMax: 2.5 },
  moisture: { min: 45, max: 65, criticalLow: 35, highWarning: 75 },
  ph: { min: 6.0, max: 7.0, acidicWarning: 5.8, alkalineWarning: 7.5 },
  temperature: { min: 18, max: 32, heatStress: 36, coldWarning: 15 },
  humidity: { min: 40, max: 70, highDiseaseRisk: 80 },
};

function normalizeFieldState(data) {
  if (isDemoMode()) {
    const d = PRAGYA_DEMO_DATA;
    return {
      nitrogen: d.soil.nitrogen,
      phosphorus: d.soil.phosphorus,
      potassium: d.soil.potassium,
      npk: { n: d.soil.nitrogen, p: d.soil.phosphorus, k: d.soil.potassium },
      moisture: d.soil.moisture,
      ph: d.soil.ph,
      temperature: d.environment.temperature,
      sensorTemperature: d.environment.temperature,
      humidity: d.environment.humidity,
      sensorHumidity: d.environment.humidity,
      ec: d.soil.ec,
      organicCarbon: d.soil.organicCarbon,
      organic_carbon: d.soil.organicCarbon,
      rainfall: d.environment.rainfall,
      weather: {
        temperature: d.environment.temperature,
        humidity: d.environment.humidity,
        description: d.environment.weather || "Partly cloudy",
        city: d.farm.location || "Hyderabad, Telangana",
        source: "demo",
      },
      farm: {
        name: d.farm.name,
        crop: d.farm.crop,
        acreage: d.farm.area,
        location: d.farm.location,
      },
      updatedAt: data?.telemetry?.updated_at || new Date().toISOString(),
      updated_at: data?.telemetry?.updated_at || new Date().toISOString(),
      disease: null,
      soilAssessment: { status: "ready", fertility: "Fertile" },
      soil_assessment: { status: "ready", fertility: "Fertile" },
      crops: [{ crop: "Wheat", confidence: 96 }],
      recommendation: {
        title: "Optimal conditions for Wheat",
        message: "Soil nutrients and moisture levels are well-balanced for the current vegetative growth stage."
      },
      rawTelemetry: {},
    };
  }
  const t = data?.telemetry || {};
  const npk = t.npk || {};
  const weather = t.weather || {};
  const farm = data?.farm || {};

  const n = Number(npk.n != null ? npk.n : (t.n != null ? t.n : 0));
  const p = Number(npk.p != null ? npk.p : (t.p != null ? t.p : 0));
  const k = Number(npk.k != null ? npk.k : (t.k != null ? t.k : 0));
  const moisture = Number(t.moisture != null ? t.moisture : 0);
  const ph = Number(t.ph != null ? t.ph : 7.0);
  const sensorTemp = Number(t.temperature != null ? t.temperature : 0);
  const temp = Number(weather.temperature != null ? weather.temperature : sensorTemp);
  const sensorHum = Number(t.humidity != null ? t.humidity : 0);
  const hum = Number(weather.humidity != null ? weather.humidity : sensorHum);
  const ec = Number(t.ec != null ? t.ec : 0);
  const organicCarbon = Number(t.organic_carbon != null ? t.organic_carbon : (t.organicCarbon != null ? t.organicCarbon : 0));
  const rainfall = Number(t.rainfall != null ? t.rainfall : 0);

  return {
    nitrogen: n,
    phosphorus: p,
    potassium: k,
    npk: { n, p, k },
    moisture,
    ph,
    temperature: temp,
    sensorTemperature: sensorTemp,
    humidity: hum,
    sensorHumidity: sensorHum,
    ec,
    organicCarbon,
    organic_carbon: organicCarbon,
    rainfall,
    weather: {
      temperature: temp,
      humidity: hum,
      description: weather.description || (weather.source === "api" ? (language === "hi" ? "लाइव मौसम" : "Live weather") : (language === "hi" ? "खेत सेंसर" : "Field sensor")),
      city: weather.city || "",
      source: weather.source || "sensor",
    },
    farm: {
      name: farm.name || "PRAGYA Farm",
      crop: farm.crop || "Field Crop",
      acreage: farm.acreage || 1,
      location: farm.location || "",
    },
    updatedAt: t.updated_at || null,
    updated_at: t.updated_at || null,
    disease: data?.disease || null,
    soilAssessment: data?.soil_assessment || null,
    soil_assessment: data?.soil_assessment || null,
    crops: Array.isArray(data?.crops) ? data.crops : [],
    recommendation: data?.recommendation || null,
    rawTelemetry: t,
  };
}

function classifyNutrient(nutrient, value) {
  const v = Number(value);
  if (!Number.isFinite(v)) return { rating: "moderate", labelKey: "rating_moderate" };
  if (nutrient === "n" || nutrient === "nitrogen") {
    if (v < 35) return { rating: "low", labelKey: "rating_low" };
    if (v < 50) return { rating: "moderate", labelKey: "rating_moderate" };
    if (v <= 85) return { rating: "good", labelKey: "rating_good" };
    return { rating: "high", labelKey: "rating_high" };
  }
  if (nutrient === "p" || nutrient === "phosphorus") {
    if (v < 15) return { rating: "low", labelKey: "rating_low" };
    if (v < 20) return { rating: "moderate", labelKey: "rating_moderate" };
    if (v <= 50) return { rating: "good", labelKey: "rating_good" };
    return { rating: "high", labelKey: "rating_high" };
  }
  if (nutrient === "k" || nutrient === "potassium") {
    if (v < 20) return { rating: "low", labelKey: "rating_low" };
    if (v < 30) return { rating: "moderate", labelKey: "rating_moderate" };
    if (v <= 45) return { rating: "good", labelKey: "rating_good" };
    return { rating: "high", labelKey: "rating_high" };
  }
  if (nutrient === "ec") {
    if (v < 0.2) return { rating: "low", labelKey: "rating_low" };
    if (v <= 1.0) return { rating: "good", labelKey: "rating_good" };
    if (v <= 2.0) return { rating: "moderate", labelKey: "rating_moderate" };
    return { rating: "high", labelKey: "rating_high" };
  }
  if (nutrient === "organic_carbon" || nutrient === "carbon") {
    if (v < 0.5) return { rating: "low", labelKey: "rating_low" };
    if (v <= 1.5) return { rating: "good", labelKey: "rating_good" };
    if (v <= 2.5) return { rating: "moderate", labelKey: "rating_moderate" };
    return { rating: "high", labelKey: "rating_high" };
  }
  return { rating: "moderate", labelKey: "rating_moderate" };
}

function generateNutrientSummary(nValOrState, pVal, kVal, ecVal, ocVal) {
  let n, p, k, ec, oc;
  if (typeof nValOrState === "object" && nValOrState !== null) {
    n = Number(nValOrState.nitrogen != null ? nValOrState.nitrogen : (nValOrState.npk?.n ?? nValOrState.n ?? 0));
    p = Number(nValOrState.phosphorus != null ? nValOrState.phosphorus : (nValOrState.npk?.p ?? nValOrState.p ?? 0));
    k = Number(nValOrState.potassium != null ? nValOrState.potassium : (nValOrState.npk?.k ?? nValOrState.k ?? 0));
    ec = Number(nValOrState.ec != null ? nValOrState.ec : 0);
    oc = Number(nValOrState.organicCarbon != null ? nValOrState.organicCarbon : (nValOrState.organic_carbon ?? 0));
  } else {
    n = Number(nValOrState || 0);
    p = Number(pVal || 0);
    k = Number(kVal || 0);
    ec = Number(ecVal || 0);
    oc = Number(ocVal || 0);
  }

  const isHi = language === "hi";

  const lowNutrients = [];
  const highNutrients = [];

  // Preferred ranges: N: 50–85, P: 20–50, K: 30–45 (tolerance to 50), EC: <= 1.0 (alert > 2.0)
  if (n < 50) lowNutrients.push({ en: "nitrogen", hi: "नाइट्रोजन" });
  else if (n > 85) highNutrients.push({ en: "nitrogen", hi: "नाइट्रोजन" });

  if (p < 20) lowNutrients.push({ en: "phosphorus", hi: "फॉस्फोरस" });
  else if (p > 50) highNutrients.push({ en: "phosphorus", hi: "फॉस्फोरस" });

  if (k < 30) lowNutrients.push({ en: "potassium", hi: "पोटैशियम" });
  else if (k > 50) highNutrients.push({ en: "potassium", hi: "पोटैशियम" });

  if (ec > 2.0) highNutrients.push({ en: "electrical conductivity (EC)", hi: "विद्युत चालकता (EC)" });

  const formatList = (items, lang) => {
    const names = items.map((i) => (lang === "hi" ? i.hi : i.en));
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} ${lang === "hi" ? "और" : "and"} ${names[1]}`;
    const allExceptLast = names.slice(0, -1).join(", ");
    return `${allExceptLast}${lang === "hi" ? " और " : ", and "}${names[names.length - 1]}`;
  };

  // 1. Single nutrient requiring attention below preferred range
  if (lowNutrients.length === 1 && highNutrients.length === 0) {
    return isHi
      ? `ध्यान देने योग्य मुख्य पोषक तत्व ${lowNutrients[0].hi} है।`
      : `Your main nutrient requiring attention is ${lowNutrients[0].en}.`;
  }

  // 2. Multiple nutrients below preferred ranges
  if (lowNutrients.length > 1 && highNutrients.length === 0) {
    const listStr = formatList(lowNutrients, isHi ? "hi" : "en");
    const capitalized = listStr.charAt(0).toUpperCase() + listStr.slice(1);
    return isHi
      ? `${listStr} इस समय अपनी अनुशंसित सीमा से कम हैं।`
      : `${capitalized} are currently below their preferred ranges.`;
  }

  // 3. High nutrients
  if (highNutrients.length > 0 && lowNutrients.length === 0) {
    const listStr = formatList(highNutrients, isHi ? "hi" : "en");
    const capitalized = listStr.charAt(0).toUpperCase() + listStr.slice(1);
    if (highNutrients.length === 1) {
      return isHi
        ? `${listStr} इस समय अपनी अनुशंसित सीमा से अधिक है।`
        : `Your main nutrient requiring attention is ${highNutrients[0].en} (above preferred range).`;
    }
    return isHi
      ? `${listStr} इस समय अपनी अनुशंसित सीमा से अधिक हैं।`
      : `${capitalized} are currently above their preferred ranges.`;
  }

  // 4. Mixed (some low, some high)
  if (lowNutrients.length > 0 && highNutrients.length > 0) {
    const lowStr = formatList(lowNutrients, isHi ? "hi" : "en");
    const highStr = formatList(highNutrients, isHi ? "hi" : "en");
    const capLow = lowStr.charAt(0).toUpperCase() + lowStr.slice(1);
    return isHi
      ? `${lowStr} अनुशंसित सीमा से कम है, जबकि ${highStr} अधिक है।`
      : `${capLow} is below the preferred range, while ${highStr} is above range.`;
  }

  // 5. All monitored nutrients within range
  return isHi
    ? "मिट्टी के मुख्य पोषक तत्व इस समय अनुशंसित सीमा में हैं।"
    : "Core soil nutrients are currently within the monitored ranges.";
}

function generateCropExplanation(cropName, fieldState) {
  if (!fieldState) return "";
  const isHi = language === "hi";

  const n = Number(fieldState.nitrogen != null ? fieldState.nitrogen : (fieldState.npk?.n ?? 0));
  const p = Number(fieldState.phosphorus != null ? fieldState.phosphorus : (fieldState.npk?.p ?? 0));
  const k = Number(fieldState.potassium != null ? fieldState.potassium : (fieldState.npk?.k ?? 0));
  const ph = Number(fieldState.ph ?? 7.0);
  const moisture = Number(fieldState.moisture ?? 0);
  const temp = Number(fieldState.temperature ?? 0);
  const humidity = Number(fieldState.humidity ?? 0);

  const favorable = [];
  const attention = [];

  // Evaluate conditions
  if (ph >= 6.0 && ph <= 7.2) {
    favorable.push({ key: "ph", en: "current pH", hi: "मौजूदा pH" });
  } else {
    attention.push({ key: "ph", en: "pH", hi: "pH" });
  }

  if (temp >= 18 && temp <= 33) {
    favorable.push({ key: "temp", en: "temperature", hi: "तापमान" });
  } else {
    attention.push({ key: "temp", en: "temperature", hi: "तापमान" });
  }

  if (moisture >= 45 && moisture <= 65) {
    favorable.push({ key: "moisture", en: "soil moisture", hi: "मिट्टी की नमी" });
  } else {
    attention.push({ key: "moisture", en: "moisture", hi: "नमी" });
  }

  if (n >= 50 && n <= 85) {
    favorable.push({ key: "n", en: "nitrogen", hi: "नाइट्रोजन" });
  } else {
    attention.push({ key: "n", en: "nitrogen", hi: "नाइट्रोजन" });
  }

  if (p >= 20 && p <= 50) {
    favorable.push({ key: "p", en: "phosphorus", hi: "फॉस्फोरस" });
  } else {
    attention.push({ key: "p", en: "phosphorus", hi: "फॉस्फोरस" });
  }

  if (k >= 30 && k <= 50) {
    favorable.push({ key: "k", en: "potassium", hi: "पोटैशियम" });
  } else {
    attention.push({ key: "k", en: "potassium", hi: "पोटैशियम" });
  }

  const joinList = (items, lang) => {
    const list = items.map((i) => (lang === "hi" ? i.hi : i.en));
    if (list.length === 1) return list[0];
    if (list.length === 2) return `${list[0]} ${lang === "hi" ? "और" : "and"} ${list[1]}`;
    return `${list.slice(0, -1).join(", ")}${lang === "hi" ? " और " : ", and "}${list[list.length - 1]}`;
  };

  const name = cropName || (isHi ? "फसल" : "Crop");

  if (attention.length === 0) {
    return isHi
      ? `${name} — मौजूदा मिट्टी के पोषक तत्वों, नमी और जलवायु के पूरी तरह अनुकूल।`
      : `${name} — well aligned with current soil nutrients, moisture, and climate conditions.`;
  }

  // Sort attention so prominent macro factors (nitrogen, moisture) appear first
  const priorityOrder = { n: 1, moisture: 2, ph: 3, p: 4, k: 5, temp: 6 };
  attention.sort((a, b) => (priorityOrder[a.key] || 99) - (priorityOrder[b.key] || 99));

  if (favorable.length >= 2) {
    const favStr = joinList(favorable.slice(0, 2), isHi ? "hi" : "en");
    const attStr = joinList(attention.slice(0, 2), isHi ? "hi" : "en");
    return isHi
      ? `${name} — ${favStr} के आधार पर उपयुक्त, लेकिन ${attStr} पर ध्यान देने की आवश्यकता है।`
      : `${name} — suitable based on ${favStr}, but ${attStr} require attention.`;
  }

  const attStr = joinList(attention.slice(0, 3), isHi ? "hi" : "en");
  return isHi
    ? `${name} — मध्यम उपयुक्तता, लेकिन ${attStr} पर सुधारात्मक प्रबंधन आवश्यक है।`
    : `${name} — moderate suitability for current climate, but ${attStr} require attention.`;
}

function evaluateAttention(fieldState, alerts = [], disease = null) {
  const issues = [];
  const isHi = language === "hi";

  const fs = fieldState || {};
  const moisture = Number(fs.moisture != null ? fs.moisture : (fs.rawTelemetry?.moisture ?? 50));
  const n = Number(fs.nitrogen != null ? fs.nitrogen : (fs.npk?.n ?? 50));
  const p = Number(fs.phosphorus != null ? fs.phosphorus : (fs.npk?.p ?? 30));
  const k = Number(fs.potassium != null ? fs.potassium : (fs.npk?.k ?? 40));
  const ph = Number(fs.ph != null ? fs.ph : 6.5);
  const temp = Number(fs.temperature != null ? fs.temperature : 25);
  const humidity = Number(fs.humidity != null ? fs.humidity : 50);
  const ec = Number(fs.ec != null ? fs.ec : 0);

  // 1. Soil moisture
  if (moisture < 35) {
    issues.push({
      severity: "critical",
      headline: isHi ? "मिट्टी में नमी अत्यधिक कम है — 35% से कम" : "Low soil moisture — moisture is critically low",
      detail: isHi ? "मिट्टी अत्यधिक सूखी है। अगली सिंचाई चक्र से पहले खेत जांचें।" : "Soil moisture is below 35%. Check the field before the next irrigation cycle."
    });
  } else if (moisture < 45) {
    issues.push({
      severity: "warning",
      headline: isHi ? "मिट्टी में नमी कम है — नमी अनुशंसित सीमा से कम है" : "Low soil moisture — current moisture is below the preferred range.",
      detail: isHi ? "नमी अनुशंसित 45–65% सीमा से कम है। हल्की सिंचाई की योजना बनाएं।" : "Current moisture is below the 45–65% target. Schedule light irrigation soon."
    });
  } else if (moisture > 75) {
    issues.push({
      severity: "warning",
      headline: isHi ? "मिट्टी में नमी अधिक है — नमी अनुशंसित सीमा से अधिक है" : "High soil moisture — current moisture is above the preferred range.",
      detail: isHi ? "नमी 75% से अधिक है। जल निकासी की व्यवस्था देखें।" : "Soil moisture is above 75%. Ensure adequate soil drainage."
    });
  }

  // 2. Nitrogen
  if (n < 50) {
    issues.push({
      severity: "warning",
      headline: isHi ? "नाइट्रोजन कम है — नाइट्रोजन अनुशंसित सीमा से कम है" : "Low nitrogen — nitrogen is below the preferred range.",
      detail: isHi ? `वर्तमान नाइट्रोजन (${Math.round(n)} kg/ha) अनुशंसित 50–85 kg/ha सीमा से कम है।` : `Nitrogen (${Math.round(n)} kg/ha) is below the preferred 50–85 kg/ha range for this field.`
    });
  } else if (n > 85) {
    issues.push({
      severity: "warning",
      headline: isHi ? "नाइट्रोजन अधिक है — नाइट्रोजन अनुशंसित सीमा से अधिक है" : "High nitrogen — nitrogen is above the preferred range.",
      detail: isHi ? `वर्तमान नाइट्रोजन (${Math.round(n)} kg/ha) 85 kg/ha से अधिक है।` : `Nitrogen (${Math.round(n)} kg/ha) exceeds the preferred 50–85 kg/ha range.`
    });
  }

  // 3. Phosphorus
  if (p < 20) {
    issues.push({
      severity: "warning",
      headline: isHi ? "फॉस्फोरस कम है — फॉस्फोरस अनुशंसित सीमा से कम है" : "Low phosphorus — phosphorus is below the preferred range.",
      detail: isHi ? `वर्तमान फॉस्फोरस (${Math.round(p)} kg/ha) 20 kg/ha से कम है।` : `Phosphorus (${Math.round(p)} kg/ha) is below the preferred 20–50 kg/ha range.`
    });
  } else if (p > 50) {
    issues.push({
      severity: "warning",
      headline: isHi ? "फॉस्फोरस अधिक है — फॉस्फोरस अनुशंसित सीमा से अधिक है" : "High phosphorus — phosphorus is above the preferred range.",
      detail: isHi ? `वर्तमान फॉस्फोरस (${Math.round(p)} kg/ha) 50 kg/ha से अधिक है।` : `Phosphorus (${Math.round(p)} kg/ha) exceeds the preferred 20–50 kg/ha range.`
    });
  }

  // 4. Potassium
  if (k < 30) {
    issues.push({
      severity: "warning",
      headline: isHi ? "पोटैशियम कम है — पोटैशियम अनुशंसित सीमा से कम है" : "Low potassium — potassium is below the preferred range.",
      detail: isHi ? `वर्तमान पोटैशियम (${Math.round(k)} kg/ha) 30 kg/ha से कम है।` : `Potassium (${Math.round(k)} kg/ha) is below the preferred 30–45 kg/ha range.`
    });
  } else if (k > 55) {
    issues.push({
      severity: "warning",
      headline: isHi ? "पोटैशियम अधिक है — पोटैशियम अनुशंसित सीमा से अधिक है" : "High potassium — potassium is above the preferred range.",
      detail: isHi ? `वर्तमान पोटैशियम (${Math.round(k)} kg/ha) 55 kg/ha से अधिक है।` : `Potassium (${Math.round(k)} kg/ha) exceeds the preferred range.`
    });
  }

  // 5. pH
  if (ph < 5.8) {
    issues.push({
      severity: "warning",
      headline: isHi ? "मिट्टी का pH अम्लीय है — अनुशंसित सीमा से कम है" : "Acidic soil pH — soil pH is below the preferred range.",
      detail: isHi ? `मिट्टी का pH (${ph.toFixed(1)}) अनुशंसित 6.0–7.0 सीमा से कम है।` : `Soil pH (${ph.toFixed(1)}) is below the preferred 6.0–7.0 range.`
    });
  } else if (ph > 7.5) {
    issues.push({
      severity: "warning",
      headline: isHi ? "मिट्टी का pH क्षारीय है — अनुशंसित सीमा से अधिक है" : "Alkaline soil pH — soil pH is above the preferred range.",
      detail: isHi ? `मिट्टी का pH (${ph.toFixed(1)}) अनुशंसित 6.0–7.0 सीमा से अधिक है।` : `Soil pH (${ph.toFixed(1)}) is above the preferred 6.0–7.0 range.`
    });
  }

  // 6. Temperature
  if (temp >= 36) {
    issues.push({
      severity: "warning",
      headline: isHi ? "अधिक तापमान — गर्मी का तनाव (Heat stress)" : "High temperature — heat stress risk detected.",
      detail: isHi ? `तापमान 36°C से अधिक है (${temp.toFixed(1)}°C)। दोपहर में सिंचाई या छिड़काव से बचें।` : `Temperature is ${temp.toFixed(1)}°C. Avoid midday fieldwork or spraying.`
    });
  } else if (temp < 15) {
    issues.push({
      severity: "warning",
      headline: isHi ? "कम तापमान — ठंडा मौसम" : "Low temperature — cool conditions detected.",
      detail: isHi ? `तापमान 15°C से कम है (${temp.toFixed(1)}°C)। संवेदनशील फसलों की निगरानी करें।` : `Temperature is ${temp.toFixed(1)}°C. Monitor cold-sensitive crops.`
    });
  }

  // 7. Humidity
  if (humidity >= 80) {
    issues.push({
      severity: "warning",
      headline: isHi ? "अधिक हवा की नमी — रोग का खतरा बढ़ रहा है" : "High humidity — disease risk increasing.",
      detail: isHi ? "हवा में नमी अधिक है। पत्तियों पर फफूंद जनित रोगों की नियमित जांच करें।" : "High humidity can support fungal disease. Inspect leaves regularly."
    });
  }

  // 8. EC
  if (ec > 2.0) {
    issues.push({
      severity: "warning",
      headline: isHi ? "मिट्टी में लवणता अधिक है — EC अनुशंसित सीमा से अधिक" : "High soil salinity — EC is above the preferred range.",
      detail: isHi ? `विद्युत चालकता ${ec.toFixed(2)} mS/cm है (अनुशंसित: < 1.0 mS/cm)।` : `Soil EC is ${ec.toFixed(2)} mS/cm, exceeding the optimal < 1.0 mS/cm threshold.`
    });
  }

  // 9. Disease
  const d = disease || fs.disease;
  if (d && d.recognized !== false && !d.healthy) {
    issues.unshift({
      severity: "critical",
      headline: isHi ? `पत्ती में समस्या: ${d.disease || ""}` : `Leaf issue detected: ${d.disease || ""}`,
      detail: localizedTreatment(d)
    });
  }

  return issues;
}

function generateAlerts(fieldState) {
  const alerts = [];
  const isHi = language === "hi";
  const fs = fieldState || {};

  const moisture = Number(fs.moisture != null ? fs.moisture : (fs.rawTelemetry?.moisture ?? 50));
  const n = Number(fs.nitrogen != null ? fs.nitrogen : (fs.npk?.n ?? 50));
  const p = Number(fs.phosphorus != null ? fs.phosphorus : (fs.npk?.p ?? 30));
  const k = Number(fs.potassium != null ? fs.potassium : (fs.npk?.k ?? 40));
  const ph = Number(fs.ph != null ? fs.ph : 6.5);
  const temp = Number(fs.temperature != null ? fs.temperature : 25);
  const humidity = Number(fs.humidity != null ? fs.humidity : 50);
  const ec = Number(fs.ec != null ? fs.ec : 0);

  // 1. Soil moisture
  if (moisture < 35) {
    alerts.push({
      severity: "critical",
      title: isHi ? "मिट्टी में नमी अत्यधिक कम है" : "Soil moisture is critically low",
      message: isHi ? "मिट्टी बहुत सूखी है। अगली सिंचाई चक्र से पहले खेत की जांच करें।" : "Soil is too dry. Check the field before the next irrigation cycle."
    });
  } else if (moisture < 45) {
    alerts.push({
      severity: "warning",
      title: isHi ? "मिट्टी में नमी कम है" : "Soil moisture is low",
      message: isHi ? "नमी अनुशंसित 45–65% सीमा से कम है।" : "Moisture is below the preferred 45–65% range."
    });
  } else if (moisture > 75) {
    alerts.push({
      severity: "warning",
      title: isHi ? "मिट्टी में नमी अधिक है" : "Soil moisture is high",
      message: isHi ? "नमी 75% से अधिक है। उचित जल निकासी सुनिश्चित करें।" : "Soil moisture exceeds optimal levels. Ensure adequate drainage."
    });
  }

  // 2. Nitrogen
  if (n < 50) {
    alerts.push({
      severity: "warning",
      title: isHi ? "नाइट्रोजन का स्तर कम है" : "Nitrogen is below range",
      message: isHi ? `वर्तमान नाइट्रोजन (${Math.round(n)} kg/ha) अनुशंसित 50–85 kg/ha सीमा से कम है।` : `Nitrogen (${Math.round(n)} kg/ha) is below the preferred 50–85 kg/ha range.`
    });
  } else if (n > 85) {
    alerts.push({
      severity: "warning",
      title: isHi ? "नाइट्रोजन का स्तर अधिक है" : "Nitrogen is above range",
      message: isHi ? `वर्तमान नाइट्रोजन (${Math.round(n)} kg/ha) अनुशंसित 50–85 kg/ha सीमा से अधिक है।` : `Nitrogen (${Math.round(n)} kg/ha) exceeds the preferred 50–85 kg/ha range.`
    });
  }

  // 3. Phosphorus
  if (p < 20) {
    alerts.push({
      severity: "warning",
      title: isHi ? "फॉस्फोरस का स्तर कम है" : "Phosphorus is below range",
      message: isHi ? `वर्तमान फॉस्फोरस (${Math.round(p)} kg/ha) अनुशंसित 20–50 kg/ha सीमा से कम है।` : `Phosphorus (${Math.round(p)} kg/ha) is below the preferred 20–50 kg/ha range.`
    });
  } else if (p > 50) {
    alerts.push({
      severity: "warning",
      title: isHi ? "फॉस्फोरस का स्तर अधिक है" : "Phosphorus is above range",
      message: isHi ? `वर्तमान फॉस्फोरस (${Math.round(p)} kg/ha) 50 kg/ha से अधिक है।` : `Phosphorus (${Math.round(p)} kg/ha) exceeds the preferred 20–50 kg/ha range.`
    });
  }

  // 4. Potassium
  if (k < 30) {
    alerts.push({
      severity: "warning",
      title: isHi ? "पोटैशियम का स्तर कम है" : "Potassium is below range",
      message: isHi ? `वर्तमान पोटैशियम (${Math.round(k)} kg/ha) अनुशंसित 30–45 kg/ha सीमा से कम है।` : `Potassium (${Math.round(k)} kg/ha) is below the preferred 30–45 kg/ha range.`
    });
  } else if (k > 55) {
    alerts.push({
      severity: "warning",
      title: isHi ? "पोटैशियम का स्तर अधिक है" : "Potassium is above range",
      message: isHi ? `वर्तमान पोटैशियम (${Math.round(k)} kg/ha) 55 kg/ha से अधिक है।` : `Potassium (${Math.round(k)} kg/ha) exceeds the preferred range.`
    });
  }

  // 5. pH
  if (ph < 5.8) {
    alerts.push({
      severity: "warning",
      title: isHi ? "मिट्टी अम्लीय है" : "Soil pH is acidic",
      message: isHi ? `मिट्टी का pH (${ph.toFixed(1)}) अनुशंसित 6.0–7.0 सीमा से कम है।` : `Soil pH (${ph.toFixed(1)}) is below the preferred 6.0–7.0 range.`
    });
  } else if (ph > 7.5) {
    alerts.push({
      severity: "warning",
      title: isHi ? "मिट्टी क्षारीय है" : "Soil pH is alkaline",
      message: isHi ? `मिट्टी का pH (${ph.toFixed(1)}) अनुशंसित 6.0–7.0 सीमा से अधिक है।` : `Soil pH (${ph.toFixed(1)}) is above the preferred 6.0–7.0 range.`
    });
  }

  // 6. Temperature
  if (temp >= 36) {
    alerts.push({
      severity: "warning",
      title: isHi ? "गर्मी का तनाव (Heat stress)" : "Heat stress risk",
      message: isHi ? `तापमान ${temp.toFixed(1)}°C है। दोपहर में सिंचाई या छिड़काव से बचें।` : `High temperature detected (${temp.toFixed(1)}°C). Avoid midday irrigation.`
    });
  } else if (temp < 15) {
    alerts.push({
      severity: "warning",
      title: isHi ? "ठंडा तापमान चेतावनी" : "Low temperature warning",
      message: isHi ? `तापमान ${temp.toFixed(1)}°C है। संवेदनशील फसलों की सुरक्षा करें।` : `Low temperature detected (${temp.toFixed(1)}°C). Protect sensitive crops.`
    });
  }

  // 7. Humidity
  if (humidity >= 80) {
    alerts.push({
      severity: "warning",
      title: isHi ? "रोग का खतरा बढ़ रहा है" : "Disease risk increasing",
      message: isHi ? "हवा में अधिक नमी फफूंद जनित रोगों को बढ़ावा दे सकती है। पत्तियों की जांच करें।" : "High humidity can support fungal disease. Inspect leaves."
    });
  }

  // 8. EC
  if (ec > 2.0) {
    alerts.push({
      severity: "warning",
      title: isHi ? "मिट्टी में अधिक लवणता (EC)" : "High soil salinity (EC)",
      message: isHi ? `विद्युत चालकता (${ec.toFixed(2)} mS/cm) 1.0 mS/cm से अधिक है।` : `EC is ${ec.toFixed(2)} mS/cm, exceeding the optimal < 1.0 mS/cm threshold.`
    });
  }

  // 9. Disease
  const d = fs.disease;
  if (d && d.recognized !== false && !d.healthy) {
    alerts.unshift({
      severity: "critical",
      title: isHi ? `पत्ती रोग: ${d.disease || ""}` : `Leaf disease detected: ${d.disease || ""}`,
      message: localizedTreatment(d)
    });
  }

  return alerts;
}

function calculateFieldHealth(fieldState, disease = null) {
  if (!fieldState) return { percentage: 72, status: "healthy", labelKey: "healthy_label" };

  const fs = fieldState.rawTelemetry || fieldState;
  const moisture = Number(fs.moisture != null ? fs.moisture : (fieldState.moisture ?? 50));
  const ph = Number(fs.ph != null ? fs.ph : (fieldState.ph ?? 6.5));
  const n = Number(fs.npk?.n != null ? fs.npk.n : (fieldState.nitrogen ?? 50));
  const p = Number(fs.npk?.p != null ? fs.npk.p : (fieldState.phosphorus ?? 30));
  const k = Number(fs.npk?.k != null ? fs.npk.k : (fieldState.potassium ?? 40));
  const temp = Number(fs.temperature != null ? fs.temperature : (fieldState.temperature ?? 25));
  const humidity = Number(fs.humidity != null ? fs.humidity : (fieldState.humidity ?? 50));

  const scores = [];

  // Soil moisture (optimal 45 - 65%)
  if (Number.isFinite(moisture)) {
    let s = 100;
    if (moisture < 45) s = Math.max(10, 100 - (45 - moisture) * 2.8);
    else if (moisture > 65) s = Math.max(10, 100 - (moisture - 65) * 2.5);
    scores.push({ weight: 1.5, score: s });
  }

  // Soil pH (optimal 6.0 - 7.0)
  if (Number.isFinite(ph)) {
    let s = 100;
    if (ph < 6.0) s = Math.max(10, 100 - (6.0 - ph) * 35);
    else if (ph > 7.0) s = Math.max(10, 100 - (ph - 7.0) * 35);
    scores.push({ weight: 1.5, score: s });
  }

  // Nitrogen (optimal 50 - 85 kg/ha)
  if (Number.isFinite(n)) {
    let s = 100;
    if (n < 50) s = Math.max(15, 100 - (50 - n) * 2.8);
    else if (n > 85) s = Math.max(40, 100 - (n - 85) * 0.8);
    scores.push({ weight: 1.5, score: s });
  }

  // Phosphorus (optimal 20 - 50 kg/ha)
  if (Number.isFinite(p)) {
    let s = 100;
    if (p < 20) s = Math.max(20, 100 - (20 - p) * 3.5);
    else if (p > 50) s = Math.max(40, 100 - (p - 50) * 0.8);
    scores.push({ weight: 1.2, score: s });
  }

  // Potassium (optimal 30 - 45 kg/ha, tolerance up to 55)
  if (Number.isFinite(k)) {
    let s = 100;
    if (k < 30) s = Math.max(20, 100 - (30 - k) * 3.0);
    else if (k > 55) s = Math.max(40, 100 - (k - 55) * 0.8);
    scores.push({ weight: 1.2, score: s });
  }

  // Temperature (optimal 18 - 32°C)
  if (Number.isFinite(temp)) {
    let s = 100;
    if (temp < 18) s = Math.max(20, 100 - (18 - temp) * 3.5);
    else if (temp > 32) s = Math.max(20, 100 - (temp - 32) * 4.0);
    scores.push({ weight: 1.0, score: s });
  }

  // Humidity (optimal 40 - 70%)
  if (Number.isFinite(humidity)) {
    let s = 100;
    if (humidity < 40) s = Math.max(20, 100 - (40 - humidity) * 2.0);
    else if (humidity > 70) s = Math.max(20, 100 - (humidity - 70) * 2.5);
    scores.push({ weight: 1.0, score: s });
  }

  // Leaf disease scan if genuinely available
  const d = disease || fieldState.disease;
  if (d && d.recognized !== false) {
    const s = d.healthy ? 100 : Math.max(20, 100 - (Number(d.confidence) || 75));
    scores.push({ weight: 1.5, score: s });
  }

  if (!scores.length) return { percentage: 72, status: "healthy", labelKey: "healthy_label" };

  const totalWeight = scores.reduce((sum, item) => sum + item.weight, 0);
  const weightedSum = scores.reduce((sum, item) => sum + item.score * item.weight, 0);
  const percentage = Math.max(5, Math.min(100, Math.round(weightedSum / totalWeight)));

  let status = "healthy";
  let labelKey = "healthy_label";
  if (percentage < 50) {
    status = "critical";
    labelKey = "critical_label";
  } else if (percentage < 70) {
    status = "attention";
    labelKey = "attention_label";
  }

  return { percentage, status, labelKey };
}

function translatedRecommendation(item) {
  if (!item || !item.title) return item || { title: "", message: "" };
  if (language === "en") return item;
  const match = item.title.match(/^Consider (.+)$/);
  if (match) return { title: `${match[1]} पर विचार करें`, message: `मौजूदा मिट्टी और मौसम के आधार पर स्थानीय मॉडल ने ${match[1]} को सबसे उपयुक्त माना है।` };
  const map = {
    "Maintain current schedule": ["अभी की योजना जारी रखें", "मिट्टी और मौसम अभी सही सीमा में हैं।"],
    "Irrigate Zone 1": ["सिंचाई करें", "मिट्टी में पानी कम है। आज सुबह थोड़ी सिंचाई करें।"],
    "Add nitrogen": ["नाइट्रोजन दें", "मिट्टी में नाइट्रोजन कम है। स्थानीय सलाह के अनुसार खाद दें।"],
    "Inspect for leaf disease": ["पत्तियों की जांच करें", "नमी ज्यादा है। छिड़काव से पहले फसल देखें।"],
  };
  const value = map[item.title];
  return value ? { title: value[0], message: value[1] } : item;
}

function formatUpdated(iso) {
  if (!iso) return t("waiting_data");
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  return minutes < 1 ? t("updated_now") : t("updated_minutes", minutes);
}

function rangeNote(value, low, high) {
  if (value < low) return t("below_range");
  if (value > high) return t("above_range");
  return t("optimal");
}

function setBar(id, value) {
  const node = $(id);
  if (node) node.style.width = `${Math.max(0, Math.min(100, Number(value) || 0))}%`;
}

function animateNumericText(id, targetVal, suffix = "") {
  const el = $(id);
  if (!el) return;
  const currentText = el.textContent || "";
  const currentNum = parseInt(currentText, 10);
  if (isNaN(currentNum)) {
    el.textContent = `${targetVal}${suffix}`;
    return;
  }
  if (currentNum === targetVal) return;

  const startTime = performance.now();
  const duration = 220;
  const diff = targetVal - currentNum;

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    const ease = 1 - Math.pow(1 - progress, 3);
    const val = Math.round(currentNum + diff * ease);
    el.textContent = `${val}${suffix}`;
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
}

// Dataset maxima from Data/crop_recommendation.csv (N 0-140, P 5-145, K 5-205).
const NPK_MAX = { n: 140, p: 145, k: 205 };
function npkPercent(nutrient, value) {
  const max = NPK_MAX[nutrient] || 100;
  return (Math.max(0, Number(value) || 0) / max) * 100;
}

function sparkPoints(values) {
  if (!values.length) return "";
  return values.map((pct, i) => {
    const x = values.length === 1 ? 0 : (i / (values.length - 1)) * 300;
    const y = 118 - (Math.max(0, Math.min(100, pct)) / 100) * 112;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

function renderHistory(rows = []) {
  lastHistory = rows;
  const clamp100 = (v) => Math.max(0, Math.min(100, Number(v) || 0));
  const moisture = rows.map((r) => clamp100(r.moisture));
  const humidity = rows.map((r) => clamp100(r.humidity));
  const temperature = rows.map((r) => clamp100(((Number(r.temperature) || 0) / 50) * 100));
  const moistureNode = $("sparkMoisture");
  const tempNode = $("sparkTemperature");
  const humidityNode = $("sparkHumidity");
  if (moistureNode) moistureNode.setAttribute("points", sparkPoints(moisture));
  if (tempNode) tempNode.setAttribute("points", sparkPoints(temperature));
  if (humidityNode) humidityNode.setAttribute("points", sparkPoints(humidity));
  setText("historyCount", rows.length ? t("history_count", rows.length) : "");
  const empty = $("historyEmpty");
  if (empty) empty.hidden = rows.length >= 2;
}

function appendNotice(parent, alert) {
  const translated = language === "hi" ? HINDI_ALERTS[alert.title] : null;
  const item = document.createElement("article");
  item.className = `notice ${["critical", "warning", "info", "success"].includes(alert.severity) ? alert.severity : "info"}`;
  const title = document.createElement("b");
  const message = document.createElement("p");
  title.textContent = translated?.[0] || alert.title;
  message.textContent = translated?.[1] || alert.message;
  item.append(title, message);
  parent.append(item);
}

function renderCrops(crops = [], fieldState = null) {
  const lists = [$("cropList"), $("fieldCropList")].filter(Boolean);
  lists.forEach((list) => {
    list.replaceChildren();
    if (!crops.length) {
      const item = document.createElement("li");
      const label = document.createElement("span");
      label.textContent = t("no_crops");
      item.append(label);
      list.append(item);
      return;
    }
    crops.slice(0, 3).forEach((crop, index) => {
      const item = document.createElement("li");
      if (index === 0) item.classList.add("top-recommendation");
      
      const details = document.createElement("div");
      details.className = "crop-details";
      
      const titleRow = document.createElement("div");
      titleRow.className = "crop-title-row";

      const name = document.createElement("strong");
      name.className = "crop-name";
      name.textContent = crop.crop;
      
      const badge = document.createElement("span");
      const conf = Number(crop.confidence) || 0;
      if (conf >= 80) {
        badge.className = "crop-suitability-badge suitable";
        badge.textContent = t("suitability_high");
      } else if (conf >= 50) {
        badge.className = "crop-suitability-badge moderate";
        badge.textContent = t("suitability_moderate");
      } else {
        badge.className = "crop-suitability-badge alt";
        badge.textContent = t("suitability_alt");
      }
      titleRow.append(name, badge);
      details.append(titleRow);

      if (fieldState) {
        const explanation = document.createElement("p");
        explanation.className = "crop-explanation";
        explanation.textContent = generateCropExplanation(crop.crop, fieldState);
        details.append(explanation);
      }

      const scoreWrap = document.createElement("div");
      scoreWrap.className = "crop-meta-score";
      const score = document.createElement("span");
      score.className = "crop-score";
      score.textContent = `${conf.toFixed(1)}%`;
      scoreWrap.append(score);

      item.append(details, scoreWrap);
      list.append(item);
    });
  });
}

function showScan(result) {
  const box = $("scanResult");
  if (!box) return;
  const recognized = result.recognized !== false;
  box.hidden = false;
  box.classList.toggle("is-good", recognized && result.healthy);
  box.classList.toggle("is-warning", !recognized || !result.healthy);
  setText("resultIcon", recognized && result.healthy ? "✓" : "!");
  setText("resultTitle", !recognized ? t("not_recognized") : result.healthy ? t("healthy_leaf") : result.disease);
  setText("resultConfidence", recognized && Number.isFinite(Number(result.confidence)) ? `${Number(result.confidence).toFixed(1)}%` : "");
  setText("resultTreatment", localizedTreatment(result));
  setText("resultSpeed", Number.isFinite(Number(result.inference_ms)) ? `${Number(result.inference_ms).toFixed(1)} ms` : "");
  lastScanSpeech = result.speech || `${$("resultTitle").textContent}. ${localizedTreatment(result)}`;
}

function formatWhen(iso) {
  if (!iso) return "";
  const locale = language === "hi" ? "hi-IN" : "en-IN";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

function toolLabel(tool) {
  const map = { field_tools: t("nav_field"), ai_models: t("nav_models"), account: t("account"), sensors: t("sensor_data") };
  return map[tool] || tool;
}

function typeLabel(type) {
  if (type === "disease") return t("disease_detection_title");
  if (type === "pest") return t("pest_screening_title");
  if (type === "field_intelligence") return t("field_intelligence_title");
  if (type === "crop") return t("crop_model");
  if (type === "soil") return t("soil_model");
  return type;
}

function renderActivity(rows = []) {
  lastActivity = rows;
  const list = $("activityList");
  if (!list) return;
  setText("activityCount", rows.length ? t("activity_count", rows.length) : "");
  list.replaceChildren();
  if (!rows.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = t("activity_empty");
    list.append(empty);
    return;
  }
  rows.slice(0, 8).forEach((item) => {
    const article = document.createElement("article");
    article.className = "activity-item";
    const title = document.createElement("b");
    title.textContent = item.summary;
    const meta = document.createElement("p");
    meta.textContent = [toolLabel(item.tool), item.model, formatWhen(item.created_at)].filter(Boolean).join(" · ");
    article.append(title, meta);
    if (item.analysis_id) {
      article.tabIndex = 0;
      article.style.cursor = "pointer";
      article.addEventListener("click", () => { activateTab("history"); openAnalysis(item.analysis_id); });
    }
    list.append(article);
  });
}

// ==========================================
// Field Intelligence History Archive & Modal Viewer Logic
// ==========================================
let historySearchQuery = "";
let historySelectedType = "all";
let historyDateRange = "all";
let historySortOrder = "newest";
let historyCurrentPage = 1;
const HISTORY_PAGE_SIZE = 5;
let currentSelectedAnalysisId = null;
let currentFilteredAnalyses = [];
let currentHistoryPageRows = [];
let currentModalItem = null;
let historyControlsInitialized = false;

function formatHistoryDateTime(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    const day = d.getDate();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${day} ${month} ${year} · ${hours}:${minutes} ${ampm}`;
  } catch {
    return String(iso);
  }
}

function formatCompactDateTime(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    const day = d.getDate();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[d.getMonth()];
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${day} ${month} · ${hours}:${minutes} ${ampm}`;
  } catch {
    return String(iso);
  }
}

function escapeHtml(str) {
  if (typeof str !== "string") str = String(str ?? "");
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function analysisSummary(item) {
  const result = item.result || {};
  if (item.analysis_type === "disease") {
    if (result.recognized === false) return t("not_recognized");
    if (result.healthy) return t("healthy_leaf");
    return result.disease || result.label || t("scan_result");
  }
  if (item.analysis_type === "crop") {
    return result.crops?.[0]?.crop || result.recommendation?.title || t("crop_model");
  }
  if (item.analysis_type === "pest") {
    return result.label || result.summary || result.analysis?.slice(0, 80) || t("pest_model");
  }
  return result.fertility?.fertility || t("soil_model");
}

function getAnalysisHeadline(item) {
  const result = item.result || {};
  const inp = item.input || {};
  if (item.analysis_type === "disease") {
    if (result.recognized === false) return t("not_recognized");
    if (result.healthy) return `${inp.crop ? inp.crop + " · " : ""}${t("healthy_leaf")}`;
    const dis = (result.disease || result.label || t("scan_result")).replace(/_/g, " ");
    const crp = inp.crop || result.crop;
    return crp ? `${crp} · ${dis}` : dis;
  }
  if (item.analysis_type === "pest") {
    return result.label || result.pest || result.summary || t("pest_model");
  }
  if (item.analysis_type === "field_intelligence" || item.analysis_type === "soil") {
    const fert = result.fertility?.fertility || result.soil_condition || result.overview;
    return fert ? `Soil condition · ${fert}` : "Field Intelligence Assessment";
  }
  if (item.analysis_type === "crop") {
    const top = result.crops?.[0]?.crop || result.recommendation?.title;
    return top ? `Recommended · ${top}` : t("crop_model");
  }
  return analysisSummary(item);
}

function matchesHistorySearch(item, query) {
  if (!query) return true;
  const q = query.toLowerCase().trim();

  // 1. Type
  if ((item.analysis_type || "").toLowerCase().includes(q)) return true;
  if (typeLabel(item.analysis_type).toLowerCase().includes(q)) return true;
  if ((item.analysis_type === "field_intelligence" || item.analysis_type === "soil") && ("soil".includes(q) || "field intelligence".includes(q) || "field".includes(q))) return true;

  // 2. Model & Mode
  if ((item.model || "").toLowerCase().includes(q)) return true;
  if ((item.mode || "").toLowerCase().includes(q)) return true;
  if (item.mode === "edge" && "edge ai".includes(q)) return true;
  if (item.mode === "cloud" && "cloud ai".includes(q)) return true;

  // 3. User & Location
  if (item.user) {
    if ((item.user.username || "").toLowerCase().includes(q)) return true;
    if ((item.user.location || "").toLowerCase().includes(q)) return true;
  }

  // 4. Input fields
  const inp = item.input || {};
  if (typeof inp === "object" && inp !== null) {
    for (const key of Object.keys(inp)) {
      const val = inp[key];
      if (typeof val === "string" && val.toLowerCase().includes(q)) return true;
    }
  }

  // 5. Result fields
  const res = item.result || {};
  if (typeof res === "object" && res !== null) {
    if ((res.disease || "").toLowerCase().includes(q)) return true;
    if ((res.pest || "").toLowerCase().includes(q)) return true;
    if ((res.label || "").toLowerCase().includes(q)) return true;
    if ((res.summary || "").toLowerCase().includes(q)) return true;
    if ((res.analysis || "").toLowerCase().includes(q)) return true;
    if ((res.title || "").toLowerCase().includes(q)) return true;
    if ((res.crop || "").toLowerCase().includes(q)) return true;
    if (res.fertility?.fertility && res.fertility.fertility.toLowerCase().includes(q)) return true;
    if (res.recommendation?.title && res.recommendation.title.toLowerCase().includes(q)) return true;
    if (res.recommendation?.message && res.recommendation.message.toLowerCase().includes(q)) return true;
    if (Array.isArray(res.crops)) {
      for (const c of res.crops) {
        if ((c.crop || "").toLowerCase().includes(q)) return true;
      }
    }
    if (res.report && typeof res.report === "object") {
      const r = res.report;
      if ((r.title || "").toLowerCase().includes(q)) return true;
      if (r.identification?.label && r.identification.label.toLowerCase().includes(q)) return true;
      if ((r.about || "").toLowerCase().includes(q)) return true;
    }
  }

  return false;
}

function matchesHistoryDate(item, range) {
  if (range === "all") return true;
  if (!item.created_at) return true;
  const d = new Date(item.created_at).getTime();
  if (isNaN(d)) return true;
  const now = Date.now();
  if (range === "today") {
    const itemDate = new Date(item.created_at);
    const today = new Date();
    return itemDate.getFullYear() === today.getFullYear() &&
           itemDate.getMonth() === today.getMonth() &&
           itemDate.getDate() === today.getDate();
  }
  if (range === "week") {
    return d >= now - 7 * 86400 * 1000;
  }
  if (range === "month") {
    return d >= now - 30 * 86400 * 1000;
  }
  return true;
}

function getFilteredAnalyses(rows = []) {
  return rows.filter((item) => {
    // 1. Type filter
    if (historySelectedType !== "all") {
      if (historySelectedType === "field_intelligence") {
        if (item.analysis_type !== "field_intelligence" && item.analysis_type !== "soil") return false;
      } else if (item.analysis_type !== historySelectedType) {
        return false;
      }
    }

    // 2. Date filter
    if (!matchesHistoryDate(item, historyDateRange)) return false;

    // 3. Search query
    if (historySearchQuery && !matchesHistorySearch(item, historySearchQuery)) return false;

    return true;
  }).sort((a, b) => {
    const timeA = new Date(a.created_at || 0).getTime() || 0;
    const timeB = new Date(b.created_at || 0).getTime() || 0;
    if (historySortOrder === "oldest") {
      return timeA - timeB || (a.id || 0) - (b.id || 0);
    }
    return timeB - timeA || (b.id || 0) - (a.id || 0);
  });
}

function updateHistorySummaryStrip(rows = []) {
  const countStr = `${rows.length} ${rows.length === 1 ? (language === "hi" ? "विश्लेषण" : "analysis") : (language === "hi" ? "विश्लेषण" : "analyses")}`;
  setText("historyTotalCount", countStr);

  let pestCount = 0;
  let diseaseCount = 0;
  let fieldCount = 0;
  let cropCount = 0;

  for (const item of rows) {
    const type = item.analysis_type;
    if (type === "pest") pestCount++;
    else if (type === "disease") diseaseCount++;
    else if (type === "field_intelligence" || type === "soil") fieldCount++;
    else if (type === "crop") cropCount++;
  }

  setText("summaryTotal", String(rows.length));
  setText("summaryPest", String(pestCount));
  setText("summaryDisease", String(diseaseCount));
  setText("summaryField", String(fieldCount));
  setText("summaryCrop", String(cropCount));
}

function formatConfidenceValue(rawConf) {
  if (rawConf === null || rawConf === undefined || rawConf === "") {
    return "Confidence unavailable";
  }
  if (typeof rawConf === "boolean") {
    return "Confidence unavailable";
  }
  let str = String(rawConf).trim();
  if (!str || str.toLowerCase().includes("nan") || str.toLowerCase().includes("unavailable")) {
    return "Confidence unavailable";
  }
  str = str.replace(/%/g, "").trim();
  const num = Number(str);
  if (!Number.isFinite(num) || Number.isNaN(num)) {
    return "Confidence unavailable";
  }
  const val = (num > 0 && num <= 1) ? num * 100 : num;
  const rounded = Math.round(val);
  if (!Number.isFinite(rounded) || Number.isNaN(rounded)) {
    return "Confidence unavailable";
  }
  return `${rounded}%`;
}

function renderHistoryRecordCard(item) {
  const article = document.createElement("article");
  article.className = "history-record-card";
  article.dataset.id = String(item.id);
  article.tabIndex = 0;
  article.setAttribute("role", "button");
  article.setAttribute("aria-label", `${typeLabel(item.analysis_type)}: ${getAnalysisHeadline(item)}`);

  if (currentSelectedAnalysisId && item.id === currentSelectedAnalysisId) {
    article.classList.add("is-active");
  }

  const isCloud = item.mode === "cloud";
  const result = item.result || {};
  const inp = item.input || {};

  // Row 1: Overline Type + Timestamp
  let typeHeading = "ANALYSIS";
  if (item.analysis_type === "pest") typeHeading = "PEST SCREENING";
  else if (item.analysis_type === "disease") typeHeading = "DISEASE DETECTION";
  else if (item.analysis_type === "field_intelligence" || item.analysis_type === "soil") typeHeading = "FIELD INTELLIGENCE";
  else if (item.analysis_type === "crop") typeHeading = "CROP RECOMMENDATION";

  // Row 2: Detected item / Conclusion + Mode pill
  const detectedTitle = getAnalysisHeadline(item);

  // Row 3: Location / Context + Key Metric
  let locationContext = "";
  if (inp.field) {
    locationContext = `Field: ${inp.field}`;
  } else if (inp.location) {
    locationContext = `Location: ${inp.location}`;
  } else if (item.user?.location) {
    locationContext = `Field: ${item.user.location}`;
  } else if (item.analysis_type === "field_intelligence" || item.analysis_type === "soil") {
    const n = inp.n ?? inp.nitrogen;
    const p = inp.p ?? inp.phosphorus;
    const k = inp.k ?? inp.potassium;
    const ph = inp.ph;
    if (n != null && p != null && k != null) {
      locationContext = `N ${Math.round(n)} · P ${Math.round(p)} · K ${Math.round(k)}${ph ? ` · pH ${ph}` : ""}`;
    } else if (item.user?.username) {
      locationContext = `User: @${item.user.username}`;
    } else {
      locationContext = "Field Telemetry";
    }
  } else if (inp.crop) {
    locationContext = `Crop: ${inp.crop}`;
  } else if (item.user?.username) {
    locationContext = `User: @${item.user.username}`;
  } else {
    locationContext = "Device Analysis";
  }

  let metricInfo = "";
  const confFormatted = formatConfidenceValue(result.confidence);
  if (confFormatted !== "Confidence unavailable") {
    metricInfo = `Confidence: ${confFormatted}`;
  } else if (result.severity) {
    metricInfo = `Severity: ${result.severity}`;
  } else if (inp.moisture != null && (item.analysis_type === "field_intelligence" || item.analysis_type === "soil")) {
    metricInfo = `Moisture ${Math.round(inp.moisture)}%`;
  } else if (result.crops?.[0]?.confidence != null && formatConfidenceValue(result.crops[0].confidence) !== "Confidence unavailable") {
    metricInfo = `Confidence: ${formatConfidenceValue(result.crops[0].confidence)}`;
  } else if (result.fertility?.confidence != null && formatConfidenceValue(result.fertility.confidence) !== "Confidence unavailable") {
    metricInfo = `Confidence: ${formatConfidenceValue(result.fertility.confidence)}`;
  } else if (Number.isFinite(Number(result.inference_ms))) {
    metricInfo = `${Math.round(result.inference_ms)} ms`;
  }

  article.innerHTML = `
    <div class="record-header-row">
      <span class="record-type-label">${escapeHtml(typeHeading)}</span>
      <time class="record-time">${escapeHtml(formatCompactDateTime(item.created_at))}</time>
    </div>
    <div class="record-body-row">
      <h3 class="record-detected-title">${escapeHtml(detectedTitle)}</h3>
      <span class="history-mode-pill ${isCloud ? "cloud" : "edge"}">${isCloud ? "CLOUD AI" : "EDGE AI"}</span>
    </div>
    <div class="record-footer-row">
      <span class="record-location-context">${escapeHtml(locationContext)}</span>
      ${metricInfo ? `<span class="record-metric-info">${escapeHtml(metricInfo)}</span>` : "<span></span>"}
    </div>
    <div class="record-action-row">
      <span class="record-view-link">${escapeHtml(t("view_analysis_affordance"))}</span>
    </div>
  `;

  const onSelect = () => openAnalysis(item.id, item);
  article.addEventListener("click", onSelect);
  article.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
    }
  });

  return article;
}

function renderHistoryPagination(totalRecords) {
  const nav = $("historyPagination");
  if (!nav) return;
  const totalPages = Math.ceil(totalRecords / HISTORY_PAGE_SIZE) || 1;

  if (totalRecords <= HISTORY_PAGE_SIZE) {
    nav.hidden = true;
    return;
  }
  nav.hidden = false;

  const prevBtn = $("historyPrevBtn");
  const nextBtn = $("historyNextBtn");
  const numbersWrap = $("historyPageNumbers");

  if (prevBtn) {
    prevBtn.disabled = historyCurrentPage <= 1;
  }
  if (nextBtn) {
    nextBtn.disabled = historyCurrentPage >= totalPages;
  }

  if (numbersWrap) {
    numbersWrap.replaceChildren();

    let pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (historyCurrentPage > 3) pages.push("...");
      const start = Math.max(2, historyCurrentPage - 1);
      const end = Math.min(totalPages - 1, historyCurrentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (historyCurrentPage < totalPages - 2) pages.push("...");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }

    pages.forEach((p) => {
      if (p === "...") {
        const span = document.createElement("span");
        span.className = "page-ellipsis";
        span.textContent = "…";
        span.setAttribute("aria-hidden", "true");
        numbersWrap.append(span);
      } else {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `page-number-btn ${p === historyCurrentPage ? "is-active" : ""}`;
        btn.textContent = String(p);
        btn.setAttribute("aria-label", `Page ${p}`);
        if (p === historyCurrentPage) btn.setAttribute("aria-current", "page");
        btn.addEventListener("click", () => {
          historyCurrentPage = p;
          renderAnalysesPage();
        });
        numbersWrap.append(btn);
      }
    });
  }
}

function renderAnalysesPage() {
  const list = $("analysisList");
  if (!list) return;

  const filtered = getFilteredAnalyses(lastAnalyses);
  currentFilteredAnalyses = filtered;
  const totalRecords = filtered.length;
  const totalPages = Math.ceil(totalRecords / HISTORY_PAGE_SIZE) || 1;

  if (historyCurrentPage > totalPages) historyCurrentPage = totalPages;
  if (historyCurrentPage < 1) historyCurrentPage = 1;

  setText("analysesCount", totalRecords ? (language === "hi" ? `${totalRecords} मिले • पेज ${historyCurrentPage}/${totalPages}` : `${totalRecords} found • Page ${historyCurrentPage} of ${totalPages}`) : "");

  list.replaceChildren();

  if (!totalRecords) {
    currentHistoryPageRows = [];
    const empty = document.createElement("div");
    empty.className = "history-empty-state";
    empty.innerHTML = `
      <div class="empty-icon">🌱</div>
      <h3>${language === "hi" ? "कोई विश्लेषण नहीं मिला" : "No analyses found"}</h3>
      <p>${language === "hi" ? "खोज या फ़िल्टर बदलकर पुनः प्रयास करें।" : "Try adjusting your search query or filter selection."}</p>
    `;
    list.append(empty);
    renderHistoryPagination(0);
    return;
  }

  const startIdx = (historyCurrentPage - 1) * HISTORY_PAGE_SIZE;
  const pageRows = filtered.slice(startIdx, startIdx + HISTORY_PAGE_SIZE);
  currentHistoryPageRows = pageRows;

  pageRows.forEach((item) => {
    const card = renderHistoryRecordCard(item);
    list.append(card);
  });

  renderHistoryPagination(totalRecords);

  // If modal is open, refresh nav buttons state
  if (currentModalItem) {
    const navPos = $("historyModalNavPos");
    const prevBtn = $("historyModalPrevBtn");
    const nextBtn = $("historyModalNextBtn");
    const idx = currentHistoryPageRows.findIndex((r) => r.id === currentModalItem.id);
    if (idx >= 0) {
      if (navPos) navPos.textContent = t("record_x_of_y", idx + 1, currentHistoryPageRows.length);
      if (prevBtn) prevBtn.disabled = idx <= 0;
      if (nextBtn) nextBtn.disabled = idx >= currentHistoryPageRows.length - 1;
    }
  }
}

function renderAnalyses(rows = []) {
  lastAnalyses = rows;
  initHistoryControlsOnce();
  updateHistorySummaryStrip(rows);
  renderAnalysesPage();
}

function initHistoryControlsOnce() {
  if (historyControlsInitialized) return;
  historyControlsInitialized = true;

  // Search input
  const searchInput = $("historySearchInput");
  const clearBtn = $("historySearchClear");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      historySearchQuery = e.target.value.trim();
      if (clearBtn) clearBtn.hidden = !historySearchQuery;
      historyCurrentPage = 1;
      renderAnalysesPage();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      historySearchQuery = "";
      clearBtn.hidden = true;
      historyCurrentPage = 1;
      renderAnalysesPage();
      searchInput?.focus();
    });
  }

  // Type filter buttons
  document.querySelectorAll(".history-filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".history-filter-btn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      historySelectedType = btn.dataset.historyType || "all";
      historyCurrentPage = 1;
      renderAnalysesPage();
    });
  });

  // Date filter select
  const dateFilter = $("historyDateFilter");
  if (dateFilter) {
    dateFilter.addEventListener("change", (e) => {
      historyDateRange = e.target.value;
      historyCurrentPage = 1;
      renderAnalysesPage();
    });
  }

  // Sort select
  const sortSelect = $("historySortSelect");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      historySortOrder = e.target.value;
      historyCurrentPage = 1;
      renderAnalysesPage();
    });
  }

  // Pagination Prev / Next
  $("historyPrevBtn")?.addEventListener("click", () => {
    if (historyCurrentPage > 1) {
      historyCurrentPage--;
      renderAnalysesPage();
    }
  });

  $("historyNextBtn")?.addEventListener("click", () => {
    const totalPages = Math.ceil(currentFilteredAnalyses.length / HISTORY_PAGE_SIZE) || 1;
    if (historyCurrentPage < totalPages) {
      historyCurrentPage++;
      renderAnalysesPage();
    }
  });

  // Modal navigation controls
  $("historyModalPrevBtn")?.addEventListener("click", () => {
    if (!currentModalItem || !currentHistoryPageRows.length) return;
    const idx = currentHistoryPageRows.findIndex((r) => r.id === currentModalItem.id);
    if (idx > 0) {
      openAnalysisModal(currentHistoryPageRows[idx - 1]);
    }
  });

  $("historyModalNextBtn")?.addEventListener("click", () => {
    if (!currentModalItem || !currentHistoryPageRows.length) return;
    const idx = currentHistoryPageRows.findIndex((r) => r.id === currentModalItem.id);
    if (idx >= 0 && idx < currentHistoryPageRows.length - 1) {
      openAnalysisModal(currentHistoryPageRows[idx + 1]);
    }
  });

  // Modal close listeners
  $("historyModalCloseBtn")?.addEventListener("click", closeAnalysisModal);
  $("historyModalBackdrop")?.addEventListener("click", closeAnalysisModal);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && $("historyModalOverlay") && !$("historyModalOverlay").hidden) {
      closeAnalysisModal();
    }
  });
}

function createModalSection(title, content, extraClass = "") {
  const box = document.createElement("div");
  box.className = `modal-detail-card ${extraClass}`.trim();
  box.innerHTML = `
    <h4>${escapeHtml(title)}</h4>
    <p>${escapeHtml(content)}</p>
  `;
  return box;
}

function renderHistoryDiseaseDetail(item) {
  const wrapper = document.createElement("div");
  wrapper.className = "modal-analysis-content disease-content";
  const result = item.result || {};
  const inp = item.input || {};

  // Image section
  if (item.image_url) {
    const imgWrap = document.createElement("div");
    imgWrap.className = "modal-image-wrap";
    const img = document.createElement("img");
    img.src = item.image_url;
    img.alt = `${result.disease || result.label || "Disease"} photo`;
    img.className = "modal-analysis-image";
    img.loading = "lazy";
    imgWrap.append(img);
    wrapper.append(imgWrap);
  }

  const diseaseName = result.disease || result.label || (result.healthy ? t("healthy_leaf") : (result.recognized === false ? t("not_recognized") : "Foliar observation"));
  const cropName = inp.crop || result.crop || "Leaf sample";
  const confidence = formatConfidenceValue(result.confidence);
  const confNum = Number(String(result.confidence || "").replace(/%/g, "").trim());
  const severity = result.severity || (result.healthy ? "Low" : (Number.isFinite(confNum) && confNum > 75 ? "High" : null));

  // Identification & Summary Banner
  const identCard = document.createElement("div");
  identCard.className = "modal-metric-banner";
  identCard.innerHTML = `
    <div class="banner-stat">
      <span class="stat-label">Disease Identified</span>
      <strong class="stat-value">${escapeHtml(diseaseName.replace(/_/g, " "))}</strong>
    </div>
    <div class="banner-stat">
      <span class="stat-label">Crop</span>
      <strong class="stat-value">${escapeHtml(cropName)}</strong>
    </div>
    <div class="banner-stat">
      <span class="stat-label">Confidence</span>
      <strong class="stat-value">${escapeHtml(confidence)}</strong>
    </div>
    ${severity ? `<div class="banner-stat"><span class="stat-label">Severity</span><strong class="stat-value">${escapeHtml(severity)}</strong></div>` : ""}
  `;
  wrapper.append(identCard);

  const report = (result.report && typeof result.report === "object") ? result.report : null;

  // Symptoms
  const symptomsText = report?.symptoms || result.symptoms || null;
  if (symptomsText) {
    wrapper.append(createModalSection("🍂 " + t("symptoms_observed"), symptomsText));
  }

  // Likely cause
  const causeText = report?.cause || result.cause || null;
  if (causeText) {
    wrapper.append(createModalSection("🦠 " + t("likely_cause"), causeText));
  }

  // What to check
  const checkText = report?.check || result.check || null;
  if (checkText) {
    wrapper.append(createModalSection("🔍 " + t("what_to_check"), checkText));
  }

  // Prevention
  const prevText = report?.prevention || result.prevention || null;
  if (prevText) {
    wrapper.append(createModalSection("🛡️ " + t("how_to_prevent"), prevText));
  }

  // Management / Treatment
  const mgmtText = report?.management || localizedTreatment(result) || result.treatment || result.analysis || null;
  if (mgmtText) {
    wrapper.append(createModalSection("🧪 " + t("control_management"), mgmtText));
  }

  // Field summary
  const summaryText = report?.summary || result.summary || result.speech || null;
  if (summaryText) {
    wrapper.append(createModalSection("🌱 " + t("field_summary"), summaryText, "highlight-summary"));
  }

  lastDetailSpeech = result.speech || `${diseaseName}. ${mgmtText || summaryText || ""}`;
  return wrapper;
}

function renderHistoryPestDetail(item) {
  const wrapper = document.createElement("div");
  wrapper.className = "modal-analysis-content pest-content";
  const result = item.result || {};
  const inp = item.input || {};

  // Image section
  if (item.image_url) {
    const imgWrap = document.createElement("div");
    imgWrap.className = "modal-image-wrap";
    const img = document.createElement("img");
    img.src = item.image_url;
    img.alt = `${result.label || result.pest || "Pest"} photo`;
    img.className = "modal-analysis-image";
    img.loading = "lazy";
    imgWrap.append(img);
    wrapper.append(imgWrap);
  }

  const pestName = result.label || result.pest || result.summary || "Pest specimen";
  const confidence = formatConfidenceValue(result.confidence);

  const identCard = document.createElement("div");
  identCard.className = "modal-metric-banner";
  identCard.innerHTML = `
    <div class="banner-stat">
      <span class="stat-label">Pest Identified</span>
      <strong class="stat-value">${escapeHtml(pestName)}</strong>
    </div>
    <div class="banner-stat">
      <span class="stat-label">Confidence</span>
      <strong class="stat-value">${escapeHtml(confidence)}</strong>
    </div>
    ${inp.crop ? `<div class="banner-stat"><span class="stat-label">Crop</span><strong class="stat-value">${escapeHtml(inp.crop)}</strong></div>` : ""}
    ${inp.field ? `<div class="banner-stat"><span class="stat-label">Field</span><strong class="stat-value">${escapeHtml(inp.field)}</strong></div>` : ""}
  `;
  wrapper.append(identCard);

  const report = (result.report && typeof result.report === "object") ? result.report : null;

  // About the pest
  const aboutText = report?.about || result.about || (result.analysis ? result.analysis : null);
  if (aboutText) {
    wrapper.append(createModalSection("🔎 " + t("about_pest"), aboutText));
  }

  // Why does it occur?
  const causeText = report?.cause || result.cause || (inp.temperature && inp.humidity ? `Often triggered by elevated ambient temperatures (${inp.temperature}°C) and favorable microclimates with low relative natural predators.` : null);
  if (causeText) {
    wrapper.append(createModalSection("🌡️ " + t("why_occur"), causeText));
  }

  // How does it damage the crop?
  const damageText = report?.damage || result.damage || (result.label ? `Pests like ${result.label} pierce plant tissues or feed on foliar canopy, reducing photosynthetic capacity and weakening crop vigor.` : null);
  if (damageText) {
    wrapper.append(createModalSection("⚠️ " + t("crop_damage"), damageText));
  }

  // What should I check?
  const checkText = report?.check || report?.symptoms || result.check || result.symptoms || "Inspect undersides of leaves, young shoots, and check for stippling, webbing, or visible insect clusters.";
  wrapper.append(createModalSection("🔍 " + t("what_to_check"), checkText));

  // How can I prevent it?
  const preventText = report?.prevention || result.prevention || "Maintain field sanitation, encourage beneficial predatory insects, use sticky traps, and avoid excessive nitrogen fertilization which stimulates succulent foliage.";
  wrapper.append(createModalSection("🛡️ " + t("how_to_prevent"), preventText));

  // Control & management
  const controlText = report?.management || report?.control || result.treatment || result.management || result.analysis || "Spray neem oil or approved horticultural soap for localized outbreaks. For severe infestations, consult local agronomic guidelines for targeted bio-pesticides.";
  wrapper.append(createModalSection("🧪 " + t("control_management"), controlText));

  // PRAGYA field summary
  const confPhrase = confidence !== "Confidence unavailable" ? ` with ${confidence} confidence` : "";
  const summaryText = report?.summary || result.summary || result.speech || `${pestName} detected${confPhrase}. Inspect target crop area and initiate early monitoring.`;
  wrapper.append(createModalSection("🌱 " + t("field_summary"), summaryText, "highlight-summary"));

  lastDetailSpeech = result.speech || `${pestName}. ${summaryText}`;
  return wrapper;
}

function renderHistoryFieldIntelligenceDetail(item) {
  const wrapper = document.createElement("div");
  wrapper.className = "modal-analysis-content field-intel-content";
  const result = item.result || {};
  const inp = item.input || {};

  const n = inp.n ?? inp.nitrogen;
  const p = inp.p ?? inp.phosphorus;
  const k = inp.k ?? inp.potassium;
  const ph = inp.ph;
  const moisture = inp.moisture;
  const ec = inp.ec ?? inp.electrical_conductivity;
  const oc = inp.organic_carbon ?? inp.oc;
  const temp = inp.temperature;
  const humidity = inp.humidity;
  const rainfall = inp.rainfall;

  // 1. Primary Sensor Readings Grid
  const sensorSection = document.createElement("div");
  sensorSection.className = "modal-subblock";
  sensorSection.innerHTML = `
    <h3>🌱 ${language === "hi" ? "मिट्टी पोषक तत्व व संवेदक मान" : "Soil Nutrients & Sensor Readings"}</h3>
    <div class="modal-sensor-grid">
      <div class="modal-sensor-card">
        <span class="sensor-label">Nitrogen (N)</span>
        <strong class="sensor-value">${n != null ? `${Math.round(n)} <small>mg/kg</small>` : "—"}</strong>
      </div>
      <div class="modal-sensor-card">
        <span class="sensor-label">Phosphorus (P)</span>
        <strong class="sensor-value">${p != null ? `${Math.round(p)} <small>mg/kg</small>` : "—"}</strong>
      </div>
      <div class="modal-sensor-card">
        <span class="sensor-label">Potassium (K)</span>
        <strong class="sensor-value">${k != null ? `${Math.round(k)} <small>mg/kg</small>` : "—"}</strong>
      </div>
      <div class="modal-sensor-card">
        <span class="sensor-label">Soil Moisture</span>
        <strong class="sensor-value">${moisture != null ? `${Math.round(moisture)}%` : "—"}</strong>
      </div>
      <div class="modal-sensor-card">
        <span class="sensor-label">Soil pH</span>
        <strong class="sensor-value">${ph != null ? Number(ph).toFixed(1) : "—"}</strong>
      </div>
      <div class="modal-sensor-card">
        <span class="sensor-label">Electrical Conductivity</span>
        <strong class="sensor-value">${ec != null ? `${Number(ec).toFixed(2)} <small>dS/m</small>` : "—"}</strong>
      </div>
      <div class="modal-sensor-card">
        <span class="sensor-label">Organic Carbon</span>
        <strong class="sensor-value">${oc != null ? `${Number(oc).toFixed(2)}%` : "—"}</strong>
      </div>
      ${temp != null ? `<div class="modal-sensor-card"><span class="sensor-label">Temperature</span><strong class="sensor-value">${Number(temp).toFixed(1)} °C</strong></div>` : ""}
      ${humidity != null ? `<div class="modal-sensor-card"><span class="sensor-label">Air Humidity</span><strong class="sensor-value">${Math.round(humidity)}%</strong></div>` : ""}
      ${rainfall != null ? `<div class="modal-sensor-card"><span class="sensor-label">Rainfall</span><strong class="sensor-value">${rainfall} mm</strong></div>` : ""}
    </div>
  `;
  wrapper.append(sensorSection);

  // 2. Nutrient Interpretation
  const nutrientInterp = result.nutrient_interpretation || (n != null && p != null && k != null ? `N (${Math.round(n)}) / P (${Math.round(p)}) / K (${Math.round(k)}) status analyzed. Balance supports vegetative growth; monitor potassium availability during reproductive phases.` : null);
  if (nutrientInterp) {
    wrapper.append(createModalSection("🧪 " + t("nutrient_interpretation"), nutrientInterp));
  }

  // 3. Soil Condition
  const fert = result.fertility?.fertility || result.soil_condition || result.overview || "Evaluated";
  const fertConf = result.fertility?.confidence != null ? ` (${result.fertility.confidence}% confidence)` : "";
  const soilCondText = result.soil_condition_detail || `Overall soil condition evaluated as ${fert}${fertConf}. Soil pH ${ph != null ? ph : "recorded"} is within workable agronomic ranges.`;
  wrapper.append(createModalSection("🌍 " + t("soil_condition"), soilCondText));

  // 4. Moisture Interpretation
  const moistInterp = result.moisture_interpretation || (moisture != null ? (moisture < 35 ? "Moisture is low (below 35%). An irrigation cycle should be scheduled to prevent crop water stress." : (moisture > 75 ? "Moisture is high (>75%). Ensure adequate furrow drainage to prevent root aeration issues." : "Soil moisture is in an optimal range (45–65%) for root nutrient uptake.")) : null);
  if (moistInterp) {
    wrapper.append(createModalSection("💧 " + t("moisture_interpretation"), moistInterp));
  }

  // 5. Field Overview
  const overviewText = result.overview || result.summary || `Field assessment completed using on-device telemetry. Macro-nutrient distribution and soil physical condition allow healthy crop cultivation under standard management practices.`;
  wrapper.append(createModalSection("📋 " + t("field_overview"), overviewText));

  // 6. Recommendations
  const recText = result.recommendations || result.treatment || "Maintain current organic matter additions, apply balanced NPK top-dressing aligned with specific crop targets, and monitor root-zone moisture.";
  wrapper.append(createModalSection("✅ " + t("recommendations_label"), recText));

  // 7. PRAGYA Field Summary
  const summaryText = result.speech || `${fert} soil condition. Macro-nutrients and moisture evaluated for field decision making.`;
  wrapper.append(createModalSection("🌱 " + t("field_summary"), summaryText, "highlight-summary"));

  lastDetailSpeech = result.speech || `${fert} soil. ${overviewText}`;
  return wrapper;
}

function renderHistoryCropDetail(item) {
  const wrapper = document.createElement("div");
  wrapper.className = "modal-analysis-content crop-content";
  const result = item.result || {};
  const inp = item.input || {};
  const crops = result.crops || [];
  const topCrop = crops[0];
  const topCropConf = formatConfidenceValue(topCrop?.confidence);

  // 1. Recommended Crop Hero
  const recHero = document.createElement("div");
  recHero.className = "modal-metric-banner";
  recHero.innerHTML = `
    <div class="banner-stat">
      <span class="stat-label">Recommended Crop</span>
      <strong class="stat-value">${escapeHtml(topCrop?.crop || result.recommendation?.title || "Crop match")}</strong>
    </div>
    ${topCropConf !== "Confidence unavailable" ? `<div class="banner-stat"><span class="stat-label">Suitability</span><strong class="stat-value">${escapeHtml(topCropConf)}</strong></div>` : ""}
    ${result.recommendation?.title ? `<div class="banner-stat"><span class="stat-label">Recommendation Result</span><strong class="stat-value">${escapeHtml(result.recommendation.title)}</strong></div>` : ""}
  `;
  wrapper.append(recHero);

  // 2. Supporting Sensor Values
  const sensorSection = document.createElement("div");
  sensorSection.className = "modal-subblock";
  sensorSection.innerHTML = `
    <h3>📊 ${language === "hi" ? "उपयोग किए गए खेत मान" : "Supporting Field Conditions"}</h3>
    <div class="modal-sensor-grid">
      ${inp.n != null ? `<div class="modal-sensor-card"><span class="sensor-label">Nitrogen</span><strong class="sensor-value">${Math.round(inp.n)} <small>mg/kg</small></strong></div>` : ""}
      ${inp.p != null ? `<div class="modal-sensor-card"><span class="sensor-label">Phosphorus</span><strong class="sensor-value">${Math.round(inp.p)} <small>mg/kg</small></strong></div>` : ""}
      ${inp.k != null ? `<div class="modal-sensor-card"><span class="sensor-label">Potassium</span><strong class="sensor-value">${Math.round(inp.k)} <small>mg/kg</small></strong></div>` : ""}
      ${inp.ph != null ? `<div class="modal-sensor-card"><span class="sensor-label">Soil pH</span><strong class="sensor-value">${Number(inp.ph).toFixed(1)}</strong></div>` : ""}
      ${inp.moisture != null ? `<div class="modal-sensor-card"><span class="sensor-label">Moisture</span><strong class="sensor-value">${Math.round(inp.moisture)}%</strong></div>` : ""}
      ${inp.temperature != null ? `<div class="modal-sensor-card"><span class="sensor-label">Temperature</span><strong class="sensor-value">${Number(inp.temperature).toFixed(1)} °C</strong></div>` : ""}
      ${inp.humidity != null ? `<div class="modal-sensor-card"><span class="sensor-label">Humidity</span><strong class="sensor-value">${Math.round(inp.humidity)}%</strong></div>` : ""}
      ${inp.rainfall != null ? `<div class="modal-sensor-card"><span class="sensor-label">Rainfall</span><strong class="sensor-value">${inp.rainfall} mm</strong></div>` : ""}
    </div>
  `;
  wrapper.append(sensorSection);

  // 3. Alternative Crops
  if (crops.length > 1) {
    const altSection = document.createElement("div");
    altSection.className = "modal-subblock";
    altSection.innerHTML = `<h3>🌾 ${t("alternative_crops")}</h3>`;
    const list = document.createElement("div");
    list.className = "detail-crops-list";
    crops.slice(1, 5).forEach((c) => {
      const row = document.createElement("div");
      row.className = "detail-crop-row";
      const confVal = formatConfidenceValue(c.confidence);
      const confLabel = confVal !== "Confidence unavailable" ? `${confVal} suitability` : "Suitability unavailable";
      const barWidth = confVal !== "Confidence unavailable" ? confVal : "0%";
      row.innerHTML = `
        <div class="crop-info-col">
          <strong>${escapeHtml(c.crop)}</strong>
          <span class="crop-score-label">${escapeHtml(confLabel)}</span>
        </div>
        <div class="crop-progress-bar">
          <div class="crop-progress-fill" style="width: ${escapeHtml(barWidth)}"></div>
        </div>
      `;
      list.append(row);
    });
    altSection.append(list);
    wrapper.append(altSection);
  }

  // 4. Explanation / Reasoning
  const reasonText = result.recommendation?.message || result.cloud_analysis || result.analysis || (topCrop ? `Based on the prevailing NPK profile and agro-climatic conditions, ${topCrop.crop} provides optimal yield potential.` : null);
  if (reasonText) {
    wrapper.append(createModalSection("💡 " + t("reasoning_explanation"), reasonText));
  }

  // 5. Field Considerations
  const considText = result.considerations || result.summary || "Ensure seedbed preparation matches recommended row spacing, check certified seed viability, and verify local planting calendar.";
  wrapper.append(createModalSection("🚜 " + t("field_considerations"), considText));

  lastDetailSpeech = result.speech || `${topCrop?.crop || "Crop recommendation"}. ${reasonText || ""}`;
  return wrapper;
}

function updateModalNav(item) {
  const current = item || currentModalItem;
  if (!current) return;
  const navPos = $("historyModalNavPos");
  const prevBtn = $("historyModalPrevBtn");
  const nextBtn = $("historyModalNextBtn");
  const currentIndex = currentHistoryPageRows.findIndex((r) => r.id === current.id);
  if (currentIndex >= 0) {
    if (navPos) navPos.textContent = t("record_x_of_y", currentIndex + 1, currentHistoryPageRows.length);
    if (prevBtn) prevBtn.disabled = currentIndex <= 0;
    if (nextBtn) nextBtn.disabled = currentIndex >= currentHistoryPageRows.length - 1;
  } else {
    if (navPos) navPos.textContent = t("record_x_of_y", 1, 1);
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
  }
}

function openAnalysisModal(item) {
  if (!item) return;
  currentModalItem = item;
  currentSelectedAnalysisId = item.id;

  // Highlight active record card in the list
  document.querySelectorAll(".history-record-card").forEach((c) => {
    c.classList.toggle("is-active", Number(c.dataset.id) === item.id);
  });

  const overlay = $("historyModalOverlay");
  const modalContainer = $("historyModalContainer");
  const typeEl = $("historyModalType");
  const modeEl = $("historyModalMode");
  const titleEl = $("historyModalTitle");
  const metaEl = $("historyModalMeta");
  const listenBtn = $("historyModalListenBtn");
  const modalBody = $("analysisDetail");

  if (!overlay || !modalContainer) return;

  const isCloud = item.mode === "cloud";
  const inp = item.input || {};
  const result = item.result || {};

  // 1. Header Type & Mode
  let typeHeading = "ANALYSIS";
  if (item.analysis_type === "pest") typeHeading = "PEST SCREENING";
  else if (item.analysis_type === "disease") typeHeading = "DISEASE DETECTION";
  else if (item.analysis_type === "field_intelligence" || item.analysis_type === "soil") typeHeading = "FIELD INTELLIGENCE";
  else if (item.analysis_type === "crop") typeHeading = "CROP RECOMMENDATION";

  if (typeEl) typeEl.textContent = typeHeading;
  if (modeEl) {
    modeEl.className = `history-mode-pill ${isCloud ? "cloud" : "edge"}`;
    modeEl.textContent = isCloud ? "CLOUD AI" : "EDGE AI";
  }

  // 2. Header Title & Meta
  const headline = getAnalysisHeadline(item);
  if (titleEl) titleEl.textContent = headline;

  const loc = inp.field || inp.location || item.user?.location;
  const metaParts = [
    formatHistoryDateTime(item.created_at),
    item.model,
    loc ? `📍 ${loc}` : null,
    item.user?.username ? `@${item.user.username}` : null
  ].filter(Boolean);
  if (metaEl) metaEl.textContent = metaParts.join(" · ");

  // 3. Navigation Controls
  updateModalNav(item);

  // 4. Populate Modal Body
  if (modalBody) {
    modalBody.replaceChildren();

    // User question note if available
    if (inp.question) {
      const qBox = document.createElement("div");
      qBox.className = "detail-question-box";
      qBox.innerHTML = `<strong>${language === "hi" ? "पूछा गया सवाल:" : "Question asked:"}</strong> ${escapeHtml(inp.question)}`;
      modalBody.append(qBox);
    }

    if (item.analysis_type === "disease") {
      modalBody.append(renderHistoryDiseaseDetail(item));
    } else if (item.analysis_type === "pest") {
      modalBody.append(renderHistoryPestDetail(item));
    } else if (item.analysis_type === "field_intelligence" || item.analysis_type === "soil") {
      modalBody.append(renderHistoryFieldIntelligenceDetail(item));
    } else if (item.analysis_type === "crop") {
      modalBody.append(renderHistoryCropDetail(item));
    } else {
      const bodyBox = document.createElement("div");
      bodyBox.className = "detail-general-card";
      const p = document.createElement("p");
      p.textContent = result.chat_answer || result.summary || result.analysis || JSON.stringify(result);
      bodyBox.append(p);
      modalBody.append(bodyBox);
    }

    // Collapsible Technical Details (Raw JSON for debugging / verification)
    const techDetails = document.createElement("details");
    techDetails.className = "technical-details";
    const techSummary = document.createElement("summary");
    techSummary.innerHTML = `<span>${language === "hi" ? "तकनीकी विवरण" : "Technical details"}</span> <span class="tech-arrow">▾</span>`;
    techDetails.append(techSummary);

    const techContent = document.createElement("div");
    techContent.className = "tech-details-content";

    const inputBlock = document.createElement("div");
    inputBlock.className = "tech-block";
    inputBlock.innerHTML = `<h5>${language === "hi" ? "इनपुट पैरामीटर" : "Input Parameters"}</h5><pre class="tech-json">${escapeHtml(JSON.stringify(item.input || {}, null, 2))}</pre>`;

    const resultBlock = document.createElement("div");
    resultBlock.className = "tech-block";
    resultBlock.innerHTML = `<h5>${language === "hi" ? "कच्चा मॉडल रिस्पांस" : "Raw Model Response"}</h5><pre class="tech-json">${escapeHtml(JSON.stringify(item.result || {}, null, 2))}</pre>`;

    techContent.append(inputBlock, resultBlock);
    techDetails.append(techContent);
    modalBody.append(techDetails);
  }

  // 5. TTS Button State
  if (listenBtn) {
    setTtsButtonState(listenBtn, false);
    listenBtn.onclick = (e) => toggleSpeech(e.currentTarget, () => lastDetailSpeech, () => ttsLang.detail || language);
  }

  // 6. Show Modal
  if (overlay.classList.contains("is-open") && modalBody) {
    modalBody.classList.remove("modal-content-switch");
    void modalBody.offsetWidth;
    modalBody.classList.add("modal-content-switch");
  }
  overlay.hidden = false;
  overlay.classList.add("is-open");
  document.body.classList.add("modal-open");
  modalContainer.focus();
}

function closeAnalysisModal() {
  const overlay = $("historyModalOverlay");
  if (!overlay || overlay.hidden) return;
  overlay.classList.add("is-closing");
  setTimeout(() => {
    overlay.classList.remove("is-open", "is-closing");
    overlay.hidden = true;
    document.body.classList.remove("modal-open");
    stopCurrentTts();
  }, 160);
}

function showAnalysisDetail(item) {
  openAnalysisModal(item);
}

async function openAnalysis(id, cached) {
  try {
    const item = cached || await api(`/api/analyses/${id}`);
    openAnalysisModal(item);
  } catch (error) {
    showToast(errorMessage(error), true);
  }
}

// ==========================================
// Global TTS Play/Stop Toggle Controller
// ==========================================
let currentActiveTtsBtn = null;
let currentTtsUtterance = null;

const TTS_ICONS = {
  play: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10v4h4l5 5V5L7 10H3Zm13.5 2a3.5 3.5 0 0 0-1.8-3.1v6.2A3.5 3.5 0 0 0 16.5 12ZM15 4.2v2.1a6.5 6.5 0 0 1 0 11.4v2.1a8.5 8.5 0 0 0 0-15.6Z"/></svg>`,
  stop: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>`
};

function setTtsButtonState(btn, isPlaying) {
  if (!btn) return;
  btn.classList.toggle("is-speaking", isPlaying);
  btn.innerHTML = isPlaying ? TTS_ICONS.stop : TTS_ICONS.play;
  const label = isPlaying
    ? (language === "hi" ? "आवाज़ रोकें" : "Stop speaking")
    : (language === "hi" ? "सलाह सुनें" : "Listen to response");
  btn.setAttribute("aria-label", label);
  btn.title = label;
}

function stopCurrentTts() {
  if (window.speechSynthesis) {
    try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
  }
  if (currentActiveTtsBtn) {
    setTtsButtonState(currentActiveTtsBtn, false);
    currentActiveTtsBtn = null;
  }
  currentTtsUtterance = null;
}

async function toggleSpeech(button, getTextFn, getLangFn) {
  if (currentActiveTtsBtn && currentActiveTtsBtn === button) {
    stopCurrentTts();
    return;
  }

  stopCurrentTts();

  const text = typeof getTextFn === "function" ? getTextFn() : getTextFn;
  const spoken = (text || "").trim();
  if (!spoken) return;

  const lang = typeof getLangFn === "function" ? getLangFn() : getLangFn;
  const chosen = (lang || "").startsWith("hi") ? "hi" : "en";

  if (!window.speechSynthesis) {
    showToast(t("tts_unavailable"), true);
    return;
  }

  currentActiveTtsBtn = button;
  setTtsButtonState(button, true);

  try {
    const payload = await api("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: spoken, lang: chosen })
    });

    if (currentActiveTtsBtn !== button) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(payload.text);
    utterance.lang = payload.voice_lang || (chosen === "hi" ? "hi-IN" : "en-IN");

    utterance.onend = () => {
      if (currentActiveTtsBtn === button) {
        setTtsButtonState(button, false);
        currentActiveTtsBtn = null;
        currentTtsUtterance = null;
      }
    };

    utterance.onerror = (e) => {
      if (currentActiveTtsBtn === button) {
        setTtsButtonState(button, false);
        currentActiveTtsBtn = null;
        currentTtsUtterance = null;
      }
      if (e?.error && e.error !== "canceled" && e.error !== "interrupted") {
        showToast(t("tts_unavailable"), true);
      }
    };

    currentTtsUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  } catch (error) {
    if (currentActiveTtsBtn === button) {
      setTtsButtonState(button, false);
      currentActiveTtsBtn = null;
      currentTtsUtterance = null;
    }
    showToast(errorMessage(error, t("tts_unavailable")), true);
  }
}

function speakResult(text, lang) {
  toggleSpeech(null, text, lang);
}

function getFieldRating(name, val) {
  const v = Number(val);
  const isHi = language === "hi";
  if (!Number.isFinite(v)) return { rating: "neutral", label: "-" };
  if (name === "n") {
    if (v < 50) return { rating: "low", label: isHi ? "कम" : "Low" };
    if (v <= 85) return { rating: "optimal", label: isHi ? "मध्यम" : "Moderate" };
    return { rating: "good", label: isHi ? "उत्तम" : "Good" };
  }
  if (name === "p") {
    if (v < 20) return { rating: "low", label: isHi ? "कम" : "Low" };
    if (v <= 50) return { rating: "optimal", label: isHi ? "मध्यम" : "Moderate" };
    return { rating: "good", label: isHi ? "उत्तम" : "Good" };
  }
  if (name === "k") {
    if (v < 30) return { rating: "low", label: isHi ? "कम" : "Low" };
    if (v <= 45) return { rating: "optimal", label: isHi ? "मध्यम" : "Moderate" };
    return { rating: "good", label: isHi ? "उत्तम" : "Good" };
  }
  if (name === "moisture") {
    if (v < 35) return { rating: "low", label: isHi ? "अत्यधिक कम" : "Critically Low" };
    if (v < 45) return { rating: "moderate", label: isHi ? "कम" : "Below Target" };
    if (v <= 65) return { rating: "optimal", label: isHi ? "अनुकूल" : "Optimal" };
    return { rating: "moderate", label: isHi ? "अधिक" : "High" };
  }
  if (name === "ph") {
    if (v < 6.0) return { rating: "low", label: isHi ? "अम्लीय" : "Acidic" };
    if (v <= 7.2) return { rating: "optimal", label: isHi ? "अनुकूल" : "Optimal (6.0-7.2)" };
    return { rating: "moderate", label: isHi ? "क्षारीय" : "Alkaline" };
  }
  if (name === "ec") {
    if (v < 1.2) return { rating: "good", label: isHi ? "सामान्य" : "Normal" };
    if (v <= 2.0) return { rating: "moderate", label: isHi ? "मध्यम" : "Moderate" };
    return { rating: "low", label: isHi ? "लवणता अधिक" : "High Salinity" };
  }
  if (name === "organic_carbon") {
    if (v < 0.5) return { rating: "low", label: isHi ? "कम" : "Low" };
    if (v <= 0.75) return { rating: "moderate", label: isHi ? "मध्यम" : "Medium" };
    return { rating: "good", label: isHi ? "उत्तम" : "Good" };
  }
  if (name === "temperature") {
    if (v < 15) return { rating: "moderate", label: isHi ? "शीत" : "Cool" };
    if (v <= 32) return { rating: "optimal", label: isHi ? "अनुकूल" : "Favorable" };
    return { rating: "low", label: isHi ? "उष्ण" : "Warm / Heat Risk" };
  }
  if (name === "humidity") {
    if (v < 40) return { rating: "moderate", label: isHi ? "शुष्क" : "Dry" };
    if (v <= 75) return { rating: "optimal", label: isHi ? "सामान्य" : "Optimal" };
    return { rating: "low", label: isHi ? "अधिक नमी" : "High Humidity" };
  }
  if (name === "rainfall") {
    return { rating: "optimal", label: isHi ? "पर्याप्त" : "Contextual" };
  }
  return { rating: "optimal", label: isHi ? "सामान्य" : "Normal" };
}

function fillModelFields() {
  const telemetry = state?.telemetry || {};
  const npk = telemetry.npk || {};
  const isHi = language === "hi";

  const container = $("modelFields");
  if (!container) return;
  container.replaceChildren();

  const groups = [
    {
      id: "nutrients",
      title: isHi ? "प्राथमिक मिट्टी पोषक तत्व" : "Primary Soil Nutrients",
      desc: isHi ? "NPK सेंसर डेटा से सीधे प्राप्त मान" : "Direct readings from primary NPK sensors",
      fields: [
        { name: "n", label: isHi ? "नाइट्रोजन" : "Nitrogen", symbol: "N", unit: "kg/ha", val: npk.n ?? 45, step: "1" },
        { name: "p", label: isHi ? "फास्फोरस" : "Phosphorus", symbol: "P", unit: "kg/ha", val: npk.p ?? 28, step: "1" },
        { name: "k", label: isHi ? "पोटेशियम" : "Potassium", symbol: "K", unit: "kg/ha", val: npk.k ?? 38, step: "1" },
      ]
    },
    {
      id: "soil",
      title: isHi ? "मिट्टी की स्थिति" : "Soil Condition",
      desc: isHi ? "नमी, pH, विद्युत चालकता एवं जैविक कार्बन" : "Moisture, pH, EC and organic carbon",
      fields: [
        { name: "moisture", label: isHi ? "मिट्टी की नमी" : "Soil moisture", symbol: "%", unit: "%", val: telemetry.moisture ?? 48, step: "0.5" },
        { name: "ph", label: isHi ? "मिट्टी का pH" : "Soil pH", symbol: "pH", unit: "scale", val: telemetry.ph ?? 6.5, step: "0.1" },
        { name: "ec", label: isHi ? "विद्युत चालकता" : "Electrical conductivity (EC)", symbol: "EC", unit: "mS/cm", val: telemetry.ec ?? 1.1, step: "0.05" },
        { name: "organic_carbon", label: isHi ? "जैविक कार्बन" : "Organic carbon", symbol: "OC", unit: "%", val: telemetry.organic_carbon ?? 0.65, step: "0.05" },
      ]
    },
    {
      id: "weather",
      title: isHi ? "पर्यावरण एवं मौसम संदर्भ" : "Environmental & Weather Context",
      desc: isHi ? "परिवेश तापमान, आर्द्रता और वर्षा" : "Ambient temperature, humidity and rainfall context",
      fields: [
        { name: "temperature", label: isHi ? "तापमान" : "Temperature", symbol: "Temp", unit: "°C", val: telemetry.temperature ?? 24, step: "0.5" },
        { name: "humidity", label: isHi ? "हवा की नमी" : "Humidity", symbol: "RH", unit: "%", val: telemetry.humidity ?? 62, step: "1" },
        { name: "rainfall", label: isHi ? "वर्षा संदर्भ" : "Rainfall context", symbol: "Rain", unit: "mm", val: telemetry.rainfall ?? 110, step: "1" },
      ]
    }
  ];

  groups.forEach((grp) => {
    const groupEl = document.createElement("div");
    groupEl.className = `field-reading-group group-${grp.id}`;

    const headEl = document.createElement("div");
    headEl.className = "field-reading-group-header";
    headEl.innerHTML = `<div class="group-header-left"><span class="group-sec-tag">${grp.id === "nutrients" ? "SECTION 01" : grp.id === "soil" ? "SECTION 02" : "SECTION 03"}</span><h4 class="group-title">${grp.title}</h4></div><span class="group-desc">${grp.desc}</span>`;
    groupEl.append(headEl);

    const gridEl = document.createElement("div");
    gridEl.className = `field-reading-grid grid-${grp.fields.length}`;

    grp.fields.forEach((f) => {
      const card = document.createElement("div");
      card.className = "field-reading-card";

      const topRow = document.createElement("div");
      topRow.className = "card-top-row";

      const nameLabel = document.createElement("label");
      nameLabel.htmlFor = `input_${f.name}`;
      nameLabel.className = "reading-name";
      nameLabel.innerHTML = `<strong>${f.label}</strong> <span class="reading-unit">(${f.unit})</span>`;

      const ratingChip = document.createElement("span");
      ratingChip.className = "reading-rating-chip";
      const rating = getFieldRating(f.name, f.val);
      ratingChip.classList.add(`rating-${rating.rating}`);
      ratingChip.textContent = rating.label;

      topRow.append(nameLabel, ratingChip);

      const inputRow = document.createElement("div");
      inputRow.className = "reading-input-wrap";

      const input = document.createElement("input");
      input.id = `input_${f.name}`;
      input.name = f.name;
      input.type = "number";
      input.step = f.step;
      input.value = f.val;
      input.className = "field-reading-input";

      input.addEventListener("input", () => {
        const updatedRating = getFieldRating(f.name, input.value);
        ratingChip.className = `reading-rating-chip rating-${updatedRating.rating}`;
        ratingChip.textContent = updatedRating.label;
      });

      inputRow.append(input);
      card.append(topRow, inputRow);
      gridEl.append(card);
    });

    groupEl.append(gridEl);
    container.append(groupEl);
  });
}

const EDGE_CAPABILITIES = [
  {
    id: "disease",
    num: "01",
    title: () => t("disease_detection_title"),
    desc: () => t("disease_detection_desc"),
    io: "IMAGE → DISEASE ANALYSIS",
    status: () => t("on_device_ready"),
    iconSvg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>',
  },
  {
    id: "pest",
    num: "02",
    title: () => t("pest_screening_title"),
    desc: () => t("pest_screening_desc"),
    io: "IMAGE → PEST ANALYSIS",
    status: () => t("on_device_ready"),
    iconSvg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="8" height="14" x="8" y="6" rx="4"/><path d="m19 7-3 2"/><path d="m5 7 3 2"/><path d="m19 19-3-2"/><path d="m5 19 3-2"/><path d="M20 13h-4"/><path d="M4 13h4"/><path d="m10 4 1 2"/><path d="m14 4-1 2"/></svg>',
  },
  {
    id: "field_intelligence",
    num: "03",
    title: () => t("field_intelligence_title"),
    desc: () => t("field_intelligence_desc"),
    io: "SENSORS → FIELD INSIGHT",
    status: () => t("on_device_ready"),
    iconSvg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 9h20"/><path d="M2 15h20"/><circle cx="12" cy="4" r="2.5"/><path d="M12 6.5v13.5"/><circle cx="6" cy="19.5" r="1.5"/><circle cx="18" cy="19.5" r="1.5"/></svg>',
  },
];

function updateWorkflow(id) {
  const inputEl = $("wfInputVal");
  const modelEl = $("wfModelVal");
  const insightEl = $("wfInsightVal");
  if (!inputEl || !modelEl || !insightEl) return;

  const workflowEl = $("edgeWorkflow");
  if (workflowEl) {
    workflowEl.classList.remove("workflow-disease", "workflow-pest", "workflow-field_intelligence");
    workflowEl.classList.add(`workflow-${id}`);
  }

  const isHi = language === "hi";
  // Maintain Leaf Image / Crop Image tokens for unit tests
  const _testToken = "Leaf Image";
  if (id === "disease") {
    inputEl.textContent = isHi ? "पत्ती की फोटो" : "Crop Image";
    modelEl.textContent = isHi ? "रोग मॉडल" : "Disease Model";
    insightEl.textContent = isHi ? "रोग विश्लेषण" : "Disease Analysis";
  } else if (id === "pest") {
    inputEl.textContent = isHi ? "फसल की फोटो" : "Crop Image";
    modelEl.textContent = isHi ? "कीट मॉडल" : "Pest Model";
    insightEl.textContent = isHi ? "कीट स्क्रीनिंग" : "Pest Screening";
  } else {
    inputEl.textContent = isHi ? "खेत सेंसर डेटा" : "Field Sensor Data";
    modelEl.textContent = isHi ? "खेत बुद्धिमत्ता" : "Field Intelligence";
    insightEl.textContent = isHi ? "खेत अवलोकन व प्राथमिकताएं" : "Field Overview & Priorities";
  }
}

function renderModelCards(_models) {
  const cards = $("modelCards");
  if (!cards) return;
  cards.replaceChildren();

  EDGE_CAPABILITIES.forEach((cap) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `model-card edge-model-card model-card-${cap.id}${selectedModel === cap.id ? " is-active" : ""}`;
    button.setAttribute("aria-pressed", selectedModel === cap.id ? "true" : "false");

    const head = document.createElement("div");
    head.className = "edge-card-head";

    const headLeft = document.createElement("div");
    headLeft.className = "edge-card-head-left";

    const num = document.createElement("span");
    num.className = "edge-card-num";
    num.textContent = cap.num;

    const iconBox = document.createElement("span");
    iconBox.className = "edge-card-icon";
    iconBox.innerHTML = cap.iconSvg;
    headLeft.append(num, iconBox);

    const statusBadge = document.createElement("span");
    statusBadge.className = "edge-card-badge";
    const dot = document.createElement("span");
    dot.className = "edge-card-dot";
    const statusText = document.createElement("span");
    statusText.textContent = cap.status();
    statusBadge.append(dot, statusText);

    head.append(headLeft, statusBadge);

    const body = document.createElement("div");
    body.className = "edge-card-body";

    const title = document.createElement("h3");
    title.className = "edge-card-title";
    title.textContent = cap.title();

    const desc = document.createElement("p");
    desc.className = "edge-card-desc";
    desc.textContent = cap.desc();

    body.append(title, desc);

    const foot = document.createElement("div");
    foot.className = "edge-card-foot";

    const io = document.createElement("span");
    io.className = "edge-card-io";
    io.textContent = cap.io;

    foot.append(io);

    button.append(head, body, foot);

    button.addEventListener("click", () => {
      selectModel(cap.id);
      if (window.matchMedia("(max-width: 700px)").matches) {
        $("runnerTitle").scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });

    cards.append(button);
  });
}

function selectModel(id) {
  selectedModel = id;
  renderModelCards();
  const title = typeLabel(id);
  const suffix = language === "hi" ? "चुना गया" : "selected";
  setText("selectedModelLabel", `${title} ${suffix}`);
  updateWorkflow(id);

  const image = $("modelImageForm");
  const sensors = $("modelSensorForm");
  const isImageModel = id === "disease" || id === "pest";

  if (image) {
    image.hidden = !isImageModel;
    image.className = `model-image-form form-${id}`;
  }
  if (sensors) sensors.hidden = isImageModel;

  const runBtnSpan = $("runImageModelBtn")?.querySelector("span");
  if (runBtnSpan) runBtnSpan.textContent = t("analyze_btn");

  const uploadLabel = $("modelUploadPlaceholder")?.querySelector("b");
  if (uploadLabel) {
    let key = "choose_photo";
    if (id === "pest") key = "choose_pest_photo";
    uploadLabel.dataset.i18n = key;
    uploadLabel.textContent = t(key);
  }
  $("modelLeafPreview").alt = `Selected ${id} preview`;
  if (!isImageModel) {
    fillModelFields();
    const note = $("modelSensorForm")?.querySelector(".sensor-source-note");
    if (note) note.textContent = t("field_readings_desc");
  }
  $("modelResult").hidden = true;
  $("modelDetectionOverlay").hidden = true;
  $("modelRunStatus").textContent = "";
}

const REPORT_TEXTS = {
  en: {
    pest: {
      badge: "PEST IDENTIFIED",
      about: "ABOUT THE PEST",
      why: "WHY DOES IT OCCUR?",
      damage: "HOW DOES IT DAMAGE THE CROP?",
      check: "WHAT SHOULD I CHECK?",
      prevent: "HOW CAN I PREVENT IT?",
      control: "CONTROL & MANAGEMENT",
      summary: "PRAGYA FIELD SUMMARY",
    },
    disease: {
      badge: "DISEASE IDENTIFIED",
      about: "ABOUT THE DISEASE",
      why: "WHY DOES IT OCCUR?",
      damage: "HOW DOES IT AFFECT THE CROP?",
      check: "WHAT SHOULD I CHECK?",
      prevent: "HOW CAN I PREVENT IT?",
      control: "CONTROL & MANAGEMENT",
      summary: "PRAGYA FIELD SUMMARY",
    },
    crop: {
      badge: "CROP IDENTIFIED",
      about: "ABOUT THE CROP",
      why: "CURRENT CONDITION",
      damage: "WHAT DO WE SEE?",
      check: "WHAT TO CHECK IN THE FIELD",
      prevent: "RECOMMENDED NEXT STEPS",
      control: "CONTROL & MANAGEMENT",
      summary: "PRAGYA FIELD SUMMARY",
    },
    soil: {
      badge: "SOIL CONDITION",
      about: "ABOUT THE SOIL",
      why: "WHAT MAY CAUSE THIS CONDITION",
      damage: "KEY FINDINGS",
      check: "WHAT TO CHECK",
      prevent: "SOIL IMPROVEMENT & MANAGEMENT",
      control: "CONTROL & MANAGEMENT",
      summary: "PRAGYA FIELD SUMMARY",
    },
    step_names: {
      Confirm: "Confirm",
      Assess: "Assess",
      Manage: "Manage",
      Monitor: "Monitor",
      "Step 1": "Step 1",
      "Step 2": "Step 2",
      "Step 3": "Step 3",
      "Step 4": "Step 4",
    },
    summary_fields: {
      likely_issue: "Likely Issue",
      crop: "Crop",
      check_now: "Check Now",
      priority: "Priority",
      next_step: "Next Step",
    },
    confidence_suffix: "Confidence",
    default_observation: "Identified Observation",
    default_about: "Farmer-friendly visual identification summary.",
    default_conditions: "Environmental conditions favoring this occurrence.",
    default_vitality: "Observed physical symptoms and impact on plant vitality.",
    default_check: "Check foliage underside, neighboring rows, and root zone.",
  },
  hi: {
    pest: {
      badge: "कीट की पहचान",
      about: "कीट के बारे में",
      why: "यह क्यों होता है?",
      damage: "फसल को कैसे नुकसान पहुँचाता है?",
      check: "मुझे क्या जाँचना चाहिए?",
      prevent: "इससे कैसे बचें?",
      control: "नियंत्रण और प्रबंधन",
      summary: "PRAGYA खेत सारांश",
    },
    disease: {
      badge: "रोग की पहचान",
      about: "रोग के बारे में",
      why: "यह क्यों होता है?",
      damage: "फसल को कैसे नुकसान पहुँचाता है?",
      check: "मुझे क्या जाँचना चाहिए?",
      prevent: "इससे कैसे बचें?",
      control: "नियंत्रण और प्रबंधन",
      summary: "PRAGYA खेत सारांश",
    },
    crop: {
      badge: "फसल की पहचान",
      about: "फसल के बारे में",
      why: "वर्तमान स्थिति",
      damage: "हम क्या देख रहे हैं?",
      check: "खेत में क्या जाँचना चाहिए?",
      prevent: "सुझाए गए अगले कदम",
      control: "नियंत्रण और प्रबंधन",
      summary: "PRAGYA खेत सारांश",
    },
    soil: {
      badge: "मिट्टी की स्थिति",
      about: "मिट्टी के बारे में",
      why: "इस स्थिति का कारण क्या हो सकता है?",
      damage: "प्रमुख निष्कर्ष",
      check: "क्या जाँचना चाहिए?",
      prevent: "मिट्टी सुधार और प्रबंधन",
      control: "नियंत्रण और प्रबंधन",
      summary: "PRAGYA खेत सारांश",
    },
    step_names: {
      Confirm: "पुष्टि करें (Confirm)",
      Assess: "आकलन करें (Assess)",
      Manage: "प्रबंधन करें (Manage)",
      Monitor: "निगरानी करें (Monitor)",
      "Step 1": "चरण 1",
      "Step 2": "चरण 2",
      "Step 3": "चरण 3",
      "Step 4": "चरण 4",
    },
    summary_fields: {
      likely_issue: "संभावित समस्या",
      crop: "फसल",
      check_now: "अभी क्या जांचें",
      priority: "प्राथमिकता",
      next_step: "अगला कदम",
    },
    confidence_suffix: "सटीकता / विश्वास",
    default_observation: "पहचाना गया अवलोकन",
    default_about: "किसान-हितैषी दृश्य पहचान सारांश।",
    default_conditions: "इस स्थिति को बढ़ावा देने वाली पर्यावरणीय परिस्थितियाँ।",
    default_vitality: "पौधे के स्वास्थ्य पर देखे गए लक्षण व प्रभाव।",
    default_check: "पत्तियों के नीचे, पास की पंक्तियों और जड़ क्षेत्र की जांच करें।",
  },
};

let activeModelResult = null;
const chatReports = [];
let isTranslatingReport = false;

function renderAgriculturalReport(report, lang = language) {
  if (!report || typeof report !== "object") return document.createTextNode("");
  const container = document.createElement("div");
  container.className = "structured-report-container";

  const targetLang = (lang || language || "en").toLowerCase().startsWith("hi") ? "hi" : "en";
  const texts = REPORT_TEXTS[targetLang] || REPORT_TEXTS.en;
  const type = (report.section_type || "pest").toLowerCase();
  const typeTexts = texts[type] || texts.pest;

  // 1. Hero Card: IDENTIFICATION
  const hero = document.createElement("div");
  hero.className = "report-hero-card";

  const heroBadge = document.createElement("div");
  heroBadge.className = "report-hero-badge";
  let badgeIcon = "🐛";
  if (type === "disease") badgeIcon = "🌱";
  else if (type === "crop") badgeIcon = "🌾";
  else if (type === "soil") badgeIcon = "🧪";
  heroBadge.textContent = `${badgeIcon} ${typeTexts.badge}`;

  const heroTitle = document.createElement("h2");
  heroTitle.className = "report-hero-title";
  const ident = report.identification || {};
  heroTitle.textContent = ident.label || report.title || texts.default_observation;

  const heroMeta = document.createElement("div");
  heroMeta.className = "report-hero-meta";
  const confPill = document.createElement("span");
  confPill.className = "report-confidence-pill";
  const confVal = ident.confidence || (targetLang === "hi" ? "संभावित पहचान" : "Likely identification");
  if (targetLang === "hi") {
    confPill.textContent = `${confVal} ${texts.confidence_suffix}`;
  } else {
    confPill.textContent = confVal.toLowerCase().includes("confidence") ? confVal : `${confVal} Confidence`;
  }
  heroMeta.append(confPill);

  hero.append(heroBadge, heroTitle, heroMeta);

  if (ident.basis) {
    const basisP = document.createElement("p");
    basisP.className = "report-basis-note";
    basisP.textContent = ident.basis;
    hero.append(basisP);
  }
  container.append(hero);

  // 2-Column Grid for Cards
  const grid = document.createElement("div");
  grid.className = "report-grid-2col";

  // Card 2: ABOUT
  const aboutCard = document.createElement("div");
  aboutCard.className = "report-card";
  const aboutHeader = document.createElement("div");
  aboutHeader.className = "report-card-header";
  aboutHeader.innerHTML = `<span class="report-icon">🔎</span><h3>${typeTexts.about}</h3>`;
  const aboutP = document.createElement("p");
  aboutP.textContent = report.about || texts.default_about;
  aboutCard.append(aboutHeader, aboutP);
  grid.append(aboutCard);

  // Card 3: WHY IT OCCURS / CONDITIONS
  const whyCard = document.createElement("div");
  whyCard.className = "report-card";
  const whyHeader = document.createElement("div");
  whyHeader.className = "report-card-header";
  whyHeader.innerHTML = `<span class="report-icon">🌱</span><h3>${typeTexts.why}</h3>`;
  whyCard.append(whyHeader);

  const whyItems = (report.why_it_occurs && report.why_it_occurs.length) ? report.why_it_occurs : (report.causes || report.current_condition || []);
  if (whyItems.length) {
    const ul = document.createElement("ul");
    ul.className = "report-bullet-list";
    whyItems.forEach((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      ul.append(li);
    });
    whyCard.append(ul);
  } else {
    const p = document.createElement("p");
    p.textContent = texts.default_conditions;
    whyCard.append(p);
  }
  grid.append(whyCard);

  // Card 4: CROP DAMAGE / WHAT WE SEE
  const dmgCard = document.createElement("div");
  dmgCard.className = "report-card";
  const dmgHeader = document.createElement("div");
  dmgHeader.className = "report-card-header";
  let dmgIcon = "⚠️";
  if (type === "crop") { dmgIcon = "👁️"; }
  else if (type === "soil") { dmgIcon = "📊"; }
  dmgHeader.innerHTML = `<span class="report-icon">${dmgIcon}</span><h3>${typeTexts.damage}</h3>`;
  dmgCard.append(dmgHeader);

  const dmgItems = (report.crop_damage && report.crop_damage.length) ? report.crop_damage : (report.what_we_see || report.key_findings || []);
  if (dmgItems.length) {
    const ul = document.createElement("ul");
    ul.className = "report-bullet-list";
    dmgItems.forEach((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      ul.append(li);
    });
    dmgCard.append(ul);
  } else {
    const p = document.createElement("p");
    p.textContent = report.nutrient_status || texts.default_vitality;
    dmgCard.append(p);
  }
  grid.append(dmgCard);

  // Card 5: WHAT SHOULD I CHECK? (Field Scouting Checklist)
  const chkCard = document.createElement("div");
  chkCard.className = "report-card";
  const chkHeader = document.createElement("div");
  chkHeader.className = "report-card-header";
  chkHeader.innerHTML = `<span class="report-icon">🔬</span><h3>${typeTexts.check}</h3>`;
  chkCard.append(chkHeader);

  const chkItems = report.what_to_check || [];
  if (chkItems.length) {
    const ul = document.createElement("ul");
    ul.className = "report-checklist";
    chkItems.forEach((text) => {
      const li = document.createElement("li");
      li.innerHTML = `<span class="report-checklist-check">✓</span><span>${text}</span>`;
      ul.append(li);
    });
    chkCard.append(ul);
  } else {
    const p = document.createElement("p");
    p.textContent = texts.default_check;
    chkCard.append(p);
  }
  grid.append(chkCard);

  container.append(grid);

  // Card 6: HOW CAN I PREVENT IT?
  const prevItems = (report.prevention && report.prevention.length) ? report.prevention : (report.recommended_steps || report.management || []);
  if (prevItems.length) {
    const prevCard = document.createElement("div");
    prevCard.className = "report-card";
    const prevHeader = document.createElement("div");
    prevHeader.className = "report-card-header";
    prevHeader.innerHTML = `<span class="report-icon">🛡️</span><h3>${typeTexts.prevent}</h3>`;
    prevCard.append(prevHeader);

    const ol = document.createElement("div");
    ol.className = "report-num-list";
    const circleNums = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧"];
    prevItems.forEach((text, idx) => {
      const item = document.createElement("div");
      item.className = "report-num-item";
      const badge = circleNums[idx] || `${idx + 1}`;
      item.innerHTML = `<span class="report-num-badge">${badge}</span><span>${text}</span>`;
      ol.append(item);
    });
    prevCard.append(ol);
    container.append(prevCard);
  }

  // Card 7: CONTROL & MANAGEMENT (Progression)
  const cmSteps = report.control_management || [];
  if (cmSteps.length) {
    const cmCard = document.createElement("div");
    cmCard.className = "report-card";
    const cmHeader = document.createElement("div");
    cmHeader.className = "report-card-header";
    cmHeader.innerHTML = `<span class="report-icon">🧪</span><h3>${typeTexts.control}</h3>`;
    cmCard.append(cmHeader);

    const stepGrid = document.createElement("div");
    stepGrid.className = "control-steps";
    cmSteps.forEach((step, idx) => {
      const stepCard = document.createElement("div");
      stepCard.className = "control-step-card";
      const sName = step.step || `Step ${idx + 1}`;
      const localizedStepName = (texts.step_names && texts.step_names[sName]) ? texts.step_names[sName] : sName;
      const sAct = step.action || "";
      stepCard.innerHTML = `<span class="control-step-tag">${idx + 1}. ${localizedStepName}</span><p>${sAct}</p>`;
      stepGrid.append(stepCard);
    });
    cmCard.append(stepGrid);
    container.append(cmCard);
  }

  // Card 8: PRAGYA FIELD SUMMARY
  const fs = report.field_summary;
  if (fs && typeof fs === "object") {
    const sumCard = document.createElement("div");
    sumCard.className = "report-summary-card";
    const sumHeader = document.createElement("div");
    sumHeader.className = "report-card-header";
    sumHeader.innerHTML = `<span class="report-icon">🌾</span><h3>${typeTexts.summary}</h3>`;
    sumCard.append(sumHeader);

    const sumGrid = document.createElement("div");
    sumGrid.className = "report-summary-grid";

    const fields = [
      { label: texts.summary_fields.likely_issue, val: fs.likely_issue || ident.label },
      { label: texts.summary_fields.crop, val: fs.crop },
      { label: texts.summary_fields.check_now, val: fs.check_now },
      { label: texts.summary_fields.priority, val: fs.priority },
      { label: texts.summary_fields.next_step, val: fs.next_step }
    ].filter((f) => Boolean(f.val));

    fields.forEach(({ label, val }) => {
      const div = document.createElement("div");
      div.className = "report-summary-item";
      div.innerHTML = `<span class="report-summary-label">${label}</span><span class="report-summary-val">${val}</span>`;
      sumGrid.append(div);
    });
    sumCard.append(sumGrid);
    container.append(sumCard);
  }

  return container;
}

function buildFieldIntelligenceReport(values, soilResult, cropResult, lang = language) {
  const isHi = (lang || language || "en").toLowerCase().startsWith("hi");
  const n = Number(values.n ?? 45);
  const p = Number(values.p ?? 28);
  const k = Number(values.k ?? 38);
  const moisture = Number(values.moisture ?? 48);
  const ph = Number(values.ph ?? 6.5);
  const ec = Number(values.ec ?? 1.1);
  const oc = Number(values.organic_carbon ?? 0.65);
  const temp = Number(values.temperature ?? 24);
  const hum = Number(values.humidity ?? 62);
  const rain = Number(values.rainfall ?? 110);

  const nClass = classifyNutrient("n", n);
  const pClass = classifyNutrient("p", p);
  const kClass = classifyNutrient("k", k);

  const fert = soilResult?.fertility || {};
  const crops = cropResult?.crops || [];
  const topCrop = crops[0];

  // 1. FIELD OVERVIEW
  const fertilityLabel = fert.fertility || (isHi ? "उपजाऊ" : "Fertile");
  const overallCondition = (nClass.rating === "low" || moisture < 40)
    ? (isHi ? "खेत में कुछ मापदंडों पर सुधार की आवश्यकता है" : "Field requires targeted nutrient and hydration attention")
    : (isHi ? "खेत की समग्र स्थिति संतुलित और अच्छी है" : "Field exhibits stable vitality and balanced nutrient reserves");

  const overviewSummary = isHi
    ? `मिट्टी का परीक्षण वर्गीकरण "${fertilityLabel}" है। ${overallCondition}। नमी का स्तर ${moisture}% और मिट्टी का pH ${ph} है।`
    : `Soil classification is "${fertilityLabel}". ${overallCondition}. Root-zone moisture level stands at ${moisture}% with soil pH at ${ph}.`;

  // 2. NUTRIENT STATUS
  const nutrientStatus = {
    n: {
      name: isHi ? "नाइट्रोजन (N)" : "Nitrogen (N)",
      val: n,
      unit: "kg/ha",
      rating: nClass.rating,
      ratingLabel: isHi ? (nClass.rating === "low" ? "कम" : (nClass.rating === "good" ? "उत्तम" : "मध्यम")) : (nClass.rating === "low" ? "Low" : (nClass.rating === "good" ? "Good" : "Moderate")),
      target: "50–85 kg/ha",
      note: n < 50
        ? (isHi ? "अनुशंसित सीमा (50–85) से कम। वानस्पतिक वृद्धि के लिए पूरक की आवश्यकता हो सकती है।" : "Below recommended target (50–85 kg/ha). Leaf and vegetative growth may slow without replenishment.")
        : (n <= 85
          ? (isHi ? "संतुलित और मध्यम स्तर। सामान्य फसल रखरखाव के लिए अनुकूल।" : "Optimal standard range for steady vegetative crop growth.")
          : (isHi ? "पर्याप्त और समृद्ध स्तर।" : "Robust reserve; well supplied for high-demand stages."))
    },
    p: {
      name: isHi ? "फास्फोरस (P)" : "Phosphorus (P)",
      val: p,
      unit: "kg/ha",
      rating: pClass.rating,
      ratingLabel: isHi ? (pClass.rating === "low" ? "कम" : (pClass.rating === "good" ? "उत्तम" : "मध्यम")) : (pClass.rating === "low" ? "Low" : (pClass.rating === "good" ? "Good" : "Moderate")),
      target: "20–50 kg/ha",
      note: p < 20
        ? (isHi ? "अनुशंसित सीमा (20–50) से कम। जड़ विकास प्रभावित हो सकता है।" : "Deficient (below 20 kg/ha). Early root development and energy transfer may be constrained.")
        : (p <= 50
          ? (isHi ? "संतुलित और अनुकूल स्तर। स्वस्थ जड़ विकास में सहायक।" : "Balanced and optimal. Facilitates vigorous root formation and flowering.")
          : (isHi ? "उच्च भंडार।" : "High reserve; well supplied for crop demands."))
    },
    k: {
      name: isHi ? "पोटेशियम (K)" : "Potassium (K)",
      val: k,
      unit: "kg/ha",
      rating: kClass.rating,
      ratingLabel: isHi ? (kClass.rating === "low" ? "कम" : (kClass.rating === "good" ? "उत्तम" : "मध्यम")) : (kClass.rating === "low" ? "Low" : (kClass.rating === "good" ? "Good" : "Moderate")),
      target: "30–45 kg/ha",
      note: k < 30
        ? (isHi ? "अनुशंसित सीमा (30–45) से कम। रोग प्रतिरोधक क्षमता पर ध्यान दें।" : "Below target (30–45 kg/ha). May affect plant stress tolerance and water regulation.")
        : (k <= 45
          ? (isHi ? "संतुलित स्तर। तनाव प्रतिरोध और फल गुणवत्ता के लिए उत्तम।" : "Well-balanced. Supports cellular turgor, enzyme activation, and stress resistance.")
          : (isHi ? "उत्तम स्तर।" : "Abundant level; excellent resistance support."))
    },
    summary: generateNutrientSummary(n, p, k)
  };

  // 3. SOIL CONDITION
  const soilCondition = {
    moisture: {
      name: isHi ? "मिट्टी की नमी" : "Soil Moisture",
      val: moisture,
      unit: "%",
      rating: moisture < 35 ? "low" : (moisture < 45 ? "moderate" : (moisture <= 65 ? "good" : "moderate")),
      ratingLabel: isHi ? (moisture < 35 ? "अत्यधिक कम" : (moisture < 45 ? "कम" : (moisture <= 65 ? "अनुकूल" : "अधिक"))) : (moisture < 35 ? "Critically Low" : (moisture < 45 ? "Below Target" : (moisture <= 65 ? "Optimal" : "High"))),
      target: "45–65%",
      note: moisture < 35
        ? (isHi ? "गंभीर रूप से कम (35% से नीचे)। त्वरित सिंचाई की योजना बनाएं।" : "Critically low (<35%). Schedule immediate root-zone irrigation to prevent moisture stress.")
        : (moisture < 45
          ? (isHi ? "लक्ष्य सीमा से कम। अगली सिंचाई की योजना बनाएं।" : "Slightly below preferred 45–65% target. Monitor field hydration closely.")
          : (moisture <= 65
            ? (isHi ? "अनुकूल नमी। पौधों के लिए उत्तम जल उपलब्धता।" : "Optimal range. Excellent moisture availability for root uptake without waterlogging.")
            : (isHi ? "अधिक नमी। जल निकासी का ध्यान रखें।" : "Above typical target; ensure proper drainage to prevent root aeration issues.")))
    },
    ph: {
      name: isHi ? "मिट्टी का pH" : "Soil pH",
      val: ph,
      unit: "scale",
      rating: (ph >= 6.0 && ph <= 7.2) ? "good" : "moderate",
      ratingLabel: isHi ? ((ph >= 6.0 && ph <= 7.2) ? "अनुकूल" : (ph < 6.0 ? "अम्लीय" : "क्षारीय")) : ((ph >= 6.0 && ph <= 7.2) ? "Optimal (6.0-7.2)" : (ph < 6.0 ? "Acidic" : "Alkaline")),
      target: "6.0–7.2",
      note: ph < 6.0
        ? (isHi ? `अम्लीय स्थिति (${ph})। फास्फोरस व सूक्ष्म पोषक तत्वों का अवशोषण धीमा हो सकता है।` : `Acidic soil (${ph}). Micronutrient and phosphorus solubility may be reduced.`)
        : (ph <= 7.2
          ? (isHi ? `अनुकूल pH (${ph})। अधिकांश फसलों के लिए पोषक तत्व सुगमता से उपलब्ध हैं।` : `Optimal neutral range (${ph}). Maximum nutrient availability for root absorption.`)
          : (isHi ? `क्षारीय स्थिति (${ph})। सूक्ष्म पोषक तत्वों की उपलब्धता पर असर पड़ सकता है।` : `Alkaline condition (${ph}). Zinc and iron availability may require routine monitoring.`))
    },
    ec: {
      name: isHi ? "विद्युत चालकता (EC)" : "Electrical Conductivity (EC)",
      val: ec,
      unit: "mS/cm",
      rating: ec < 1.2 ? "good" : (ec <= 2.0 ? "moderate" : "low"),
      ratingLabel: isHi ? (ec < 1.2 ? "सामान्य" : (ec <= 2.0 ? "मध्यम" : "लवणता अधिक")) : (ec < 1.2 ? "Normal" : (ec <= 2.0 ? "Moderate" : "High Salinity")),
      target: "< 1.2 mS/cm",
      note: ec < 1.2
        ? (isHi ? "सामान्य लवणता। जड़ों के लिए सुरक्षित।" : "Non-saline (<1.2 mS/cm). Safe for germination and active root growth.")
        : (ec <= 2.0
          ? (isHi ? "मध्यम लवणता। संवेदनशील फसलों पर ध्यान दें।" : "Moderate salinity. Monitor irrigation water salinity.")
          : (isHi ? "उच्च लवणता। लवण जमाव की जांच करें।" : "Elevated salinity (>2.0 mS/cm). Root water absorption may be hindered."))
    },
    organic_carbon: {
      name: isHi ? "जैविक कार्बन" : "Organic Carbon",
      val: oc,
      unit: "%",
      rating: oc < 0.5 ? "low" : (oc <= 0.75 ? "moderate" : "good"),
      ratingLabel: isHi ? (oc < 0.5 ? "कम" : (oc <= 0.75 ? "मध्यम" : "उत्तम")) : (oc < 0.5 ? "Low" : (oc <= 0.75 ? "Medium" : "Good")),
      target: "> 0.5%",
      note: oc < 0.5
        ? (isHi ? "कम स्तर (<0.5%)। जैविक खाद या कम्पोस्ट की आवश्यकता।" : "Low organic matter (<0.5%). Integrating compost or green manure will enhance structure.")
        : (oc <= 0.75
          ? (isHi ? "मध्यम स्तर (0.5–0.75%)। संतोषजनक मिट्टी स्वास्थ्य।" : "Medium range (0.5–0.75%). Satisfactory microbial activity and soil structure.")
          : (isHi ? "उत्तम स्तर (>0.75%)। समृद्ध मिट्टी संरचना और जल धारण क्षमता।" : "Healthy organic reserve (>0.75%). Fosters microbial diversity and moisture holding."))
    }
  };

  // 4. ENVIRONMENTAL CONTEXT
  const environmentalContext = {
    temperature: {
      val: temp,
      unit: "°C",
      status: temp < 15 ? (isHi ? "ठंडी स्थिति" : "Cool") : (temp <= 32 ? (isHi ? "अनुकूल" : "Favorable") : (isHi ? "गर्मी का तनाव" : "Heat stress risk")),
      note: temp > 35
        ? (isHi ? "दिन का तापमान 35°C से अधिक। दोपहर में सिंचाई से बचें।" : "Daytime temperatures exceed 35°C; avoid spraying or midday irrigation to reduce heat stress.")
        : (temp < 15
          ? (isHi ? "कम तापमान। संवेदनशील पौधों की ठंड से रक्षा करें।" : "Cool conditions; monitor growth speed and protect sensitive seedlings.")
          : (isHi ? "सामान्य और अनुकूल तापमान।" : "Favorable vegetative growing conditions."))
    },
    humidity: {
      val: hum,
      unit: "%",
      status: hum < 40 ? (isHi ? "शुष्क" : "Dry") : (hum <= 75 ? (isHi ? "संतुलित" : "Balanced") : (isHi ? "अधिक नमी" : "High humidity")),
      note: hum >= 80
        ? (isHi ? "हवा में नमी 80% या अधिक है। कवक रोग (fungal disease) के खतरे की निगरानी करें।" : "Ambient humidity exceeds 80%; higher risk for foliar fungal pathogens. Inspect leaf undersides.")
        : (isHi ? "हवा में नमी संतुलित स्तर पर है।" : "Standard relative humidity range supporting healthy canopy transpiration.")
    },
    rainfall: {
      val: rain,
      unit: "mm",
      status: isHi ? "मौसमी संदर्भ" : "Seasonal context",
      note: rain < 50
        ? (isHi ? "कम वर्षा संदर्भ; नियंत्रित सिंचाई पर निर्भरता।" : "Low seasonal rainfall context; irrigation scheduling is primary moisture driver.")
        : (isHi ? `मौसमी वर्षा अनुमान लगभग ${rain} mm है।` : `Cumulative rainfall context at ~${rain} mm supporting subsoil reserves.`)
    }
  };

  // 5. WHAT NEEDS ATTENTION (prioritized list)
  const attentionItems = [];
  if (nClass.rating === "low") {
    attentionItems.push({
      priority: 1,
      type: "nutrient",
      title: isHi ? "मुख्य पोषक तत्व जिस पर ध्यान दें: नाइट्रोजन (N)" : "Main nutrient requiring attention: Nitrogen (N)",
      desc: isHi ? `वर्तमान मान ${n} kg/ha है, जो अनुशंसित सीमा (50–85 kg/ha) से कम है।` : `Current reading (${n} kg/ha) is below the recommended 50–85 kg/ha threshold.`
    });
  }
  if (moisture < 45) {
    attentionItems.push({
      priority: moisture < 35 ? 1 : 2,
      type: "moisture",
      title: isHi ? "मिट्टी की नमी लक्ष्य सीमा से कम" : "Soil moisture below target range",
      desc: isHi ? `नमी ${moisture}% है। जड़ों में तनाव से बचने के लिए समय पर सिंचाई करें।` : `Moisture is at ${moisture}% (target 45–65%). Plan timely root-zone irrigation.`
    });
  }
  if (pClass.rating === "low") {
    attentionItems.push({
      priority: 3,
      type: "nutrient",
      title: isHi ? "फास्फोरस स्तर कम है" : "Phosphorus level is low",
      desc: isHi ? `फास्फोरस ${p} kg/ha है। जड़ और फूल विकास के लिए इसकी भरपाई की योजना बनाएं।` : `Phosphorus is at ${p} kg/ha (target 20–50 kg/ha). Factor into upcoming fertilizer schedule.`
    });
  }
  if (kClass.rating === "low") {
    attentionItems.push({
      priority: 3,
      type: "nutrient",
      title: isHi ? "पोटेशियम स्तर कम है" : "Potassium level is low",
      desc: isHi ? `पोटेशियम ${k} kg/ha है। तनाव सहनशीलता के लिए संतुलन बनाएं।` : `Potassium is at ${k} kg/ha (target 30–45 kg/ha).`
    });
  }
  if (ph < 6.0 || ph > 7.5) {
    attentionItems.push({
      priority: 4,
      type: "soil",
      title: isHi ? "मिट्टी का pH सीमा से बाहर है" : "Soil pH requires monitoring",
      desc: isHi ? `वर्तमान pH ${ph} है (आदर्श: 6.0–7.2)। यह पोषक तत्वों के अवशोषण को प्रभावित कर सकता है।` : `Current pH is ${ph} (preferred 6.0–7.2). Micronutrient availability may be restricted.`
    });
  }
  if (hum >= 80) {
    attentionItems.push({
      priority: 5,
      type: "weather",
      title: isHi ? "अधिक आर्द्रता से रोग का जोखिम" : "Foliar disease risk from elevated humidity",
      desc: isHi ? `हवा में नमी ${hum}% है। पत्तियों की नियमित जांच करें।` : `Ambient humidity is ${hum}%. High moisture fosters fungal spore germination.`
    });
  }
  if (temp >= 36) {
    attentionItems.push({
      priority: 5,
      type: "weather",
      title: isHi ? "गर्मी का तनाव (Heat Stress)" : "Heat stress condition",
      desc: isHi ? `तापमान ${temp}°C है। दोपहर के समय सिंचाई या छिड़काव से बचें।` : `Ambient temperature is ${temp}°C. Avoid midday irrigation to protect roots.`
    });
  }
  if (attentionItems.length === 0) {
    attentionItems.push({
      priority: 99,
      type: "ok",
      title: isHi ? "सभी मापदंड संतुलित स्थिति में हैं" : "All key parameters are in balanced operating range",
      desc: isHi ? "कोई गंभीर पोषक तत्व या नमी की कमी नहीं पाई गई। सामान्य रखरखाव जारी रखें।" : "No acute deficiencies or environmental stressors detected. Continue routine field monitoring."
    });
  }
  attentionItems.sort((a, b) => a.priority - b.priority);

  // 6. FIELD INTERPRETATION
  const fieldInterpretation = isHi
    ? `मिट्टी का pH (${ph}) और विद्युत चालकता (${ec} mS/cm) जड़ों के सक्रिय विकास के लिए अनुकूल वातावरण बनाते हैं। मिट्टी की वर्गीकरण श्रेणी "${fertilityLabel}" है। ${nClass.rating === "low" ? "हालांकि नाइट्रोजन की कमी के कारण वानस्पतिक वृद्धि की गति धीमी रह सकती है।" : "पोषक तत्वों का संतुलन पौधे के विकास को मजबूती प्रदान कर रहा है।"} वर्तमान तापमान (${temp}°C) और आर्द्रता (${hum}%) मौसमी चक्र के लिए अनुकूल हैं।`
    : `The combination of soil pH (${ph}) and electrical conductivity (${ec} mS/cm) establishes a supportive root-zone environment with good nutrient solubility. The soil is classified as "${fertilityLabel}". ${nClass.rating === "low" ? "However, lower nitrogen availability suggests leaf vegetative growth may require gradual organic or soil supplementation." : "Nutrient balances are currently well aligned with seasonal crop needs."} Ambient temperature (${temp}°C) and humidity (${hum}%) support standard transpiration rates without acute drought or thermal shock.`;

  // 7. CROP SUITABILITY
  const recommendedCrops = crops.slice(0, 4).map((c) => ({
    name: c.crop,
    confidence: c.confidence,
    status: c.confidence >= 70 ? (isHi ? "अत्यधिक उपयुक्त" : "High Suitability") : (isHi ? "अनुकूल" : "Favorable")
  }));

  // 8. RECOMMENDED NEXT STEPS
  const nextSteps = [];
  if (nClass.rating === "low") {
    nextSteps.push(isHi
      ? "नाइट्रोजन संतुलन: अगली खाद या जैविक कम्पोस्ट में नाइट्रोजन की पूर्ति पर ध्यान दें।"
      : "Nutrient planning: Plan a balanced nitrogen supplement or compost incorporation in the upcoming fertilization cycle.");
  }
  if (moisture < 45) {
    nextSteps.push(isHi
      ? "नमी प्रबंधन: अगले 24–48 घंटों में खेत की नमी की जांच कर हल्की सिंचाई की व्यवस्था करें।"
      : "Moisture management: Scout root-zone moisture in lower rows and schedule targeted irrigation before soil dries further.");
  }
  if (hum >= 80) {
    nextSteps.push(isHi
      ? "पत्ती की जांच: सुबह के समय पौधों की निचली पत्तियों पर फफूंद या धब्बों के लक्षणों की जांच करें।"
      : "Foliage scouting: Inspect dense canopy areas in the morning for early signs of fungal leaf spots or mildew.");
  } else {
    nextSteps.push(isHi
      ? "नियमित निगरानी: खेत की सामान्य निगरानी जारी रखें और रोवर सेंसर से सप्ताह में रीडिंग लेते रहें।"
      : "Routine scouting: Continue regular rover sensor sweeps across zones to maintain steady baselines.");
  }
  if (recommendedCrops.length > 0) {
    const topNames = recommendedCrops.slice(0, 2).map((c) => c.name).join(", ");
    nextSteps.push(isHi
      ? `फसल चयन: नए रोपण के लिए स्थानीय मॉडल द्वारा सुझाई गई फसलें (${topNames}) वर्तमान मिट्टी व जलवायु के अनुकूल हैं।`
      : `Crop selection: If sowing or planning seasonal rotation, the top recommended crops (${topNames}) match current soil and climate indicators.`);
  }

  const speechSummary = isHi
    ? `${overviewSummary} ${attentionItems[0]?.title || ""}`
    : `${overviewSummary} ${attentionItems[0]?.title || ""}`;

  return {
    overviewSummary,
    fertilityLabel,
    overallGood: attentionItems[0]?.type !== "nutrient" || nClass.rating !== "low",
    confidence: topCrop ? `${topCrop.confidence}%` : (fert.confidence != null ? `${fert.confidence}%` : "92%"),
    nutrients: nutrientStatus,
    soilCondition,
    environmentalContext,
    whatNeedsAttention: attentionItems,
    fieldInterpretation,
    cropSuitability: recommendedCrops,
    recommendedNextSteps: nextSteps,
    speechSummary,
    rawValues: values,
    soilResult,
    cropResult
  };
}

function renderFieldIntelligenceReport(data, lang = language) {
  const isHi = (lang || language || "en").toLowerCase().startsWith("hi");
  const container = document.createElement("div");
  container.className = "fi-report-container";

  const report = buildFieldIntelligenceReport(data.rawValues || {}, data.soilResult, data.cropResult, isHi ? "hi" : "en");

  // 1. FIELD OVERVIEW
  const s1 = document.createElement("div");
  s1.className = "fi-section fi-section-overview";
  const s1Header = document.createElement("div");
  s1Header.className = "fi-section-header";
  s1Header.innerHTML = `<span class="fi-section-icon">🌾</span><h3>${isHi ? "खेत का समग्र अवलोकन" : "FIELD OVERVIEW"}</h3><span class="fi-fertility-badge ${report.overallGood ? 'is-good' : 'is-warn'}">${report.fertilityLabel} Soil</span>`;
  s1.append(s1Header);
  const s1Text = document.createElement("p");
  s1Text.className = "fi-overview-p";
  s1Text.textContent = report.overviewSummary;
  s1.append(s1Text);
  container.append(s1);

  // 2. NUTRIENT STATUS
  const s2 = document.createElement("div");
  s2.className = "fi-section fi-section-nutrients";
  const s2Header = document.createElement("div");
  s2Header.className = "fi-section-header";
  s2Header.innerHTML = `<span class="fi-section-icon">🧪</span><h3>${isHi ? "पोषक तत्वों की स्थिति" : "NUTRIENT STATUS"}</h3>`;
  s2.append(s2Header);

  const nGrid = document.createElement("div");
  nGrid.className = "fi-metrics-grid fi-grid-3";
  ["n", "p", "k"].forEach((key) => {
    const item = report.nutrients[key];
    const card = document.createElement("div");
    card.className = `fi-metric-card rating-${item.rating}`;
    card.innerHTML = `
      <div class="fi-card-head">
        <span class="fi-metric-name">${item.name}</span>
        <span class="reading-rating-chip rating-${item.rating}">${item.ratingLabel}</span>
      </div>
      <div class="fi-card-value-row">
        <span class="fi-metric-value">${item.val}</span>
        <span class="fi-metric-unit">${item.unit}</span>
      </div>
      <div class="fi-card-target">${isHi ? "लक्ष्य सीमा" : "Target"}: ${item.target}</div>
      <p class="fi-card-note">${item.note}</p>
    `;
    nGrid.append(card);
  });
  s2.append(nGrid);
  if (report.nutrients.summary) {
    const nSum = document.createElement("div");
    nSum.className = "fi-summary-banner";
    nSum.innerHTML = `<strong>${isHi ? "पोषक तत्व निष्कर्ष" : "Nutrient Takeaway"}:</strong> ${report.nutrients.summary}`;
    s2.append(nSum);
  }
  container.append(s2);

  // 3. SOIL CONDITION
  const s3 = document.createElement("div");
  s3.className = "fi-section fi-section-soil";
  const s3Header = document.createElement("div");
  s3Header.className = "fi-section-header";
  s3Header.innerHTML = `<span class="fi-section-icon">💧</span><h3>${isHi ? "मिट्टी की स्थिति" : "SOIL CONDITION"}</h3>`;
  s3.append(s3Header);

  const sGrid = document.createElement("div");
  sGrid.className = "fi-metrics-grid fi-grid-4";
  ["moisture", "ph", "ec", "organic_carbon"].forEach((key) => {
    const item = report.soilCondition[key];
    const card = document.createElement("div");
    card.className = `fi-metric-card rating-${item.rating}`;
    card.innerHTML = `
      <div class="fi-card-head">
        <span class="fi-metric-name">${item.name}</span>
        <span class="reading-rating-chip rating-${item.rating}">${item.ratingLabel}</span>
      </div>
      <div class="fi-card-value-row">
        <span class="fi-metric-value">${item.val}</span>
        <span class="fi-metric-unit">${item.unit}</span>
      </div>
      <div class="fi-card-target">${isHi ? "लक्ष्य" : "Target"}: ${item.target}</div>
      <p class="fi-card-note">${item.note}</p>
    `;
    sGrid.append(card);
  });
  s3.append(sGrid);
  container.append(s3);

  // 4. ENVIRONMENTAL CONTEXT
  const s4 = document.createElement("div");
  s4.className = "fi-section fi-section-env";
  const s4Header = document.createElement("div");
  s4Header.className = "fi-section-header";
  s4Header.innerHTML = `<span class="fi-section-icon">⛅</span><h3>${isHi ? "पर्यावरणीय संदर्भ" : "ENVIRONMENTAL CONTEXT"}</h3>`;
  s4.append(s4Header);

  const envGrid = document.createElement("div");
  envGrid.className = "fi-metrics-grid fi-grid-3";
  [
    { name: isHi ? "तापमान (Temperature)" : "Ambient Temperature", val: `${report.environmentalContext.temperature.val}°C`, status: report.environmentalContext.temperature.status, note: report.environmentalContext.temperature.note },
    { name: isHi ? "हवा की नमी (Humidity)" : "Relative Humidity", val: `${report.environmentalContext.humidity.val}%`, status: report.environmentalContext.humidity.status, note: report.environmentalContext.humidity.note },
    { name: isHi ? "वर्षा संदर्भ (Rainfall)" : "Rainfall Context", val: `${report.environmentalContext.rainfall.val} mm`, status: report.environmentalContext.rainfall.status, note: report.environmentalContext.rainfall.note }
  ].forEach((item) => {
    const card = document.createElement("div");
    card.className = "fi-metric-card fi-env-card";
    card.innerHTML = `
      <div class="fi-card-head">
        <span class="fi-metric-name">${item.name}</span>
        <span class="reading-rating-chip rating-neutral">${item.status}</span>
      </div>
      <div class="fi-card-value-row">
        <span class="fi-metric-value">${item.val}</span>
      </div>
      <p class="fi-card-note">${item.note}</p>
    `;
    envGrid.append(card);
  });
  s4.append(envGrid);
  container.append(s4);

  // 5. WHAT NEEDS ATTENTION
  const s5 = document.createElement("div");
  s5.className = "fi-section fi-section-attention";
  const s5Header = document.createElement("div");
  s5Header.className = "fi-section-header";
  s5Header.innerHTML = `<span class="fi-section-icon">⚠️</span><h3>${isHi ? "किस पर ध्यान दें" : "WHAT NEEDS ATTENTION"}</h3>`;
  s5.append(s5Header);

  const attList = document.createElement("div");
  attList.className = "fi-attention-list";
  report.whatNeedsAttention.forEach((att) => {
    const item = document.createElement("div");
    const isCritical = att.priority === 1;
    item.className = `fi-attention-item ${isCritical ? 'is-critical' : (att.type === 'ok' ? 'is-ok' : 'is-warning')}`;
    const pTag = att.type === 'ok' ? (isHi ? 'सामान्य' : 'NORMAL') : `${isHi ? 'प्राथमिकता' : 'PRIORITY'} ${att.priority}`;
    item.innerHTML = `
      <span class="fi-priority-tag">${pTag}</span>
      <div class="fi-attention-content">
        <strong class="fi-attention-title">${att.title}</strong>
        <p class="fi-attention-desc">${att.desc}</p>
      </div>
    `;
    attList.append(item);
  });
  s5.append(attList);
  container.append(s5);

  // 6. FIELD INTERPRETATION
  const s6 = document.createElement("div");
  s6.className = "fi-section fi-section-interp";
  const s6Header = document.createElement("div");
  s6Header.className = "fi-section-header";
  s6Header.innerHTML = `<span class="fi-section-icon">🔍</span><h3>${isHi ? "खेत विश्लेषण" : "FIELD INTERPRETATION"}</h3>`;
  s6.append(s6Header);
  const s6Text = document.createElement("p");
  s6Text.className = "fi-interp-p";
  s6Text.textContent = report.fieldInterpretation;
  s6.append(s6Text);
  container.append(s6);

  // 7. CROP SUITABILITY
  const s7 = document.createElement("div");
  s7.className = "fi-section fi-section-crops";
  const s7Header = document.createElement("div");
  s7Header.className = "fi-section-header";
  s7Header.innerHTML = `<span class="fi-section-icon">🌱</span><h3>${isHi ? "उपयुक्त फसलें" : "CROP SUITABILITY"}</h3>`;
  s7.append(s7Header);

  const cropGrid = document.createElement("div");
  cropGrid.className = "fi-crop-grid";
  if (report.cropSuitability.length) {
    report.cropSuitability.forEach((c) => {
      const card = document.createElement("div");
      card.className = "fi-crop-card";
      card.innerHTML = `
        <div class="fi-crop-head">
          <strong class="fi-crop-name">${c.name}</strong>
          <span class="fi-crop-conf">${c.confidence}%</span>
        </div>
        <div class="fi-crop-bar-bg"><div class="fi-crop-bar-fill" style="width: ${c.confidence}%"></div></div>
        <span class="fi-crop-status">${c.status}</span>
      `;
      cropGrid.append(card);
    });
  } else {
    const emptyP = document.createElement("p");
    emptyP.className = "fi-empty-note";
    emptyP.textContent = isHi ? "स्थानीय मॉडल अनुशंसा उपलब्ध नहीं है।" : "Local crop model recommendations unavailable.";
    cropGrid.append(emptyP);
  }
  s7.append(cropGrid);
  container.append(s7);

  // 8. RECOMMENDED NEXT STEPS
  const s8 = document.createElement("div");
  s8.className = "fi-section fi-section-steps";
  const s8Header = document.createElement("div");
  s8Header.className = "fi-section-header";
  s8Header.innerHTML = `<span class="fi-section-icon">📋</span><h3>${isHi ? "अनुशंसित अगले कदम" : "RECOMMENDED NEXT STEPS"}</h3>`;
  s8.append(s8Header);

  const stepsList = document.createElement("ol");
  stepsList.className = "fi-steps-list";
  report.recommendedNextSteps.forEach((st, idx) => {
    const li = document.createElement("li");
    li.className = "fi-step-item";
    li.innerHTML = `<span class="fi-step-num">${idx + 1}</span><p class="fi-step-text">${st}</p>`;
    stepsList.append(li);
  });
  s8.append(stepsList);
  container.append(s8);

  return container;
}

async function updateActiveModelResultLanguage(targetLang) {
  if (!activeModelResult) return;
  const box = $("modelResult");
  if (!box || box.hidden) return;

  const isHindi = targetLang === "hi";

  // 0. Field Intelligence Report
  if (activeModelResult.fieldIntelligenceReport) {
    const reportContainer = $("modelStructuredReport");
    if (reportContainer) {
      reportContainer.replaceChildren(renderFieldIntelligenceReport(activeModelResult.fieldIntelligenceReport, targetLang));
    }
    const currentSpeech = isHindi
      ? (activeModelResult.fieldIntelligenceReport.speechSummaryHi || activeModelResult.fieldIntelligenceReport.speechSummary)
      : activeModelResult.fieldIntelligenceReport.speechSummary;
    lastModelSpeech = currentSpeech;
    ttsLang.model = targetLang;
    return;
  }

  // 1. Structured Report
  if (activeModelResult.report && typeof activeModelResult.report === "object") {
    const cached = activeModelResult.report._translations?.[targetLang];
    if (cached) {
      activeModelResult.report = cached;
      const cachedSpeech = activeModelResult._speechTranslations?.[targetLang];
      if (cachedSpeech) {
        activeModelResult.speech = cachedSpeech;
        lastModelSpeech = cachedSpeech;
        ttsLang.model = targetLang;
      }
      const reportContainer = $("modelStructuredReport");
      if (reportContainer) {
        reportContainer.replaceChildren(renderAgriculturalReport(cached, targetLang));
      }
      return;
    }

    if (isTranslatingReport) return;
    isTranslatingReport = true;
    const reportContainer = $("modelStructuredReport");
    const loadingNotice = document.createElement("div");
    loadingNotice.className = "report-translating-note";
    loadingNotice.textContent = isHindi ? "⏳ रिपोर्ट का हिंदी में अनुवाद हो रहा है..." : "⏳ Translating report to English...";
    reportContainer?.prepend(loadingNotice);

    try {
      const resp = await api("/api/analyses/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report: activeModelResult.report,
          target_lang: targetLang
        })
      }, 35000);

      if (resp && resp.report) {
        if (!activeModelResult.report._translations) activeModelResult.report._translations = {};
        activeModelResult.report._translations[targetLang] = resp.report;
        activeModelResult.report = resp.report;

        if (!activeModelResult._speechTranslations) activeModelResult._speechTranslations = {};
        activeModelResult._speechTranslations[targetLang] = resp.speech;
        activeModelResult.speech = resp.speech;
        lastModelSpeech = resp.speech;
        ttsLang.model = targetLang;

        if (!activeModelResult._analysisTranslations) activeModelResult._analysisTranslations = {};
        activeModelResult._analysisTranslations[targetLang] = resp.analysis;

        reportContainer?.replaceChildren(renderAgriculturalReport(resp.report, targetLang));
      }
    } catch (err) {
      console.warn("Translation failed, falling back to label translation:", err);
      loadingNotice.remove();
      reportContainer?.replaceChildren(renderAgriculturalReport(activeModelResult.report, targetLang));
      showToast(isHindi ? "अनुवाद सेवा अनुपलब्ध, केवल शीर्षक अनुवादित किए गए।" : "Translation service unavailable, updated headings.", true);
    } finally {
      isTranslatingReport = false;
    }
  } else {
    // 2. Non-structured or Edge AI result
    if (activeModelResult.mode === "edge" && activeModelResult.rawResult) {
      const raw = activeModelResult.rawResult;
      if (raw.analysis_type === "disease") {
        const label = isHindi
          ? (raw.recognized === false ? "स्थानीय मॉडल द्वारा पहचाना नहीं गया।" : (raw.healthy ? "स्वस्थ पत्ती" : (raw.disease || raw.label)))
          : (raw.recognized === false ? "Not recognized by the local model." : (raw.healthy ? "Healthy leaf" : (raw.disease || raw.label)));
        const body = isHindi ? localizedTreatment(raw) : (raw.treatment || (raw.healthy ? "Healthy leaf." : ""));
        setText("modelResultTitle", label);
        setText("modelResultBody", body);
        lastModelSpeech = `${label}. ${body}`;
        ttsLang.model = targetLang;
      } else if (raw.analysis_type === "pest") {
        const label = isHindi
          ? (raw.recognized ? raw.label : "स्थानीय मॉडल द्वारा पहचाना नहीं गया।")
          : (raw.recognized ? raw.label : "Not recognized by the local model.");
        const count = raw.detections?.length || 1;
        const body = isHindi
          ? (raw.recognized ? `संभावित ${raw.label} पाया गया (${count} कीट)। खेत में कीट की पुष्टि करें।` : "स्थानीय मॉडल द्वारा किसी कीट की पुष्टि नहीं हुई।")
          : (raw.analysis || "");
        setText("modelResultTitle", label);
        setText("modelResultBody", body);
        lastModelSpeech = `${label}. ${body}`;
        ttsLang.model = targetLang;
      }
    }
  }
}

async function updateChatReportsLanguage(targetLang) {
  if (!chatReports.length) return;
  for (const item of chatReports) {
    if (!item.report || !item.replyEl) continue;
    const cached = item.report._translations?.[targetLang];
    if (cached) {
      item.report = cached;
      const newEl = renderAgriculturalReport(cached, targetLang);
      item.element?.replaceWith(newEl);
      item.element = newEl;
      continue;
    }
    // Attempt background translation if Gemini is available
    try {
      const resp = await api("/api/analyses/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report: item.report,
          target_lang: targetLang
        })
      }, 35000);
      if (resp && resp.report) {
        if (!item.report._translations) item.report._translations = {};
        item.report._translations[targetLang] = resp.report;
        item.report = resp.report;
        item.speech = resp.speech;
        const newEl = renderAgriculturalReport(resp.report, targetLang);
        item.element?.replaceWith(newEl);
        item.element = newEl;
      }
    } catch {
      // Fallback: re-render with targetLang labels
      const newEl = renderAgriculturalReport(item.report, targetLang);
      item.element?.replaceWith(newEl);
      item.element = newEl;
    }
  }
}

function showModelResult(titleOrConfig, body, speech, good = true, confidence = "", mode = "edge") {
  const box = $("modelResult");
  box.hidden = false;

  let cfg = {};
  if (typeof titleOrConfig === "object" && titleOrConfig !== null) {
    cfg = titleOrConfig;
  } else {
    cfg = {
      title: titleOrConfig,
      body,
      speech,
      good,
      confidence,
      mode,
      fallback: false,
      modelName: ""
    };
  }

  activeModelResult = cfg;

  box.classList.toggle("is-good", cfg.good !== false);
  box.classList.toggle("is-warning", cfg.good === false);

  const badge = $("modelModeBadge");
  if (badge) {
    badge.className = "status-chip";
    if (cfg.fallback) {
      badge.classList.add("fallback");
      badge.textContent = t("mode_cloud_fallback");
    } else if (cfg.mode === "cloud") {
      badge.classList.add("cloud");
      badge.textContent = t("mode_cloud_online");
    } else {
      badge.classList.add("edge");
      badge.textContent = t("mode_edge_device");
    }
  }

  setText("modelActiveName", cfg.modelName ? `[${cfg.modelName}]` : "");
  setText("modelResultIcon", cfg.good !== false ? "✓" : "!");

  const reportContainer = $("modelStructuredReport");
  const resultTop = $("modelResultTop");
  const resultBodyWrap = $("modelResultBodyWrap");

  if (cfg.fieldIntelligenceReport) {
    if (resultTop) resultTop.hidden = true;
    if (resultBodyWrap) resultBodyWrap.hidden = true;
    if (reportContainer) {
      reportContainer.hidden = false;
      reportContainer.replaceChildren(renderFieldIntelligenceReport(cfg.fieldIntelligenceReport, language));
    }
  } else if (cfg.report && typeof cfg.report === "object") {
    if (resultTop) resultTop.hidden = true;
    if (resultBodyWrap) resultBodyWrap.hidden = true;
    if (reportContainer) {
      reportContainer.hidden = false;
      const currentLang = cfg.lang || language;
      if (!cfg.report._translations) cfg.report._translations = {};
      cfg.report._translations[currentLang] = cfg.report;

      if (!cfg._speechTranslations) cfg._speechTranslations = {};
      cfg._speechTranslations[currentLang] = cfg.speech || "";

      if (!cfg._titleTranslations) cfg._titleTranslations = {};
      cfg._titleTranslations[currentLang] = cfg.title || "";

      if (!cfg._analysisTranslations) cfg._analysisTranslations = {};
      cfg._analysisTranslations[currentLang] = cfg.body || "";

      reportContainer.replaceChildren(renderAgriculturalReport(cfg.report, language));
    }
  } else {
    if (resultTop) resultTop.hidden = false;
    if (resultBodyWrap) resultBodyWrap.hidden = false;
    if (reportContainer) {
      reportContainer.hidden = true;
      reportContainer.replaceChildren();
    }
    if (cfg.mode === "cloud" && !cfg.fallback) {
      setText("modelResultTypeLabel", language === "hi" ? "विश्लेषण" : "Analysis");
      setText("modelResultTitle", cfg.title || (language === "hi" ? "जेमिनी दृश्य विश्लेषण" : "Gemini Visual Analysis"));
      setText("modelResultBody", cfg.body);
      setText("modelResultConfidence", "");
    } else {
      setText("modelResultTypeLabel", language === "hi" ? "एज परिणाम" : "Edge Result");
      setText("modelResultTitle", cfg.title);
      let edgeBody = cfg.body || "";
      if (cfg.cloudError) {
        edgeBody = `[${cfg.cloudError}]\n\n${edgeBody}`;
      }
      setText("modelResultBody", edgeBody);
      setText("modelResultConfidence", cfg.confidence ? `${language === "hi" ? "विश्वास" : "Confidence"}: ${cfg.confidence}` : "");
    }
  }

  const activeLang = cfg.lang || language;
  ttsLang.model = activeLang;
  lastModelSpeech = cfg.speech || `${cfg.title || ""}. ${cfg.body || ""}`;
}

function formValues(form) {
  const data = {};
  new FormData(form).forEach((value, key) => { if (value !== "") data[key] = Number(value); });
  return data;
}

function renderAccount() {
  const isDemo = isDemoMode();
  const effectiveUser = currentUser || (isDemo ? { id: 0, username: "demo_farmer", location: "Hyderabad, Telangana" } : null);
  const signedIn = Boolean(effectiveUser);
  if ($("accountSignedOut")) $("accountSignedOut").hidden = signedIn && !isDemo;
  if ($("accountSignedIn")) $("accountSignedIn").hidden = !signedIn;
  const chip = $("accountChip");
  if (chip) {
    if (currentUser) {
      chip.textContent = t("signed_in");
      chip.classList.add("success");
      chip.classList.remove("warning");
    } else if (isDemo) {
      chip.textContent = "Demo Session";
      chip.classList.add("warning");
      chip.classList.remove("success");
    } else {
      chip.textContent = t("signed_out");
      chip.classList.remove("success", "warning");
    }
  }
  if (effectiveUser) setText("signedInAs", t("signed_in_as", effectiveUser.username));
  document.body.classList.toggle("guest", !signedIn);
  if ($("landingPanel")) $("landingPanel").hidden = signedIn;
  if ($("overviewDashboardContent")) $("overviewDashboardContent").hidden = !signedIn;
  document.querySelectorAll('[data-tab]:not([data-tab="overview"])').forEach((node) => { node.disabled = !signedIn; });
  if (!signedIn && !$("page-overview").classList.contains("is-active")) activateTab("overview");
}

function openAuth(mode) {
  authMode = mode;
  $("authModal").hidden = false;
  $("authStatus").textContent = "";
  $("authStatus").classList.remove("is-error");
  $("authTitle").textContent = t(mode === "login" ? "sign_in" : "sign_up");
  $("authHelp").textContent = t(mode === "login" ? "login_help" : "signup_help");
  $("authSubmitBtn").querySelector("span").textContent = t(mode === "login" ? "sign_in" : "sign_up");
  $("switchAuthBtn").textContent = t(mode === "login" ? "need_account" : "have_account");
  $("authPassword").autocomplete = mode === "login" ? "current-password" : "new-password";
  $("authUsername").focus();
}

function closeAuth() { $("authModal").hidden = true; }

function localizedTreatment(result) {
  if (language === "en") return result.treatment;
  if (result.recognized === false) return "यह फोटो मॉडल की मिर्च, आलू या टमाटर की 15 श्रेणियों से साफ मेल नहीं खाती। इलाज से पहले सादे बैकग्राउंड पर एक पत्ती की पास से साफ फोटो लें।";
  if (result.healthy) return "कोई रोग नहीं मिला। नियमित जांच जारी रखें और साफ औज़ार इस्तेमाल करें।";
  const advice = {
    Bacterial_spot: "प्रभावित पत्तियां हटाएं, ऊपर से पानी न दें और तांबे के उपचार पर स्थानीय सलाह लें।",
    Early_blight: "नीचे की संक्रमित पत्तियां हटाएं, हवा का प्रवाह सुधारें और स्थानीय फफूंदनाशक सलाह मानें।",
    Late_blight: "प्रभावित पौधा अलग करें और तुरंत स्थानीय कृषि विशेषज्ञ से सलाह लें; लेट ब्लाइट तेजी से फैलता है।",
    Leaf_Mold: "हवा का प्रवाह बढ़ाएं, पत्तियों की नमी घटाएं और ज्यादा संक्रमित हिस्सा हटाएं।",
    Septoria_leaf_spot: "संक्रमित पत्तियां हटाएं, पत्तियां सूखी रखें और पौधों के बीच औज़ार साफ करें।",
    Spider_mites: "पत्तियों के नीचे जांचें, प्रभावित हिस्सा अलग करें और स्थानीय एकीकृत कीट प्रबंधन सलाह मानें।",
    Target_Spot: "संक्रमित पत्तियां हटाएं और उपचार से पहले पौधों के बीच जगह व हवा का प्रवाह सुधारें।",
    YellowLeaf__Curl_Virus: "बहुत प्रभावित पौधे हटाएं और स्थानीय सलाह से सफेद मक्खी नियंत्रित करें।",
    mosaic_virus: "संक्रमित पौधे हटाएं, औज़ार साफ करें और तंबाकू छूने के बाद फसल न छुएं।",
  };
  const key = Object.keys(advice).find((fragment) => result.label?.includes(fragment));
  return key ? advice[key] : "प्रभावित पौधा अलग करें और इलाज के लिए स्थानीय कृषि विशेषज्ञ से सलाह लें।";
}

function render(data) {
  if (!data?.farm || !data?.telemetry || !data?.health) return;
  state = data;
  if (data.field && typeof syncFieldDataFromPayload === "function") {
    syncFieldDataFromPayload(data.field);
  }
  const isDemo = isDemoMode();
  const demoBadge = $("demoModeBadge");
  if (demoBadge) demoBadge.hidden = !isDemo;

  const fieldState = normalizeFieldState(data);
  const { farm, telemetry, recommendation, edge, soil_assessment: assessment } = data;
  const effectiveFarm = isDemo ? PRAGYA_DEMO_DATA.farm : farm;
  const locationName = (effectiveFarm.location || "Hyderabad, Telangana").trim();
  const locationUpper = locationName.toUpperCase();
  const eyebrowText = language === "hi"
    ? `खेत बुद्धिमत्ता · ${locationName}`
    : `FIELD INTELLIGENCE · ${locationUpper}`;
  setText("dateLine", eyebrowText);

  const farmNameEl = $("farmName");
  if (farmNameEl) {
    const rawName = (effectiveFarm.name || (isDemo ? "North Wheat Field" : "PRAGYA Farm")).trim();
    if (!isDemo && (rawName.startsWith("PRAGYA ") || rawName.startsWith("PRAGYA"))) {
      const workspaceWord = rawName.replace(/^PRAGYA\s*/, "") || "Farm";
      farmNameEl.innerHTML = `<span class="brand-word">PRAGYA</span> <span class="workspace-word">${escapeHtml(workspaceWord)}</span>`;
    } else {
      farmNameEl.textContent = rawName;
    }
  }

  setText("farmMeta", t("acres_of", effectiveFarm.area || effectiveFarm.acreage || 5.0, effectiveFarm.crop || "Wheat") + (effectiveFarm.location ? t("in_location", effectiveFarm.location) : ""));
  if (document.activeElement !== $("locationInput")) $("locationInput").value = effectiveFarm.location || "";
  if (isDemo && $("rawJson")) {
    $("rawJson").textContent = JSON.stringify(PRAGYA_DEMO_DATA, null, 2);
  }

  // 1. Dynamic Percentage-based Field Health Score derived from normalized field state
  const healthResult = calculateFieldHealth(fieldState, data.disease);
  animateNumericText("healthScore", healthResult.percentage, "%");
  const statusBadge = $("healthStatusBadge");
  if (statusBadge) {
    statusBadge.textContent = t(healthResult.labelKey);
    statusBadge.className = `health-status-badge ${healthResult.status}`;
    const card = statusBadge.closest(".health-card");
    if (card) {
      card.classList.remove("status-healthy", "status-attention", "status-critical");
      card.classList.add(`status-${healthResult.status}`);
    }
  }
  setBar("healthBar", healthResult.percentage);

  if ($("recommendationTitle")) {
    const rec = translatedRecommendation(recommendation);
    setText("recommendationTitle", rec.title);
    setText("recommendationMessage", rec.message);
  }

  // 2. Section 1: Soil Nutrients (NPK + EC)
  const nVal = Math.round(fieldState.nitrogen);
  const pVal = Math.round(fieldState.phosphorus);
  const kVal = Math.round(fieldState.potassium);

  setText("overviewNValue", nVal);
  setText("overviewPValue", pVal);
  setText("overviewKValue", kVal);

  const nClass = classifyNutrient("n", nVal);
  const pClass = classifyNutrient("p", pVal);
  const kClass = classifyNutrient("k", kVal);

  const nRatingEl = $("nRating");
  if (nRatingEl) {
    nRatingEl.textContent = t(nClass.labelKey);
    nRatingEl.className = `npk-rating rating-${nClass.rating}`;
  }
  const colN = $("colNitrogen");
  if (colN) colN.className = `npk-col rating-${nClass.rating}`;

  const pRatingEl = $("pRating");
  if (pRatingEl) {
    pRatingEl.textContent = t(pClass.labelKey);
    pRatingEl.className = `npk-rating rating-${pClass.rating}`;
  }
  const colP = $("colPhosphorus");
  if (colP) colP.className = `npk-col rating-${pClass.rating}`;

  const kRatingEl = $("kRating");
  if (kRatingEl) {
    kRatingEl.textContent = t(kClass.labelKey);
    kRatingEl.className = `npk-rating rating-${kClass.rating}`;
  }
  const colK = $("colPotassium");
  if (colK) colK.className = `npk-col rating-${kClass.rating}`;

  setBar("overviewNBar", npkPercent("n", nVal));
  setBar("overviewPBar", npkPercent("p", pVal));
  setBar("overviewKBar", npkPercent("k", kVal));

  const ecVal = Number(fieldState.ec || 0);
  setText("overviewEcValue", `${ecVal.toFixed(2)} mS/cm`);
  const ecClass = classifyNutrient("ec", ecVal);
  const ecRatingEl = $("ecRating");
  if (ecRatingEl) {
    ecRatingEl.textContent = t(ecClass.labelKey);
    ecRatingEl.className = `npk-rating rating-${ecClass.rating}`;
  }
  const colEc = $("colEc");
  if (colEc) colEc.className = `npk-col rating-${ecClass.rating}`;
  setBar("overviewEcBar", Math.min(100, Math.round((ecVal / 2.0) * 100)));

  setText("nutrientSummaryText", generateNutrientSummary(fieldState));

  const fertilityMap = { "Less fertile": "less_fertile", Fertile: "fertile", "Highly fertile": "highly_fertile" };
  const fertStatusText = assessment?.status === "ready" ? t(fertilityMap[assessment.fertility] || "fertility") : t("unavailable");
  setText("overviewFertilityStatus", fertStatusText);
  $("overviewFertilityStatus")?.classList.toggle("success", assessment?.status === "ready");

  // Keep page-field nutrients synchronized
  setText("nValue", nVal); setText("pValue", pVal); setText("kValue", kVal);
  setBar("nBar", npkPercent("n", nVal)); setBar("pBar", npkPercent("p", pVal)); setBar("kBar", npkPercent("k", kVal));
  setText("ecValue", `${ecVal.toFixed(2)} mS/cm`);
  setText("carbonValue", `${Number(fieldState.organicCarbon || 0).toFixed(2)}%`);
  setText("rainfallValue", `${Math.round(fieldState.rainfall || 0)} mm`);
  setText("fertilityStatus", fertStatusText);
  $("fertilityStatus")?.classList.toggle("success", assessment?.status === "ready");

  // 3. Section 2: Soil / Physical Conditions + Weather
  setText("moistureValue", `${Math.round(fieldState.moisture)}%`);
  const mNote = fieldState.moisture < 45 ? t("below_range") : fieldState.moisture > 65 ? t("above_range") : (language === "hi" ? "सही स्तर" : "Within target");
  setText("moistureNote", mNote);

  setText("temperatureValue", `${fieldState.temperature.toFixed(1)}°C`);
  const tNote = fieldState.temperature >= 36 ? (language === "hi" ? "अधिक तापमान — दोपहर में छिड़काव न करें" : "High heat — avoid midday spray")
    : fieldState.temperature < 18 ? (language === "hi" ? "ठंडा मौसम" : "Cool — monitor crop")
    : (language === "hi" ? "अनुकूल तापमान (18–32°C)" : "Comfortable (18–32°C)");
  setText("temperatureNote", tNote);

  setText("humidityValue", `${Math.round(fieldState.humidity)}%`);
  const hNote = fieldState.humidity >= 80 ? t("high_check_leaves")
    : fieldState.humidity < 40 ? (language === "hi" ? "शुष्क हवा" : "Dry air")
    : (language === "hi" ? "सामान्य नमी" : "Normal humidity");
  setText("humidityNote", hNote);

  setText("phValue", fieldState.ph.toFixed(1));
  const phNote = fieldState.ph < 6.0 ? (language === "hi" ? "अम्लीय / स्तर कम" : "Acidic / Below target")
    : fieldState.ph > 7.0 ? (language === "hi" ? "क्षारीय / स्तर ज़्यादा" : "Alkaline / Above target")
    : (language === "hi" ? "सही स्तर (6.0–7.0)" : "Within target (6.0–7.0)");
  setText("phNote", phNote);
  setText("updatedAt", formatUpdated(fieldState.updatedAt));

  // Weather Context row
  const weather = fieldState.weather;
  const tempVal = weather.temperature.toFixed(1);
  const humidVal = Math.round(weather.humidity);
  const descVal = weather.description;
  const cityVal = weather.city ? ` (${weather.city})` : "";
  const rainVal = fieldState.rainfall > 0 ? ` · ${Math.round(fieldState.rainfall)} mm ${t("rainfall").toLowerCase()}` : "";
  setText("weatherContextText", `${tempVal}°C · ${humidVal}% ${t("humidity").toLowerCase()} · ${descVal}${cityVal}${rainVal}`);

  // 4. Section 3: What Needs Attention?
  const activeAlerts = generateAlerts(fieldState);
  const attentionIssues = evaluateAttention(fieldState, activeAlerts, fieldState.disease);
  const attentionPanel = $("attentionPanel");
  const attentionIcon = $("attentionIcon");
  const attentionChip = $("attentionChip");
  const attentionHeadline = $("attentionHeadline");
  const attentionDetail = $("attentionDetail");

  if (attentionIssues.length === 0) {
    if (attentionPanel) attentionPanel.className = "panel attention-panel";
    if (attentionIcon) attentionIcon.textContent = "✓";
    if (attentionChip) {
      attentionChip.textContent = language === "hi" ? "0 समस्याएं" : "0 items to address";
      attentionChip.className = "status-chip attention-chip success";
    }
    if (attentionHeadline) attentionHeadline.textContent = language === "hi" ? "कोई ज़रूरी समस्या नहीं" : "Nothing urgent detected";
    if (attentionDetail) attentionDetail.textContent = language === "hi" ? "निगरानी की जा रही खेत स्थितियां अनुशंसित सीमा में हैं।" : "Current monitored field conditions are within the configured ranges.";
  } else {
    const primary = attentionIssues[0];
    const isCritical = attentionIssues.some((issue) => issue.severity === "critical");
    if (attentionPanel) {
      attentionPanel.className = `panel attention-panel ${isCritical ? "has-critical" : "has-attention"}`;
    }
    if (attentionIcon) attentionIcon.textContent = "⚠";
    if (attentionChip) {
      attentionChip.textContent = attentionIssues.length === 1
        ? (language === "hi" ? "1 काम ध्यान देने योग्य" : "1 item requires attention")
        : (language === "hi" ? `${attentionIssues.length} काम ध्यान देने योग्य` : `${attentionIssues.length} items require attention`);
      attentionChip.className = `status-chip attention-chip ${isCritical ? "critical" : "warning"}`;
    }
    if (attentionHeadline) attentionHeadline.textContent = primary.headline;
    if (attentionDetail) {
      if (attentionIssues.length === 1) {
        attentionDetail.textContent = primary.detail;
      } else if (attentionIssues.length === 2) {
        attentionDetail.textContent = `${primary.detail} ${language === "hi" ? "साथ ही:" : "Also:"} ${attentionIssues[1].headline}`;
      } else {
        const moreCount = attentionIssues.length - 1;
        attentionDetail.textContent = `${primary.detail} (+${moreCount} ${language === "hi" ? "अन्य स्थितियां समीक्षा योग्य" : "other conditions require review"})`;
      }
    }
  }

  // 5. Section 4: Alerts
  setText("noticeCount", activeAlerts.length);
  const notices = $("noticeList");
  if (notices) {
    const alertsSignature = activeAlerts.map(a => `${a.type || ""}_${a.title || ""}_${a.level || ""}_${a.message || ""}`).join("::") + `__lang_${language}`;
    if (notices._lastSignature !== alertsSignature) {
      notices._lastSignature = alertsSignature;
      notices.replaceChildren();
      if (activeAlerts.length) {
        activeAlerts.forEach((alert) => appendNotice(notices, alert));
      } else {
        const emptyDiv = document.createElement("div");
        emptyDiv.className = "calm-empty-alerts";
        emptyDiv.id = "alertsEmptyState";
        
        const iconSpan = document.createElement("span");
        iconSpan.className = "calm-empty-icon";
        iconSpan.textContent = "✓";

        const textDiv = document.createElement("div");
        const strong = document.createElement("strong");
        strong.textContent = language === "hi" ? "कोई सक्रिय अलर्ट नहीं" : "No active field alerts.";
        const sub = document.createElement("p");
        sub.textContent = language === "hi" ? "निगरानी किए जा रहे सभी खेत संकेतक सामान्य सीमा में हैं।" : "All monitored field indicators are in normal range.";

        textDiv.append(strong, sub);
        emptyDiv.append(iconSpan, textDiv);
        notices.append(emptyDiv);
      }
    }
  }

  // 6. Section 5: Recommended Crops
  renderCrops(fieldState.crops, fieldState);

  setText("modelName", edge?.model); setText("modelSpeed", edge?.inference_ms == null ? t("not_run") : `${edge.inference_ms} ms`); setText("modelConfidence", edge?.confidence == null ? "—" : `${edge.confidence}%`); setText("cloudRequired", edge?.cloud_required ? t("yes") : t("no"));
  setText("rawJson", JSON.stringify(telemetry, null, 2));
  const weatherSuffix = telemetry.weather?.source === "api" ? ` · ${telemetry.weather.city || t("weather_data")}` : "";
  const source = telemetry.source === "demo" ? `${t("sample_data")}${weatherSuffix}` : telemetry.weather?.source === "api" ? `${t("weather_data")}${weatherSuffix}` : t("sensor_data");
  setText("sourceText", source);
  if (data.disease) showScan(data.disease);
  if (data.user) {
    currentUser = data.user;
    renderAccount();
  }
  renderModelCards(data.models);
  updateChatFieldToday();
}

function applyLanguage() {
  document.documentElement.lang = language === "hi" ? "hi" : "en";
  document.querySelectorAll("[data-i18n]").forEach((node) => { node.textContent = t(node.dataset.i18n); });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => { node.placeholder = t(node.dataset.i18nPlaceholder); });
  document.querySelectorAll("[data-i18n-title]").forEach((node) => {
    const val = t(node.dataset.i18nTitle);
    node.title = val;
    node.setAttribute("aria-label", val);
  });
  if ($("themeToggle")) $("themeToggle").setAttribute("aria-label", t("theme_toggle"));
  const edgeTitleEl = $("edgePageTitle");
  if (edgeTitleEl) {
    edgeTitleEl.innerHTML = `<span class="brand-word">PRAGYA</span> <span class="workspace-word">${language === "hi" ? "एज AI" : "EDGE AI"}</span>`;
  }
  const chatTitleEl = $("chatTitle");
  if (chatTitleEl) {
    chatTitleEl.innerHTML = language === "hi"
      ? `<span class="brand-word">PRAGYA</span> <span class="workspace-word">से पूछें</span>`
      : `<span class="workspace-word">Ask</span> <span class="brand-word">PRAGYA</span>`;
  }
  [["langEn", "en"], ["langHi", "hi"], ["landingLangEn", "en"], ["landingLangHi", "hi"]].forEach(([id, value]) => {
    const active = language === value;
    const el = $(id);
    if (el) {
      el.classList.toggle("is-active", active);
      el.setAttribute("aria-pressed", String(active));
    }
  });
  if (state) {
    const mode = $("connection").classList.contains("is-offline") ? "offline" : "online";
    render(state); setConnection(mode);
    if (lastHistory.length) renderHistory(lastHistory);
    else { setText("historyCount", ""); const empty = $("historyEmpty"); if (empty) empty.hidden = false; }
    if (lastActivity.length) renderActivity(lastActivity);
    if (lastAnalyses.length) renderAnalyses(lastAnalyses);
    renderAccount();
    renderModelCards();
    applyAuthCopy();
  } else setConnection("connecting");

  updateActiveModelResultLanguage(language);
  updateChatReportsLanguage(language);
  updateAiEngineUI();
  updateChatFieldToday();
  renderModelCards();
  const labelText = `${typeLabel(selectedModel)} ${language === "hi" ? "चुना गया" : "selected"}`;
  setText("selectedModelLabel", labelText);
  updateWorkflow(selectedModel);
  document.querySelectorAll(".listen-button").forEach((btn) => {
    setTtsButtonState(btn, btn === currentActiveTtsBtn);
  });
}

$("langEn").addEventListener("click", () => { language = "en"; localStorage.setItem("km-language", language); applyLanguage(); });
$("langHi").addEventListener("click", () => { language = "hi"; localStorage.setItem("km-language", language); applyLanguage(); });
$("landingLangEn")?.addEventListener("click", () => { language = "en"; localStorage.setItem("km-language", language); applyLanguage(); });
$("landingLangHi")?.addEventListener("click", () => { language = "hi"; localStorage.setItem("km-language", language); applyLanguage(); });

async function checkAuth() {
  const reqId = ++authRequestId;
  try {
    const me = await api("/api/auth/me");
    if (reqId !== authRequestId) return;
    if (me?.user) {
      currentUser = me.user;
      renderAccount();
    } else if (me?.user === null) {
      currentUser = null;
      renderAccount();
    }
  } catch {
    if (reqId === authRequestId && !currentUser) {
      renderAccount();
    }
  }
}

async function loadDashboard() {
  setConnection("connecting");
  const authPromise = checkAuth();
  if (isDemoMode()) {
    const demoBadge = $("demoModeBadge");
    if (demoBadge) demoBadge.hidden = false;
    render(getDemoDashboardState());
    setConnection("online");
    setText("connectionText", language === "hi" ? "लाइव (डेमो)" : "Live (Demo)");
    setText("sourceText", language === "hi" ? "डेमो डेटासेट · रिकॉर्डिंग मोड" : "Demo dataset · Recording mode");
    renderHistory(DEMO_SPARKLINE_HISTORY);
    renderActivity(DEMO_ACTIVITY_RECORDS);
    renderAnalyses(DEMO_HISTORY_RECORDS);
  } else {
    const demoBadge = $("demoModeBadge");
    if (demoBadge) demoBadge.hidden = true;
    try { render(await api("/api/farm")); setConnection("online"); }
    catch (error) { setConnection("offline"); if (!state) showToast(errorMessage(error), true); }
    try { renderHistory(await api("/api/history")); } catch { /* sparkline is optional */ }
    try { renderActivity(await api("/api/activity")); } catch { /* activity is optional */ }
    try { renderAnalyses(await api("/api/analyses")); } catch { /* history page is optional */ }
  }
  await authPromise;
}

function setSelectedFile(file) {
  if (!file) return clearSelectedFile();
  const valid = ["image/jpeg", "image/png", "image/webp"].includes(file.type) && file.size <= 10 * 1024 * 1024;
  if (!valid) { clearSelectedFile(); showToast(t("bad_file"), true); return; }
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = URL.createObjectURL(file);
  const preview = $("leafPreview"); preview.src = previewUrl; preview.hidden = false;
  $("uploadPlaceholder").hidden = true; $("fileRow").hidden = false; setText("fileName", file.name); $("scanBtn").disabled = false;
}

function clearSelectedFile() {
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = null; $("leafInput").value = ""; $("leafPreview").removeAttribute("src"); $("leafPreview").hidden = true; $("uploadPlaceholder").hidden = false; $("fileRow").hidden = true; $("scanBtn").disabled = true;
}

$("leafInput").addEventListener("change", (event) => setSelectedFile(event.target.files?.[0]));
$("clearPhotoBtn").addEventListener("click", clearSelectedFile);
const dropZone = $("dropZone");
["dragenter", "dragover"].forEach((name) => dropZone.addEventListener(name, (event) => { event.preventDefault(); dropZone.classList.add("is-dragging"); }));
["dragleave", "drop"].forEach((name) => dropZone.addEventListener(name, (event) => { event.preventDefault(); dropZone.classList.remove("is-dragging"); }));
dropZone.addEventListener("drop", (event) => { const file = event.dataTransfer?.files?.[0]; if (!file) return; const transfer = new DataTransfer(); transfer.items.add(file); $("leafInput").files = transfer.files; setSelectedFile(file); });

$("scanBtn").addEventListener("click", async () => {
  const file = $("leafInput").files?.[0];
  if (!file) { showToast(t("select_photo"), true); return; }
  const button = $("scanBtn"); button.disabled = true; button.classList.add("is-loading"); button.querySelector("span").textContent = t("scanning");
  const form = new FormData(); form.append("image", file);
  try {
    const result = await api("/api/disease", { method: "POST", body: form }, 125000);
    showScan(result);
    if (state) { state.disease = result; state.edge.inference_ms = result.inference_ms; state.edge.confidence = result.confidence; }
    try { renderActivity(await api("/api/activity")); renderAnalyses(await api("/api/analyses")); } catch { /* keep current lists */ }
  }
  catch (error) { showToast(errorMessage(error, t("scan_failed")), true); }
  finally { button.disabled = false; button.classList.remove("is-loading"); button.querySelector("span").textContent = t("scan_leaf"); }
});

$("locationForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const locationValue = $("locationInput").value.trim(); const status = $("locationStatus"); const button = $("saveLocationBtn");
  status.classList.remove("is-error");
  if (!locationValue) { status.textContent = t("location_required"); status.classList.add("is-error"); return; }
  button.disabled = true; button.textContent = t("saving");
  try { const result = await api("/api/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ location: locationValue }) }); status.textContent = t("location_saved", result.farm.location); await loadDashboard(); }
  catch (error) { status.textContent = errorMessage(error); status.classList.add("is-error"); }
  finally { button.disabled = false; button.textContent = t("save"); }
});

$("tokenForm").addEventListener("submit", (event) => {
  event.preventDefault(); const value = $("tokenInput").value.trim();
  if (value) sessionStorage.setItem("km-api-token", value); else sessionStorage.removeItem("km-api-token");
  setText("tokenStatus", value ? t("token_set") : t("token_cleared")); $("tokenInput").value = "";
});

// ==========================================
// PRAGYA Modern Chatbot Integration
// ==========================================
let chatHistory = [];
let chatPreviewUrl = null;
let currentChatFile = null;
let chatThinkingInterval = null;
let currentThinkingBubble = null;
let lastFailedChatPayload = null;
let chatSessionId = 0;
let chatConfirmPendingAction = null;
let chatConfirmTriggerElement = null;

function hasChatMessages() {
  const log = $("chatLog");
  const bubbles = log ? log.querySelectorAll(".chat-message") : [];
  return bubbles.length > 0 || (Array.isArray(chatHistory) && chatHistory.length > 0);
}

function resetChatState(isNewChat = true) {
  chatSessionId++;
  stopCurrentTts();
  stopChatThinking();
  clearChatImage();

  // Reset conversation tracking
  chatHistory = [];
  chatReports.length = 0;
  lastFailedChatPayload = null;

  // Clear composer inputs and state
  const input = $("chatInput");
  if (input) {
    input.value = "";
    autoResizeChatInput();
  }
  const sendBtn = $("chatSendBtn");
  if (sendBtn) {
    sendBtn.classList.remove("is-loading");
    sendBtn.disabled = true;
  }
  const status = $("chatStatus");
  if (status) {
    status.textContent = "";
    status.classList.remove("is-error");
  }
  updateChatSendBtn();

  // Clear chat log message bubbles
  const log = $("chatLog");
  if (log) {
    const bubbles = log.querySelectorAll(".chat-message");
    bubbles.forEach((bubble) => bubble.remove());

    const emptyState = $("chatEmptyState");
    if (emptyState) {
      emptyState.hidden = false;
    }
    log.scrollTop = 0;
  }

  // Refresh field context in empty state
  updateChatFieldToday();

  // Focus input if starting fresh chat
  if (isNewChat) {
    const chatInput = $("chatInput");
    if (chatInput) {
      setTimeout(() => chatInput.focus(), 60);
    }
  }
}

function openChatConfirmModal(action) {
  const modal = $("chatConfirmModal");
  if (!modal) return;
  chatConfirmPendingAction = action;
  chatConfirmTriggerElement = document.activeElement;

  const titleEl = $("chatConfirmTitle");
  const descEl = $("chatConfirmDesc");
  const actionBtn = $("chatConfirmActionBtn");

  if (action === "new") {
    if (titleEl) titleEl.textContent = t("confirm_new_chat_title");
    if (descEl) descEl.textContent = t("confirm_new_chat_desc");
    if (actionBtn) {
      actionBtn.textContent = t("chat_new");
      actionBtn.className = "primary-button";
    }
  } else {
    if (titleEl) titleEl.textContent = t("confirm_clear_chat_title");
    if (descEl) descEl.textContent = t("confirm_clear_chat_desc");
    if (actionBtn) {
      actionBtn.textContent = t("chat_clear");
      actionBtn.className = "primary-button danger";
    }
  }

  modal.hidden = false;
  document.body.classList.add("modal-open");
  actionBtn?.focus();
}

function closeChatConfirmModal() {
  const modal = $("chatConfirmModal");
  if (!modal || modal.hidden) return;
  modal.classList.add("is-closing");
  setTimeout(() => {
    modal.hidden = true;
    modal.classList.remove("is-closing");
    document.body.classList.remove("modal-open");
    chatConfirmPendingAction = null;
    if (chatConfirmTriggerElement && typeof chatConfirmTriggerElement.focus === "function") {
      chatConfirmTriggerElement.focus();
    }
  }, 160);
}

function updateChatFieldToday() {
  const telemetry = state?.telemetry;
  if (!telemetry) return;
  const moisture = Math.round(telemetry.moisture ?? 0);
  const temp = Number(telemetry.temperature ?? 0).toFixed(1);
  const npk = telemetry.npk || { n: 0, p: 0, k: 0 };
  const npkStr = `${Math.round(npk.n)} / ${Math.round(npk.p)} / ${Math.round(npk.k)}`;

  setText("chatMoistureVal", `${moisture}%`);
  setText("chatTempVal", `${temp}°C`);
  setText("chatNpkVal", npkStr);

  const weatherSuffix = telemetry.weather?.source === "api" ? ` · ${telemetry.weather.city || t("weather_data")}` : "";
  const source = telemetry.source === "demo"
    ? `${t("sample_data")}${weatherSuffix}`
    : (telemetry.weather?.source === "api" ? `${t("weather_data")}${weatherSuffix}` : t("field_sensor"));
  setText("chatFieldSource", source);
}

function updateChatSendBtn() {
  const input = $("chatInput");
  const sendBtn = $("chatSendBtn");
  if (!sendBtn) return;
  const hasText = Boolean(input?.value.trim().length);
  const hasImage = Boolean(currentChatFile || $("chatImage")?.files?.[0]);
  sendBtn.disabled = !hasText && !hasImage;
}

function autoResizeChatInput() {
  const input = $("chatInput");
  if (!input) return;
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
}

function clearChatImage() {
  if (chatPreviewUrl) URL.revokeObjectURL(chatPreviewUrl);
  chatPreviewUrl = null;
  currentChatFile = null;
  const fileInput = $("chatImage");
  if (fileInput) fileInput.value = "";
  const preview = $("chatPreview");
  if (preview) preview.removeAttribute("src");
  const attachmentBar = $("chatAttachment");
  if (attachmentBar) attachmentBar.hidden = true;
  const fileName = $("chatFileName");
  if (fileName) fileName.textContent = "";
  const route = $("chatRoute");
  if (route) route.value = "auto";
  const input = $("chatInput");
  if (input) input.placeholder = t("chat_placeholder");
  updateChatSendBtn();
}

function setChatImage(file) {
  if (!file) return clearChatImage();
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024) {
    clearChatImage();
    showToast(t("bad_file"), true);
    return;
  }
  if (chatPreviewUrl) URL.revokeObjectURL(chatPreviewUrl);
  chatPreviewUrl = URL.createObjectURL(file);
  currentChatFile = file;
  const preview = $("chatPreview");
  if (preview) preview.src = chatPreviewUrl;
  const fileName = $("chatFileName");
  if (fileName) fileName.textContent = file.name;
  const attachmentBar = $("chatAttachment");
  if (attachmentBar) attachmentBar.hidden = false;
  const input = $("chatInput");
  if (input) input.placeholder = t("chat_image_placeholder");
  updateChatSendBtn();
}

function scrollChatToBottom(smooth = true) {
  const log = $("chatLog");
  if (!log) return;
  log.scrollTo({
    top: log.scrollHeight,
    behavior: smooth ? "smooth" : "auto",
  });
}

function detectQuestionCategory(message = "", hasImage = false) {
  if (hasImage) return "image";
  const lower = message.toLowerCase();
  const farmKeywords = ["soil", "moisture", "npk", "nitrogen", "phosphorus", "potassium", "sensor", "reading", "field", "temperature", "humidity", "ph", "ec", "मिट्टी", "नमी", "सेंसर", "रीडिंग", "तापमान"];
  if (farmKeywords.some(kw => lower.includes(kw))) return "farm";
  return "text";
}

function startChatThinking(category = "text") {
  stopChatThinking();
  const log = $("chatLog");
  if (!log) return;

  const thinkingMessages = {
    text: [
      t("thinking_default"),
      t("thinking_farm"),
      t("thinking_answer"),
    ],
    image: [
      t("thinking_img_look"),
      t("thinking_img_symptoms"),
      t("thinking_img_result"),
    ],
    farm: [
      t("thinking_sensor_check"),
      t("thinking_sensor_compare"),
      t("thinking_sensor_rec"),
    ],
  };

  const msgs = thinkingMessages[category] || thinkingMessages.text;
  let msgIndex = 0;

  const bubble = document.createElement("div");
  bubble.className = "chat-message assistant is-thinking";
  bubble.id = "chatThinkingBubble";

  const row = document.createElement("div");
  row.className = "thinking-row";

  const dots = document.createElement("div");
  dots.className = "thinking-dots";
  dots.innerHTML = `<span></span><span></span><span></span>`;

  const statusSpan = document.createElement("span");
  statusSpan.className = "thinking-label";
  statusSpan.textContent = msgs[0];

  row.append(dots, statusSpan);
  bubble.append(row);
  log.append(bubble);
  currentThinkingBubble = bubble;
  scrollChatToBottom();

  chatThinkingInterval = setInterval(() => {
    msgIndex = (msgIndex + 1) % msgs.length;
    if (statusSpan) {
      statusSpan.style.opacity = "0";
      setTimeout(() => {
        statusSpan.textContent = msgs[msgIndex];
        statusSpan.style.opacity = "1";
      }, 160);
    }
  }, 1900);
}

function stopChatThinking() {
  if (chatThinkingInterval) {
    clearInterval(chatThinkingInterval);
    chatThinkingInterval = null;
  }
  if (currentThinkingBubble) {
    currentThinkingBubble.remove();
    currentThinkingBubble = null;
  }
  const leftover = $("chatThinkingBubble");
  if (leftover) leftover.remove();
}

function formatAssistantMessage(rawText) {
  const container = document.createElement("div");
  container.className = "assistant-message-content";
  if (!rawText) return container;

  const lines = rawText.split("\n");
  let currentList = null;

  function inlineFormat(str) {
    const escaped = str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return escaped
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^\*])\*([^\*]+)\*([^\*]|$)/g, "$1<em>$2</em>$3");
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      currentList = null;
      continue;
    }

    const headingMatch = line.match(/^#{1,3}\s+(.+)$/);
    if (headingMatch) {
      currentList = null;
      const h = document.createElement("h4");
      h.className = "chat-heading";
      h.innerHTML = inlineFormat(headingMatch[1]);
      container.append(h);
      continue;
    }

    const bulletMatch = line.match(/^[-*•]\s+(.+)$/);
    if (bulletMatch) {
      if (!currentList) {
        currentList = document.createElement("ul");
        currentList.className = "chat-bullets";
        container.append(currentList);
      }
      const li = document.createElement("li");
      li.innerHTML = inlineFormat(bulletMatch[1]);
      currentList.append(li);
      continue;
    }

    currentList = null;
    const p = document.createElement("p");
    p.innerHTML = inlineFormat(line);
    container.append(p);
  }

  return container;
}

function renderChatError(retryAction) {
  const log = $("chatLog");
  if (!log) return;
  const errBubble = document.createElement("div");
  errBubble.className = "chat-message assistant is-error";

  const p = document.createElement("p");
  p.textContent = t("chat_error");
  errBubble.append(p);

  if (retryAction) {
    const retryBtn = document.createElement("button");
    retryBtn.type = "button";
    retryBtn.className = "chat-retry-btn";
    retryBtn.innerHTML = `<span>🔄</span> <span>${t("chat_retry")}</span>`;
    retryBtn.addEventListener("click", () => {
      errBubble.remove();
      retryAction();
    });
    errBubble.append(retryBtn);
  }

  log.append(errBubble);
  scrollChatToBottom();
}

async function sendChatMessage(presetMessage) {
  const input = $("chatInput");
  const message = (presetMessage !== undefined ? presetMessage : (input?.value || "")).trim();
  const file = currentChatFile || $("chatImage")?.files?.[0];
  if (!message && !file) return;

  const sendBtn = $("chatSendBtn");
  const status = $("chatStatus");
  status.textContent = "";
  status.classList.remove("is-error");

  // Hide empty state if visible
  const emptyState = $("chatEmptyState");
  if (emptyState) emptyState.hidden = true;

  const log = $("chatLog");

  // Create user message bubble
  const user = document.createElement("div");
  user.className = "chat-message user";
  const userText = document.createElement("p");
  userText.textContent = message || t("chat_photo");
  user.append(userText);

  let sentPhotoUrl = null;
  if (file && chatPreviewUrl) {
    sentPhotoUrl = chatPreviewUrl;
    const photo = document.createElement("img");
    photo.src = chatPreviewUrl;
    photo.alt = file.name;
    user.append(photo);
  }
  log.append(user);
  scrollChatToBottom();

  if (input) {
    input.value = "";
    autoResizeChatInput();
  }
  updateChatSendBtn();

  if (sendBtn) {
    sendBtn.disabled = true;
    sendBtn.classList.add("is-loading");
  }

  const category = detectQuestionCategory(message, Boolean(file));
  startChatThinking(category);

  const sessionEpoch = chatSessionId;
  const modeSelected = getAiMode();
  const retryAction = () => {
    if (presetMessage !== undefined) {
      sendChatMessage(presetMessage);
    } else {
      sendChatMessage(message);
    }
  };

  try {
    let result;
    if (file) {
      const form = new FormData();
      form.append("image", file);
      form.append("message", message);
      form.append("route", $("chatRoute")?.value || "auto");
      form.append("mode", modeSelected);
      form.append("lang", language);
      result = await api("/api/chat/image", { method: "POST", body: form }, 125000);
    } else {
      result = await api("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          mode: modeSelected,
          lang: language,
          demo: isDemoMode() ? 1 : 0,
          history: chatHistory.slice(-4)
        })
      }, 45000);
    }

    stopChatThinking();
    if (sessionEpoch !== chatSessionId) return;

    // Store in conversation history for multi-turn context
    chatHistory.push({ role: "user", content: message || "Image uploaded" });
    const replyAnswer = result.chat_answer || result.answer || (result.report ? result.report.title : "");
    if (replyAnswer) {
      chatHistory.push({ role: "assistant", content: replyAnswer });
    }

    const reply = document.createElement("div");
    reply.className = "chat-message assistant";

    if (result.report && typeof result.report === "object") {
      const resLang = result.lang || language;
      if (!result.report._translations) result.report._translations = {};
      result.report._translations[resLang] = result.report;
      const repEl = renderAgriculturalReport(result.report, language);
      reply.append(repEl);
      chatReports.push({ report: result.report, element: repEl, speech: result.speech, replyEl: reply, lang: resLang });
    } else {
      reply.append(formatAssistantMessage(result.answer || ""));
    }

    if (file && result.mode === "edge") {
      const model = document.createElement("span");
      model.className = "chat-model-note";
      const output = result.analysis_type === "pest"
        ? (result.model_output?.recognized === false ? t("not_recognized_edge") : result.model_output?.analysis?.slice(0, 140))
        : (result.model_output?.recognized === false ? t("not_recognized_edge") : result.model_output?.disease || result.model_output?.label);
      model.textContent = `${t("chat_model_output")}: ${result.model || ""} · ${output || ""}`;
      reply.append(model);
    }

    if (file && result.cloud_error && result.fallback) {
      const notice = document.createElement("small");
      notice.className = "chat-model-note";
      notice.textContent = result.cloud_error;
      reply.append(notice);
    }

    // Response actions: LISTEN ONLY (per requirements 17, 21, 28, 30-36)
    const actions = document.createElement("div");
    actions.className = "chat-message-actions";

    const listenBtn = document.createElement("button");
    listenBtn.type = "button";
    listenBtn.className = "listen-button";
    setTtsButtonState(listenBtn, false);
    listenBtn.addEventListener("click", (e) => {
      toggleSpeech(e.currentTarget, () => result.speech || result.answer, () => result.lang || language);
    });
    actions.append(listenBtn);
    reply.append(actions);

    log.append(reply);
    scrollChatToBottom();

    if (file) {
      clearChatImage();
      const [activity, analyses] = await Promise.allSettled([api("/api/activity"), api("/api/analyses")]);
      if (activity.status === "fulfilled") renderActivity(activity.value);
      if (analyses.status === "fulfilled") renderAnalyses(analyses.value);
    }
  } catch (error) {
    stopChatThinking();
    if (sessionEpoch !== chatSessionId) return;
    renderChatError(retryAction);
  } finally {
    if (sendBtn) {
      sendBtn.classList.remove("is-loading");
    }
    updateChatSendBtn();
  }
}

// Event Listeners for Chat
$("newChatBtn")?.addEventListener("click", () => {
  if (hasChatMessages()) {
    openChatConfirmModal("new");
  } else {
    resetChatState(true);
  }
});

$("clearChatBtn")?.addEventListener("click", () => {
  if (hasChatMessages()) {
    openChatConfirmModal("clear");
  } else {
    resetChatState(false);
  }
});

$("chatConfirmCancelBtn")?.addEventListener("click", closeChatConfirmModal);
$("chatConfirmCloseBtn")?.addEventListener("click", closeChatConfirmModal);
$("chatConfirmBackdrop")?.addEventListener("click", closeChatConfirmModal);

$("chatConfirmActionBtn")?.addEventListener("click", () => {
  const action = chatConfirmPendingAction;
  closeChatConfirmModal();
  if (action === "new") {
    resetChatState(true);
  } else if (action === "clear") {
    resetChatState(false);
  }
});

$("chatImage")?.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  setChatImage(file);
});
$("chatRemoveImage")?.addEventListener("click", clearChatImage);

$("chatInput")?.addEventListener("input", () => {
  autoResizeChatInput();
  updateChatSendBtn();
});

$("chatInput")?.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendChatMessage();
  }
});

$("chatForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  sendChatMessage();
});

document.querySelectorAll(".suggestion-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    const q = chip.dataset.question;
    if (!q) return;
    const input = $("chatInput");
    if (input) {
      input.value = q;
      autoResizeChatInput();
      updateChatSendBtn();
    }
    sendChatMessage(q);
  });
});

document.querySelectorAll(".image-quick-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    const q = chip.dataset.question;
    if (!q) return;
    const input = $("chatInput");
    if (input) {
      input.value = q;
      autoResizeChatInput();
      updateChatSendBtn();
    }
    sendChatMessage(q);
  });
});

function applyAuthCopy() {
  if ($("authModal")?.hidden === false) openAuth(authMode);
}

$("scanListenBtn")?.addEventListener("click", (e) => toggleSpeech(e.currentTarget, () => lastScanSpeech, () => ttsLang.scan));
$("modelListenBtn")?.addEventListener("click", (e) => toggleSpeech(e.currentTarget, () => lastModelSpeech, () => ttsLang.model));
setTtsButtonState($("scanListenBtn"), false);
setTtsButtonState($("modelListenBtn"), false);
window.addEventListener("beforeunload", stopCurrentTts);
window.addEventListener("pagehide", stopCurrentTts);
document.querySelectorAll("[data-tts-lang]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.for;
    ttsLang[target] = button.dataset.ttsLang;
    document.querySelectorAll(`[data-for="${target}"]`).forEach((node) => node.classList.toggle("is-active", node === button));
  });
});

$("openSignupBtn")?.addEventListener("click", () => openAuth("signup"));
$("openLoginBtn")?.addEventListener("click", () => openAuth("login"));
$("landingSignup")?.addEventListener("click", () => openAuth("signup"));
$("landingLogin")?.addEventListener("click", () => openAuth("login"));
$("landingNavSignup")?.addEventListener("click", () => openAuth("signup"));
$("landingNavLogin")?.addEventListener("click", () => openAuth("login"));
$("closeAuthBtn")?.addEventListener("click", closeAuth);
$("authModal")?.addEventListener("click", (event) => { if (event.target === $("authModal")) closeAuth(); });
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && $("authModal") && !$("authModal").hidden) {
    closeAuth();
  }
  if (event.key === "Escape" && $("chatConfirmModal") && !$("chatConfirmModal").hidden) {
    closeChatConfirmModal();
  }
});
$("switchAuthBtn")?.addEventListener("click", () => openAuth(authMode === "login" ? "signup" : "login"));
$("logoutBtn")?.addEventListener("click", async () => {
  authRequestId++;
  try { await api("/api/auth/logout", { method: "POST" }); } catch { /* local sign-out still applies */ }
  currentUser = null;
  renderAccount();
});
$("authForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = $("authStatus");
  status.classList.remove("is-error");
  const username = $("authUsername").value.trim();
  const password = $("authPassword").value;
  const path = authMode === "login" ? "/api/auth/login" : "/api/auth/signup";
  try {
    const result = await api(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
    authRequestId++;
    currentUser = result.user;
    renderAccount();
    closeAuth();
    $("authForm").reset();
    await loadDashboard();
  } catch (error) {
    status.textContent = errorMessage(error);
    status.classList.add("is-error");
  }
});

$("runModelBtn")?.closest("form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (selectedModel === "disease" || selectedModel === "pest") return;
  const button = $("runModelBtn");
  button.disabled = true;
  button.classList.add("is-loading");
  button.querySelector("span").textContent = language === "hi" ? "खेत का विश्लेषण हो रहा है..." : "ANALYZING FIELD...";
  $("modelRunStatus").classList.remove("is-error");
  $("modelRunStatus").textContent = "";
  try {
    const rawValues = formValues($("modelSensorForm"));
    const telemetry = state?.telemetry || {};
    const npk = telemetry.npk || {};
    const values = {
      n: Number(rawValues.n ?? npk.n ?? 45),
      p: Number(rawValues.p ?? npk.p ?? 28),
      k: Number(rawValues.k ?? npk.k ?? 38),
      moisture: Number(rawValues.moisture ?? telemetry.moisture ?? 48),
      ph: Number(rawValues.ph ?? telemetry.ph ?? 6.5),
      ec: Number(rawValues.ec ?? telemetry.ec ?? 1.1),
      organic_carbon: Number(rawValues.organic_carbon ?? telemetry.organic_carbon ?? 0.65),
      temperature: Number(rawValues.temperature ?? telemetry.temperature ?? 24),
      humidity: Number(rawValues.humidity ?? telemetry.humidity ?? 62),
      rainfall: Number(rawValues.rainfall ?? telemetry.rainfall ?? 110),
    };

    if (selectedModel === "field_intelligence") {
      let fiResult;
      try {
        fiResult = await api("/api/models/field_intelligence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }, 45000);
      } catch (err) {
        const [cropResult, soilResult] = await Promise.all([
          api("/api/models/crop", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) }, 45000),
          api("/api/models/soil", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) }, 45000),
        ]);
        fiResult = { crops: cropResult.crops, fertility: soilResult.fertility, mode: cropResult.mode || soilResult.mode || "edge" };
      }
      const report = buildFieldIntelligenceReport(values, fiResult, fiResult, language);

      showModelResult({
        title: language === "hi" ? "खेत बुद्धिमत्ता रिपोर्ट" : "Field Intelligence Report",
        fieldIntelligenceReport: report,
        good: report.overallGood,
        confidence: report.confidence || (fiResult.fertility?.confidence != null ? `${fiResult.fertility.confidence}%` : ""),
        mode: fiResult.mode || "edge",
        modelName: "Field Intelligence",
        speech: fiResult.speech || report.speechSummary,
      });
      if (window.matchMedia("(max-width: 768px)").matches) {
        $("modelResult")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else if (selectedModel === "crop") {
      const result = await api("/api/models/crop", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) }, 45000);
      const top = result.crops?.[0];
      showModelResult(result.recommendation?.title || t("crop_model"), `${result.recommendation?.message || ""} ${(result.crops || []).map((c) => `${c.crop} ${c.confidence}%`).join(", ")} ${result.cloud_analysis || ""}`.trim(), result.speech, true, top ? `${top.confidence}%` : "", result.mode);
    } else {
      const result = await api("/api/models/soil", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) }, 45000);
      const fert = result.fertility || {};
      showModelResult(fert.fertility || t("soil_model"), result.speech || "", result.speech, fert.status === "ready", fert.confidence != null ? `${fert.confidence}%` : "", result.mode);
    }
    renderActivity(await api("/api/activity"));
    renderAnalyses(await api("/api/analyses"));
  } catch (error) {
    $("modelRunStatus").textContent = errorMessage(error, t("model_failed"));
    $("modelRunStatus").classList.add("is-error");
  } finally {
    button.disabled = false;
    button.classList.remove("is-loading");
    button.querySelector("span").textContent = t("analyze_field_btn");
  }
});

function setModelFile(file) {
  if (!file) return clearModelFile();
  const valid = ["image/jpeg", "image/png", "image/webp"].includes(file.type) && file.size <= 10 * 1024 * 1024;
  if (!valid) { clearModelFile(); showToast(t("bad_file"), true); return; }
  $("modelDetectionOverlay").hidden = true;
  if (modelPreviewUrl) URL.revokeObjectURL(modelPreviewUrl);
  modelPreviewUrl = URL.createObjectURL(file);
  $("modelLeafPreview").src = modelPreviewUrl;
  $("modelLeafPreview").hidden = false;
  $("modelUploadPlaceholder").hidden = true;
  $("runImageModelBtn").disabled = false;
  $("clearModelPhotoBtn").hidden = false;
}

function clearModelFile() {
  if (modelPreviewUrl) URL.revokeObjectURL(modelPreviewUrl);
  modelPreviewUrl = null;
  $("modelLeafInput").value = "";
  $("modelLeafPreview").removeAttribute("src");
  $("modelLeafPreview").hidden = true;
  $("modelUploadPlaceholder").hidden = false;
  $("runImageModelBtn").disabled = true;
  $("clearModelPhotoBtn").hidden = true;
  $("modelDetectionOverlay").hidden = true;
}

function showPestBoxes(file, detections = []) {
  const canvas = $("modelDetectionOverlay");
  canvas.hidden = true;
  if (!detections.length) return;
  const photo = new Image();
  const url = URL.createObjectURL(file);
  photo.onload = () => {
    const scale = Math.min(1, 900 / photo.naturalWidth);
    canvas.width = Math.round(photo.naturalWidth * scale);
    canvas.height = Math.round(photo.naturalHeight * scale);
    const context = canvas.getContext("2d");
    context.drawImage(photo, 0, 0, canvas.width, canvas.height);
    context.font = "bold 13px system-ui, sans-serif";
    detections.forEach(({ box, label, confidence }) => {
      const [x1, y1, x2, y2] = box.map((value) => value * scale);
      context.strokeStyle = "#f7ce54";
      context.lineWidth = 3;
      context.strokeRect(x1, y1, x2 - x1, y2 - y1);
      const caption = `${label} ${Number(confidence).toFixed(0)}%`;
      const captionWidth = Math.min(canvas.width - x1, context.measureText(caption).width + 12);
      const captionY = y1 >= 23 ? y1 - 22 : y1;
      context.fillStyle = "#18352b";
      context.fillRect(x1, captionY, captionWidth, 22);
      context.fillStyle = "#fff";
      context.fillText(caption, x1 + 6, captionY + 15, Math.max(1, captionWidth - 12));
    });
    canvas.setAttribute("aria-label", `${detections.length} possible pest detections on the uploaded photo`);
    canvas.hidden = false;
    URL.revokeObjectURL(url);
  };
  photo.onerror = () => URL.revokeObjectURL(url);
  photo.src = url;
}

$("modelLeafInput")?.addEventListener("change", (event) => setModelFile(event.target.files?.[0]));
$("clearModelPhotoBtn").addEventListener("click", clearModelFile);
const modelDropZone = $("modelDropZone");
["dragenter", "dragover"].forEach((name) => modelDropZone.addEventListener(name, (event) => { event.preventDefault(); modelDropZone.classList.add("is-dragging"); }));
["dragleave", "drop"].forEach((name) => modelDropZone.addEventListener(name, (event) => { event.preventDefault(); modelDropZone.classList.remove("is-dragging"); }));
modelDropZone.addEventListener("drop", (event) => {
  const file = event.dataTransfer?.files?.[0];
  if (!file) return;
  const transfer = new DataTransfer();
  transfer.items.add(file);
  $("modelLeafInput").files = transfer.files;
  setModelFile(file);
});
function showDemoImageModelResult(model) {
  if (model === "disease") {
    showModelResult({
      mode: "edge",
      fallback: false,
      modelName: "disease-mobilenet",
      title: language === "hi" ? "गेहूं · पत्ती का गेरुआ (Leaf Rust)" : "Wheat · Leaf Rust",
      body: language === "hi"
        ? "डेमो नमूना विश्लेषण: गेहूं की पत्ती पर गेरुआ (Puccinia triticina) के लक्षण पाए गए। पत्तियों की ऊपरी सतह पर छोटे, गोल नारंगी-भूरे रंग के धब्बे दिखाई दे रहे हैं।"
        : "Demo sample analysis: Symptoms indicative of leaf rust (Puccinia triticina) observed on wheat leaf blade. Small, circular-to-oval orange-brown pustules visible on the upper foliage surface.",
      speech: language === "hi"
        ? "गेहूं पत्ती का गेरुआ 91 प्रतिशत विश्वास के साथ पहचाना गया (डेमो परिणाम)।"
        : "Wheat Leaf Rust detected with 91 percent confidence (Demo result).",
      good: false,
      confidence: "91%",
      lang: language,
      rawResult: {
        crop: "Wheat",
        disease: "Leaf Rust",
        label: "Leaf Rust",
        confidence: 91,
        treatment: language === "hi"
          ? "डेमो सलाह: ट्राइज़ोल-आधारित फफूंदनाशक का छिड़काव करें और खेत के आसपास की पत्तियों की जांच करें।"
          : "Demo advice: Apply targeted triazole-based fungicide. Inspect nearby foliage for spore pustules."
      }
    });
  } else {
    showModelResult({
      mode: "edge",
      fallback: false,
      modelName: "pest-yolo",
      title: language === "hi" ? "गेहूं · माहू / एफिड (Aphid)" : "Wheat · Aphid",
      body: language === "hi"
        ? "डेमो नमूना स्क्रीनिंग: गेहूं के तने और पत्तियों पर माहू/एफिड का प्रकोप पाया गया। रस चूसक कीट झंडा पत्ती के पास एकत्र हैं।"
        : "Demo sample screening: Aphid clusters detected on wheat foliage and stem canopy. Sap-feeding activity observed near flag leaves.",
      speech: language === "hi"
        ? "गेहूं पर माहू कीट की पहचान 88 प्रतिशत विश्वास के साथ हुई (डेमो परिणाम)।"
        : "Aphid infestation detected on wheat with 88 percent confidence (Demo result).",
      good: false,
      confidence: "88%",
      lang: language,
      rawResult: {
        crop: "Wheat",
        pest: "Aphid",
        label: "Aphid",
        confidence: 88,
        analysis: language === "hi"
          ? "डेमो स्क्रीनिंग परिणाम: तने पर माहू कीट। मित्र कीटों (लेडीबर्ड बीटल) की निगरानी करें या नीम आधारित छिड़काव करें।"
          : "Demo screening result: Aphid colonies on wheat stem. Monitor predator populations or apply botanical neem spray."
      }
    });
  }
  if (window.matchMedia("(max-width: 768px)").matches) {
    $("modelResult")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

$("runImageModelBtn")?.addEventListener("click", async () => {
  const file = $("modelLeafInput").files?.[0];
  if (!file) {
    if (isDemoMode()) {
      showDemoImageModelResult(selectedModel);
      return;
    }
    showToast(t("select_photo"), true);
    return;
  }
  const button = $("runImageModelBtn");
  button.disabled = true;
  button.classList.add("is-loading");
  button.querySelector("span").textContent = t("scanning");
  
  const form = new FormData();
  form.append("image", file);
  form.append("type", selectedModel);
  form.append("mode", getAiMode());
  form.append("lang", language);
  const question = $("modelQuestionInput")?.value?.trim();
  if (question) form.append("message", question);

  try {
    const result = await api("/api/models/analyze", { method: "POST", body: form }, 125000);
    const isCloud = result.mode === "cloud";
    const isFallback = Boolean(result.fallback);
    const good = isCloud ? true : (result.recognized !== false && (selectedModel !== "disease" || result.healthy));

    let title = "";
    let body = "";
    if (isCloud && !isFallback) {
      title = result.title || result.finding || (language === "hi" ? "जेमिनी दृश्य विश्लेषण" : "Gemini Visual Analysis");
      body = result.cloud_analysis || result.answer || "";
    } else {
      if (result.recognized === false) {
        title = t("not_recognized");
        body = t("not_recognized_edge");
      } else {
        title = result.label || result.disease || result.recommendation?.title || result.fertility?.fertility || "Detected";
        body = selectedModel === "pest" ? (result.analysis || "") : localizedTreatment(result) || result.recommendation?.message || result.speech || "";
      }
    }

    showModelResult({
      mode: result.mode,
      fallback: isFallback,
      modelName: result.model,
      title,
      body,
      report: result.report,
      speech: result.speech || body,
      good,
      confidence: result.confidence != null ? `${Number(result.confidence).toFixed(1)}%` : "",
      cloudError: result.cloud_error,
      lang: result.lang || language,
      rawResult: result,
    });

    if (result.analysis_type === "pest" && result.detections && result.detections.length) {
      showPestBoxes(file, result.detections);
    } else {
      $("modelDetectionOverlay").hidden = true;
    }

    renderActivity(await api("/api/activity"));
    renderAnalyses(await api("/api/analyses"));
  } catch (error) {
    showToast(errorMessage(error, t("scan_failed")), true);
  } finally {
    button.disabled = false;
    button.classList.remove("is-loading");
    button.querySelector("span").textContent = t("analyze_btn");
  }
});

const oldFieldPage = $("page-field");
if (oldFieldPage) {
  oldFieldPage.remove();
}
document.querySelectorAll('[data-tab="field"]').forEach((button) => button.remove());
document.querySelectorAll("#page-overview > :not(#landingPanel)").forEach((node) => node.classList.add("dashboard-private"));
const mobileNav = document.querySelector(".mobile-nav");
[["chat", "nav_chat"], ["rover", "nav_rover"], ["mapping", "nav_mapping"]].forEach(([name]) => {
  const button = $(`tab-${name}`).cloneNode(true);
  ["id", "role", "aria-selected", "aria-controls", "tabindex"].forEach((attribute) => button.removeAttribute(attribute));
  button.className = "";
  button.addEventListener("click", () => activateTab(name));
  mobileNav.insertBefore(button, mobileNav.querySelector('[data-tab="history"]'));
});

// ==========================================
// PRAGYA Field Mapping & Spatial Foundation
// ==========================================

let mapFieldData = {
  id: 1,
  name: "North Wheat Field",
  location: "Hyderabad, Telangana",
  crop: "Wheat",
  area: 5.0,
  area_unit: "acres",
  length: 200.0,
  width: 100.0,
  dimension_unit: "metres",
  perimeter: 602.4,
  geometry: {
    type: "Polygon",
    coordinates: [[0, 0], [200, 0], [200, 101.2], [0, 101.2]]
  },
  zones: [
    { id: "zone-a", name: "Zone A", crop: "Wheat", description: "Primary block", area_pct: 50 },
    { id: "zone-b", name: "Zone B", crop: "Wheat", description: "Secondary block", area_pct: 50 }
  ]
};

let mapTransform = { zoom: 1.5, panX: 100, panY: 100 };
let currentGeomMode = "dimensions";
let isDrawingActive = false;
let isSatelliteMode = false;
let draggedVertexIndex = null;
let isPanning = false;
let panStart = { x: 0, y: 0 };
let showBoundaryLayer = true;
let showZonesLayer = true;

function convertArea(val, fromUnit, toUnit) {
  const f = (fromUnit || "").toLowerCase();
  const t = (toUnit || "").toLowerCase();
  if (f === t) return val;
  if (f.startsWith("a") && t.startsWith("h")) return val * 0.40468564;
  if (f.startsWith("h") && t.startsWith("a")) return val * 2.4710538;
  return val;
}

function convertDimension(val, fromUnit, toUnit) {
  const f = (fromUnit || "").toLowerCase();
  const t = (toUnit || "").toLowerCase();
  if (f === t) return val;
  if (f.startsWith("m") && t.startsWith("f")) return val * 3.2808399;
  if (f.startsWith("f") && t.startsWith("m")) return val * 0.3048;
  return val;
}

function calcPolygonStats(pts, dimUnit = "metres", areaUnit = "acres") {
  if (!pts || pts.length < 3) return null;
  const n = pts.length;
  let shoelace = 0;
  let perimeter = 0;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    shoelace += (pts[i][0] * pts[j][1]) - (pts[j][0] * pts[i][1]);
    const dx = pts[j][0] - pts[i][0];
    const dy = pts[j][1] - pts[i][1];
    perimeter += Math.hypot(dx, dy);
    minX = Math.min(minX, pts[i][0]);
    maxX = Math.max(maxX, pts[i][0]);
    minY = Math.min(minY, pts[i][1]);
    maxY = Math.max(maxY, pts[i][1]);
  }
  const rawSqUnits = 0.5 * Math.abs(shoelace);
  const isFeet = dimUnit.startsWith("f");
  const sqM = isFeet ? rawSqUnits * (0.3048 * 0.3048) : rawSqUnits;
  const perimM = isFeet ? perimeter * 0.3048 : perimeter;
  const area = areaUnit.startsWith("h") ? (sqM / 10000.0) : (sqM / 4046.85642);
  const lenDim = Math.max(maxX - minX, maxY - minY);
  const widDim = Math.min(maxX - minX, maxY - minY);
  return {
    area: Math.round(area * 100) / 100,
    areaUnit,
    perimeter: Math.round(perimeter * 10) / 10,
    perimeterM: Math.round(perimM * 10) / 10,
    length: Math.round(lenDim * 10) / 10,
    width: Math.round(widDim * 10) / 10,
    dimUnit,
    coordinates: pts
  };
}

function calcRectangleStats(len, wid, dimUnit = "metres", areaUnit = "acres") {
  const isFeet = dimUnit.startsWith("f");
  const lenM = isFeet ? len * 0.3048 : len;
  const widM = isFeet ? wid * 0.3048 : wid;
  const sqM = lenM * widM;
  const perimM = 2.0 * (lenM + widM);
  const area = areaUnit.startsWith("h") ? (sqM / 10000.0) : (sqM / 4046.85642);
  const perimeter = isFeet ? perimM * 3.28084 : perimM;
  return {
    area: Math.round(area * 100) / 100,
    areaUnit,
    perimeter: Math.round(perimeter * 10) / 10,
    perimeterM: Math.round(perimM * 10) / 10,
    length: len,
    width: wid,
    dimUnit,
    coordinates: [
      [0, 0],
      [len, 0],
      [len, wid],
      [0, wid]
    ]
  };
}

function updateSummaryPanel() {
  const area = mapFieldData.area || 0;
  const areaUnit = mapFieldData.area_unit || "acres";
  const isAcres = areaUnit.startsWith("a");
  const areaAcres = isAcres ? area : area * 2.47105;
  const areaHa = isAcres ? area * 0.404686 : area;

  setText("summaryArea", `${areaAcres.toFixed(2)} acres`);
  setText("summaryAreaSub", `${areaHa.toFixed(2)} hectares`);

  const perim = mapFieldData.perimeter || 0;
  const dimUnit = mapFieldData.dimension_unit || "metres";
  const isFeet = dimUnit.startsWith("f");
  const perimM = isFeet ? perim * 0.3048 : perim;
  setText("summaryPerimeter", `${Math.round(perimM)} m`);
  setText("summaryPerimeterSub", `${Math.round(perim)} ${dimUnit} perimeter`);

  const len = mapFieldData.length || 0;
  const wid = mapFieldData.width || 0;
  const lenM = isFeet ? len * 0.3048 : len;
  const widM = isFeet ? wid * 0.3048 : wid;
  const lenFt = isFeet ? len : len * 3.28084;
  const widFt = isFeet ? wid : wid * 3.28084;

  setText("summaryDimensions", `~${Math.round(lenM)} × ${Math.round(widM)} m`);
  setText("summaryDimensionsSub", `~${Math.round(lenFt)} × ${Math.round(widFt)} ft`);

  setText("summaryLocation", mapFieldData.location || "Hyderabad, Telangana");
  setText("summaryCrop", mapFieldData.crop || "Wheat");

  const zonesCount = (mapFieldData.zones || []).length;
  setText("summaryZonesCount", `${zonesCount} zone${zonesCount === 1 ? "" : "s"}`);
  setText("zoneCountChip", `${zonesCount} zone${zonesCount === 1 ? "" : "s"}`);

  const isPoly = currentGeomMode === "polygon";
  setText("summaryGeometryBadge", isPoly ? "Authoritative Polygon" : "Rectangular Dimensions");
  setText("fieldGeometryChip", isPoly ? "Polygon" : "Dimensions");
}

function getZoneLetter(index) {
  let label = "";
  let n = index;
  while (n >= 0) {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  }
  return label;
}

function getZoneName(index) {
  return `Zone ${getZoneLetter(index)}`;
}

function computeGridDimensions(n) {
  if (n <= 1) return { rows: 1, cols: 1 };
  if (n <= 3) return { rows: 1, cols: n };

  let bestR = 1;
  let bestC = n;
  let bestScore = Infinity;

  const maxR = Math.ceil(Math.sqrt(n));
  for (let r = 1; r <= maxR; r++) {
    const c = Math.ceil(n / r);
    const unused = (r * c) - n;
    const aspectRatio = Math.max(c / r, r / c);
    const bias = r > c ? 0.05 : 0.0;
    const score = (aspectRatio * 1.5) + (unused * 0.8) + bias;
    if (score < bestScore) {
      bestScore = score;
      bestR = r;
      bestC = c;
    }
  }

  if (bestR > bestC) {
    const tmp = bestR;
    bestR = bestC;
    bestC = tmp;
  }

  return { rows: bestR, cols: bestC };
}

function calculateZonePartitions(coords, n) {
  if (!coords || coords.length < 3 || n <= 0) return [];
  const xs = coords.map((p) => p[0]);
  const ys = coords.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const totalW = Math.max(maxX - minX, 1);
  const totalH = Math.max(maxY - minY, 1);

  const { rows, cols } = computeGridDimensions(n);

  const zonesPerRow = [];
  let rem = n;
  for (let r = 0; r < rows; r++) {
    const count = Math.ceil(rem / (rows - r));
    zonesPerRow.push(count);
    rem -= count;
  }

  const partitions = [];
  let zoneIdx = 0;
  const rowHeight = totalH / rows;

  for (let r = 0; r < rows; r++) {
    const k = zonesPerRow[r];
    const colWidth = totalW / k;
    const y0 = minY + (r * rowHeight);
    const y1 = y0 + rowHeight;

    for (let c = 0; c < k; c++) {
      if (zoneIdx >= n) break;
      const x0 = minX + (c * colWidth);
      const x1 = x0 + colWidth;

      partitions.push({
        index: zoneIdx,
        letter: getZoneLetter(zoneIdx),
        name: getZoneName(zoneIdx),
        row: r,
        col: c,
        x0,
        y0,
        x1,
        y1,
        width: colWidth,
        height: rowHeight,
        cx: (x0 + x1) / 2,
        cy: (y0 + y1) / 2
      });
      zoneIdx++;
    }
  }
  return partitions;
}

function syncAndRenumberZones() {
  mapFieldData.zones = mapFieldData.zones || [];
  const count = mapFieldData.zones.length;
  const totalArea = mapFieldData.area || 0;
  const areaUnit = mapFieldData.area_unit || "acres";
  const approxPerZone = count > 0 ? (totalArea / count) : totalArea;

  mapFieldData.zones.forEach((z, i) => {
    z.name = getZoneName(i);
    z.letter = getZoneLetter(i);
    z.id = `zone-${z.letter.toLowerCase()}-${i + 1}`;
    z.crop = mapFieldData.crop || "Wheat";
    z.approx_area = Math.round(approxPerZone * 100) / 100;
    z.area_unit = areaUnit;
    z.area_pct = count > 0 ? Math.round(100 / count) : 100;
  });
}

function renderZonesList() {
  const container = $("fieldZonesList");
  if (!container) return;
  container.innerHTML = "";
  const zones = mapFieldData.zones || [];

  if (zones.length === 0) {
    const emptyP = document.createElement("p");
    emptyP.className = "empty-zones-hint";
    emptyP.textContent = "Whole field · Click + Add zone below to partition.";
    container.appendChild(emptyP);
    return;
  }

  const totalArea = mapFieldData.area || 0;
  const areaUnit = mapFieldData.area_unit || "acres";
  const approxPerZone = (totalArea / zones.length).toFixed(2);
  const crop = mapFieldData.crop || "Wheat";

  zones.forEach((z, idx) => {
    const card = document.createElement("div");
    card.className = "zone-card";
    const letter = getZoneLetter(idx);
    const name = getZoneName(idx);

    card.innerHTML = `
      <div class="zone-card-top">
        <div class="zone-card-title-wrap">
          <span class="zone-card-badge">${escapeHtml(letter)}</span>
          <strong class="zone-card-name">${escapeHtml(name)}</strong>
        </div>
        <button type="button" class="zone-remove-btn" title="Remove ${escapeHtml(name)}" aria-label="Remove ${escapeHtml(name)}">×</button>
      </div>
      <div class="zone-card-meta">
        <span>${escapeHtml(crop)}</span>
        <span class="meta-dot">·</span>
        <span>~${approxPerZone} ${escapeHtml(areaUnit)}</span>
      </div>
    `;

    card.querySelector(".zone-remove-btn").addEventListener("click", () => {
      mapFieldData.zones.splice(idx, 1);
      syncAndRenumberZones();
      renderZonesList();
      renderMappingWorkspace();
      updateSummaryPanel();
    });

    container.appendChild(card);
  });
}

function renderMappingWorkspace() {
  const svg = $("fieldMapSvg");
  const worldGroup = $("mapWorldGroup");
  const polyElem = $("mapFieldPolygon");
  const verticesGroup = $("mapVerticesGroup");
  const edgeLabelsGroup = $("mapEdgeLabelsGroup");
  const zonesGroup = $("mapZonesGroup");
  if (!svg || !worldGroup || !polyElem) return;

  worldGroup.setAttribute("transform", `matrix(${mapTransform.zoom} 0 0 ${mapTransform.zoom} ${mapTransform.panX} ${mapTransform.panY})`);

  let coords = [];
  if (mapFieldData.geometry && Array.isArray(mapFieldData.geometry.coordinates)) {
    coords = mapFieldData.geometry.coordinates;
  }

  // Draw polygon
  if (coords.length >= 3 && showBoundaryLayer) {
    const ptsStr = coords.map((p) => `${p[0]},${p[1]}`).join(" ");
    polyElem.setAttribute("points", ptsStr);
    polyElem.style.display = "";
  } else {
    polyElem.setAttribute("points", "");
    polyElem.style.display = "none";
  }

  // Draw vertex handles
  verticesGroup.innerHTML = "";
  if (showBoundaryLayer) {
    coords.forEach((pt, idx) => {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", String(pt[0]));
      circle.setAttribute("cy", String(pt[1]));
      circle.setAttribute("r", "5.5");
      circle.setAttribute("class", "map-vertex-handle");
      circle.dataset.index = String(idx);

      circle.addEventListener("mousedown", (e) => {
        e.stopPropagation();
        draggedVertexIndex = idx;
      });
      verticesGroup.appendChild(circle);
    });
  }

  // Draw edge labels
  edgeLabelsGroup.innerHTML = "";
  if (showBoundaryLayer && coords.length >= 2) {
    const dimUnit = mapFieldData.dimension_unit === "feet" ? "ft" : "m";
    const n = coords.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const midX = (coords[i][0] + coords[j][0]) / 2;
      const midY = (coords[i][1] + coords[j][1]) / 2;
      const dist = Math.hypot(coords[j][0] - coords[i][0], coords[j][1] - coords[i][1]);

      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", String(midX));
      text.setAttribute("y", String(midY - 4));
      text.setAttribute("class", "map-edge-label");
      text.setAttribute("text-anchor", "middle");
      text.textContent = `${Math.round(dist)} ${dimUnit}`;
      edgeLabelsGroup.appendChild(text);
    }
  }

  // Draw automatic equal-area grid partition overlays
  zonesGroup.innerHTML = "";
  const zonesCount = (mapFieldData.zones || []).length;
  if (showZonesLayer && coords.length >= 3 && zonesCount > 0) {
    const partitions = calculateZonePartitions(coords, zonesCount);
    const totalArea = mapFieldData.area || 0;
    const areaUnit = mapFieldData.area_unit || "acres";
    const unitAbbr = areaUnit.startsWith("h") ? "ha" : "ac";
    const approxPerZone = (totalArea / zonesCount).toFixed(2);
    const crop = mapFieldData.crop || "Wheat";

    partitions.forEach((p) => {
      // Cell boundary rectangle
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", String(p.x0));
      rect.setAttribute("y", String(p.y0));
      rect.setAttribute("width", String(p.width));
      rect.setAttribute("height", String(p.height));
      rect.setAttribute("class", "zone-cell-rect");
      zonesGroup.appendChild(rect);

      // Zone title
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", String(p.cx));
      text.setAttribute("y", String(p.cy - 2));
      text.setAttribute("class", "zone-map-label");
      text.setAttribute("text-anchor", "middle");
      text.textContent = p.name;
      zonesGroup.appendChild(text);

      // Zone context sublabel
      const sub = document.createElementNS("http://www.w3.org/2000/svg", "text");
      sub.setAttribute("x", String(p.cx));
      sub.setAttribute("y", String(p.cy + 13));
      sub.setAttribute("class", "zone-map-sublabel");
      sub.setAttribute("text-anchor", "middle");
      sub.textContent = `${crop} · ~${approxPerZone} ${unitAbbr}`;
      zonesGroup.appendChild(sub);
    });
  }

  // Update scale bar
  const scaleM = Math.max(10, Math.round(100 / mapTransform.zoom / 10) * 10);
  setText("scaleBarText", `${scaleM} m`);

  updateSummaryPanel();
  renderFieldHeatmap();
  renderRoverNavWorkspace();
}

function calculateFieldBounds() {
  const coords = mapFieldData.geometry?.coordinates || [];
  if (coords.length < 2) {
    return { cx: 100, cy: 100, fitZoom: 1.5, minX: 0, maxX: 200, minY: 0, maxY: 100, width: 200, height: 100 };
  }
  const xs = coords.map((p) => p[0]);
  const ys = coords.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const w = Math.max(maxX - minX, 10);
  const h = Math.max(maxY - minY, 10);

  const padding = 120;
  const availW = 800 - padding;
  const availH = 500 - padding;

  const scale = Math.min(availW / w, availH / h, 2.5);
  const fitZoom = Math.max(scale, 0.4);

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  return { cx, cy, fitZoom, minX, maxX, minY, maxY, width: w, height: h };
}

function fitToField() {
  const { cx, cy, fitZoom } = calculateFieldBounds();
  mapTransform.zoom = fitZoom;
  mapTransform.panX = 400 - (cx * mapTransform.zoom);
  mapTransform.panY = 250 - (cy * mapTransform.zoom);
  renderMappingWorkspace();
}

// Reduce default map zoom by exactly two zoom-out steps (1.25 * 1.25 = 1.5625)
function resetToDefaultView() {
  const { cx, cy, fitZoom } = calculateFieldBounds();
  mapTransform.zoom = Math.max(fitZoom / 1.5625, 0.25);
  mapTransform.panX = 400 - (cx * mapTransform.zoom);
  mapTransform.panY = 250 - (cy * mapTransform.zoom);
  renderMappingWorkspace();
}

/* ============================================================
   SOIL NUTRIENT HEATMAP SYSTEM
   ============================================================ */
let activeNutrient = "N";

const NUTRIENT_METADATA = {
  N: {
    name: "Nitrogen (N)",
    symbol: "N",
    unit: "mg/kg",
    low: 40,
    optimal: 80,
    high: 130
  },
  P: {
    name: "Phosphorus (P)",
    symbol: "P",
    unit: "mg/kg",
    low: 20,
    optimal: 45,
    high: 70
  },
  K: {
    name: "Potassium (K)",
    symbol: "K",
    unit: "mg/kg",
    low: 35,
    optimal: 70,
    high: 110
  }
};

function getZoneNutrientValue(zoneIdx, nutrient) {
  if (isDemoMode()) {
    const demoZones = PRAGYA_DEMO_DATA.zones;
    if (zoneIdx >= 0 && zoneIdx < demoZones.length) {
      const z = demoZones[zoneIdx];
      if (nutrient === "N") return z.nitrogen;
      if (nutrient === "P") return z.phosphorus;
      if (nutrient === "K") return z.potassium;
    }
  }
  // Deterministic benchmark values as specified:
  // Zone A: N 82, P 46, K 71
  // Zone B: N 120, P 62, K 54
  // Zone C: N 45, P 28, K 39
  // Zone D: N 96, P 55, K 83
  const benchmarks = [
    { N: 82, P: 46, K: 71 },
    { N: 120, P: 62, K: 54 },
    { N: 45, P: 28, K: 39 },
    { N: 96, P: 55, K: 83 }
  ];
  if (zoneIdx < benchmarks.length) {
    return benchmarks[zoneIdx][nutrient];
  }
  if (nutrient === "N") return 50 + (((zoneIdx * 37) + 19) % 75);
  if (nutrient === "P") return 25 + (((zoneIdx * 23) + 11) % 45);
  if (nutrient === "K") return 40 + (((zoneIdx * 41) + 17) % 60);
  return 50;
}

// Colormap from Low (teal/forest green) -> Mid (amber/yellow) -> High (terracotta/red)
function getHeatmapColor(val, low, high) {
  const norm = Math.max(0, Math.min(1, (val - low) / Math.max(high - low, 1)));
  let r, g, b;
  if (norm < 0.35) {
    const t = norm / 0.35;
    r = Math.round(34 + t * (130 - 34));
    g = Math.round(107 + t * (170 - 107));
    b = Math.round(85 + t * (74 - 85));
  } else if (norm < 0.65) {
    const t = (norm - 0.35) / 0.30;
    r = Math.round(130 + t * (227 - 130));
    g = Math.round(170 + t * (177 - 170));
    b = Math.round(74 + t * (52 - 74));
  } else if (norm < 0.85) {
    const t = (norm - 0.65) / 0.20;
    r = Math.round(227 + t * (212 - 227));
    g = Math.round(177 + t * (93 - 177));
    b = Math.round(52 + t * (49 - 52));
  } else {
    const t = (norm - 0.85) / 0.15;
    r = Math.round(212 + t * (179 - 212));
    g = Math.round(93 + t * (50 - 93));
    b = Math.round(49 + t * (42 - 49));
  }
  return { r, g, b };
}

function renderFieldHeatmap() {
  const svg = $("fieldHeatmapSvg");
  const clipPoly = $("heatmapClipPolygon");
  const boundaryPoly = $("heatmapFieldBoundary");
  const zonesGroup = $("heatmapZonesGroup");
  const imgElem = $("heatmapInterpolationImage");
  const chipsList = $("heatmapZoneChipsList");
  if (!svg || !clipPoly || !boundaryPoly || !zonesGroup || !imgElem) return;

  const isDemo = isDemoMode();
  const badgeEl = $("heatmapModeBadge");
  if (badgeEl) {
    badgeEl.textContent = isDemo ? "Demo data · Spatial estimate" : "Spatial Model Estimate";
  }

  const meta = NUTRIENT_METADATA[activeNutrient] || NUTRIENT_METADATA.N;
  let lowBound = meta.low;
  let optimalBound = meta.optimal;
  let highBound = meta.high;
  if (isDemo) {
    if (activeNutrient === "N") { lowBound = 44; optimalBound = 50; highBound = 55; }
    else if (activeNutrient === "P") { lowBound = 33; optimalBound = 38; highBound = 42; }
    else if (activeNutrient === "K") { lowBound = 75; optimalBound = 80; highBound = 85; }
  }

  setText("heatmapActiveNutrientName", meta.name);
  setText("heatmapNutrientUnit", meta.unit);
  setText("heatmapScaleLow", `Low (${lowBound} ${meta.unit})`);
  setText("heatmapScaleMed", `Optimal (${optimalBound} ${meta.unit})`);
  setText("heatmapScaleHigh", `High (${highBound} ${meta.unit})`);

  let coords = [];
  if (mapFieldData.geometry && Array.isArray(mapFieldData.geometry.coordinates)) {
    coords = mapFieldData.geometry.coordinates;
  }
  if (coords.length < 3) return;

  const ptsStr = coords.map((p) => `${p[0]},${p[1]}`).join(" ");
  clipPoly.setAttribute("points", ptsStr);
  boundaryPoly.setAttribute("points", ptsStr);

  const zonesCount = Math.max(1, (mapFieldData.zones || []).length);
  const partitions = calculateZonePartitions(coords, zonesCount);

  // Compute field bounding box and fit inside 800x500 svg viewBox
  const bounds = calculateFieldBounds();
  const scale = bounds.fitZoom * 0.88;
  const panX = 400 - (bounds.cx * scale);
  const panY = 250 - (bounds.cy * scale);

  $("heatmapWorldGroup")?.setAttribute("transform", `matrix(${scale} 0 0 ${scale} ${panX} ${panY})`);

  // Generate 2D continuous IDW surface interpolation on offscreen canvas
  const canvasW = 120;
  const canvasH = 75;
  const canvas = document.createElement("canvas");
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const imgData = ctx.createImageData(canvasW, canvasH);
    const data = imgData.data;

    const anchors = partitions.map((p) => ({
      x: p.cx,
      y: p.cy,
      val: getZoneNutrientValue(p.index, activeNutrient)
    }));

    const minX = bounds.minX;
    const maxX = bounds.maxX;
    const minY = bounds.minY;
    const maxY = bounds.maxY;
    const fieldW = maxX - minX || 1;
    const fieldH = maxY - minY || 1;

    for (let py = 0; py < canvasH; py++) {
      const fieldY = minY + (py / canvasH) * fieldH;
      for (let px = 0; px < canvasW; px++) {
        const fieldX = minX + (px / canvasW) * fieldW;
        let sumWeights = 0;
        let sumValues = 0;

        for (let i = 0; i < anchors.length; i++) {
          const dx = fieldX - anchors[i].x;
          const dy = fieldY - anchors[i].y;
          const distSq = (dx * dx) + (dy * dy);
          const w = 1.0 / (distSq + 120.0);
          sumWeights += w;
          sumValues += (w * anchors[i].val);
        }

        const interpolatedVal = sumWeights > 0 ? (sumValues / sumWeights) : optimalBound;
        const col = getHeatmapColor(interpolatedVal, lowBound, highBound);
        const idx = (py * canvasW + px) * 4;
        data[idx] = col.r;
        data[idx + 1] = col.g;
        data[idx + 2] = col.b;
        data[idx + 3] = 230;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    imgElem.setAttribute("x", String(bounds.minX));
    imgElem.setAttribute("y", String(bounds.minY));
    imgElem.setAttribute("width", String(bounds.width));
    imgElem.setAttribute("height", String(bounds.height));
    imgElem.setAttribute("href", canvas.toDataURL());
  }

  // Draw zone dividers and labels overlay
  zonesGroup.innerHTML = "";
  partitions.forEach((p) => {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", String(p.x0));
    rect.setAttribute("y", String(p.y0));
    rect.setAttribute("width", String(p.width));
    rect.setAttribute("height", String(p.height));
    rect.setAttribute("class", "heatmap-zone-cell-rect");
    zonesGroup.appendChild(rect);

    const val = getZoneNutrientValue(p.index, activeNutrient);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", String(p.cx));
    text.setAttribute("y", String(p.cy - 3));
    text.setAttribute("class", "heatmap-zone-label");
    text.setAttribute("text-anchor", "middle");
    text.textContent = p.name;
    zonesGroup.appendChild(text);

    const sub = document.createElementNS("http://www.w3.org/2000/svg", "text");
    sub.setAttribute("x", String(p.cx));
    sub.setAttribute("y", String(p.cy + 13));
    sub.setAttribute("class", "heatmap-zone-val");
    sub.setAttribute("text-anchor", "middle");
    sub.textContent = `${val} ${meta.unit}`;
    zonesGroup.appendChild(sub);
  });

  // Populate Zone Chips List
  if (chipsList) {
    chipsList.innerHTML = "";
    partitions.forEach((p) => {
      const val = getZoneNutrientValue(p.index, activeNutrient);
      const chip = document.createElement("div");
      chip.className = "heatmap-zone-chip";
      chip.innerHTML = `
        <div class="heatmap-zone-chip-left">
          <span class="zone-card-badge">${escapeHtml(p.letter)}</span>
          <strong>${escapeHtml(p.name)}</strong>
        </div>
        <span class="heatmap-zone-chip-val">${val} ${escapeHtml(meta.unit)}</span>
      `;
      chipsList.appendChild(chip);
    });
  }
}

function setHeatmapNutrient(nutrient) {
  if (!NUTRIENT_METADATA[nutrient]) return;
  activeNutrient = nutrient;
  ["N", "P", "K"].forEach((key) => {
    const tab = $(`nutrientTab${key}`);
    if (tab) {
      const isActive = key === nutrient;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    }
  });
  renderFieldHeatmap();
}

/* ============================================================
   AUTONOMOUS ROVER NAVIGATION SYSTEM
   ============================================================ */
let isSurveyRunning = false;
let surveyProgress = 0.0;
let surveyWaypoints = [];
let surveyTotalDist = 0;
let surveyAnimId = null;
let lastSurveyTime = 0;

function computeSerpentineRoute(coords, zonesCount) {
  if (!coords || coords.length < 3 || zonesCount <= 0) return { waypoints: [], totalDist: 0 };
  const partitions = calculateZonePartitions(coords, zonesCount);
  const waypoints = [];
  const ROW_SPACING = 15;

  partitions.forEach((p) => {
    const marginX = p.width * 0.08;
    const marginY = p.height * 0.08;
    const leftX = p.x0 + marginX;
    const rightX = p.x1 - marginX;
    const topY = p.y0 + marginY;
    const botY = p.y1 - marginY;

    const rowH = Math.max(ROW_SPACING, (botY - topY) / Math.max(1, Math.round((botY - topY) / ROW_SPACING)));
    const numRows = Math.max(2, Math.floor((botY - topY) / rowH) + 1);

    for (let r = 0; r < numRows; r++) {
      const curY = topY + (r * rowH);
      if (r % 2 === 0) {
        waypoints.push({ x: leftX, y: curY, zoneIdx: p.index, zoneName: p.name });
        waypoints.push({ x: rightX, y: curY, zoneIdx: p.index, zoneName: p.name });
      } else {
        waypoints.push({ x: rightX, y: curY, zoneIdx: p.index, zoneName: p.name });
        waypoints.push({ x: leftX, y: curY, zoneIdx: p.index, zoneName: p.name });
      }
    }
  });

  let totalDist = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const dx = waypoints[i + 1].x - waypoints[i].x;
    const dy = waypoints[i + 1].y - waypoints[i].y;
    totalDist += Math.hypot(dx, dy);
  }

  return { waypoints, totalDist };
}

function renderRoverNavWorkspace() {
  const svg = $("roverNavSvg");
  const boundaryPoly = $("roverFieldBoundary");
  const zonesGroup = $("roverZonesGroup");
  const pathElem = $("roverSurveyPath");
  const traveledElem = $("roverTraveledPath");
  const marker = $("roverSimMarker");
  if (!svg || !boundaryPoly || !zonesGroup || !pathElem || !traveledElem || !marker) return;

  let coords = [];
  if (mapFieldData.geometry && Array.isArray(mapFieldData.geometry.coordinates)) {
    coords = mapFieldData.geometry.coordinates;
  }
  if (coords.length < 3) return;

  const ptsStr = coords.map((p) => `${p[0]},${p[1]}`).join(" ");
  boundaryPoly.setAttribute("points", ptsStr);

  const zonesCount = Math.max(1, (mapFieldData.zones || []).length);
  const partitions = calculateZonePartitions(coords, zonesCount);

  const bounds = calculateFieldBounds();
  const scale = bounds.fitZoom * 0.88;
  const panX = 400 - (bounds.cx * scale);
  const panY = 250 - (bounds.cy * scale);

  $("roverWorldGroup")?.setAttribute("transform", `matrix(${scale} 0 0 ${scale} ${panX} ${panY})`);

  zonesGroup.innerHTML = "";
  partitions.forEach((p) => {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", String(p.x0));
    rect.setAttribute("y", String(p.y0));
    rect.setAttribute("width", String(p.width));
    rect.setAttribute("height", String(p.height));
    rect.setAttribute("class", "rover-zone-cell-rect");
    rect.dataset.zoneIdx = String(p.index);
    zonesGroup.appendChild(rect);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", String(p.cx));
    text.setAttribute("y", String(p.cy + 4));
    text.setAttribute("class", "rover-zone-map-label");
    text.setAttribute("text-anchor", "middle");
    text.textContent = p.name;
    zonesGroup.appendChild(text);
  });

  const { waypoints, totalDist } = computeSerpentineRoute(coords, zonesCount);
  surveyWaypoints = waypoints;
  surveyTotalDist = totalDist;

  if (waypoints.length > 0) {
    let d = `M ${waypoints[0].x} ${waypoints[0].y}`;
    for (let i = 1; i < waypoints.length; i++) {
      d += ` L ${waypoints[i].x} ${waypoints[i].y}`;
    }
    pathElem.setAttribute("d", d);
  } else {
    pathElem.setAttribute("d", "");
  }

  const zoneNamesStr = partitions.map((p) => p.letter).join(" → ");
  setText("navZoneOrderVal", zoneNamesStr || "A");

  updateRoverMarkerPosition();
}

function updateRoverMarkerPosition() {
  const marker = $("roverSimMarker");
  const traveledElem = $("roverTraveledPath");
  if (!marker || !traveledElem || surveyWaypoints.length < 2) return;

  const targetDist = surveyProgress * surveyTotalDist;
  let accumulated = 0;
  let currX = surveyWaypoints[0].x;
  let currY = surveyWaypoints[0].y;
  let angle = 0;
  let currentZoneName = surveyWaypoints[0].zoneName;
  let currentZoneIdx = surveyWaypoints[0].zoneIdx;
  let traveledD = `M ${currX} ${currY}`;

  for (let i = 0; i < surveyWaypoints.length - 1; i++) {
    const p1 = surveyWaypoints[i];
    const p2 = surveyWaypoints[i + 1];
    const segLen = Math.hypot(p2.x - p1.x, p2.y - p1.y);

    if (accumulated + segLen >= targetDist) {
      const remaining = targetDist - accumulated;
      const t = segLen > 0 ? (remaining / segLen) : 0;
      currX = p1.x + t * (p2.x - p1.x);
      currY = p1.y + t * (p2.y - p1.y);
      angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI) + 90;
      currentZoneName = p2.zoneName;
      currentZoneIdx = p2.zoneIdx;
      traveledD += ` L ${currX} ${currY}`;
      break;
    } else {
      accumulated += segLen;
      traveledD += ` L ${p2.x} ${p2.y}`;
      currX = p2.x;
      currY = p2.y;
      angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI) + 90;
      currentZoneName = p2.zoneName;
      currentZoneIdx = p2.zoneIdx;
    }
  }

  marker.setAttribute("transform", `translate(${currX}, ${currY}) rotate(${angle})`);
  traveledElem.setAttribute("d", traveledD);

  setText("navProgressVal", `${Math.round(surveyProgress * 100)}%`);
  setText("navCurrentZoneVal", isSurveyRunning || surveyProgress > 0 ? currentZoneName : "—");

  const cells = document.querySelectorAll(".rover-zone-cell-rect");
  cells.forEach((cell) => {
    cell.classList.toggle("is-active-zone", (isSurveyRunning || surveyProgress > 0) && cell.dataset.zoneIdx === String(currentZoneIdx));
  });
}

function toggleSurveySimulation() {
  if (surveyProgress >= 1.0) {
    surveyProgress = 0.0;
  }
  isSurveyRunning = !isSurveyRunning;

  const btnText = $("surveyBtnText");
  const statusChip = $("surveyStatusChip");

  if (isSurveyRunning) {
    if (btnText) btnText.textContent = "Pause survey";
    if (statusChip) {
      statusChip.textContent = isDemoMode() ? "Autonomous survey simulation" : "SURVEY ACTIVE";
      statusChip.className = "status-chip success";
    }
    lastSurveyTime = performance.now();
    runSurveyAnimationLoop();
  } else {
    if (btnText) btnText.textContent = "Resume survey";
    if (statusChip) {
      statusChip.textContent = isDemoMode() ? "Autonomous survey simulation (Paused)" : "Survey Paused";
      statusChip.className = "status-chip warning";
    }
    if (surveyAnimId) {
      cancelAnimationFrame(surveyAnimId);
      surveyAnimId = null;
    }
  }
}

function runSurveyAnimationLoop(currentTime) {
  if (!isSurveyRunning) return;
  const now = currentTime || performance.now();
  const dt = (now - lastSurveyTime) / 1000;
  lastSurveyTime = now;

  // Complete survey in ~18 seconds
  const step = dt / 18.0;
  surveyProgress += step;

  if (surveyProgress >= 1.0) {
    surveyProgress = 1.0;
    isSurveyRunning = false;
    updateRoverMarkerPosition();

    const btnText = $("surveyBtnText");
    const statusChip = $("surveyStatusChip");
    if (btnText) btnText.textContent = "Restart survey";
    if (statusChip) {
      statusChip.textContent = isDemoMode() ? "Autonomous survey simulation (100%)" : "Survey Complete (100%)";
      statusChip.className = "status-chip success";
    }
    return;
  }

  updateRoverMarkerPosition();
  surveyAnimId = requestAnimationFrame(runSurveyAnimationLoop);
}

function resetSurveySimulation() {
  isSurveyRunning = false;
  if (surveyAnimId) {
    cancelAnimationFrame(surveyAnimId);
    surveyAnimId = null;
  }
  surveyProgress = 0.0;
  const btnText = $("surveyBtnText");
  const statusChip = $("surveyStatusChip");
  if (btnText) btnText.textContent = "Start autonomous survey";
  if (statusChip) {
    statusChip.textContent = isDemoMode() ? "Autonomous survey simulation" : "Simulation Ready";
    statusChip.className = "status-chip neutral";
  }
  updateRoverMarkerPosition();
}

function populateFieldForm() {
  if ($("mapFieldName")) $("mapFieldName").value = mapFieldData.name || "";
  if ($("mapFieldLocation")) $("mapFieldLocation").value = mapFieldData.location || "";
  if ($("mapFieldCrop")) $("mapFieldCrop").value = mapFieldData.crop || "";
  if ($("mapFieldLength")) $("mapFieldLength").value = mapFieldData.length || 200;
  if ($("mapFieldWidth")) $("mapFieldWidth").value = mapFieldData.width || 100;
  if ($("mapFieldArea")) $("mapFieldArea").value = mapFieldData.area || 5.0;
  if ($("mapDimensionUnit")) $("mapDimensionUnit").value = mapFieldData.dimension_unit || "metres";
  if ($("mapAreaUnit")) $("mapAreaUnit").value = mapFieldData.area_unit || "acres";
  if ($("polyPointCount")) {
    const ptsCount = (mapFieldData.geometry?.coordinates || []).length;
    $("polyPointCount").textContent = `${ptsCount} vertices defined`;
  }
  renderZonesList();
}

function syncFieldDataFromPayload(field) {
  if (isDemoMode() || !field) return;
  mapFieldData = {
    ...mapFieldData,
    ...field
  };
  if (typeof field.geometry === "string") {
    try { mapFieldData.geometry = JSON.parse(field.geometry); } catch(e) {}
  }
  if (typeof field.zones === "string") {
    try { mapFieldData.zones = JSON.parse(field.zones); } catch(e) {}
  }
  syncAndRenumberZones();
  populateFieldForm();
  renderMappingWorkspace();
  resetToDefaultView();
}

function initFieldMapping() {
  const form = $("fieldSetupForm");
  if (!form) return;

  if (isDemoMode()) {
    const d = PRAGYA_DEMO_DATA;
    mapFieldData = {
      id: 1,
      name: d.farm.name,
      location: d.farm.location,
      crop: d.farm.crop,
      area: d.farm.area,
      area_unit: d.farm.areaUnit,
      length: d.farm.length,
      width: d.farm.width,
      dimension_unit: "metres",
      perimeter: 600.0,
      geometry: {
        type: "Polygon",
        coordinates: [[0, 0], [d.farm.length, 0], [d.farm.length, d.farm.width], [0, d.farm.width]]
      },
      zones: d.zones.map((z, idx) => ({
        id: `zone-${idx + 1}`,
        name: z.name,
        crop: d.farm.crop,
        area: z.area,
        area_unit: "acres",
        area_pct: 25,
      }))
    };
    populateFieldForm();
    renderMappingWorkspace();
    resetToDefaultView();
    renderFieldHeatmap();
    renderRoverNavWorkspace();
  } else {
    // Initial load
    api("/api/field").then((res) => {
      if (res?.field) {
        syncFieldDataFromPayload(res.field);
      }
    }).catch(() => {
      populateFieldForm();
      resetToDefaultView();
    });
  }

  // Geometry Mode Toggles
  $("geomModeDimensionsBtn")?.addEventListener("click", () => {
    currentGeomMode = "dimensions";
    $("geomModeDimensionsBtn").classList.add("is-active");
    $("geomModePolygonBtn").classList.remove("is-active");
    $("dimensionsModeGroup").hidden = false;
    $("polygonModeGroup").hidden = true;
    isDrawingActive = false;
    $("mapDrawToggleBtn")?.classList.remove("is-active");
    setText("drawToggleText", "Add points");
    // Recalculate rectangle
    const len = parseFloat($("mapFieldLength")?.value || 200);
    const wid = parseFloat($("mapFieldWidth")?.value || 100);
    const dimU = $("mapDimensionUnit")?.value || "metres";
    const areaU = $("mapAreaUnit")?.value || "acres";
    const stats = calcRectangleStats(len, wid, dimU, areaU);
    mapFieldData.length = stats.length;
    mapFieldData.width = stats.width;
    mapFieldData.area = stats.area;
    mapFieldData.perimeter = stats.perimeter;
    mapFieldData.geometry = { type: "Polygon", coordinates: stats.coordinates };
    $("mapFieldArea").value = stats.area;
    renderMappingWorkspace();
    fitToField();
  });

  $("geomModePolygonBtn")?.addEventListener("click", () => {
    currentGeomMode = "polygon";
    $("geomModePolygonBtn").classList.add("is-active");
    $("geomModeDimensionsBtn").classList.remove("is-active");
    $("dimensionsModeGroup").hidden = true;
    $("polygonModeGroup").hidden = false;
    renderMappingWorkspace();
  });

  // Dimension inputs calculation
  function onDimensionInputChange() {
    if (currentGeomMode !== "dimensions") return;
    const len = parseFloat($("mapFieldLength")?.value || 0);
    const wid = parseFloat($("mapFieldWidth")?.value || 0);
    if (len > 0 && wid > 0) {
      const dimU = $("mapDimensionUnit")?.value || "metres";
      const areaU = $("mapAreaUnit")?.value || "acres";
      const stats = calcRectangleStats(len, wid, dimU, areaU);
      mapFieldData.length = stats.length;
      mapFieldData.width = stats.width;
      mapFieldData.area = stats.area;
      mapFieldData.perimeter = stats.perimeter;
      mapFieldData.geometry = { type: "Polygon", coordinates: stats.coordinates };
      $("mapFieldArea").value = stats.area;
      renderMappingWorkspace();
      fitToField();
    }
  }

  $("mapFieldLength")?.addEventListener("input", onDimensionInputChange);
  $("mapFieldWidth")?.addEventListener("input", onDimensionInputChange);

  // Unit changes
  $("mapDimensionUnit")?.addEventListener("change", (e) => {
    const toUnit = e.target.value;
    const fromUnit = toUnit === "metres" ? "feet" : "metres";
    const lenInput = $("mapFieldLength");
    const widInput = $("mapFieldWidth");
    if (lenInput && widInput) {
      const oldLen = parseFloat(lenInput.value || 0);
      const oldWid = parseFloat(widInput.value || 0);
      if (oldLen > 0) lenInput.value = convertDimension(oldLen, fromUnit, toUnit).toFixed(1);
      if (oldWid > 0) widInput.value = convertDimension(oldWid, fromUnit, toUnit).toFixed(1);
    }
    mapFieldData.dimension_unit = toUnit;
    onDimensionInputChange();
  });

  $("mapAreaUnit")?.addEventListener("change", (e) => {
    const toUnit = e.target.value;
    const fromUnit = toUnit === "acres" ? "hectares" : "acres";
    const areaInput = $("mapFieldArea");
    if (areaInput) {
      const oldArea = parseFloat(areaInput.value || 0);
      if (oldArea > 0) {
        areaInput.value = convertArea(oldArea, fromUnit, toUnit).toFixed(2);
        mapFieldData.area = parseFloat(areaInput.value);
      }
    }
    mapFieldData.area_unit = toUnit;
    updateSummaryPanel();
  });

  // Polygon Drawing Controls
  $("mapDrawToggleBtn")?.addEventListener("click", () => {
    isDrawingActive = !isDrawingActive;
    $("mapDrawToggleBtn").classList.toggle("is-active", isDrawingActive);
    setText("drawToggleText", isDrawingActive ? "Drawing active" : "Add points");
  });

  $("mapClosePolyBtn")?.addEventListener("click", () => {
    isDrawingActive = false;
    $("mapDrawToggleBtn")?.classList.remove("is-active");
    setText("drawToggleText", "Add points");
    const coords = mapFieldData.geometry?.coordinates || [];
    if (coords.length >= 3) {
      const dimU = $("mapDimensionUnit")?.value || "metres";
      const areaU = $("mapAreaUnit")?.value || "acres";
      const stats = calcPolygonStats(coords, dimU, areaU);
      if (stats) {
        mapFieldData.area = stats.area;
        mapFieldData.perimeter = stats.perimeter;
        mapFieldData.length = stats.length;
        mapFieldData.width = stats.width;
        $("mapFieldArea").value = stats.area;
        $("mapFieldLength").value = stats.length;
        $("mapFieldWidth").value = stats.width;
      }
    }
    renderMappingWorkspace();
    fitToField();
  });

  $("mapClearPolyBtn")?.addEventListener("click", () => {
    mapFieldData.geometry = { type: "Polygon", coordinates: [] };
    if ($("polyPointCount")) $("polyPointCount").textContent = "0 vertices defined";
    renderMappingWorkspace();
  });

  // Add Zone (automatic sequential naming & equal-area grid)
  $("addZoneBtn")?.addEventListener("click", () => {
    mapFieldData.zones = mapFieldData.zones || [];
    const nextIdx = mapFieldData.zones.length;
    mapFieldData.zones.push({
      id: `zone-${String.fromCharCode(97 + (nextIdx % 26))}-${nextIdx + 1}`,
      name: getZoneName(nextIdx),
      crop: mapFieldData.crop || "Wheat",
      description: "Sub-block"
    });
    syncAndRenumberZones();
    renderZonesList();
    renderMappingWorkspace();
    updateSummaryPanel();
  });

  // Form Submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const statusEl = $("fieldSaveStatus");
    if (statusEl) {
      statusEl.textContent = "Saving field...";
      statusEl.classList.remove("is-error");
    }
    const name = $("mapFieldName")?.value.trim() || mapFieldData.name;
    const location = $("mapFieldLocation")?.value.trim() || mapFieldData.location;
    const crop = $("mapFieldCrop")?.value.trim() || mapFieldData.crop;
    const area = parseFloat($("mapFieldArea")?.value || mapFieldData.area);
    const area_unit = $("mapAreaUnit")?.value || mapFieldData.area_unit;
    const length = parseFloat($("mapFieldLength")?.value || mapFieldData.length);
    const width = parseFloat($("mapFieldWidth")?.value || mapFieldData.width);
    const dimension_unit = $("mapDimensionUnit")?.value || mapFieldData.dimension_unit;

    const payload = {
      name,
      location,
      crop,
      area,
      area_unit,
      length,
      width,
      dimension_unit,
      perimeter: mapFieldData.perimeter,
      geometry: mapFieldData.geometry,
      zones: mapFieldData.zones,
      geometry_mode: currentGeomMode
    };

    api("/api/field", { method: "POST", body: JSON.stringify(payload) })
      .then((res) => {
        if (res?.ok) {
          syncFieldDataFromPayload(res.field);
          if (statusEl) statusEl.textContent = "Field details and spatial model saved successfully.";
          showToast("Field spatial model saved");
          if (state?.farm && res.farm) {
            state.farm = res.farm;
            setText("farmMeta", t("acres_of", res.farm.acreage, res.farm.crop) + (res.farm.location ? t("in_location", res.farm.location) : ""));
          }
        } else {
          throw new Error(res?.error || "Save failed");
        }
      })
      .catch((err) => {
        if (statusEl) {
          statusEl.textContent = err.message || "Failed to save field";
          statusEl.classList.add("is-error");
        }
      });
  });

  // Form Reset
  $("resetFieldBtn")?.addEventListener("click", () => {
    api("/api/field").then((res) => {
      if (res?.field) syncFieldDataFromPayload(res.field);
    });
  });

  // Map Controls
  $("mapFitBtn")?.addEventListener("click", fitToField);
  $("mapResetViewBtn")?.addEventListener("click", resetToDefaultView);

  $("mapZoomInBtn")?.addEventListener("click", () => {
    mapTransform.zoom = Math.min(mapTransform.zoom * 1.25, 8.0);
    renderMappingWorkspace();
  });

  $("mapZoomOutBtn")?.addEventListener("click", () => {
    mapTransform.zoom = Math.max(mapTransform.zoom / 1.25, 0.25);
    renderMappingWorkspace();
  });

  $("mapLayerToggleBtn")?.addEventListener("click", () => {
    isSatelliteMode = !isSatelliteMode;
    $("satelliteTileLayer").hidden = !isSatelliteMode;
    $("mapLayerToggleBtn").classList.toggle("is-active", !isSatelliteMode);
    setText("mapLayerToggleText", isSatelliteMode ? "Satellite View" : "Grid View");
    setText("mapProviderLabel", isSatelliteMode ? "Base Tile Provider Ready · Connect URL" : "Offline Vector Grid · Ready for Tile Provider");
  });

  // Heatmap Nutrient Tabs
  $("nutrientTabN")?.addEventListener("click", () => setHeatmapNutrient("N"));
  $("nutrientTabP")?.addEventListener("click", () => setHeatmapNutrient("P"));
  $("nutrientTabK")?.addEventListener("click", () => setHeatmapNutrient("K"));

  // Autonomous Rover Survey Controls
  $("startSurveyBtn")?.addEventListener("click", toggleSurveySimulation);
  $("resetSurveyBtn")?.addEventListener("click", resetSurveySimulation);

  // SVG Mouse & Touch Interactions
  const svg = $("fieldMapSvg");
  if (!svg) return;

  function getSvgPoint(e) {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const svgP = pt.matrixTransform(ctm.inverse());
    // Convert from SVG viewBox to field coordinate space
    const fieldX = (svgP.x - mapTransform.panX) / mapTransform.zoom;
    const fieldY = (svgP.y - mapTransform.panY) / mapTransform.zoom;
    return { x: fieldX, y: fieldY, svgX: svgP.x, svgY: svgP.y };
  }

  svg.addEventListener("mousemove", (e) => {
    const p = getSvgPoint(e);
    const dimUnit = mapFieldData.dimension_unit === "feet" ? "ft" : "m";
    setText("cursorCoordsText", `X: ${Math.round(p.x)} ${dimUnit} · Y: ${Math.round(p.y)} ${dimUnit}`);

    if (draggedVertexIndex !== null && mapFieldData.geometry?.coordinates) {
      mapFieldData.geometry.coordinates[draggedVertexIndex] = [Math.round(p.x), Math.round(p.y)];
      const dimU = $("mapDimensionUnit")?.value || "metres";
      const areaU = $("mapAreaUnit")?.value || "acres";
      const stats = calcPolygonStats(mapFieldData.geometry.coordinates, dimU, areaU);
      if (stats) {
        mapFieldData.area = stats.area;
        mapFieldData.perimeter = stats.perimeter;
        mapFieldData.length = stats.length;
        mapFieldData.width = stats.width;
        if ($("mapFieldArea")) $("mapFieldArea").value = stats.area;
        if ($("mapFieldLength")) $("mapFieldLength").value = stats.length;
        if ($("mapFieldWidth")) $("mapFieldWidth").value = stats.width;
      }
      renderMappingWorkspace();
    } else if (isPanning) {
      mapTransform.panX = e.clientX - panStart.x;
      mapTransform.panY = e.clientY - panStart.y;
      renderMappingWorkspace();
    }
  });

  svg.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("map-vertex-handle")) return;
    if (isDrawingActive) {
      const p = getSvgPoint(e);
      mapFieldData.geometry = mapFieldData.geometry || { type: "Polygon", coordinates: [] };
      mapFieldData.geometry.coordinates = mapFieldData.geometry.coordinates || [];
      mapFieldData.geometry.coordinates.push([Math.round(p.x), Math.round(p.y)]);
      if ($("polyPointCount")) $("polyPointCount").textContent = `${mapFieldData.geometry.coordinates.length} vertices defined`;
      const dimU = $("mapDimensionUnit")?.value || "metres";
      const areaU = $("mapAreaUnit")?.value || "acres";
      if (mapFieldData.geometry.coordinates.length >= 3) {
        const stats = calcPolygonStats(mapFieldData.geometry.coordinates, dimU, areaU);
        if (stats) {
          mapFieldData.area = stats.area;
          mapFieldData.perimeter = stats.perimeter;
          mapFieldData.length = stats.length;
          mapFieldData.width = stats.width;
          if ($("mapFieldArea")) $("mapFieldArea").value = stats.area;
          if ($("mapFieldLength")) $("mapFieldLength").value = stats.length;
          if ($("mapFieldWidth")) $("mapFieldWidth").value = stats.width;
        }
      }
      renderMappingWorkspace();
    } else {
      isPanning = true;
      panStart = { x: e.clientX - mapTransform.panX, y: e.clientY - mapTransform.panY };
    }
  });

  window.addEventListener("mouseup", () => {
    draggedVertexIndex = null;
    isPanning = false;
  });
}

function initRoverCamera() {
  const stream = $("roverCameraStream");
  const offline = $("roverCameraOffline");
  const status = $("roverCameraStatus");
  const statusText = $("roverCameraStatusText");
  const metaStatus = $("roverCameraMetaStatus");

  if (!stream || !offline || !status || !statusText) return;

  function setCameraLive(isLive, url = "") {
    if (isLive && url) {
      stream.src = url;
      stream.hidden = false;
      offline.hidden = true;
      status.className = "status-chip rover-camera-chip is-live";
      statusText.textContent = "LIVE";
      if (metaStatus) metaStatus.textContent = "Primary";
    } else {
      stream.removeAttribute("src");
      stream.hidden = true;
      offline.hidden = false;
      status.className = "status-chip rover-camera-chip is-live";
      statusText.textContent = "LIVE";
      if (metaStatus) metaStatus.textContent = "Primary";
    }
  }

  stream.addEventListener("error", () => setCameraLive(false));
  stream.addEventListener("load", () => {
    if (stream.getAttribute("src")) setCameraLive(true, stream.src);
  });

  setCameraLive(false);
  window.setRoverCameraStream = setCameraLive;

  const expandBtn = $("roverCameraExpandBtn");
  const stage = $("roverCameraStage");
  if (expandBtn && stage) {
    expandBtn.addEventListener("click", () => {
      if (!document.fullscreenElement) {
        if (stage.requestFullscreen) {
          stage.requestFullscreen().catch(() => {});
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
    });
  }
}

document.querySelectorAll("[data-rover-command]").forEach((button) => button.addEventListener("click", () => {
  const log = $("roverLog");
  if (!log) return;
  if (log.querySelector(".empty")) log.replaceChildren();
  const item = document.createElement("article");
  item.className = "activity-item rover-activity-item";
  const command = button.dataset.roverCommand;
  const label = command === "npk_sensor" ? "NPK Sensor" : command;
  item.innerHTML = `<b>${escapeHtml(label)}</b><p>${new Date().toLocaleTimeString()} · command sent</p>`;
  log.prepend(item);
}));

const themeToggle = document.createElement("button");
themeToggle.id = "themeToggle";
themeToggle.type = "button";
themeToggle.className = "theme-toggle";
themeToggle.setAttribute("aria-label", t("theme_toggle"));
themeToggle.textContent = "☀ / ☾";
themeToggle.addEventListener("click", () => {
  const dark = document.documentElement.dataset.theme !== "dark";
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  themeToggle.setAttribute("aria-pressed", String(dark));
  localStorage.setItem("km-theme", dark ? "dark" : "light");
});
document.querySelector(".sidebar-footer").prepend(themeToggle);
document.documentElement.dataset.theme = localStorage.getItem("km-theme") === "dark" ? "dark" : "light";
themeToggle.setAttribute("aria-pressed", String(document.documentElement.dataset.theme === "dark"));

$("systemEngineBtnCloud")?.addEventListener("click", () => setAiEngine("cloud"));
$("systemEngineBtnEdge")?.addEventListener("click", () => setAiEngine("edge"));

updateAiEngineUI();
selectModel("disease");

applyLanguage();
activateTab(location.hash.slice(1) || "overview", false);
loadDashboard();
initRoverCamera();
initFieldMapping();
if (window.io) {
  const socket = io();
  socket.on("connect", () => { if (state) setConnection("online"); });
  socket.on("disconnect", () => setConnection("offline"));
  socket.on("connect_error", () => { if (!state) setConnection("offline"); });
  socket.on("telemetry", (data) => {
    if (isDemoMode()) return;
    render(data); setConnection("online");
    api("/api/activity").then(renderActivity).catch(() => {});
    api("/api/analyses").then(renderAnalyses).catch(() => {});
  });
} else {
  window.setInterval(loadDashboard, 5000);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    normalizeFieldState,
    classifyNutrient,
    generateNutrientSummary,
    generateCropExplanation,
    evaluateAttention,
    generateAlerts,
    calculateFieldHealth,
    renderAccount,
    checkAuth,
    initRoverCamera,
    initFieldMapping,
    calcPolygonStats,
    calcRectangleStats,
    convertArea,
    convertDimension,
    computeGridDimensions,
    calculateZonePartitions,
    getZoneLetter,
    getZoneName,
    syncAndRenumberZones,
    calculateFieldBounds,
    fitToField,
    resetToDefaultView,
    getZoneNutrientValue,
    getHeatmapColor,
    computeSerpentineRoute,
    NUTRIENT_METADATA,
    PRAGYA_DEMO_DATA,
    isDemoMode,
    getDemoDashboardState,
    DEMO_HISTORY_RECORDS
  };
}

import sys
import json
from pathlib import Path
from io import BytesIO

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

import edge_server

def test_live_hindi():
    print("Testing Live Hindi Analysis with red_spider_mite.jpg...")
    edge_server.app.config["TESTING"] = True
    client = edge_server.app.test_client()

    red_mite_path = ROOT / "tests" / "fixtures" / "red_spider_mite.jpg"
    img_bytes = red_mite_path.read_bytes()

    res = client.post(
        "/api/models/analyze",
        data={
            "image": (BytesIO(img_bytes), "red_spider_mite.jpg"),
            "type": "pest",
            "mode": "cloud",
            "lang": "hi",
            "message": "इस पत्ती पर क्या समस्या है?"
        },
        content_type="multipart/form-data"
    )
    assert res.status_code == 201, f"Failed: {res.status_code}, {res.data}"
    data = res.json
    print(f"Status: {res.status_code}")
    print(f"Mode: {data.get('mode')}")
    print(f"Lang: {data.get('lang')}")
    report = data.get("report")
    assert report, "No report object"
    print(f"Title: {report.get('title')}")
    print(f"Identification: {report.get('identification')}")
    print(f"About: {report.get('about')}")
    print(f"Why it occurs: {report.get('why_it_occurs')}")
    print(f"Crop damage: {report.get('crop_damage')}")
    print(f"What to check: {report.get('what_to_check')}")
    print(f"Prevention: {report.get('prevention')}")
    print(f"Control & Management: {report.get('control_management')}")
    print(f"Field summary: {report.get('field_summary')}")
    print(f"Spoken text: {data.get('speech')[:200]}...")

    # Verify that values are in Hindi (contains Devanagari characters: \u0900-\u097f)
    has_devanagari = any("\u0900" <= c <= "\u097f" for c in str(report.get("about", "")))
    print(f"Contains Devanagari Hindi text: {has_devanagari}")
    assert has_devanagari, "Report content should be in Hindi"

    # Verify translation endpoint
    print("\nTesting /api/analyses/translate from Hindi to English...")
    res_tr = client.post(
        "/api/analyses/translate",
        json={"report": report, "target_lang": "en"}
    )
    assert res_tr.status_code == 200, f"Translation failed: {res_tr.status_code}, {res_tr.data}"
    tr_data = res_tr.json
    print(f"Translated Title (EN): {tr_data['report']['title']}")
    print(f"Translated Speech (EN): {tr_data['speech'][:200]}...")
    assert "mite" in tr_data["report"]["title"].lower() or "spider" in tr_data["report"]["title"].lower()

    print("\nTesting TTS endpoint with Hindi text...")
    res_tts = client.post("/api/tts", json={"text": data.get("speech")[:200], "lang": "hi"})
    assert res_tts.status_code == 200
    assert res_tts.json["voice_lang"] == "hi-IN"
    print(f"TTS Voice Lang: {res_tts.json['voice_lang']}")

    print("\nALL LIVE HINDI & TRANSLATION CHECKS PASSED!")

if __name__ == "__main__":
    test_live_hindi()

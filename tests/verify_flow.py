import os
import sys
from pathlib import Path
from io import BytesIO
from unittest import mock

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

import edge_server
from cloud_service import CloudError

def run_verification():
    print("==================================================")
    print("STARTING VERIFICATION OF 7 ARCHITECTURE TEST CASES")
    print("==================================================")
    
    edge_server.app.config["TESTING"] = True
    client = edge_server.app.test_client()
    edge_server.initialise_database()
    
    red_mite_path = ROOT / "tests" / "fixtures" / "red_spider_mite.jpg"
    assert red_mite_path.exists(), f"Missing fixture: {red_mite_path}"
    red_mite_bytes = red_mite_path.read_bytes()
    print(f"Loaded actual red spider mite fixture: {len(red_mite_bytes)} bytes")

    # ----------------------------------------------------
    # TEST 1: CLOUD IMAGE (Gemini Vision with actual image)
    # ----------------------------------------------------
    print("\n--- TEST 1: CLOUD IMAGE ANALYSIS ---")
    res1 = client.post(
        "/api/models/analyze",
        data={
            "image": (BytesIO(red_mite_bytes), "red_spider_mite.jpg"),
            "type": "pest",
            "mode": "cloud",
            "message": "What pest is this?"
        },
        content_type="multipart/form-data"
    )
    assert res1.status_code == 201, f"Status: {res1.status_code}, data: {res1.get_data(as_text=True)}"
    data1 = res1.json
    print(f"Mode: {data1.get('mode')}")
    print(f"Model: {data1.get('model')}")
    report1 = data1.get("report")
    assert report1 is not None, "Expected structured report object in response"
    print(f"Structured Report Title: {report1.get('title')}")
    print(f"Structured Identification: {report1.get('identification')}")
    print(f"Field Summary: {report1.get('field_summary')}")
    
    # Assert all 8 sections are present
    assert "identification" in report1
    assert "about" in report1
    assert "why_it_occurs" in report1
    assert "crop_damage" in report1 or "what_we_see" in report1
    assert "what_to_check" in report1
    assert "prevention" in report1
    assert "control_management" in report1
    assert "field_summary" in report1

    # Assert speech is logical, non-empty, and free of JSON syntax
    speech1 = data1.get("speech", "")
    assert speech1 and "{" not in speech1 and "}" not in speech1

    analysis_text = data1.get("cloud_analysis") or data1.get("analysis") or ""
    print(f"Cloud Analysis excerpt:\n{analysis_text[:250]}...")
    assert data1["mode"] == "cloud"
    assert "spider" in analysis_text.lower() or "mite" in analysis_text.lower() or "pest" in analysis_text.lower()
    print(">>> TEST 1 PASSED: Gemini Vision directly inspected image and produced structured pest analysis!")

    # ----------------------------------------------------
    # TEST 2: EDGE IMAGE (Local ONNX model only, no Gemini)
    # ----------------------------------------------------
    print("\n--- TEST 2: EDGE IMAGE ANALYSIS ---")
    with mock.patch.object(edge_server.cloud, "generate_result") as mock_gemini:
        res2 = client.post(
            "/api/models/analyze",
            data={
                "image": (BytesIO(red_mite_bytes), "red_spider_mite.jpg"),
                "type": "pest",
                "mode": "edge",
            },
            content_type="multipart/form-data"
        )
        assert res2.status_code == 201
        data2 = res2.json
        print(f"Mode: {data2.get('mode')}")
        print(f"Model: {data2.get('model')}")
        print(f"Recognized: {data2.get('recognized')}")
        print(f"Analysis: {data2.get('analysis')}")
        assert data2["mode"] == "edge"
        assert data2["model"] == "pest_yolo11s.onnx"
        mock_gemini.assert_not_called()
    print(">>> TEST 2 PASSED: Local pest ONNX model ran independently. Gemini was NOT called!")

    # ----------------------------------------------------
    # TEST 3: CLOUD TEXT (Gemini farm question)
    # ----------------------------------------------------
    print("\n--- TEST 3: CLOUD TEXT CHAT ---")
    res3 = client.post("/api/chat", json={"message": "What are optimal soil pH levels for wheat?", "mode": "cloud"})
    assert res3.status_code == 200
    data3 = res3.json
    print(f"Mode: {data3.get('mode')}")
    print(f"Answer excerpt: {data3.get('answer', '')[:200]}...")
    assert data3["mode"] == "cloud"
    assert len(data3["answer"]) > 10
    print(">>> TEST 3 PASSED: Cloud text chat successfully called Gemini!")

    # ----------------------------------------------------
    # TEST 4: EDGE TEXT (Offline local rules, no Gemini)
    # ----------------------------------------------------
    print("\n--- TEST 4: EDGE TEXT CHAT ---")
    with mock.patch.object(edge_server.cloud, "generate") as mock_gemini_text:
        res4 = client.post("/api/chat", json={"message": "What is my soil moisture reading?", "mode": "edge"})
        assert res4.status_code == 200
        data4 = res4.json
        print(f"Mode: {data4.get('mode')}")
        print(f"Answer: {data4.get('answer')}")
        assert data4["mode"] == "edge"
        mock_gemini_text.assert_not_called()
    print(">>> TEST 4 PASSED: Edge text chat answered from local context without Gemini!")

    # ----------------------------------------------------
    # TEST 5: NO INTERNET / FALLBACK BEHAVIOR
    # ----------------------------------------------------
    print("\n--- TEST 5: CLOUD FAILURE FALLBACK TO EDGE ---")
    with mock.patch.object(edge_server.cloud, "generate_result", side_effect=CloudError("network_error", "Connection timed out")):
        res5 = client.post(
            "/api/models/analyze",
            data={
                "image": (BytesIO(red_mite_bytes), "red_spider_mite.jpg"),
                "type": "pest",
                "mode": "cloud",
            },
            content_type="multipart/form-data"
        )
        assert res5.status_code == 201
        data5 = res5.json
        print(f"Mode: {data5.get('mode')}")
        print(f"Fallback flag: {data5.get('fallback')}")
        print(f"Cloud error note: {data5.get('cloud_error')}")
        assert data5["mode"] == "edge"
        assert data5["fallback"] is True
        assert "Cloud AI unavailable" in data5["cloud_error"]
    print(">>> TEST 5 PASSED: Cloud failure seamlessly fell back to Edge AI with clear fallback indicator!")

    # ----------------------------------------------------
    # TEST 6: NO GEMINI KEY
    # ----------------------------------------------------
    print("\n--- TEST 6: NO GEMINI KEY FALLBACK ---")
    orig_key = edge_server.cloud.key
    try:
        edge_server.cloud.key = ""
        res6 = client.post(
            "/api/chat/image",
            data={
                "image": (BytesIO(red_mite_bytes), "red_spider_mite.jpg"),
                "message": "What is on this leaf?",
                "mode": "cloud",
            },
            content_type="multipart/form-data"
        )
        assert res6.status_code == 201
        data6 = res6.json
        print(f"Mode: {data6.get('mode')}")
        print(f"Fallback flag: {data6.get('fallback')}")
        assert data6["mode"] == "edge"
        assert data6["fallback"] is True
        # Check API key was not leaked
        assert orig_key not in res6.get_data(as_text=True)
    finally:
        edge_server.cloud.key = orig_key
    print(">>> TEST 6 PASSED: Missing API key safely fell back to Edge AI without leaking secrets!")

    # ----------------------------------------------------
    # TEST 7: CHATBOT IMAGE FLOW (Both Cloud & Edge)
    # ----------------------------------------------------
    print("\n--- TEST 7: CHATBOT IMAGE FLOW ---")
    # Cloud AI
    res7_cloud = client.post(
        "/api/chat/image",
        data={
            "image": (BytesIO(red_mite_bytes), "red_spider_mite.jpg"),
            "message": "What pest is this?",
            "mode": "cloud",
        },
        content_type="multipart/form-data"
    )
    assert res7_cloud.status_code == 201
    data7_cloud = res7_cloud.json
    print(f"Chat Cloud Mode: {data7_cloud.get('mode')}")
    print(f"Chat Cloud Answer excerpt: {data7_cloud.get('answer', '')[:200]}...")
    assert data7_cloud["mode"] == "cloud"
    assert data7_cloud.get("report") is not None
    assert "identification" in data7_cloud["report"]
    assert "field_summary" in data7_cloud["report"]
    
    # Edge AI
    with mock.patch.object(edge_server.cloud, "generate_result") as mock_gemini_chat:
        res7_edge = client.post(
            "/api/chat/image",
            data={
                "image": (BytesIO(red_mite_bytes), "red_spider_mite.jpg"),
                "message": "What pest is this?",
                "mode": "edge",
            },
            content_type="multipart/form-data"
        )
        assert res7_edge.status_code == 201
        data7_edge = res7_edge.json
        print(f"Chat Edge Mode: {data7_edge.get('mode')}")
        print(f"Chat Edge Model: {data7_edge.get('model')}")
        assert data7_edge["mode"] == "edge"
        mock_gemini_chat.assert_not_called()
    print(">>> TEST 7 PASSED: Chatbot image flow verified for both Cloud AI and Edge AI!")

    # ----------------------------------------------------
    # HISTORY VERIFICATION (Mode persistence)
    # ----------------------------------------------------
    print("\n--- HISTORY MODE PERSISTENCE ---")
    res_hist = client.get("/api/analyses")
    assert res_hist.status_code == 200
    analyses = res_hist.json
    print(f"Total analyses in history: {len(analyses)}")
    modes_found = set(item.get("mode") for item in analyses)
    print(f"Modes recorded in history: {modes_found}")
    assert "cloud" in modes_found
    assert "edge" in modes_found
    print(">>> HISTORY VERIFIED: Stored and returned modes accurately!")

    print("\n==================================================")
    print("ALL 7 TEST CASES AND HISTORY SUCCESSFULLY VERIFIED!")
    print("==================================================")

if __name__ == "__main__":
    run_verification()

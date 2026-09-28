import re
import urllib.request

def verify_live_server():
    resp = urllib.request.urlopen("http://localhost:3000/")
    assert resp.status == 200, f"Expected 200, got {resp.status}"
    html = resp.read().decode("utf-8")

    # 1. System page checks
    assert 'id="aiEngineTitle"' in html, "Missing AI Engine title on System page"
    assert 'id="systemEngineBtnCloud"' in html, "Missing Cloud AI button in System settings"
    assert 'id="systemEngineBtnEdge"' in html, "Missing Edge AI button in System settings"
    assert 'id="systemEngineStatusLine"' in html, "Missing status line in System settings"
    assert 'data-i18n="ai_engine_desc"' in html, "Missing description translation key"
    assert 'data-i18n="cloud_engine_desc"' in html, "Missing Cloud engine description key"
    assert 'data-i18n="edge_engine_desc"' in html, "Missing Edge engine description key"
    print("PASS: System page contains AI Engine section with Cloud/Edge controls and status line.")

    # 2. AI Models page checks
    assert 'id="modeBtnCloud"' not in html, "Found obsolete modeBtnCloud on Models page"
    assert 'id="modeBtnEdge"' not in html, "Found obsolete modeBtnEdge on Models page"
    assert 'class="panel ai-mode-card"' not in html, "Found obsolete ai-mode-card on Models page"
    assert 'id="aiModeTitle"' not in html, "Found obsolete aiModeTitle on Models page"
    print("PASS: AI Models page has NO AI mode/engine toggle.")

    # 3. Chatbot page checks
    assert 'id="chatModeBar"' not in html, "Found obsolete chatModeBar on Chatbot page"
    assert 'id="chatModeBtnCloud"' not in html, "Found obsolete chatModeBtnCloud on Chatbot page"
    assert 'id="chatModeBtnEdge"' not in html, "Found obsolete chatModeBtnEdge on Chatbot page"
    print("PASS: Chatbot page has NO AI mode/engine toggle.")

    # 4. JavaScript verification
    js_resp = urllib.request.urlopen("http://localhost:3000/js/app.js")
    js = js_resp.read().decode("utf-8")

    assert "ai_engine_title" in js and "AI Engine" in js, "Missing English translation for ai_engine_title"
    assert "AI इंजन" in js, "Missing Hindi translation for ai_engine_title"
    assert "Current engine: Cloud AI" in js, "Missing English status string"
    assert "वर्तमान इंजन: क्लाउड AI" in js, "Missing Hindi status string"
    assert "Current engine: Edge AI" in js, "Missing English Edge status string"
    assert "वर्तमान इंजन: एज AI" in js, "Missing Hindi Edge status string"
    assert "getAiEngine" in js and "setAiEngine" in js, "Missing engine getter/setter functions"
    assert "kisan_ai_engine" in js, "Missing localStorage persistence for kisan_ai_engine"

    print("PASS: Frontend JS has complete single-source-of-truth implementation with English and Hindi translations.")

    # 5. CSS verification
    css_resp = urllib.request.urlopen("http://localhost:3000/css/main.css")
    css = css_resp.read().decode("utf-8")
    assert ".engine-desc-list" in css, "Missing CSS rule for .engine-desc-list"
    assert ".engine-status-line" in css, "Missing CSS rule for .engine-status-line"
    print("PASS: main.css has correct styling for AI Engine card.")

if __name__ == "__main__":
    verify_live_server()

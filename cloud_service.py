"""Optional Gemini analysis. A failed request leaves local model results usable."""
from __future__ import annotations

import base64
import json
import logging
import os
import re
import time
from dataclasses import dataclass
from io import BytesIO
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from PIL import Image

logger = logging.getLogger("kisan_mitra.cloud")

DEFAULT_MODEL = "gemini-2.5-flash"
FALLBACK_MODELS = ("gemini-2.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-2.5-flash-lite", "gemini-3.8-flash")


def prepare_image_for_gemini(raw_image: bytes, max_dim: int = 1200) -> tuple[str, str]:
    """Ensure image is optimized and base64-encoded for Gemini multimodal input."""
    try:
        with Image.open(BytesIO(raw_image)) as img:
            format_name = (img.format or "JPEG").upper()
            mime = "image/jpeg"
            if format_name == "PNG":
                mime = "image/png"
            elif format_name == "WEBP":
                mime = "image/webp"

            w, h = img.size
            if max(w, h) > max_dim:
                scale = max_dim / max(w, h)
                new_size = (max(1, int(w * scale)), max(1, int(h * scale)))
                img = img.resize(new_size, Image.Resampling.LANCZOS)

            buf = BytesIO()
            if format_name == "PNG":
                img.save(buf, format="PNG", optimize=True)
            elif format_name == "WEBP":
                img.save(buf, format="WEBP", quality=85)
            else:
                img = img.convert("RGB")
                img.save(buf, format="JPEG", quality=85)

            return base64.b64encode(buf.getvalue()).decode("utf-8"), mime
    except Exception as e:
        logger.warning("Could not optimize image for Gemini; sending raw bytes: %s", e)
        return base64.b64encode(raw_image).decode("utf-8"), "image/jpeg"


@dataclass(frozen=True)
class CloudResult:
    text: str
    model: str


class CloudError(Exception):
    def __init__(self, kind: str, message: str):
        super().__init__(message)
        self.kind = kind


class CloudService:
    def __init__(self) -> None:
        self.key = os.environ.get("GEMINI_API_KEY", "").strip()
        self.model = os.environ.get("GEMINI_MODEL", DEFAULT_MODEL).strip() or DEFAULT_MODEL

    @property
    def configured(self) -> bool:
        return bool(self.key)

    def generate(self, prompt: str) -> str:
        return self.generate_result(prompt).text

    def generate_result(
        self,
        prompt: str,
        image_bytes: bytes | None = None,
        mime_type: str = "image/jpeg",
        json_mode: bool = False,
    ) -> CloudResult:
        if not self.configured:
            raise CloudError("not_configured", "Gemini is not configured for online text guidance.")

        parts: list[dict] = []
        if image_bytes:
            b64_data, resolved_mime = prepare_image_for_gemini(image_bytes)
            parts.append({
                "inlineData": {
                    "mimeType": resolved_mime or mime_type,
                    "data": b64_data,
                }
            })
        parts.append({"text": prompt})

        gen_config: dict[str, Any] = {
            "maxOutputTokens": 2500,
            "temperature": 0.4 if image_bytes else 0.7,
        }
        if json_mode:
            gen_config["responseMimeType"] = "application/json"

        payload_data = {
            "contents": [{"parts": parts}],
            "generationConfig": gen_config,
        }
        payload = json.dumps(payload_data).encode("utf-8")
        models = [self.model]
        for fallback in FALLBACK_MODELS:
            if fallback not in models:
                models.append(fallback)
        failures: list[CloudError] = []
        for index, model in enumerate(models):
            is_last = index == len(models) - 1
            try:
                text = self._request(model, payload, retry=True)
                return CloudResult(text, model)
            except CloudError as error:
                failures.append(error)
                if not is_last and error.kind in {"rate_limit", "server", "timeout", "model_unavailable"}:
                    logger.info("Gemini model '%s' failed (%s); trying fallback...", model, error.kind)
                    continue
                if error.kind not in {"rate_limit", "server", "timeout", "model_unavailable"}:
                    raise
        logger.error("All Gemini model attempts failed (%d models tried). Last error: %s", len(models), failures[-1])
        raise failures[-1]

    def _request(self, model: str, payload: bytes, retry: bool) -> str:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        req = Request(url, data=payload, headers={"x-goog-api-key": self.key, "Content-Type": "application/json"}, method="POST")
        for attempt in range(2 if retry else 1):
            try:
                with urlopen(req, timeout=25) as response:
                    data = json.loads(response.read().decode("utf-8"))
                text = " ".join(
                    part["text"]
                    for candidate in data.get("candidates", [])
                    for part in candidate.get("content", {}).get("parts", [])
                    if part.get("text")
                ).strip()
                if not text:
                    raise CloudError("empty", "Gemini returned no text. Try again shortly.")
                return text[:4000]
            except HTTPError as error:
                detail = error.read().decode("utf-8", errors="replace")
                error.close()
                logger.warning("Gemini HTTP error (model=%s, code=%s): %s", model, error.code, detail[:200])
                if error.code == 429:
                    failure = CloudError("rate_limit", "Gemini request limit reached. Try again later or use a model with available quota.")
                elif error.code in {401, 403}:
                    failure = CloudError("auth", "Gemini rejected the API key. Check GEMINI_API_KEY and model access.")
                elif error.code == 404:
                    failure = CloudError("model_unavailable", "The configured Gemini model is unavailable for this API key.")
                elif error.code in {500, 502, 503, 504}:
                    failure = CloudError("server", "Gemini is temporarily unavailable. Try again shortly.")
                else:
                    failure = CloudError("request", "Gemini could not generate text. Check the model settings.")
                if attempt == 0 and retry and error.code in {429, 500, 502, 503, 504}:
                    delay = 0.35
                    if error.code == 429:
                        try:
                            message = json.loads(detail).get("error", {}).get("message", "")
                            match = re.search(r"retry in\s+(\d+(?:\.\d+)?)s", message, re.IGNORECASE)
                            if match:
                                delay = min(float(match.group(1)) + 0.5, 20)
                        except ValueError:
                            pass
                    time.sleep(delay)
                    continue
                raise failure from error
            except (TimeoutError, URLError) as error:
                logger.warning("Gemini network/timeout error (model=%s): %s", model, error)
                raise CloudError("timeout", "Gemini did not respond in time. Check the connection and try again.") from error
        raise CloudError("unavailable", "Gemini did not return an analysis.")

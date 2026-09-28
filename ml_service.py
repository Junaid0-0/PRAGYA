"""Local, offline machine-learning inference for PRAGYA."""
from __future__ import annotations

import time
from ast import literal_eval
from io import BytesIO
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import onnxruntime as ort
from PIL import Image, ImageOps, UnidentifiedImageError

ROOT = Path(__file__).resolve().parent
MODEL_DIR = ROOT / "models"
DISEASE_MODEL = MODEL_DIR / "plant_disease.onnx"
DISEASE_CALIBRATION = MODEL_DIR / "plant_disease_centroids.npz"
CROP_MODEL = MODEL_DIR / "crop_recommendation.joblib"
SOIL_MODEL = MODEL_DIR / "soil_fertility.joblib"
PEST_MODEL = MODEL_DIR / "pest_yolo11s.onnx"
PEST_CONFIDENCE_FLOOR = 0.55
PEST_NMS_IOU = 0.45

# The PlantVillage model is a closed-set classifier: it always emits a full
# softmax, so blank or out-of-distribution images get forced onto one of its 15
# classes (blank images scored 99% "Tomato_Late_blight"). The OOD gate rejects
# such inputs before a diagnosis is reported. It has three parts:
#   1. A size floor: icon-sized uploads (measured: a 32 x 32 downscale of a
#      known leaf scored 99.97% for the WRONG class -- the upscale creates a
#      smooth blob that slips past the other checks). Real photos down to
#      ~64 px still diagnose correctly, so the floor only blocks icons.
#   2. A content check: a real leaf photo has meaningful pixel variation.
#   3. A feature-space check: the image must sit inside the distance envelope
#      (built by train_disease_ood.py) of the class the model actually predicts
#      AND win by a clear softmax margin. Close-up real-world photos can sit
#      inside a class envelope yet be ambiguous (a field pepper photo scored
#      75% "Tomato_Early_blight" with a 24% runner-up); saturated in-distribution
#      softmaxes have a near-100-point margin.
MIN_IMAGE_DIM = 64
MIN_IMAGE_STD = 8.0
# Fallback when the calibration file predates margin calibration; the calibrated
# value in plant_disease_centroids.npz governs when present.
MIN_SOFTMAX_MARGIN = 0.80

# Verified against the class-directory ordering of the PlantVillage subset used
# by the downloaded 15-class EfficientNetV2 ONNX model.
DISEASE_LABELS = [
    "Pepper__bell___Bacterial_spot", "Pepper__bell___healthy", "Potato___Early_blight",
    "Potato___Late_blight", "Potato___healthy", "Tomato_Bacterial_spot",
    "Tomato_Early_blight", "Tomato_Late_blight", "Tomato_Leaf_Mold",
    "Tomato_Septoria_leaf_spot", "Tomato_Spider_mites_Two_spotted_spider_mite",
    "Tomato__Target_Spot", "Tomato__Tomato_YellowLeaf__Curl_Virus",
    "Tomato__Tomato_mosaic_virus", "Tomato_healthy",
]

TREATMENTS = {
    "Bacterial_spot": "Remove affected leaves, avoid overhead watering, and consult local guidance on copper treatment.",
    "Early_blight": "Remove lower infected leaves, improve airflow, and follow local fungicide guidance.",
    "Late_blight": "Isolate affected plants and consult local extension guidance promptly; late blight spreads quickly.",
    "Leaf_Mold": "Improve ventilation, reduce leaf wetness, and remove heavily infected material.",
    "Septoria_leaf_spot": "Remove infected leaves, keep foliage dry, and clean tools between plants.",
    "Spider_mites": "Inspect leaf undersides, isolate hotspots, and follow local integrated pest-management advice.",
    "Target_Spot": "Remove infected leaves and improve spacing and airflow before applying any treatment.",
    "YellowLeaf__Curl_Virus": "Remove severely affected plants and manage whiteflies with local agricultural guidance.",
    "mosaic_virus": "Remove infected plants, disinfect tools, and avoid handling tobacco before touching crops.",
}


class MLService:
    def __init__(self) -> None:
        self._disease_session: ort.InferenceSession | None = None
        self._disease_ood: dict[str, Any] | None = None
        self._crop_model: Any = None
        self._soil_model: Any = None
        self._pest_session: ort.InferenceSession | None = None
        self._pest_labels: dict[int, str] | None = None

    def disease_ready(self) -> bool:
        return DISEASE_MODEL.exists()

    def disease_ood_ready(self) -> bool:
        """Whether the OOD rejection calibration is installed with the model."""
        return bool(self._disease_calibration())

    def crop_ready(self) -> bool:
        return CROP_MODEL.exists()

    def soil_ready(self) -> bool:
        return SOIL_MODEL.exists()

    def pest_ready(self) -> bool:
        return PEST_MODEL.exists()

    def model_status(self) -> dict[str, dict[str, Any]]:
        """Report whether each model artefact is present, for the health endpoint."""
        return {
            "disease": {"ready": self.disease_ready(), "file": DISEASE_MODEL.name, "ood": self.disease_ood_ready()},
            "crop": {"ready": self.crop_ready(), "file": CROP_MODEL.name},
            "soil": {"ready": self.soil_ready(), "file": SOIL_MODEL.name},
            "pest": {"ready": self.pest_ready(), "file": PEST_MODEL.name},
        }

    def _disease(self) -> ort.InferenceSession:
        if self._disease_session is None:
            self._disease_session = ort.InferenceSession(str(DISEASE_MODEL), providers=["CPUExecutionProvider"])
        return self._disease_session

    def _disease_calibration(self) -> dict[str, Any]:
        """Lazily load the OOD calibration (centroids + per-class thresholds)."""
        if self._disease_ood is None:
            if DISEASE_CALIBRATION.exists():
                with np.load(DISEASE_CALIBRATION) as data:
                    self._disease_ood = {
                        "centroids": data["centroids"],
                        "thresholds": data["thresholds"],
                        "feature_output": str(data["feature_output"]),
                        "margin_threshold": float(data["margin_threshold"]) if "margin_threshold" in data else None,
                    }
            else:
                self._disease_ood = {}
        return self._disease_ood

    def _crop(self) -> Any:
        if self._crop_model is None:
            self._crop_model = joblib.load(CROP_MODEL)
        return self._crop_model

    def _soil(self) -> Any:
        if self._soil_model is None:
            self._soil_model = joblib.load(SOIL_MODEL)
        return self._soil_model

    def _pest(self) -> ort.InferenceSession:
        if self._pest_session is None:
            self._pest_session = ort.InferenceSession(str(PEST_MODEL), providers=["CPUExecutionProvider"])
            self._pest_labels = literal_eval(self._pest_session.get_modelmeta().custom_metadata_map["names"])
        return self._pest_session

    def screen_pest(self, image_bytes: bytes, leaf_result: dict[str, Any] | None = None) -> dict[str, Any]:
        """Detect IP102 pests locally; return no finding when no credible box survives."""
        if not self.pest_ready():
            raise RuntimeError("Pest model is not installed")
        try:
            with Image.open(BytesIO(image_bytes)) as loaded:
                if min(loaded.size) < MIN_IMAGE_DIM:
                    raise ValueError("Use a pest photo at least 64x64 pixels")
                oriented = ImageOps.exif_transpose(loaded)
                width, height = oriented.size
                image = ImageOps.pad(oriented.convert("RGB"), (640, 640), method=Image.Resampling.BILINEAR, color=(114, 114, 114))
        except (UnidentifiedImageError, OSError) as error:
            raise ValueError("Upload a valid JPG, PNG, or WEBP pest image") from error
        pixels = np.asarray(image, dtype=np.float32)
        if float(pixels.std()) < MIN_IMAGE_STD:
            return self._uncertain_pest()
        vector = np.transpose(pixels / 255.0, (2, 0, 1))[None].astype(np.float32)
        session = self._pest()
        start = time.perf_counter()
        output = session.run(None, {session.get_inputs()[0].name: vector})[0][0]
        inference_ms = round((time.perf_counter() - start) * 1000, 1)
        classes = output[4:].argmax(axis=0)
        confidences = output[4:].max(axis=0)
        candidates = np.where(confidences >= PEST_CONFIDENCE_FLOOR)[0]
        if not len(candidates):
            return self._uncertain_pest(inference_ms)
        # The detector can mistake leaf lesions for insects. A confident local
        # leaf diagnosis is stronger evidence for a leaf-only photo.
        leaf_result = leaf_result if leaf_result is not None else self.diagnose(image_bytes)
        if leaf_result.get("recognized"):
            return self._uncertain_pest(inference_ms)
        scale = min(640 / width, 640 / height)
        pad_x, pad_y = (640 - width * scale) / 2, (640 - height * scale) / 2
        detections: list[dict[str, Any]] = []
        boxes: list[np.ndarray] = []
        for index in sorted(candidates, key=lambda i: float(confidences[i]), reverse=True):
            cx, cy, w, h = output[:4, index]
            box = np.array([cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2], dtype=np.float32)
            if any(d["class_id"] == int(classes[index]) and self._box_iou(box, previous) > PEST_NMS_IOU for d, previous in zip(detections, boxes)):
                continue
            x1, y1, x2, y2 = box
            label = self._pest_labels[int(classes[index])]
            detections.append({
                "class_id": int(classes[index]), "label": label,
                "confidence": round(float(confidences[index]) * 100, 2),
                "box": [round(float(v), 1) for v in (
                    max(0, min(width, (x1 - pad_x) / scale)), max(0, min(height, (y1 - pad_y) / scale)),
                    max(0, min(width, (x2 - pad_x) / scale)), max(0, min(height, (y2 - pad_y) / scale)),
                )],
            })
            boxes.append(box)
            if len(detections) >= 20:
                break
        label = detections[0]["label"]
        count = len(detections)
        analysis = (
            f"Possible {label} detected ({count} candidate{'s' if count != 1 else ''}). "
            "Confirm the insect in the field before choosing any treatment. "
            "This local model detects 102 pest categories and may miss unfamiliar species."
        )
        return {
            "recognized": True, "label": label, "confidence": detections[0]["confidence"],
            "analysis": analysis, "speech": analysis, "mode": "edge", "prototype": False,
            "inference_ms": inference_ms, "detections": detections,
        }

    @staticmethod
    def _box_iou(a: np.ndarray, b: np.ndarray) -> float:
        intersection = max(0.0, float(min(a[2], b[2]) - max(a[0], b[0]))) * max(0.0, float(min(a[3], b[3]) - max(a[1], b[1])))
        area_a = max(0.0, float(a[2] - a[0])) * max(0.0, float(a[3] - a[1]))
        area_b = max(0.0, float(b[2] - b[0])) * max(0.0, float(b[3] - b[1]))
        return intersection / (area_a + area_b - intersection + 1e-9)

    @staticmethod
    def _uncertain_pest(inference_ms: float = 0.0) -> dict[str, Any]:
        analysis = (
            "No supported pest detected confidently. Retake a sharp close-up of an insect if one is visible. "
            "This local model covers 102 pest categories but can miss small or unfamiliar insects."
        )
        return {
            "recognized": False, "label": "Not recognized", "confidence": None,
            "analysis": analysis, "speech": analysis, "mode": "edge", "prototype": False,
            "inference_ms": inference_ms, "detections": [],
        }

    def _unknown_result(self, scores: np.ndarray, inference_ms: float) -> dict[str, Any]:
        """Honest response when the scan is not one of the 15 trained classes."""
        top = np.argsort(scores)[-3:][::-1]
        return {
            "label": "Unknown",
            "disease": "Not recognized",
            "healthy": False,
            "recognized": False,
            "confidence": round(float(scores[top[0]]) * 100, 2),
            "treatment": (
                "This image doesn't match any of the 15 pepper, potato, or tomato "
                "leaf classes this offline model was trained on, or it is too "
                "blurry/uniform to read. Retake a clear, close-up photo of one "
                "leaf against a plain background before treating anything."
            ),
            "inference_ms": inference_ms,
            "top_predictions": [{"label": DISEASE_LABELS[int(i)], "confidence": round(float(scores[int(i)]) * 100, 2)} for i in top],
        }

    def diagnose(self, image_bytes: bytes) -> dict[str, Any]:
        if not self.disease_ready():
            raise RuntimeError("Disease model is not installed")
        try:
            loaded = Image.open(BytesIO(image_bytes))
            if min(loaded.size) < MIN_IMAGE_DIM:
                raise ValueError(
                    f"Image is only {loaded.size[0]}x{loaded.size[1]}, which is too small to "
                    f"diagnose reliably; use a leaf photo at least {MIN_IMAGE_DIM}x{MIN_IMAGE_DIM} pixels"
                )
            image = ImageOps.exif_transpose(loaded).convert("RGB").resize((224, 224))
        except (UnidentifiedImageError, OSError) as error:
            raise ValueError("Upload a valid JPG, PNG, or WEBP leaf image") from error
        pixels = np.asarray(image, dtype=np.float32)  # Model expects 0-255 RGB pixels.
        session = self._disease()
        calibration = self._disease_calibration()
        start = time.perf_counter()
        outputs = [session.get_outputs()[0].name]
        feature_output = calibration.get("feature_output") if calibration else None
        if feature_output and any(output.name == feature_output for output in session.get_outputs()):
            outputs.append(feature_output)
        results = session.run(outputs, {session.get_inputs()[0].name: pixels[None, ...]})
        inference_ms = round((time.perf_counter() - start) * 1000, 1)
        scores = results[0][0]

        # OOD gate, part 1: a real leaf photo has meaningful pixel variation;
        # blank and near-uniform uploads are rejected before any softmax read.
        if float(pixels.std()) < MIN_IMAGE_STD:
            return self._unknown_result(scores, inference_ms)

        index = int(np.argmax(scores))

        # OOD gate, part 2: the image must sit inside the distance envelope of
        # the class the model predicts (see train_disease_ood.py). Softmax
        # confidence alone is useless out-of-distribution -- blank images score
        # 99% -- but penultimate-feature distance separates them reliably.
        if len(results) > 1:
            feature = results[1][0]
            unit = feature / (np.linalg.norm(feature) + 1e-12)
            distance = 1.0 - float(unit @ calibration["centroids"][index])
            if distance > float(calibration["thresholds"][index]):
                return self._unknown_result(scores, inference_ms)

        # OOD gate, part 3: a photo can sit inside a class envelope yet be
        # ambiguous -- a real-world pepper photo passed the distance check at
        # 75% "Tomato_Early_blight" with a 24% runner-up. In-distribution
        # PlantVillage scans have a near-saturated softmax, so require a clear
        # winning margin as well.
        ordered = np.sort(scores)[::-1]
        margin = float(ordered[0] - ordered[1])
        margin_limit = (calibration or {}).get("margin_threshold") or MIN_SOFTMAX_MARGIN
        if margin < margin_limit:
            return self._unknown_result(scores, inference_ms)

        label = DISEASE_LABELS[index]
        confidence = float(scores[index])
        healthy = "healthy" in label.lower()
        disease = label.replace("___", " - ").replace("__", " ").replace("_", " ")
        treatment = "No disease detected. Continue routine scouting and use clean tools." if healthy else next(
            (advice for fragment, advice in TREATMENTS.items() if fragment.lower() in label.lower()),
            "Isolate the affected plant and consult a local agricultural extension officer for treatment advice.",
        )
        top = np.argsort(scores)[-3:][::-1]
        return {
            "label": label, "disease": disease,
            "healthy": healthy, "recognized": True,
            "confidence": round(confidence * 100, 2),
            "treatment": treatment, "inference_ms": inference_ms,
            "top_predictions": [{"label": DISEASE_LABELS[int(i)], "confidence": round(float(scores[int(i)]) * 100, 2)} for i in top],
        }

    def recommend_crops(self, features: dict[str, float]) -> list[dict[str, Any]]:
        if not self.crop_ready():
            return []
        model = self._crop()
        vector = np.array([[features[key] for key in ("n", "p", "k", "temperature", "humidity", "ph", "rainfall")]], dtype=float)
        probabilities = model.predict_proba(vector)[0]
        top = np.argsort(probabilities)[-3:][::-1]
        return [{"crop": str(model.classes_[int(i)]).title(), "confidence": round(float(probabilities[int(i)]) * 100, 1)} for i in top]

    def assess_soil_fertility(self, features: dict[str, float]) -> dict[str, Any]:
        """Classify fertility from the six sensor/lab measurements the app collects."""
        if not self.soil_ready():
            return {"status": "unavailable", "fertility": None, "confidence": None}
        model = self._soil()
        vector = np.array([[features[key] for key in ("n", "p", "k", "ph", "ec", "organic_carbon")]], dtype=float)
        probabilities = model.predict_proba(vector)[0]
        index = int(np.argmax(probabilities))
        labels = {0: "Less fertile", 1: "Fertile", 2: "Highly fertile"}
        label = int(model.classes_[index])
        return {"status": "ready", "fertility": labels[label], "confidence": round(float(probabilities[index]) * 100, 1)}

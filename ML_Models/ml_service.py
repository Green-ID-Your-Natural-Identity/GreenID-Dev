"""
ml_service.py — GreenID ML Verification Service
=================================================
Production-ready Flask service compatible with Gunicorn.

Deploy on Railway:
  • Procfile → `web: gunicorn ml_service:app --workers 1 --timeout 120`
  • Set env vars: FRONTEND_URL, PORT, PT_MODEL_DOWNLOAD_URL (if model not bundled)

All ML models are lazy-loaded (loaded on first use) to ensure
fast cold starts and minimal memory usage on cloud platforms like Railway.
"""

import os
import sys
import logging
import tempfile
import threading
import importlib.util
from math import radians, sin, cos, sqrt, atan2

from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

# ---------------------------------------------------------------------------
# App & CORS setup
# ---------------------------------------------------------------------------

app = Flask(__name__)

# Hard cap on upload size: 100 MB (protects against memory-bomb uploads).
# Raise or lower via MAX_UPLOAD_MB env var.
_max_mb = int(os.environ.get("MAX_UPLOAD_MB", 100))
app.config["MAX_CONTENT_LENGTH"] = _max_mb * 1024 * 1024

allowed_origins = os.environ.get("FRONTEND_URL", "*")
CORS(app, resources={r"/*": {"origins": allowed_origins}})

# ---------------------------------------------------------------------------
# Structured logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger("ml_service")

# ---------------------------------------------------------------------------
# Path constants
# ---------------------------------------------------------------------------

# abspath guards against empty string when __file__ is a relative path
# (can happen under some Gunicorn configurations).
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
PLANTING_PATH = os.path.join(BASE_DIR, "planting")

# Public Transport model
IMG_SIZE = (224, 224)
PT_MODEL_PATH = os.path.join(BASE_DIR, "PublicTransport", "model", "public_transport_model")
PT_MODEL_DOWNLOAD_URL = os.environ.get("PT_MODEL_DOWNLOAD_URL", "")   # placeholder

CLASS_NAMES = ["auto_rickshaw", "bus", "metro", "not_transport"]

# ---------------------------------------------------------------------------
# Lazy-load state: all None until first use
# ---------------------------------------------------------------------------

_pt_model = None
_pt_model_lock = threading.Lock()

_cleanup_module = None
_cleanup_module_lock = threading.Lock()

_planting_modules = None          # dict with extracted functions + flags
_planting_modules_lock = threading.Lock()

# ---------------------------------------------------------------------------
# Model getters (lazy, thread-safe)
# ---------------------------------------------------------------------------


def get_pt_model():
    """Return the Public Transport TF/Keras model, loading it on first call."""
    global _pt_model

    if _pt_model is not None:
        return _pt_model

    with _pt_model_lock:
        if _pt_model is not None:          # double-checked locking
            return _pt_model

        import tensorflow as tf            # heavy import deferred

        model_path = PT_MODEL_PATH
        if not os.path.exists(model_path) and PT_MODEL_DOWNLOAD_URL:
            logger.info("PT model not found locally — attempting download…")
            _download_file(PT_MODEL_DOWNLOAD_URL, model_path)

        if not os.path.exists(model_path):
            logger.error("PT model path does not exist: %s", model_path)
            return None

        try:
            logger.info("Loading Public Transport model…")
            _pt_model = tf.keras.models.load_model(model_path)
            logger.info("Public Transport model loaded (Keras format).")
        except ValueError:
            try:
                logger.info("Retrying PT model as SavedModel / TFSMLayer…")
                tfsm_layer = tf.keras.layers.TFSMLayer(
                    model_path, call_endpoint="serving_default"
                )
                inputs = tf.keras.Input(shape=(224, 224, 3))
                outputs = tfsm_layer(inputs)
                if isinstance(outputs, dict):
                    outputs = list(outputs.values())[0]
                _pt_model = tf.keras.Model(inputs=inputs, outputs=outputs)
                logger.info("Public Transport model loaded (SavedModel format).")
            except Exception as exc:
                logger.error("Failed to load PT model: %s", exc)
                _pt_model = None
        except Exception as exc:
            logger.error("Failed to load PT model: %s", exc)
            _pt_model = None

    return _pt_model


def get_cleanup_module():
    """Return the cleanup verification module (lazy-loaded)."""
    global _cleanup_module

    if _cleanup_module is not None:
        return _cleanup_module

    with _cleanup_module_lock:
        if _cleanup_module is not None:
            return _cleanup_module

        cleanup_utils_file = os.path.join(BASE_DIR, "cleanup", "utils.py")
        if not os.path.exists(cleanup_utils_file):
            logger.error("Cleanup utils file not found: %s", cleanup_utils_file)
            return None

        try:
            logger.info("Loading cleanup verification module…")
            spec = importlib.util.spec_from_file_location("cleanup_utils", cleanup_utils_file)
            mod = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(mod)
            _cleanup_module = mod
            logger.info("Cleanup verification module loaded.")
        except Exception as exc:
            logger.error("Failed to load cleanup module: %s", exc)
            _cleanup_module = None

    return _cleanup_module


def get_planting_modules():
    """
    Return a dict with planting pipeline callables (lazy-loaded).

    Keys: 'extract_frames', 'verify_planting_from_frames', 'ensure_empty_dir'
    Returns None if loading fails.
    """
    global _planting_modules

    if _planting_modules is not None:
        return _planting_modules

    with _planting_modules_lock:
        if _planting_modules is not None:
            return _planting_modules

        if PLANTING_PATH not in sys.path:
            sys.path.insert(0, PLANTING_PATH)

        try:
            logger.info("Loading planting verification modules…")
            from video_processing.extract_frames import extract_frames
            from video_processing.verify_video import verify_planting_from_frames
            from utils.cleanup import ensure_empty_dir

            _planting_modules = {
                "extract_frames": extract_frames,
                "verify_planting_from_frames": verify_planting_from_frames,
                "ensure_empty_dir": ensure_empty_dir,
            }
            logger.info("Planting verification modules loaded.")
        except Exception as exc:
            logger.error("Failed to load planting modules: %s", exc)
            _planting_modules = None

    return _planting_modules


# ---------------------------------------------------------------------------
# Helper: optional model download
# ---------------------------------------------------------------------------


def _download_file(url: str, dest_path: str, timeout: int = 60) -> bool:
    """
    Download a file from *url* to *dest_path*.

    Uses ``requests`` with a hard timeout so a stalled download never
    blocks a Gunicorn worker indefinitely.  Returns True on success.
    """
    try:
        import requests as _requests
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        logger.info("Downloading %s → %s", url, dest_path)
        with _requests.get(url, stream=True, timeout=timeout) as resp:
            resp.raise_for_status()
            with open(dest_path, "wb") as fh:
                for chunk in resp.iter_content(chunk_size=8192):
                    fh.write(chunk)
        logger.info("Download complete: %s", dest_path)
        return True
    except Exception as exc:
        logger.error("Download failed (%s): %s", url, exc)
        # Remove partial file if it exists
        if os.path.exists(dest_path):
            os.remove(dest_path)
        return False


# ---------------------------------------------------------------------------
# File-type validation helpers
# ---------------------------------------------------------------------------

_ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
_ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".webm"}


def _validate_extension(filename: str, allowed: set) -> bool:
    """Return True if *filename* has an allowed extension (case-insensitive)."""
    ext = os.path.splitext(secure_filename(filename))[1].lower()
    return ext in allowed


# ---------------------------------------------------------------------------
# Walk verification (pure math — no ML model)
# ---------------------------------------------------------------------------


def haversine(lat1, lon1, lat2, lon2) -> float:
    """Return the great-circle distance (km) between two GPS coordinates."""
    R = 6371.0
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))


@app.route("/verify_walk", methods=["POST"])
def verify_walk():
    """Verify walk activity via GPS coordinates."""
    data = request.get_json(silent=True) or {}
    coords = data.get("coordinates", [])

    if not coords or len(coords) < 2:
        return jsonify({"error": "Not enough coordinates"}), 400

    try:
        total_distance = sum(
            haversine(coords[i]["lat"], coords[i]["lon"],
                      coords[i + 1]["lat"], coords[i + 1]["lon"])
            for i in range(len(coords) - 1)
        )
    except (KeyError, TypeError) as exc:
        return jsonify({"error": f"Invalid coordinate format: {exc}"}), 400

    threshold = 2.0  # km
    return jsonify({
        "total_distance_km": round(total_distance, 2),
        "walk_valid": total_distance >= threshold,
    })


# ---------------------------------------------------------------------------
# Public Transport verification
# ---------------------------------------------------------------------------


def _predict_transport_image(img_path: str) -> dict:
    """Run transport classification on a single image file."""
    import numpy as np
    from tensorflow.keras.preprocessing import image as tf_image
    from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

    model = get_pt_model()
    if model is None:
        raise RuntimeError("Public Transport model unavailable.")

    img = tf_image.load_img(img_path, target_size=IMG_SIZE)
    img_array = tf_image.img_to_array(img)
    img_array = preprocess_input(img_array)
    img_array = img_array[None, ...]          # add batch dim

    predictions = model.predict(img_array, verbose=0)
    predicted_index = int(predictions.argmax())
    confidence = float(predictions.max())

    return {
        "predicted_class": CLASS_NAMES[predicted_index],
        "confidence": confidence,
        "all_probabilities": {
            CLASS_NAMES[i]: float(predictions[0][i]) for i in range(len(CLASS_NAMES))
        },
    }


@app.route("/verify_public_transport", methods=["POST"])
def verify_public_transport():
    """Verify public transport activity via image classification."""
    if get_pt_model() is None:
        return jsonify({"error": "Public Transport model not available"}), 503

    if "image" not in request.files:
        data = request.get_json(silent=True) or {}
        if "image_url" in data:
            return jsonify({"error": "Direct file upload required"}), 400
        return jsonify({"error": "No image provided"}), 400

    file = request.files["image"]
    if not file.filename:
        return jsonify({"error": "No file selected"}), 400

    if not _validate_extension(file.filename, _ALLOWED_IMAGE_EXTENSIONS):
        return jsonify({"error": f"Unsupported file type. Allowed: {_ALLOWED_IMAGE_EXTENSIONS}"}), 415

    suffix = os.path.splitext(secure_filename(file.filename))[1] or ".jpg"
    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            temp_path = tmp.name
            file.save(temp_path)

        result = _predict_transport_image(temp_path)
    except Exception as exc:
        logger.error("Transport prediction error: %s", exc, exc_info=True)
        return jsonify({"error": str(exc)}), 500
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

    predicted_class = result["predicted_class"]
    confidence = result["confidence"]
    is_valid_transport = predicted_class in {"auto_rickshaw", "bus", "metro"}

    result["is_valid"] = is_valid_transport and confidence >= 0.6
    result["should_review"] = confidence < 0.6 or not is_valid_transport

    return jsonify(result)


# ---------------------------------------------------------------------------
# Planting verification
# ---------------------------------------------------------------------------


@app.route("/verify_planting", methods=["POST"])
def verify_planting():
    """Verify tree planting activity via video analysis."""
    modules = get_planting_modules()
    if modules is None:
        return jsonify({"error": "Planting model not available"}), 503

    if "video" not in request.files:
        return jsonify({"error": "No video provided"}), 400

    file = request.files["video"]
    if not file.filename:
        return jsonify({"error": "No file selected"}), 400

    if not _validate_extension(file.filename, _ALLOWED_VIDEO_EXTENSIONS):
        return jsonify({"error": f"Unsupported file type. Allowed: {_ALLOWED_VIDEO_EXTENSIONS}"}), 415

    suffix = os.path.splitext(secure_filename(file.filename))[1] or ".mp4"
    temp_video_path = None
    temp_frames_dir = None

    try:
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            temp_video_path = tmp.name
            file.save(temp_video_path)

        temp_frames_dir = tempfile.mkdtemp(prefix="planting_frames_")
        modules["ensure_empty_dir"](temp_frames_dir)

        frames = modules["extract_frames"](
            temp_video_path,
            out_dir=temp_frames_dir,
            sample_fps=1,
            max_frames=60,
        )

        if not frames:
            return jsonify({"error": "No frames extracted from video", "is_valid": False}), 400

        passed, evidence = modules["verify_planting_from_frames"](
            temp_frames_dir,
            min_plant_frames=1,
            motion_threshold=0.6,
        )
    except Exception as exc:
        logger.error("Planting verification error: %s", exc, exc_info=True)
        return jsonify({"error": str(exc)}), 500
    finally:
        if temp_video_path and os.path.exists(temp_video_path):
            os.remove(temp_video_path)
        if temp_frames_dir and os.path.isdir(temp_frames_dir):
            try:
                modules["ensure_empty_dir"](temp_frames_dir)
                os.rmdir(temp_frames_dir)
            except Exception:
                pass

    if passed:
        num_frames = evidence.get("num_frames", 1) or 1
        plant_ratio = len(evidence.get("plant_frames", [])) / num_frames
        person_ratio = len(evidence.get("person_frames", [])) / num_frames
        motion_score = min(evidence.get("avg_motion", 0) / 2.0, 1.0)
        confidence = plant_ratio * 0.4 + person_ratio * 0.3 + motion_score * 0.3
        confidence = max(0.5, min(confidence, 0.95))
    else:
        confidence = 0.3

    return jsonify({
        "is_valid": passed,
        "confidence": confidence,
        "evidence": evidence,
        "reason": evidence.get("reason", "unknown"),
    })


# ---------------------------------------------------------------------------
# Cleanup verification
# ---------------------------------------------------------------------------


@app.route("/verify_cleanup", methods=["POST"])
def verify_cleanup():
    """Verify cleanup activity via before/after image comparison."""
    cleanup_mod = get_cleanup_module()
    if cleanup_mod is None:
        return jsonify({"error": "Cleanup model not available"}), 503

    if "before" not in request.files or "after" not in request.files:
        return jsonify({"error": "Both 'before' and 'after' images are required"}), 400

    before_file = request.files["before"]
    after_file = request.files["after"]

    if not before_file.filename or not after_file.filename:
        return jsonify({"error": "No file selected"}), 400

    if not _validate_extension(before_file.filename, _ALLOWED_IMAGE_EXTENSIONS):
        return jsonify({"error": f"'before' file type not allowed. Allowed: {_ALLOWED_IMAGE_EXTENSIONS}"}), 415
    if not _validate_extension(after_file.filename, _ALLOWED_IMAGE_EXTENSIONS):
        return jsonify({"error": f"'after' file type not allowed. Allowed: {_ALLOWED_IMAGE_EXTENSIONS}"}), 415

    before_ext = os.path.splitext(secure_filename(before_file.filename))[1] or ".jpg"
    after_ext = os.path.splitext(secure_filename(after_file.filename))[1] or ".jpg"

    temp_before = temp_after = None
    try:
        with tempfile.NamedTemporaryFile(prefix="cleanup_before_", suffix=before_ext, delete=False) as tmp:
            temp_before = tmp.name
            before_file.save(temp_before)

        with tempfile.NamedTemporaryFile(prefix="cleanup_after_", suffix=after_ext, delete=False) as tmp:
            temp_after = tmp.name
            after_file.save(temp_after)

        result = cleanup_mod.verify_cleanup(
            temp_before,
            temp_after,
            confidence_threshold=0.5,
            log_details=True,
        )
    except Exception as exc:
        logger.error("Cleanup verification error: %s", exc, exc_info=True)
        return jsonify({"error": str(exc)}), 500
    finally:
        for path in (temp_before, temp_after):
            if path and os.path.exists(path):
                os.remove(path)

    avg_confidence = (result["before_confidence"] + result["after_confidence"]) / 2

    return jsonify({
        "is_valid": result["verified"],
        "confidence": avg_confidence,
        "reason": result["reason"],
        "details": {
            "before": {
                "predicted_class": result["before_class"],
                "confidence": result["before_confidence"],
                "probabilities": result["before_probs"],
            },
            "after": {
                "predicted_class": result["after_class"],
                "confidence": result["after_confidence"],
                "probabilities": result["after_probs"],
            },
        },
    })


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------


@app.route("/health", methods=["GET"])
def health():
    """Lightweight health check — does NOT trigger model loading."""
    return jsonify({
        "status": "running",
        "public_transport_model_loaded": _pt_model is not None,
        "planting_modules_loaded": _planting_modules is not None,
        "cleanup_module_loaded": _cleanup_module is not None,
        "max_upload_mb": _max_mb,
    })


@app.errorhandler(413)
def request_entity_too_large(_err):
    """Return a clean JSON error when upload exceeds MAX_CONTENT_LENGTH."""
    return jsonify({"error": f"Upload too large. Maximum allowed size is {_max_mb} MB."}), 413


# ---------------------------------------------------------------------------
# Dev entry point (not used by Gunicorn)
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    logger.info("Starting ML service in development mode on port %d", port)
    # Use Gunicorn for production: gunicorn ml_service:app
    app.run(host="0.0.0.0", port=port, debug=False)

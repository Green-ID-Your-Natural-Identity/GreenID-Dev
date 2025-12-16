from flask import Flask, request, jsonify
from flask_cors import CORS
from math import radians, sin, cos, sqrt, atan2
import sys
import os
import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from werkzeug.utils import secure_filename
import tempfile
import cv2

app = Flask(__name__)
CORS(app)  # Allow requests from Node.js backend

# ============== WALK VERIFICATION ==============
def haversine(lat1, lon1, lat2, lon2):
    """Calculate distance between two GPS points"""
    R = 6371  # Earth radius in km
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c  # Distance in km

@app.route('/verify_walk', methods=['POST'])
def verify_walk():
    """Existing walk verification endpoint"""
    data = request.get_json()
    coords = data.get("coordinates", [])  # list of {lat, lon}

    if not coords or len(coords) < 2:
        return jsonify({"error": "Not enough coordinates"}), 400

    total_distance = 0.0
    for i in range(len(coords) - 1):
        lat1, lon1 = coords[i]["lat"], coords[i]["lon"]
        lat2, lon2 = coords[i+1]["lat"], coords[i+1]["lon"]
        total_distance += haversine(lat1, lon1, lat2, lon2)

    threshold = 2.0  # km
    result = total_distance >= threshold

    return jsonify({
        "total_distance_km": round(total_distance, 2),
        "walk_valid": result
    })


# ============== PUBLIC TRANSPORT VERIFICATION ==============

# Model configuration
IMG_SIZE = (224, 224)
MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "PublicTransport",
    "model",
    "public_transport_model"
)

CLASS_NAMES = [
    "auto_rickshaw",
    "bus",
    "metro",
    "not_transport"
]

# Load model once at startup
print("🔄 Loading Public Transport model...")
try:
    # Try loading as Keras model
    pt_model = tf.keras.models.load_model(MODEL_PATH)
    print("✅ Public Transport model loaded successfully")
except ValueError:
    # Load as SavedModel with TFSMLayer (for Keras 3)
    print("Loading SavedModel with TFSMLayer...")
    tfsm_layer = tf.keras.layers.TFSMLayer(MODEL_PATH, call_endpoint='serving_default')
    inputs = tf.keras.Input(shape=(224, 224, 3))
    outputs = tfsm_layer(inputs)
    
    if isinstance(outputs, dict):
        outputs = list(outputs.values())[0]
    
    pt_model = tf.keras.Model(inputs=inputs, outputs=outputs)
    print("✅ Public Transport model loaded (SavedModel)")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    pt_model = None


def predict_transport_image(img_path):
    """Predict transport class from image"""
    if pt_model is None:
        raise RuntimeError("Model not loaded")
    
    # Load and preprocess image
    img = image.load_img(img_path, target_size=IMG_SIZE)
    img_array = image.img_to_array(img)
    img_array = preprocess_input(img_array)  # MobileNetV2 preprocessing
    img_array = np.expand_dims(img_array, axis=0)
    
    # Predict
    predictions = pt_model.predict(img_array, verbose=0)
    predicted_index = np.argmax(predictions)
    confidence = float(np.max(predictions))
    
    return {
        "predicted_class": CLASS_NAMES[predicted_index],
        "confidence": confidence,
        "all_probabilities": {
            CLASS_NAMES[i]: float(predictions[0][i])
            for i in range(len(CLASS_NAMES))
        }
    }


@app.route('/verify_public_transport', methods=['POST'])
def verify_public_transport():
    """
    Verify public transport activity via image classification
    Expects: image file via multipart/form-data OR image URL
    """
    if pt_model is None:
        return jsonify({"error": "Model not loaded"}), 500
    
    try:
        # Check if image file is provided
        if 'image' not in request.files:
            # Try to get image URL from JSON
            data = request.get_json()
            if data and 'image_url' in data:
                # For now, return error - URL download can be added later
                return jsonify({"error": "Direct file upload required"}), 400
            return jsonify({"error": "No image provided"}), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Save to temporary file
        temp_dir = tempfile.gettempdir()
        filename = secure_filename(file.filename)
        temp_path = os.path.join(temp_dir, filename)
        file.save(temp_path)
        
        # Run prediction
        result = predict_transport_image(temp_path)
        
        # Clean up
        os.remove(temp_path)
        
        # Add validation flag
        predicted_class = result['predicted_class']
        confidence = result['confidence']
        
        # Determine if valid
        is_valid_transport = predicted_class in ['auto_rickshaw', 'bus', 'metro']
        
        result['is_valid'] = is_valid_transport and confidence >= 0.6
        result['should_review'] = confidence < 0.6 or not is_valid_transport
        
        return jsonify(result)
    
    except Exception as e:
        print(f"❌ Prediction error: {e}")
        return jsonify({"error": str(e)}), 500


# ============== PLANTING VERIFICATION ==============

# Add planting module to path
PLANTING_PATH = os.path.join(os.path.dirname(__file__), "planting")
sys.path.insert(0, PLANTING_PATH)

# Import planting verification functions
try:
    from video_processing.extract_frames import extract_frames
    from video_processing.verify_video import verify_planting_from_frames
    from utils.cleanup import ensure_empty_dir
    print("✅ Planting model modules loaded successfully")
    planting_available = True
except Exception as e:
    print(f"❌ Error loading planting modules: {e}")
    planting_available = False


@app.route('/verify_planting', methods=['POST'])
def verify_planting():
    """
    Verify tree planting activity via video analysis
    Expects: video file via multipart/form-data
    """
    if not planting_available:
        return jsonify({"error": "Planting model not available"}), 500
    
    try:
        # Check if video file is provided
        if 'video' not in request.files:
            return jsonify({"error": "No video provided"}), 400
        
        file = request.files['video']
        
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Save to temporary file
        temp_dir = tempfile.gettempdir()
        filename = secure_filename(file.filename)
        temp_video_path = os.path.join(temp_dir, filename)
        file.save(temp_video_path)
        
        # Create temp directory for frames
        temp_frames_dir = os.path.join(temp_dir, "planting_frames")
        ensure_empty_dir(temp_frames_dir)
        
        # Extract frames from video
        frames = extract_frames(
            temp_video_path, 
            out_dir=temp_frames_dir, 
            sample_fps=1, 
            max_frames=60
        )
        
        if not frames:
            # Clean up
            os.remove(temp_video_path)
            ensure_empty_dir(temp_frames_dir)
            return jsonify({
                "error": "No frames extracted from video",
                "is_valid": False
            }), 400
        
        # Run planting verification
        passed, evidence = verify_planting_from_frames(
            temp_frames_dir,
            min_plant_frames=1,
            motion_threshold=0.6
        )
        
        # Clean up
        os.remove(temp_video_path)
        ensure_empty_dir(temp_frames_dir)
        
        # Calculate confidence based on evidence
        confidence = 0.0
        if passed:
            # Base confidence on number of plant frames and motion
            plant_ratio = len(evidence.get("plant_frames", [])) / evidence.get("num_frames", 1)
            person_ratio = len(evidence.get("person_frames", [])) / evidence.get("num_frames", 1)
            motion_score = min(evidence.get("avg_motion", 0) / 2.0, 1.0)  # normalize to 0-1
            
            confidence = (plant_ratio * 0.4 + person_ratio * 0.3 + motion_score * 0.3)
            confidence = min(max(confidence, 0.5), 0.95)  # clamp between 0.5-0.95 for valid cases
        else:
            confidence = 0.3  # low confidence for failed verification
        
        result = {
            "is_valid": passed,
            "confidence": confidence,
            "evidence": evidence,
            "reason": evidence.get("reason", "unknown")
        }
        
        return jsonify(result)
    
    except Exception as e:
        print(f"❌ Planting verification error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "running",
        "public_transport_model_loaded": pt_model is not None,
        "planting_model_loaded": planting_available
    })


if __name__ == '__main__':
    print("🚀 Starting ML Service on http://127.0.0.1:5000")
    print("Available endpoints:")
    print("  POST /verify_walk - Walk verification")
    print("  POST /verify_public_transport - Public transport image verification")
    print("  POST /verify_planting - Tree planting video verification")
    print("  GET  /health - Health check")
    app.run(debug=True, port=5000)

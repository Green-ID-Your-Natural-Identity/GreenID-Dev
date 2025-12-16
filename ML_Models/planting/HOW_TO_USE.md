# Planting Detection Model - Usage Guide

## Overview
This model detects planting activities in videos by identifying:
- **Person presence** using YOLO object detection
- **Plant/tree presence** using YOLO and fallback green blob detection
- **Motion/activity** to verify authentic planting behavior

## Prerequisites

### 1. Install Dependencies
```bash
# Install from the main requirements.txt
cd c:\Users\aryan\Downloads\Models
pip install -r requirements.txt
```

Required packages:
- ultralytics (YOLO)
- opencv-python
- pillow
- piexif
- requests

### 2. Demo Video
Ensure you have a demo video at:
`c:\Users\aryan\Downloads\Models\planting\uploads\videos\demo_video.mp4`

## How to Run

### Option 1: Quick Test (Recommended)
```bash
cd c:\Users\aryan\Downloads\Models\planting
python test_planting.py
```

This will run the visual detector in demo mode. Press 'q' to quit.

### Option 2: Run Detection Directly
```bash
cd c:\Users\aryan\Downloads\Models\planting
python run_detection.py
```

#### Configuration Options:
Edit `run_detection.py` to switch modes:
- `LIVE_MODE = False` - Use demo video (default)
- `LIVE_MODE = True` - Use webcam for live detection

### Option 3: Run as FastAPI Service
```bash
cd c:\Users\aryan\Downloads\Models\planting
uvicorn verification_pipeline:app --reload --port 8001
```

Then test with:
```bash
curl -X POST "http://localhost:8001/verify" -F "use_demo=true"
```

## What the Model Detects

The detector shows:
- **Person Detection**: Whether a person is present in the frame
- **Plant Detection**: Whether plants/trees are detected
- **YOLO Status**: Whether YOLO model is loaded
- **Bounding Boxes**: Visual boxes around detected objects with confidence scores

## File Structure

```
planting/
├── run_detection.py           # Visual detector (webcam/demo)
├── verification_pipeline.py   # FastAPI verification service
├── test_planting.py           # Simple test script
├── object_detection/
│   └── detect_objects.py      # YOLO detector class
├── video_processing/
│   ├── extract_frames.py      # Frame extraction
│   └── verify_video.py        # Verification logic
├── utils/                     # Utility functions
└── uploads/
    ├── videos/                # Input videos
    └── frames/                # Extracted frames (temp)
```

## Troubleshooting

### YOLO Model Not Found
- The model file `yolov8n.pt` should be in the planting directory
- It will be auto-downloaded by ultralytics on first run

### Demo Video Not Found
- Ensure `uploads/videos/demo_video.mp4` exists
- Or set `LIVE_MODE = True` to use webcam

### OpenCV Display Issues
- If the window doesn't appear, check your display settings
- On some systems, you may need to run with administrator privileges

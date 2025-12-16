# 🚀 How to Use the Public Transport Classification Model

## Quick Start Guide

### 1️⃣ Test a Single Image

To classify a single image:

```bash
python predict.py <path_to_image>
```

**Examples:**

```bash
# Test a bus image
python predict.py test_images/bus1.png

# Test an auto rickshaw image
python predict.py test_images/auto.jpg

# Test a metro image
python predict.py test_images/metro1.png

# Test a not_transport image
python predict.py test_images/img1.png

# Test your own image
python predict.py C:/Users/aryan/Pictures/my_vehicle.jpg
```

### 2️⃣ Run Comprehensive Tests on All Images

To test all images in the `test_images` folder and generate reports:

```bash
python test_model.py
```

This will:
- ✅ Test all images in `test_images/`
- ✅ Calculate accuracy, precision, recall, F1-score
- ✅ Generate `test_results.json` (detailed JSON report)
- ✅ Generate `test_report.html` (visual HTML report)
- ✅ Display results in the terminal

---

## 📋 Output Format

### Single Image Prediction (`predict.py`)

```
Loading model...
✓ Model loaded successfully
Detected model type: transfer
Using image size: (224, 224)

Prediction Result
============================================================
Class      : bus
Confidence : 99.99%

============================================================
All Class Probabilities:
============================================================
auto_rickshaw       :   0.07% ██
bus                 :  99.99% ██████████████████████████████████████████████████
metro               :   0.09% ██
not_transport       :   0.00% 
============================================================
```

### Batch Testing (`test_model.py`)

Creates two report files:

1. **test_results.json** - Raw data with all predictions
2. **test_report.html** - Beautiful visual report (open in browser)

---

## 🎯 Understanding the Classes

The model can identify **4 classes**:

| Class | Description | Example Filenames |
|-------|-------------|-------------------|
| **auto_rickshaw** | Auto rickshaws / tuk-tuks | auto.jpg, auto2.jpg |
| **bus** | Public buses | bus1.png, bus2.png |
| **metro** | Metro/subway trains | metro1.png, metro2.png |
| **not_transport** | Non-transport images | img1.png, img10.png |

---

## 📁 File Naming Convention for Testing

For the test script to automatically recognize ground truth:

- **Auto rickshaws:** `auto*.jpg` or `auto*.png`
- **Buses:** `bus*.jpg` or `bus*.png`
- **Metro trains:** `metro*.jpg` or `metro*.png`
- **Not transport:** `img*.jpg` or `img*.png`

---

## 🔧 Requirements

Make sure you have installed the dependencies:

```bash
pip install -r requirements.txt
```

**What's included:**
- tensorflow >= 2.13.0
- pillow >= 9.0.0
- numpy >= 1.23.0
- matplotlib >= 3.5.0

---

## 💡 Tips for Best Results

1. **Image Quality:** Use clear, well-lit images
2. **Image Size:** The model automatically resizes to 224x224 pixels
3. **Format:** Supports JPG, JPEG, and PNG formats
4. **Focus:** Ensure the vehicle is the main subject in the image

---

## 📊 Model Details

- **Architecture:** Transfer Learning with MobileNetV2
- **Input Size:** 224x224 pixels
- **Framework:** TensorFlow/Keras
- **Format:** SavedModel

---

## 🎬 Example Workflow

```bash
# Navigate to the project directory
cd c:\Users\aryan\Downloads\Models\PublicTransport

# Test a single image
python predict.py test_images/bus1.png

# Run comprehensive tests
python test_model.py

# Open the HTML report
start test_report.html
```

---

## ❓ Troubleshooting

### Error: Module not found
```bash
# Install dependencies
pip install -r requirements.txt
```

### Error: Model not found
- Ensure you're in the correct directory
- Check that `model/public_transport_model/` exists

### Error: Image not found
- Use the correct path to your image
- Use forward slashes (/) or double backslashes (\\\\) in paths

---

## 📞 Need Help?

- Check `test_report.html` for visual insights
- Review `test_results.json` for detailed predictions
- Ensure images follow naming conventions for automatic testing

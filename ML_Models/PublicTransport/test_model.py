"""
Comprehensive Testing Script for Public Transport Classification Model
Tests all images in test_images folder and generates detailed metrics
"""

import os
import sys
import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
import json
from datetime import datetime
from collections import defaultdict

# Import from predict.py
from predict import load_model, detect_model_type, CLASS_NAMES

# Color codes disabled for Windows compatibility
class Colors:
    GREEN = ''
    RED = ''
    YELLOW = ''
    BLUE = ''
    BOLD = ''
    END = ''


def get_ground_truth_from_filename(filename):
    """Extract ground truth label from filename (e.g., 'bus1.png' -> 'bus')"""
    # Get the base name without extension
    basename = os.path.splitext(filename)[0].lower()
    
    # Special handling for specific naming conventions
    if basename.startswith('auto'):
        return 'auto_rickshaw'
    elif basename.startswith('bus'):
        return 'bus'
    elif basename.startswith('metro'):
        return 'metro'
    elif basename.startswith('img'):
        return 'not_transport'
    
    # If no match, return None
    return None


def predict_image_with_model(img_path, model, model_type, img_size):
    """Make prediction on an image"""
    if not os.path.exists(img_path):
        raise FileNotFoundError(f"Image not found: {img_path}")
    
    # Load and preprocess image
    img = image.load_img(img_path, target_size=img_size)
    img_array = image.img_to_array(img)
    
    if model_type == 'transfer':
        img_array = preprocess_input(img_array)
    else:
        img_array = img_array / 255.0
    
    img_array = np.expand_dims(img_array, axis=0)
    
    # Make prediction
    predictions = model.predict(img_array, verbose=0)
    predicted_index = np.argmax(predictions)
    confidence = np.max(predictions)
    
    return CLASS_NAMES[predicted_index], confidence, predictions[0]


def test_all_images(test_dir, model):
    """Test all images in the test directory"""
    results = []
    model_type, img_size = detect_model_type(model)
    
    print(f"\n{Colors.BLUE}Model Type: {model_type}{Colors.END}")
    print(f"{Colors.BLUE}Image Size: {img_size}{Colors.END}\n")
    
    # Get all image files
    image_files = [f for f in os.listdir(test_dir) 
                   if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    
    print(f"Found {len(image_files)} test images\n")
    print("=" * 80)
    
    for img_file in sorted(image_files):
        img_path = os.path.join(test_dir, img_file)
        ground_truth = get_ground_truth_from_filename(img_file)
        
        if ground_truth is None:
            print(f"{Colors.YELLOW}[!] Skipping {img_file} - cannot determine ground truth{Colors.END}")
            continue
        
        # Make prediction
        predicted_label, confidence, all_probs = predict_image_with_model(
            img_path, model, model_type, img_size
        )
        
        # Check if correct
        is_correct = (predicted_label == ground_truth)
        
        # Store result
        result = {
            'filename': img_file,
            'ground_truth': ground_truth,
            'predicted': predicted_label,
            'confidence': float(confidence),
            'is_correct': is_correct,
            'all_probabilities': {CLASS_NAMES[i]: float(all_probs[i]) 
                                 for i in range(len(CLASS_NAMES))}
        }
        results.append(result)
        
        # Print result
        status_icon = f"{Colors.GREEN}[OK]{Colors.END}" if is_correct else f"{Colors.RED}[FAIL]{Colors.END}"
        color = Colors.GREEN if is_correct else Colors.RED
        
        print(f"{status_icon} {img_file:20s} | True: {ground_truth:15s} | "
              f"Pred: {color}{predicted_label:15s}{Colors.END} | "
              f"Conf: {confidence*100:6.2f}%")
    
    print("=" * 80)
    return results


def calculate_metrics(results):
    """Calculate accuracy, precision, recall, and F1 score"""
    if not results:
        return None
    
    # Overall accuracy
    correct = sum(1 for r in results if r['is_correct'])
    total = len(results)
    accuracy = correct / total if total > 0 else 0
    
    # Per-class metrics
    class_metrics = {}
    
    for class_name in CLASS_NAMES:
        # True Positives, False Positives, False Negatives
        tp = sum(1 for r in results if r['ground_truth'] == class_name and r['predicted'] == class_name)
        fp = sum(1 for r in results if r['ground_truth'] != class_name and r['predicted'] == class_name)
        fn = sum(1 for r in results if r['ground_truth'] == class_name and r['predicted'] != class_name)
        tn = sum(1 for r in results if r['ground_truth'] != class_name and r['predicted'] != class_name)
        
        # Calculate metrics
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
        
        class_metrics[class_name] = {
            'precision': precision,
            'recall': recall,
            'f1_score': f1,
            'true_positives': tp,
            'false_positives': fp,
            'false_negatives': fn,
            'true_negatives': tn,
            'support': tp + fn  # Total actual instances
        }
    
    return {
        'overall_accuracy': accuracy,
        'total_correct': correct,
        'total_samples': total,
        'class_metrics': class_metrics
    }


def print_metrics_report(metrics):
    """Print a detailed metrics report"""
    print(f"\n{Colors.BOLD}{'='*80}{Colors.END}")
    print(f"{Colors.BOLD}TEST RESULTS SUMMARY{Colors.END}")
    print(f"{Colors.BOLD}{'='*80}{Colors.END}\n")
    
    # Overall accuracy
    print(f"{Colors.BOLD}Overall Accuracy:{Colors.END} {metrics['overall_accuracy']*100:.2f}% "
          f"({metrics['total_correct']}/{metrics['total_samples']})\n")
    
    # Per-class metrics
    print(f"{Colors.BOLD}Per-Class Metrics:{Colors.END}\n")
    print(f"{'Class':<20s} {'Precision':<12s} {'Recall':<12s} {'F1-Score':<12s} {'Support':<10s}")
    print("-" * 80)
    
    for class_name in CLASS_NAMES:
        cm = metrics['class_metrics'][class_name]
        print(f"{class_name:<20s} "
              f"{cm['precision']*100:6.2f}% {'':<5s} "
              f"{cm['recall']*100:6.2f}% {'':<5s} "
              f"{cm['f1_score']*100:6.2f}% {'':<5s} "
              f"{cm['support']:<10d}")
    
    print("\n" + "="*80)
    
    # Confusion analysis
    print(f"\n{Colors.BOLD}Misclassifications:{Colors.END}\n")
    for class_name in CLASS_NAMES:
        cm = metrics['class_metrics'][class_name]
        if cm['false_positives'] > 0 or cm['false_negatives'] > 0:
            print(f"{class_name}:")
            if cm['false_positives'] > 0:
                print(f"  - {Colors.RED}{cm['false_positives']} false positives{Colors.END} "
                      f"(predicted as {class_name} but wasn't)")
            if cm['false_negatives'] > 0:
                print(f"  - {Colors.RED}{cm['false_negatives']} false negatives{Colors.END} "
                      f"(should be {class_name} but missed)")
    
    print("="*80)


def save_results(results, metrics, output_file='test_results.json'):
    """Save results to JSON file"""
    report = {
        'timestamp': datetime.now().isoformat(),
        'metrics': metrics,
        'detailed_results': results
    }
    
    with open(output_file, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\n{Colors.GREEN}[OK] Results saved to {output_file}{Colors.END}")


def generate_html_report(results, metrics, output_file='test_report.html'):
    """Generate an HTML report with visualizations"""
    
    html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Public Transport Model Test Report</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }}
        h1, h2 {{
            color: #2c3e50;
        }}
        .summary {{
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        .metric {{
            display: inline-block;
            margin: 10px 20px;
            text-align: center;
        }}
        .metric-value {{
            font-size: 36px;
            font-weight: bold;
            color: #3498db;
        }}
        .metric-label {{
            color: #7f8c8d;
            font-size: 14px;
        }}
        table {{
            width: 100%;
            background: white;
            border-collapse: collapse;
            margin: 20px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        th, td {{
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ecf0f1;
        }}
        th {{
            background-color: #34495e;
            color: white;
            font-weight: bold;
        }}
        tr:hover {{
            background-color: #f8f9fa;
        }}
        .correct {{
            color: #27ae60;
            font-weight: bold;
        }}
        .incorrect {{
            color: #e74c3c;
            font-weight: bold;
        }}
        .confidence-bar {{
            height: 20px;
            background: linear-gradient(to right, #3498db, #2ecc71);
            border-radius: 4px;
        }}
        .footer {{
            text-align: center;
            color: #7f8c8d;
            margin-top: 40px;
            padding: 20px;
        }}
    </style>
</head>
<body>
    <h1>🚌 Public Transport Classification Model - Test Report</h1>
    <p><strong>Generated:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
    
    <div class="summary">
        <h2>📊 Summary</h2>
        <div class="metric">
            <div class="metric-value">{metrics['overall_accuracy']*100:.1f}%</div>
            <div class="metric-label">Overall Accuracy</div>
        </div>
        <div class="metric">
            <div class="metric-value">{metrics['total_correct']}/{metrics['total_samples']}</div>
            <div class="metric-label">Correct Predictions</div>
        </div>
    </div>
    
    <h2>📈 Per-Class Performance</h2>
    <table>
        <thead>
            <tr>
                <th>Class</th>
                <th>Precision</th>
                <th>Recall</th>
                <th>F1-Score</th>
                <th>Support</th>
            </tr>
        </thead>
        <tbody>
"""
    
    for class_name in CLASS_NAMES:
        cm = metrics['class_metrics'][class_name]
        html_content += f"""
            <tr>
                <td><strong>{class_name}</strong></td>
                <td>{cm['precision']*100:.2f}%</td>
                <td>{cm['recall']*100:.2f}%</td>
                <td>{cm['f1_score']*100:.2f}%</td>
                <td>{cm['support']}</td>
            </tr>
"""
    
    html_content += """
        </tbody>
    </table>
    
    <h2>🔍 Detailed Results</h2>
    <table>
        <thead>
            <tr>
                <th>Image</th>
                <th>Ground Truth</th>
                <th>Predicted</th>
                <th>Confidence</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
"""
    
    for result in results:
        status = "✓" if result['is_correct'] else "✗"
        status_class = "correct" if result['is_correct'] else "incorrect"
        conf_width = result['confidence'] * 100
        
        html_content += f"""
            <tr>
                <td>{result['filename']}</td>
                <td>{result['ground_truth']}</td>
                <td class="{status_class}">{result['predicted']}</td>
                <td>
                    <div style="width: 100%; background: #ecf0f1; border-radius: 4px;">
                        <div class="confidence-bar" style="width: {conf_width}%; padding: 2px 8px; font-size: 12px; color: white;">
                            {result['confidence']*100:.1f}%
                        </div>
                    </div>
                </td>
                <td class="{status_class}">{status}</td>
            </tr>
"""
    
    html_content += """
        </tbody>
    </table>
    
    <div class="footer">
        <p>Generated by Public Transport Classification Model Testing Script</p>
    </div>
</body>
</html>
"""
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"{Colors.GREEN}[OK] HTML report saved to {output_file}{Colors.END}")


def main():
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}PUBLIC TRANSPORT CLASSIFICATION MODEL - COMPREHENSIVE TESTING{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.END}\n")
    
    # Configuration
    test_images_dir = "test_images"
    
    # Load model
    print(f"{Colors.YELLOW}Loading model...{Colors.END}")
    model = load_model()
    print(f"{Colors.GREEN}[OK] Model loaded successfully{Colors.END}")
    
    # Test all images
    print(f"\n{Colors.YELLOW}Testing all images...{Colors.END}")
    results = test_all_images(test_images_dir, model)
    
    if not results:
        print(f"{Colors.RED}No valid test results found!{Colors.END}")
        return
    
    # Calculate metrics
    metrics = calculate_metrics(results)
    
    # Print metrics report
    print_metrics_report(metrics)
    
    # Save results
    save_results(results, metrics)
    
    # Generate HTML report
    generate_html_report(results, metrics)
    
    print(f"\n{Colors.GREEN}{Colors.BOLD}[SUCCESS] Testing completed successfully!{Colors.END}\n")


if __name__ == "__main__":
    main()

"""
Simple test script for the planting detection model.
This script runs the visual detector in demo mode.
"""
import os
import sys

# Ensure we can import from the planting module
sys.path.insert(0, os.path.dirname(__file__))

from run_detection import main

if __name__ == "__main__":
    print("=" * 60)
    print("Testing Planting Detection Model")
    print("=" * 60)
    print("\nThis will run the visual detector in demo mode.")
    print("Press 'q' to quit the video window.\n")
    
    try:
        main()
        print("\n✓ Detection completed successfully!")
    except Exception as e:
        print(f"\n✗ Error running detection: {e}")
        import traceback
        traceback.print_exc()

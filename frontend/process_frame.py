#!/usr/bin/env python3
import argparse
import sys
import cv2
import numpy as np
import torch
from ultralytics import YOLO
import os

# Set environment variable to handle OpenMP runtime conflict
os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'

def process_frame(model, frame_data, confidence_threshold=0.25):
    """
    Process a single frame using the YOLO model.
    
    Args:
        model: The loaded YOLO model
        frame_data: The frame data as a numpy array
        confidence_threshold: The confidence threshold for detections
        
    Returns:
        A list of detections in the format [class_id, x, y, width, height, confidence]
    """
    try:
        # Print frame shape for debugging
        print(f"Processing frame with shape: {frame_data.shape}")
        
        # Run inference
        results = model(frame_data, conf=confidence_threshold)[0]
        
        # Process detections
        detections = []
        for r in results.boxes.data.tolist():
            x1, y1, x2, y2, score, class_id = r
            
            # Convert to normalized coordinates (center format)
            width = x2 - x1
            height = y2 - y1
            x_center = x1 + width / 2
            y_center = y1 + height / 2
            
            # Normalize coordinates
            img_height, img_width = frame_data.shape[:2]
            x_norm = x_center / img_width
            y_norm = y_center / img_height
            width_norm = width / img_width
            height_norm = height / img_height
            
            # Add detection
            detections.append([int(class_id), x_norm, y_norm, width_norm, height_norm, score])
            print(f"Debug: Found detection: {int(class_id)} {x_norm} {y_norm} {width_norm} {height_norm} {score}")
        
        print(f"Debug: Found {len(detections)} detections")
        return detections
    except Exception as e:
        print(f"Error processing frame: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        return []

def main():
    parser = argparse.ArgumentParser(description='Process a video frame with YOLOv11')
    parser.add_argument('--model', type=str, required=True, help='Path to the YOLOv11 model')
    parser.add_argument('--confidence', type=float, default=0.25, help='Confidence threshold')
    parser.add_argument('--frame', action='store_true', help='Process frame from stdin')
    args = parser.parse_args()
    
    try:
        # Check if model file exists
        if not os.path.exists(args.model):
            print(f"Error: Model file not found at {args.model}", file=sys.stderr)
            sys.exit(1)
        
        # Load the model
        print(f"Loading model from {args.model}...")
        model = YOLO(args.model)
        print("Model loaded successfully")
        
        # Process frame from stdin
        if args.frame:
            try:
                # Read frame data from stdin
                frame_data = sys.stdin.buffer.read()
                
                if not frame_data:
                    print("Error: No frame data received from stdin", file=sys.stderr)
                    sys.exit(1)
                
                # Decode the frame
                nparr = np.frombuffer(frame_data, np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                if frame is None:
                    print("Error: Failed to decode frame", file=sys.stderr)
                    sys.exit(1)
                
                print(f"Successfully decoded frame with shape: {frame.shape}")
                
                # Process the frame
                detections = process_frame(model, frame, args.confidence)
                
                # Print detections in YOLO format
                for detection in detections:
                    print(f"{detection[0]} {detection[1]} {detection[2]} {detection[3]} {detection[4]} {detection[5]}")
                
                # Exit with success code
                sys.exit(0)
            except Exception as e:
                print(f"Error processing frame: {e}", file=sys.stderr)
                import traceback
                traceback.print_exc(file=sys.stderr)
                sys.exit(1)
        else:
            print("Error: No frame data provided", file=sys.stderr)
            sys.exit(1)
            
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main() 
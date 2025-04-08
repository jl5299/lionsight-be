import streamlit as st
import cv2
import numpy as np
from ultralytics import YOLO
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from datetime import datetime
import json

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv("SUPABASE_URL", ""),
    os.getenv("SUPABASE_KEY", "")
)

# Initialize YOLO model
model = YOLO('yolov11n.pt')  # You'll need to provide the actual model file

def process_frame(frame):
    """Process a single frame with YOLO and return detections"""
    results = model(frame)
    return results[0]

def update_analytics(detections):
    """Update analytics in Supabase"""
    people_count = len([box for box in detections.boxes if box.cls == 0])  # class 0 is person
    
    # Simple demographic estimation (this should be replaced with your actual demographic model)
    demographics = {
        'male': people_count // 2,
        'female': people_count // 2,
        'other': people_count % 2
    }
    
    # Insert analytics data
    data = {
        'timestamp': datetime.utcnow().isoformat(),
        'people_count': people_count,
        'demographics': json.dumps(demographics)
    }
    
    supabase.table('analytics').insert(data).execute()

def main():
    st.title("Lionsight Analytics")
    
    # Initialize session state
    if 'camera_active' not in st.session_state:
        st.session_state.camera_active = False
    
    # Camera selection
    camera_options = [f"Camera {i}" for i in range(5)]  # Support up to 5 cameras
    selected_camera = st.selectbox("Select Camera", camera_options)
    camera_index = int(selected_camera.split()[-1])
    
    # Start/Stop button
    if st.button("Start Camera" if not st.session_state.camera_active else "Stop Camera"):
        st.session_state.camera_active = not st.session_state.camera_active
    
    # Main camera feed
    if st.session_state.camera_active:
        cap = cv2.VideoCapture(camera_index)
        
        # Create columns for layout
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("Live Feed")
            frame_placeholder = st.empty()
            
        with col2:
            st.subheader("Analytics")
            count_placeholder = st.empty()
            demo_placeholder = st.empty()
        
        try:
            while st.session_state.camera_active:
                ret, frame = cap.read()
                if not ret:
                    st.error("Failed to access camera")
                    break
                
                # Process frame
                results = process_frame(frame)
                
                # Draw detections
                annotated_frame = results.plot()
                
                # Update analytics
                update_analytics(results)
                
                # Display frame
                frame_placeholder.image(annotated_frame, channels="BGR")
                
                # Update analytics display
                people_count = len([box for box in results.boxes if box.cls == 0])
                count_placeholder.metric("People Count", people_count)
                
                # Simple demographic display
                demographics = {
                    'Male': people_count // 2,
                    'Female': people_count // 2,
                    'Other': people_count % 2
                }
                demo_placeholder.write(demographics)
                
        finally:
            cap.release()

if __name__ == "__main__":
    main() 
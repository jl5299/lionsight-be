# Lionsight Video Processing Demo

This demo showcases real-time object detection using YOLOv11 neural network.

## Features

- Real-time video processing from webcam or other camera sources
- Configurable object detection classes
- Adjustable confidence threshold
- Real-time statistics and visualization
- Historical tracking of detections

## Setup

1. Install dependencies:

```bash
npm install
```

2. Download the YOLOv11 model:

```bash
npm run download-model
```

3. Install Python dependencies:

```bash
pip install -r requirements.txt
```

4. Start the development server:

```bash
npm run dev
```

5. Open your browser and navigate to http://localhost:3000

## Usage

1. Click on "Video Processing Demo" in the navigation bar
2. Select your camera from the dropdown
3. Adjust the confidence threshold slider as needed
4. Select the classes you want to detect
5. Click "Start Processing" to begin real-time object detection
6. View the real-time statistics and charts on the right side

## Troubleshooting

- If you encounter issues with the model, make sure it's properly downloaded using `npm run download-model`
- If the camera doesn't work, check your browser permissions
- If the detection is slow, try reducing the number of selected classes or increasing the confidence threshold

## Technical Details

- Frontend: Next.js with TypeScript and Tailwind CSS
- Backend: Python script using YOLOv11 for object detection
- Charts: Chart.js for real-time visualization

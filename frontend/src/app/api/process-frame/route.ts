import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { join } from 'path';
import fs from 'fs';

// Define YOLO classes
const YOLO_CLASSES = [
  'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
  'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat',
  'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack',
  'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball',
  'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket',
  'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
  'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair',
  'couch', 'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse', 'remote',
  'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink', 'refrigerator', 'book',
  'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush'
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, selectedClasses, confidenceThreshold = 0.25 } = body;

    if (!image) {
      return NextResponse.json({ error: 'No frame data provided.' }, { status: 400 });
    }

    // Check if the model file exists
    const modelPath = join(process.cwd(), '..', 'yolo11n.pt');
    if (!fs.existsSync(modelPath)) {
      console.error('Model file not found at:', modelPath);
      return NextResponse.json({ error: 'Model file not found. Please ensure yolo11n.pt is in the root directory.' }, { status: 500 });
    }

    // Extract base64 data
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    console.log(`Sending frame data: ${imageBuffer.length} bytes`);

    // Run the Python script with the frame data
    const pythonScriptPath = join(process.cwd(), 'process_frame.py');
    console.log('Python script path:', pythonScriptPath);
    console.log('Model path:', modelPath);
    
    // Set environment variables to fix OpenMP runtime conflict
    const env = { ...process.env, KMP_DUPLICATE_LIB_OK: 'TRUE' };
    
    const pythonProcess = spawn('python', [
      pythonScriptPath,
      '--model', modelPath,
      '--confidence', confidenceThreshold.toString(),
      '--frame'
    ], { env });

    // Send the image data to the Python script
    pythonProcess.stdin.write(imageBuffer);
    pythonProcess.stdin.end();

    // Collect output from the Python process
    let outputData = '';
    let errorData = '';

    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString();
      console.log('Python stdout:', data.toString());
    });

    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
      console.error('Python stderr:', data.toString());
    });

    // Wait for the Python process to complete
    await new Promise<void>((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code: ${code}`);
        
        // Check if we have any detections in the output
        const hasDetections = outputData.includes('Debug: Found detection:');
        
        if (code === 0 || (code === null && hasDetections)) {
          // Success case
          resolve();
        } else {
          // Error case
          const errorMessage = errorData || 'Unknown error';
          console.error(`Python process error: ${errorMessage}`);
          reject(new Error(`Python process error: ${errorMessage}`));
        }
      });
      
      // Handle process errors
      pythonProcess.on('error', (err) => {
        console.error('Failed to start Python process:', err);
        reject(new Error(`Failed to start Python process: ${err.message}`));
      });
    });

    // Parse the detections from the output
    const detections = [];
    const lines = outputData.split('\n');
    
    for (const line of lines) {
      if (line.includes('Debug: Found detection:')) {
        try {
          const detectionStr = line.split('Debug: Found detection:')[1].trim();
          const [classId, x, y, width, height, confidence] = detectionStr.split(' ').map(Number);
          
          // Only include detections for selected classes if specified
          if (!selectedClasses || selectedClasses.includes(YOLO_CLASSES[classId])) {
            detections.push({
              classId,
              x,
              y,
              width,
              height,
              confidence
            });
          }
        } catch (e) {
          console.error('Error parsing detection:', e);
        }
      }
    }

    console.log('Parsed detections:', detections);
    
    // Return empty detections array if no detections were found
    return NextResponse.json({ detections });
  } catch (error) {
    console.error('Error processing frame:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process frame' },
      { status: 500 }
    );
  }
} 
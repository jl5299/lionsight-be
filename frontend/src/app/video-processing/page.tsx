'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// YOLO classes (example - update with actual classes from your model)
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

export default function VideoProcessing() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>(['person']);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.25);
  const [detectionHistory, setDetectionHistory] = useState<{ timestamp: number; count: number }[]>([]);
  const [cumulativeDetections, setCumulativeDetections] = useState<number>(0);
  const [modelLoaded, setModelLoaded] = useState<boolean>(false);
  const [modelLoading, setModelLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Load YOLOv11 model on component mount
  useEffect(() => {
    // Remove automatic model loading
    // loadModel();
  }, []);

  // Get available cameras
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setCameras(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0].deviceId);
        }
      })
      .catch(err => {
        console.error('Error getting cameras:', err);
        setError('Failed to access camera devices');
      });
  }, []);

  // Load YOLOv11 model
  const loadModel = async () => {
    try {
      setModelLoading(true);
      setError(null);
      
      // Check if model exists by making a request to the API
      const response = await fetch('/api/process-frame', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
          confidenceThreshold: 0.25
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load model');
      }

      const data = await response.json();
      console.log('Model loaded successfully', data);
      setModelLoaded(true);
    } catch (err) {
      console.error('Error loading model:', err);
      setError(err instanceof Error ? err.message : 'Failed to load model');
      setModelLoaded(false);
    } finally {
      setModelLoading(false);
    }
  };

  const startVideo = async () => {
    try {
      // Load the model first if not already loaded
      if (!modelLoaded) {
        await loadModel();
        
        if (!modelLoaded) {
          setError('Model not loaded. Please try again.');
          return;
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: selectedCamera ? { exact: selectedCamera } : undefined
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          if (canvasRef.current) {
            canvasRef.current.width = videoRef.current!.videoWidth;
            canvasRef.current.height = videoRef.current!.videoHeight;
          }
          setIsProcessing(true);
          // Start processing after a short delay to ensure video is playing
          setTimeout(() => {
            processVideo();
          }, 500);
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Failed to access camera. Please check permissions.');
    }
  };

  const stopVideo = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsProcessing(false);
  };

  const processVideo = async () => {
    if (!videoRef.current || !canvasRef.current || !isProcessing) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      // Convert canvas to base64
      const base64Image = canvas.toDataURL('image/jpeg', 0.8);
      console.log(`Sending frame: ${base64Image.substring(0, 50)}...`);

      // Send frame to backend for processing
      const response = await fetch('/api/process-frame', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          selectedClasses,
          confidenceThreshold,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process frame');
      }

      const { detections } = await response.json();
      console.log('Received detections:', detections);

      // Update detection history
      const currentTime = Date.now();
      const personCount = detections.filter((d: any) => d.classId === 0).length; // 0 is the class ID for person
      
      setDetectionHistory(prev => {
        const newHistory = [...prev, { timestamp: currentTime, count: personCount }];
        // Keep only last 30 seconds of history
        return newHistory.filter(h => currentTime - h.timestamp < 30000);
      });

      // Update cumulative detections
      setCumulativeDetections(prev => prev + personCount);

      // Draw detections on canvas
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.font = '16px Arial';
      ctx.fillStyle = '#00ff00';

      detections.forEach((detection: any) => {
        const { x, y, width, height, classId, confidence } = detection;
        const className = YOLO_CLASSES[classId] || `class_${classId}`;
        
        // Convert normalized coordinates to pixel coordinates
        const pixelX = x * canvas.width;
        const pixelY = y * canvas.height;
        const pixelWidth = width * canvas.width;
        const pixelHeight = height * canvas.height;
        
        ctx.strokeRect(pixelX - pixelWidth/2, pixelY - pixelHeight/2, pixelWidth, pixelHeight);
        ctx.fillText(`${className} ${Math.round(confidence * 100)}%`, pixelX - pixelWidth/2, pixelY - pixelHeight/2 - 5);
      });

      // Continue processing if still active
      if (isProcessing) {
        requestAnimationFrame(processVideo);
      }
    } catch (err) {
      console.error('Error processing frame:', err);
      setError(err instanceof Error ? err.message : 'Error processing video frame');
      if (isProcessing) {
        requestAnimationFrame(processVideo);
      }
    }
  };

  // Prepare chart data
  const chartData = {
    labels: detectionHistory.map(h => new Date(h.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'People Detected',
        data: detectionHistory.map(h => h.count),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    animation: {
      duration: 0
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Live Video Processing
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Real-time object detection using neural network
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <p>{error}</p>
            <button 
              onClick={loadModel}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry Loading Model
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Video and controls */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Camera
                </label>
                <select
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {cameras.map((camera) => (
                    <option key={camera.deviceId} value={camera.deviceId}>
                      {camera.label || `Camera ${cameras.indexOf(camera) + 1}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confidence Threshold: {confidenceThreshold}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Classes to Detect
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-2">
                  {YOLO_CLASSES.map((className) => (
                    <label key={className} className="flex items-center space-x-2 mb-1">
                      <input
                        type="checkbox"
                        checked={selectedClasses.includes(className)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedClasses([...selectedClasses, className]);
                          } else {
                            setSelectedClasses(selectedClasses.filter(c => c !== className));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{className}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-6">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="absolute inset-0 w-full h-full object-contain"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full"
                />
                {modelLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
                      <p>Loading model...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={isProcessing ? stopVideo : startVideo}
                  disabled={modelLoading}
                  className={`px-6 py-3 rounded-lg font-medium ${
                    isProcessing
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : modelLoading
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isProcessing ? 'Stop Processing' : modelLoading ? 'Loading Model...' : 'Start Processing'}
                </button>
              </div>
            </div>
          </div>

          {/* Right column: Charts */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Real-time Detection Stats
              </h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Current People Detected: {detectionHistory.length > 0 ? detectionHistory[detectionHistory.length - 1].count : 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Cumulative People Detected: {cumulativeDetections}
                </p>
              </div>
              <div className="h-64">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
} 
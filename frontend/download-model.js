const https = require('https');
const fs = require('fs');
const path = require('path');

const modelUrl = 'https://github.com/ultralytics/yolov11/releases/download/v0.0.0/yolo11n.pt';
const modelPath = path.join(__dirname, '..', 'yolo11n.pt');

console.log('Checking if YOLOv11 model exists...');

if (fs.existsSync(modelPath)) {
  console.log('YOLOv11 model already exists.');
  process.exit(0);
}

console.log('Downloading YOLOv11 model...');

const file = fs.createWriteStream(modelPath);

https.get(modelUrl, (response) => {
  if (response.statusCode !== 200) {
    console.error(`Failed to download model: ${response.statusCode} ${response.statusMessage}`);
    fs.unlinkSync(modelPath);
    process.exit(1);
  }

  response.pipe(file);

  file.on('finish', () => {
    file.close();
    console.log('YOLOv11 model downloaded successfully.');
  });
}).on('error', (err) => {
  fs.unlinkSync(modelPath);
  console.error(`Error downloading model: ${err.message}`);
  process.exit(1);
}); 
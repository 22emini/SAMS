const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';
const OUTPUT_DIR = path.join(process.cwd(), 'public/models');

// Create models directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`Created directory: ${OUTPUT_DIR}`);
}

const FILES_TO_DOWNLOAD = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2',
  'face_recognition_model-shard3',
  'face_recognition_model-shard4'
];

/**
 * Download a file from a URL to a local path
 * @param {string} url URL to download from
 * @param {string} outputPath Path to save the file to
 * @returns {Promise} Promise that resolves when the download is complete
 */
function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download file: ${response.statusCode} ${response.statusMessage}`));
        return;
      }

      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {}); // Delete the file if there was an error
      reject(err);
    });
  });
}

/**
 * Download all face-api.js model files
 */
async function downloadModels() {
  console.log('Downloading face-api.js model files...');
  
  for (const fileName of FILES_TO_DOWNLOAD) {
    const url = `${BASE_URL}${fileName}`;
    const outputPath = path.join(OUTPUT_DIR, fileName);
    
    try {
      console.log(`Downloading ${fileName}...`);
      await downloadFile(url, outputPath);
      console.log(`✓ Downloaded ${fileName}`);
    } catch (error) {
      console.error(`✗ Failed to download ${fileName}:`, error.message);
    }
  }
  
  console.log('Done downloading model files.');
}

// Run the download
downloadModels();
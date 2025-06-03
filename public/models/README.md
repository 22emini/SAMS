# Face-API.js Models

This directory should contain the face recognition models for face-api.js.

## Required Models

The following models need to be placed in this directory:

1. `tiny_face_detector_model-weights_manifest.json`
2. `tiny_face_detector_model-shard1`
3. `face_landmark_68_model-weights_manifest.json`
4. `face_landmark_68_model-shard1`
5. `face_recognition_model-weights_manifest.json`
6. `face_recognition_model-shard1`

## Download Models

You can download these models from the official face-api.js repository:

1. Go to: https://github.com/justadudewhohacks/face-api.js/tree/master/weights
2. Download the following model files and place them in this directory:
   - tiny_face_detector_model-*
   - face_landmark_68_model-*
   - face_recognition_model-*

Alternatively, you can run the following script in your project root to download the models automatically:

```bash
mkdir -p public/models
cd public/models

# Download TinyFaceDetector model
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1

# Download FaceLandmark68 model
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1

# Download FaceRecognition model
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard1
```

## Configuration

The face recognition components in this application expect these models to be available in the `/models` public path. 

## npm to run to ensure that  face id work

 npm run download:face-models  
  npx drizzle-kit push 
   npx drizzle-kit push:mysql    
    npx drizzle-kit generate  
    npm install drizzle-kit --save-dev           
    mysql -u root -p < migrations/001_add_face_descriptor.sql
    npm install face-api.js --force   
    npm run db:



## npm package json


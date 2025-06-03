"use client"
import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import * as faceapi from '@vladmandic/face-api'
import * as tf from '@tensorflow/tfjs'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import GlobalApi from '@/app/_services/GlobalApi'
import GradeSelect from '@/app/_components/GradeSelect'

const PROMPTS = [
  'Look straight at the camera',
  'Turn your face slightly to the left',
  'Turn your face slightly to the right'
];

const FaceRegistration = () => {
  const [isModelLoading, setIsModelLoading] = useState(true)
  const [stream, setStream] = useState(null)
  const [selectedGrade, setSelectedGrade] = useState('')
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [processing, setProcessing] = useState(false)
  const [currentPrompt, setCurrentPrompt] = useState('')
  const [step, setStep] = useState(0)
  const [descriptors, setDescriptors] = useState([])
  const videoRef = useRef(null)
  const overlayRef = useRef(null)
  const router = useRouter()

  // Initialize models and camera
  useEffect(() => {
    const init = async () => {
      try {
        await tf.ready();
        await tf.setBackend('webgl');
        if (!tf.getBackend()) throw new Error('TensorFlow.js backend not initialized');
        await faceapi.tf.setBackend('webgl');
        await faceapi.tf.ready();
        await loadModels();
        await startVideo();
        setIsModelLoading(false);
      } catch (error) {
        console.error('Error initializing:', error);
        toast.error('Error initializing face recognition system');
      }
    }
    init();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    }
    // eslint-disable-next-line
  }, [])

  // Load students when grade changes
  useEffect(() => {
    if (selectedGrade) loadStudents();
    else setStudents([]);
  }, [selectedGrade])

  // Draw bounding box overlay
  const drawBox = (detection) => {
    const canvas = overlayRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!detection) return;
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 2;
    const { x, y, width, height } = detection.box;
    ctx.strokeRect(x, y, width, height);
  };

  // Real-time face detection for overlay
  useEffect(() => {
    let interval;
    if (!isModelLoading && videoRef.current && videoRef.current.readyState === 4) {
      interval = setInterval(async () => {
        try {
          const detection = await faceapi.detectSingleFace(
            videoRef.current,
            new faceapi.SsdMobilenetv1Options({ minConfidence: 0.4 })
          ).withFaceLandmarks(faceapi.nets.faceLandmark68Net);
          drawBox(detection);
        } catch (err) {
          // Silent fail
        }
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isModelLoading])

  // Load face-api models
  const loadModels = async () => {
    const modelPath = '/models';
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(modelPath),
      faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
      faceapi.nets.faceLandmark68TinyNet.loadFromUri(modelPath),
      faceapi.nets.faceRecognitionNet.loadFromUri(modelPath)
    ]);
  }

  // Start webcam
  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      setStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (error) {
      toast.error('Unable to access webcam. Please make sure camera permissions are granted.');
    }
  }

  // Load students for selected grade
  const loadStudents = async () => {
    try {
      const response = await GlobalApi.GetAllStudents();
      const gradeStudents = response.data.filter(student => student.grade === selectedGrade);
      setStudents(gradeStudents);
    } catch (error) {
      toast.error('Failed to load students');
    }
  }

  // Average descriptors
  const averageDescriptors = (descArr) => {
    if (!descArr.length) return null;
    const avg = new Array(descArr[0].length).fill(0);
    descArr.forEach(d => d.forEach((v, i) => avg[i] += v));
    return avg.map(v => v / descArr.length);
  };

  // Step-by-step face capture with improved accuracy
  const handleRegister = async () => {
    if (!videoRef.current || isModelLoading || !selectedStudent) {
      toast.error('Please select a student and ensure camera is ready');
      return;
    }
    setProcessing(true);
    setDescriptors([]);
    const SAMPLES_PER_PROMPT = 3;
    const MIN_CONFIDENCE = 0.7;
    let allDescriptors = [];
    for (let i = 0; i < PROMPTS.length; i++) {
      setCurrentPrompt(PROMPTS[i]);
      setStep(i + 1);
      let promptDescriptors = [];
      let attempts = 0;
      while (promptDescriptors.length < SAMPLES_PER_PROMPT && attempts < SAMPLES_PER_PROMPT * 4) {
        await new Promise(res => setTimeout(res, 500));
        const detection = await faceapi.detectSingleFace(
          videoRef.current,
          new faceapi.SsdMobilenetv1Options({ minConfidence: MIN_CONFIDENCE })
        ).withFaceLandmarks(faceapi.nets.faceLandmark68Net).withFaceDescriptor();
        if (detection && detection.detection && detection.detection.score > MIN_CONFIDENCE) {
          promptDescriptors.push(Array.from(detection.descriptor));
        }
        attempts++;
      }
      if (promptDescriptors.length === 0) {
        toast.error('No clear face detected. Please try again.');
        setProcessing(false);
        setCurrentPrompt('');
        setStep(0);
        return;
      }
      allDescriptors = allDescriptors.concat(promptDescriptors);
    }
    setCurrentPrompt('');
    setStep(0);
    // Register face
    try {
      const avgDescriptor = averageDescriptors(allDescriptors);
      // Validation before sending
      if (!selectedStudent || !avgDescriptor || avgDescriptor.length !== 128) {
        toast.error('Face capture failed. Please try again.');
        setProcessing(false);
        return;
      }
      await GlobalApi.RegisterFaceId(selectedStudent, avgDescriptor);
      toast.success('Face ID registered successfully!');
      router.push('/dashboard/faceID');
    } catch (error) {
      toast.error('Error during face registration');
    } finally {
      setProcessing(false);
      setDescriptors([]);
    }
  }

  // UI
  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Register Face ID</h1>
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Select Grade</label>
              <GradeSelect selectedGrade={setSelectedGrade} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Select Student</label>
              <select
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                value={selectedStudent}
                onChange={e => setSelectedStudent(e.target.value)}
                disabled={!selectedGrade || processing}
              >
                <option value="">Select a student</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>
            {selectedStudent && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md border flex flex-col gap-1">
                <span className="font-medium text-blue-700">Selected Student:</span>
                <span className="text-gray-700">{students.find(s => s.id === selectedStudent)?.name}</span>
                <span className="text-xs text-gray-500">Grade: {selectedGrade}</span>
              </div>
            )}
          </div>
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="relative border-2 border-blue-200 rounded-lg overflow-hidden shadow-md">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-[320px] h-[240px] md:w-[400px] md:h-[300px] bg-black object-cover"
                style={{ borderRadius: 12 }}
              />
              <canvas
                ref={overlayRef}
                width={400}
                height={300}
                className="absolute top-0 left-0 pointer-events-none"
                style={{ zIndex: 2, width: '100%', height: '100%' }}
              />
              {processing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 z-10">
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    <span className="text-white font-semibold">Capturing...</span>
                  </div>
                </div>
              )}
            </div>
            {currentPrompt && (
              <div className="mt-2 text-center text-blue-700 font-semibold animate-pulse">
                {currentPrompt}
              </div>
            )}
            {step > 0 && (
              <div className="mt-1 text-xs text-gray-500">Step {step} of {PROMPTS.length}</div>
            )}
          </div>
        </div>
        <div className="flex gap-4 justify-center mt-8">
          <Button
            onClick={handleRegister}
            disabled={processing || !selectedStudent}
            className="flex items-center gap-2 px-6 py-2 text-lg"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </>
            ) : 'Register Face ID'}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/faceID')}
            disabled={processing}
          >
            Cancel
          </Button>
        </div>
        {isModelLoading && (
          <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-lg font-semibold">Loading face recognition models...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FaceRegistration;
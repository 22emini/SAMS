"use client"
import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import * as faceapi from '@vladmandic/face-api'
import * as tf from '@tensorflow/tfjs'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import GlobalApi from '@/app/_services/GlobalApi'
import GradeSelect from '@/app/_components/GradeSelect'
import moment from 'moment'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const FaceRecognition = () => {
  const [isModelLoading, setIsModelLoading] = useState(true)
  const [stream, setStream] = useState(null)
  const [selectedGrade, setSelectedGrade] = useState('')
  const [processing, setProcessing] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const toastCountRef = useRef(0); // Track model toast count
  const cameraToastCountRef = useRef(0); // Track camera toast count
  const router = useRouter()

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        // Ensure TensorFlow.js is properly initialized first
        await tf.ready();
        
        // Set backend to WebGL for better performance
        if (!tf.getBackend() || tf.getBackend() !== 'webgl') {
          await tf.setBackend('webgl');
        }
        
        console.log('TensorFlow.js initialized with backend:', tf.getBackend());

        // Load face-api models sequentially
        await loadModels();
        
        if (mounted) {
          await startVideo();
          setIsModelLoading(false);
        }
      } catch (error) {
        console.error('Error initializing:', error);
        if (mounted) {
          toast.error('Error initializing face recognition system');
          setIsModelLoading(false);
        }
      }
    }

    init();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')
        ctx && ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
    }
  }, [stream]);

  const loadModels = async () => {
    try {
      const modelPath = '/models';
      // Use SSDMobilenetv1 for higher accuracy (can fall back to TinyFaceDetector if needed)
      console.log('Loading SSDMobilenetv1 model...');
      await faceapi.nets.ssdMobilenetv1.loadFromUri(modelPath);
      console.log('Loading FaceLandmark68Net model...');
      await faceapi.nets.faceLandmark68Net.loadFromUri(modelPath);
      // Load the tiny model as well
      console.log('Loading FaceLandmark68TinyNet model...');
      await faceapi.nets.faceLandmark68TinyNet.loadFromUri(modelPath);
      console.log('Loading FaceRecognitionNet model...');
      await faceapi.nets.faceRecognitionNet.loadFromUri(modelPath);
      // Verify all models are loaded correctly
      const modelsLoaded =
        faceapi.nets.ssdMobilenetv1.isLoaded &&
        faceapi.nets.faceLandmark68Net.isLoaded &&
        faceapi.nets.faceLandmark68TinyNet.isLoaded && // Check if tiny model is loaded
        faceapi.nets.faceRecognitionNet.isLoaded;
      if (!modelsLoaded) {
        throw new Error('Not all models were loaded successfully');
      }
      console.log('All face-api models loaded successfully');
      if (toastCountRef.current < 3) {
        toast.success('Face recognition models loaded successfully');
        toastCountRef.current += 1;
      }
    } catch (error) {
      console.error('Error loading models:', error);
      toast.error('Failed to load face recognition models');
      throw error;
    }
  }

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640,
          height: 480,
          facingMode: 'user'
        } 
      })
      setStream(stream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        if (cameraToastCountRef.current < 3) {
          toast.success('Camera initialized successfully')
          cameraToastCountRef.current += 1
        }
      }
    } catch (error) {
      console.error('Error accessing webcam:', error)
      toast.error('Unable to access webcam. Please make sure camera permissions are granted.')
    }
  }

  const drawDetections = (detection) => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video || !detection) return
    const dims = faceapi.matchDimensions(canvas, video, true)
    const resized = faceapi.resizeResults(detection, dims)
    faceapi.draw.drawDetections(canvas, resized)
    faceapi.draw.drawFaceLandmarks(canvas, resized)
    // Draw confidence
    const ctx = canvas.getContext('2d')
    ctx.font = '16px Arial'
    ctx.fillStyle = 'red'
    ctx.fillText(`Conf: ${(detection.detection.score * 100).toFixed(1)}%`, resized.detection.box.x, resized.detection.box.y - 10)
  }

  const handleAttendance = async () => {
    if (!videoRef.current || isModelLoading || !selectedGrade) {
      toast.error('Please select a grade and ensure camera is ready')
      return
    }
    setProcessing(true)
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
    try {
      // Ensure video is playing and ready
      if (videoRef.current.readyState !== 4) {
        await new Promise((resolve) => {
          videoRef.current.onloadeddata = () => resolve()
        })
      }
      // Improved: Capture multiple frames and average descriptors
      const descriptors = []
      let attempts = 0
      let detections = null
      const maxAttempts = 7
      const framesToCapture = 5
      while (attempts < maxAttempts && descriptors.length < framesToCapture) {
        detections = await faceapi.detectSingleFace(
          videoRef.current,
          new faceapi.SsdMobilenetv1Options({
            minConfidence: 0.4 // Increased confidence threshold from 0.6 to 0.7
          })
        ).withFaceLandmarks('net').withFaceDescriptor()
        if (detections && detections.descriptor) {
          drawDetections(detections)
          descriptors.push(detections.descriptor)
        }
        attempts++
        await new Promise(res => setTimeout(res, 300))
      }
      if (descriptors.length === 0) {
        toast.error('No face detected after several attempts. Please ensure your face is clearly visible')
        return
      }
      // Average descriptors
      const avgDescriptor = descriptors[0].map((_, i) =>
        descriptors.reduce((sum, desc) => sum + desc[i], 0) / descriptors.length
      )
      // Try to match face and mark attendance
      const response = await GlobalApi.MarkAttendanceWithFace(
        Array.from(avgDescriptor),
        selectedGrade
      )
      if (response.data.matched && response.data.student) {
        // Mark attendance
        const today = new Date()
        await GlobalApi.MarkAttendance({
          studentId: response.data.student.id,
          present: true,
          day: today.getDate(),
          date: moment(today).format('MM/YYYY')
        })
        toast.success(`Attendance marked for ${response.data.student.name}`)
      } else {
        toast.error(response.data.message || 'Face not recognized')
        if (confirm('Would you like to register your face ID?')) {
          router.push('/dashboard/faceID/register')
        }
      }
    } catch (error) {
      console.error('Error processing face:', error)
      toast.error('Error processing face recognition')
    } finally {
      setProcessing(false)
    }
  }

  if (isModelLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading face recognition models...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Face Recognition Attendance</h1>
      <Link href="/dashboard" className=''>
     
        <Button className="w-full sm:w-auto" >
           <ArrowLeft  className=' text-white'/>  back
          </Button>
      </Link>
      <div className="flex flex-col items-center gap-4">
        <div className="w-full max-w-md mb-4">
          <label className="block text-sm font-medium mb-1">Select Grade</label>
          <GradeSelect selectedGrade={(grade) => setSelectedGrade(grade)} />
        </div>
        <div className="relative border rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-[640px] h-[480px] object-cover"
            width={640}
            height={480}
          />
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="absolute top-0 left-0 w-[640px] h-[480px] pointer-events-none"
          />
        </div>
        <div className="flex gap-4">
          <Button 
            onClick={handleAttendance}
            disabled={processing || !selectedGrade}
            className="flex items-center gap-2">
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </>
            ) : 'Mark Attendance'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard/faceID/register')}>
            Register Face ID
          </Button>
        </div>
      </div>
    </div>
  )
}

export default FaceRecognition

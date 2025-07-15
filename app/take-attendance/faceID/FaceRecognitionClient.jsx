"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import * as faceapi from '@vladmandic/face-api';
import * as tf from '@tensorflow/tfjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import GlobalApi from '@/app/_services/GlobalApi';
import { useAuth } from "@clerk/nextjs";
import moment from 'moment';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Student fetching logic (no lecturer email required)
const fetchStudentByEmailAndGrade = async (email, grade) => {
  try {
    const resp = await GlobalApi.GetStudentByEmailAndGrade({
      email: email.trim(),
      grade: grade.trim(),
    })
    if (resp.data && Array.isArray(resp.data) && resp.data.length > 0) {
      return resp.data[0]
    }
    return null
  } catch (err) {
    return null
  }
}

// Helper: Calculate distance between two lat/lng points (Haversine formula)
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Radius of the earth in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const FaceRecognition = () => {
  const [isModelLoading, setIsModelLoading] = useState(true)
  const [stream, setStream] = useState(null)
  
  // Geofencing state (read-only for attendees)
  const [geoEnabled, setGeoEnabled] = useState(false)
  const [geoStatus, setGeoStatus] = useState('disabled') // 'disabled', 'checking', 'success', 'fail'
  const [geoError, setGeoError] = useState('')
  const [geoAllowed, setGeoAllowed] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [clerkLocation, setClerkLocation] = useState(null)
  const geoCheckIntervalRef = useRef(null)
  
  // Function to stop camera stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx && ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }  
  const [processing, setProcessing] = useState(false)
  const [student, setStudent] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const toastCountRef = useRef(0)
  const cameraToastCountRef = useRef(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  // Get params from URL (from Take Attendance page)
  const email = searchParams.get('email') || ''
  const grade = searchParams.get('grade') || ''

  // Fetch geofencing status/location from backend API and poll for changes
  useEffect(() => {
    let intervalId;
    const fetchGeoStatus = async () => {
      try {
        const resp = await fetch('/api/geofencing');
        const data = await resp.json();
        setGeoEnabled(!!data.enabled);
        setClerkLocation(data.location || null);
      } catch {}
    };
    fetchGeoStatus();
    intervalId = setInterval(fetchGeoStatus, 10000); // poll every 10s
    window.addEventListener('focus', fetchGeoStatus);
    document.addEventListener('visibilitychange', fetchGeoStatus);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', fetchGeoStatus);
      document.removeEventListener('visibilitychange', fetchGeoStatus);
    };
  }, []);

  // Geofencing: Check location every 5 minutes if enabled
  useEffect(() => {
    if (!geoEnabled) {
      setGeoStatus('disabled');
      setGeoAllowed(false);
      setGeoError('');
      if (geoCheckIntervalRef.current) clearInterval(geoCheckIntervalRef.current);
      return;
    }
    if (!clerkLocation) {
      setGeoStatus('fail');
      setGeoError('Clerk location not set. Please set location in dashboard.');
      setGeoAllowed(false);
      return;
    }
    if (!navigator.geolocation) {
      setGeoStatus('fail');
      setGeoError('Geolocation not supported.');
      setGeoAllowed(false);
      return;
    }
    const checkLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          const dist = getDistanceFromLatLonInMeters(
            pos.coords.latitude,
            pos.coords.longitude,
            clerkLocation.lat,
            clerkLocation.lng
          );
          if (dist <= 50) {
            setGeoStatus('success');
            setGeoAllowed(true);
            setGeoError('');
          } else {
            setGeoStatus('fail');
            setGeoAllowed(false);
            setGeoError(`You are ${dist.toFixed(1)} meters away. Must be within 50 meters.`);
          }
        },
        (err) => {
          setGeoStatus('fail');
          setGeoAllowed(false);
          setGeoError('Unable to get location: ' + err.message);
        }
      );
    };
    checkLocation();
    geoCheckIntervalRef.current = setInterval(checkLocation, 5 * 60 * 1000);
    return () => {
      if (geoCheckIntervalRef.current) clearInterval(geoCheckIntervalRef.current);
    };
  }, [geoEnabled, clerkLocation]);

  // Fetch student info on mount
  useEffect(() => {
    const fetchStudent = async () => {
      if (email && grade) {
        const s = await fetchStudentByEmailAndGrade(email, grade)
        setStudent(s)
      }
    }
    fetchStudent()
  }, [email, grade])

  useEffect(() => {
    let mounted = true
    const init = async () => {
      try {
        await tf.ready()
        if (!tf.getBackend() || tf.getBackend() !== 'webgl') {
          await tf.setBackend('webgl')
        }
        await loadModels()
        if (mounted) {
          await startVideo()
          setIsModelLoading(false)
        }
      } catch (error) {
        console.error('Error initializing:', error)
        if (mounted) {
          toast.error('Error initializing face recognition system')
          setIsModelLoading(false)
        }
      }
    }
    init()
    return () => {
      mounted = false
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')
        ctx && ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
      if (geoCheckIntervalRef.current) {
        clearInterval(geoCheckIntervalRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream])

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
        if (cameraToastCountRef.current < 1) {
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

  const { getToken } = useAuth();

  const handleAttendance = async () => {
    if (!videoRef.current || isModelLoading || !email || !grade) {
      toast.error('Missing required information or camera not ready')
      return
    }
    
    // Check geofencing before proceeding
    if (geoEnabled && !geoAllowed) {
      toast.error('Geofencing: You are not within the required range to mark attendance.')
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
      // Capture multiple frames and average descriptors
      const descriptors = []
      let attempts = 0
      let detections = null
      const maxAttempts = 7
      const framesToCapture = 5
      while (attempts < maxAttempts && descriptors.length < framesToCapture) {
        detections = await faceapi.detectSingleFace(
          videoRef.current,
          new faceapi.SsdMobilenetv1Options({
            minConfidence: 0.4
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
      
      // Try to match face and mark attendance (no authentication)
      const response = await GlobalApi.MarkAttendanceWithFace(
        Array.from(avgDescriptor),
        grade
      )
      if (response.data.matched && response.data.student) {
        // Mark attendance with location data if available
        const today = new Date()
        const attendanceData = {
          studentId: response.data.student.id,
          present: true,
          day: today.getDate(),
          date: moment(today).format('MM/YYYY'),
          noAuth: true, // <-- add this flag to signal no auth required
          location: userLocation || null, // Include location data
          timestamp: moment().toISOString()
        }
        
        await GlobalApi.MarkAttendance(attendanceData)
        
        toast.success(`Attendance marked for ${response.data.student.name}`)
      } else {
        toast.error(response.data.message || 'Face not recognized')
        if (window.confirm('Face not recognized. Would you like to register your face ID?')) {
          router.push(`/take-attendance/faceID/register?email=${encodeURIComponent(email)}&grade=${encodeURIComponent(grade)}`)
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
      <Button
        className="w-full sm:w-auto"
        onClick={() => {
          stopCamera();
          router.push("/");
        }}
      >
        <ArrowLeft className='text-white' /> back
      </Button>
      <div className="flex flex-col items-center gap-4">
        {/* Geofencing status (read-only for attendees) */}
        <div className="w-full max-w-md mb-4 flex items-center gap-2">
          <label className="block text-sm font-medium">Geofencing (50m radius)</label>
          <span className={`ml-2 px-2 py-1 rounded ${geoEnabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {geoEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        {geoEnabled && (
          <div className="w-full max-w-md mb-2">
            <div className={`p-2 rounded ${geoStatus === 'success' ? 'bg-green-50' : geoStatus === 'fail' ? 'bg-red-50' : 'bg-yellow-50'}`}>
              <span className="font-medium">Geofencing Status: </span>
              {geoStatus === 'checking' && 'Checking location...'}
              {geoStatus === 'success' && 'Within range!'}
              {geoStatus === 'fail' && geoError}
            </div>
            {userLocation && clerkLocation && (
              <div className="text-xs text-gray-500 mt-1">
                Your location: {userLocation.lat?.toFixed(5)}, {userLocation.lng?.toFixed(5)}<br/>
                Clerk location: {clerkLocation.lat?.toFixed(5)}, {clerkLocation.lng?.toFixed(5)}
              </div>
            )}
          </div>
        )}
        <div className="w-full max-w-md mb-4">
          <label className="block text-sm font-medium mb-1">Grade</label>
          <input
            type="text"
            value={grade}
            disabled
            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
          />
        </div>
        <div className="w-full max-w-md mb-4">
          <label className="block text-sm font-medium mb-1">Student Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
          />
        </div>
        {student && (
          <div className="mt-2 p-3 bg-blue-50 rounded-md border flex flex-col gap-1 w-full max-w-md">
            <span className="font-medium text-blue-700">Student:</span>
            <span className="text-gray-700">{student.name}</span>
            <span className="text-xs text-gray-500">Grade: {grade}</span>
          </div>
        )}
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
            disabled={processing || (geoEnabled && !geoAllowed)}
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
            onClick={() => router.push(`/take-attendance/faceID/register?email=${encodeURIComponent(email)}&grade=${encodeURIComponent(grade)}`)}>
            Register Face ID
          </Button>
        </div>
      </div>
    </div>
  )
}

export default FaceRecognition;
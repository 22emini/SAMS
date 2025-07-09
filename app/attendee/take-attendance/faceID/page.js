"use client";
import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const FaceIDPage = () => {
  const videoRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let stream;
    const setupCameraAndFaceApi = async () => {
      try {
        // Only import face-api in the browser
        const faceapi = await import("@vladmandic/face-api");

        // Load models from public/models
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
        await faceapi.nets.faceRecognitionNet.loadFromUri("/models");

        // Setup camera
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError("Could not access camera or load face-api: " + err.message);
      }
    };
    setupCameraAndFaceApi();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Face ID Attendance</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          width={320}
          height={240}
          className="mx-auto rounded border mb-4"
        />
        <p className="text-gray-500">Face recognition logic will run in the browser only.</p>
      </div>
    </div>
  );
};

export default FaceIDPage;

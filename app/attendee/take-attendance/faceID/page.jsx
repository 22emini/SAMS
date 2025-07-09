"use client";
import dynamic from 'next/dynamic';

const FaceRecognitionClient = dynamic(() => import('./FaceRecognitionClient'), { ssr: false });

export default function Page() {
  return <FaceRecognitionClient />;
}

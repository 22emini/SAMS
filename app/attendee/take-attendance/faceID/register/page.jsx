"use client";
import dynamic from 'next/dynamic';

const FaceRegistrationClient = dynamic(() => import('./FaceRegistrationClient'), { ssr: false });

export default function Page() {
  return <FaceRegistrationClient />;
}
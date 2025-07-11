'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const TakeAttendance = () => {
  const [email, setEmail] = useState('');
  const [grade, setGrade] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/attendee/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, grade }),
      });
      const data = await res.json();
      if (data.exists) {
        // Redirect to Face ID attendance page with email and grade as query params (no lecturer email)
        router.push(`/take-attendance/faceID?email=${encodeURIComponent(email)}&grade=${encodeURIComponent(grade)}`);
      } else {
        setError('No record found for this email and grade. Please request access from your clerk.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-md shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Take Attendance</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium" htmlFor="email">Email</label>
          <Input
            id="email"
            type="email"
            value={email}
            placeholder="Enter your registered email"
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium" htmlFor="grade">Grade</label>
          <Input
            id="grade"
            type="text"
            value={grade}
            placeholder="Enter your course/grade"
            onChange={e => setGrade(e.target.value)}
            required
            autoComplete="off"
          />
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Checking...' : 'Proceed'}
        </Button>
      </form>
    </div>
  );
};

export default TakeAttendance;

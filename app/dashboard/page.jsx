"use client"
import { useTheme } from 'next-themes'
import React, { useEffect, useState } from 'react'
import MonthSelection from '../_components/MonthSelection'
import GradeSelect from '../_components/GradeSelect'
import GlobalApi from '../_services/GlobalApi'
import moment from 'moment'
import StatusList from './_components/StatusList'
import BarChartComponent from './_components/BarChartComponent'
import { Pie, PieChart } from 'recharts'
import PieChartComponent from './_components/PieChartComponent'
import{motion} from 'framer-motion'
import { useUser } from "@clerk/nextjs"; 
// ...existing imports and code...

function Dashboard() {
  const { setTheme } = useTheme();
  const [selectedMonth, setSelectedMonth] = useState();
  const [selectedGrade, setSelectedGrade] = useState('5th');
  const [attendaceList, setAttendaceList] = useState();
  const [totalPresentData, setTotalPresentData] = useState([]);
  // Face recognition session state
  const [faceSessionEnabled, setFaceSessionEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('faceSessionEnabled');
      return stored === 'true';
    }
    return false;
  });
  const [clerkLocation, setClerkLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const { isSignedIn, user, isLoaded } = useUser();

  useEffect(() => {
    GetTotalPresentCountByDay();
    getStudentAttendance();
  }, [selectedMonth, selectedGrade]);

  // Persist faceSessionEnabled in localStorage and auto-capture location
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('faceSessionEnabled', faceSessionEnabled);
    }
    // Sync geofencing status to backend API for attendee UI
    const updateGeofencingStatus = async () => {
      let location = null;
      if (faceSessionEnabled && navigator.geolocation) {
        try {
          const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setClerkLocation(location);
          setLocationError('');
        } catch (err) {
          setLocationError('Unable to get location: ' + err.message);
        }
      } else {
        setClerkLocation(null);
        setLocationError('');
      }
      if (user && user.id) {
        await fetch('/api/geofencing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clerkUserId: user.id, enabled: faceSessionEnabled, location })
        });
      }
    };
    updateGeofencingStatus();
  }, [faceSessionEnabled, user]);

  function getStudentAttendance() {
    GlobalApi.GetAttendanceList(selectedGrade, moment(selectedMonth).format('MM/yyyy'))
      .then(resp => {
        setAttendaceList(resp.data);
      });
  }

  function GetTotalPresentCountByDay() {
    GlobalApi.TotalPresentCountByDay(moment(selectedMonth).format('MM/yyyy'), selectedGrade)
      .then(resp => {
        setTotalPresentData(resp.data);
      });
  }

  return (
    <div className='p-3 md:p-10'>
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <h2 className='font-bold text-xl md:text-2xl'>Dashboard</h2>
        <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto'>
          <MonthSelection selectedMonth={setSelectedMonth} />
          <GradeSelect selectedGrade={(v) => { setSelectedGrade(v); console.log(v); }} />
        </div>
      </div>
      {/* Face Recognition Session Controls */}
      <div className='my-4 p-4 border rounded bg-gray-50 max-w-md'>
        <div className='flex items-center gap-2 mb-2'>
          <label className='font-medium'>Enable Face Recognition Session</label>
          <input
            type='checkbox'
            checked={faceSessionEnabled}
            onChange={e => {
              setFaceSessionEnabled(e.target.checked);
              if (typeof window !== 'undefined') {
                localStorage.setItem('faceSessionEnabled', e.target.checked);
              }
            }}
            className='ml-2'
          />
        </div>
        <div className='text-sm'>
          Status: <span className={faceSessionEnabled ? 'text-green-600' : 'text-red-600'}>{faceSessionEnabled ? 'Enabled' : 'Disabled'}</span>
        </div>
        {faceSessionEnabled && (
          <div className='mt-2'>
            {clerkLocation ? (
              <div className='text-xs text-gray-700'>Location captured: {clerkLocation.lat?.toFixed(5)}, {clerkLocation.lng?.toFixed(5)}</div>
            ) : (
              <div className='text-xs text-red-600'>Capturing location...</div>
            )}
            {locationError && <div className='text-xs text-red-600'>{locationError}</div>}
          </div>
        )}
      </div>
      {user && (
        <motion.p
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, type: 'spring' }}
          className='text-white bg-primary border rounded-xl my-5 p-4 md:p-12 text-sm md:text-base'>
          <span>{`Welcome back, ${user.firstName} 👋 to the Student Attendance Monitoring System!`}</span>
          <br />
          <span>{`We’re excited to have you on board! This platform is designed to make tracking and managing attendance effortless and efficient. Please select the month you wish to find attendance.`}</span>
        </motion.p>
      )}
      <StatusList attendaceList={attendaceList} />
      <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
        <div className='md:col-span-2'>
          <BarChartComponent attendaceList={attendaceList} totalPresentData={totalPresentData} />
        </div>
        <div>
          <PieChartComponent attendaceList={attendaceList} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
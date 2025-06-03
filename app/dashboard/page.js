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
const data01 = [
  {
    "name": "Group A",
    "value": 400
  },
  {
    "name": "Group B",
    "value": 300
  },
  {
    "name": "Group C",
    "value": 300
  },
  {
    "name": "Group D",
    "value": 200
  },
  {
    "name": "Group E",
    "value": 278
  },
  {
    "name": "Group F",
    "value": 189
  }
];

function Dashboard() {
    const { setTheme } = useTheme()
    const [selectedMonth,setSelectedMonth]=useState();
    const [selectedGrade,setSelectedGrade]=useState('5th');
    const [attendaceList,setAttendaceList]=useState();
    const [totalPresentData,setTotalPresentData]=useState([]);
    useEffect(()=>{

        GetTotalPresentCountByDay();
        getStudentAttendance();
       
    },[selectedMonth||selectedGrade])

    useEffect(()=>{

      GetTotalPresentCountByDay();
      getStudentAttendance();
     
  },[selectedGrade])


  /**
   * Used to get Student Attendace for Give Month and Date
   */
    const getStudentAttendance=()=>{
      
      GlobalApi.GetAttendanceList(selectedGrade,moment(selectedMonth).format('MM/yyyy'))
      .then(resp=>{
        setAttendaceList(resp.data)
      })
    }

    const GetTotalPresentCountByDay=()=>{
      
      GlobalApi.TotalPresentCountByDay(moment(selectedMonth).format('MM/yyyy'),selectedGrade)
      .then(resp=>{
        setTotalPresentData(resp.data);
      })
    }

    const { isSignedIn, user, isLoaded } = useUser()
  return (
    <div className='p-10'>
      <div className='flex items-center justify-between'>
          <h2 className='font-bold text-2xl'>Dashboard</h2>
          <div className='flex items-center  ml-3 gap-4'>
            <MonthSelection selectedMonth={setSelectedMonth} />
            <GradeSelect selectedGrade={(v)=>{setSelectedGrade(v);console.log(v)}}/>
          </div>
        </div>
      {user && (
        <motion.p 
          initial ={{opacity: 0, scale: 0}}
          whileInView={{opacity: 1, scale: 1}}
          transition={{duration: 2, type:'spring'}}
          className='  text-white  bg-primary border  rounded-xl m-5 p-12'>
          {`Welcome  back ${user.firstName} to the Student Attendance Monitoring System!
\nWe’re excited to have you on board! This platform is designed to make tracking and managing attendance effortless and efficient.please select the month you wish to find attendace .`}
        </motion.p>
      )}
        <StatusList attendaceList={attendaceList} />

        <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
          <div className='md:col-span-2'>
            <BarChartComponent attendaceList={attendaceList}
            totalPresentData={totalPresentData}/>
          </div>
          <div>
            <PieChartComponent  attendaceList={attendaceList} />
          </div>
        </div>
    </div>
  )
}

export default Dashboard
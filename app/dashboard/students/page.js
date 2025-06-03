"use client"
import React, { useEffect, useState } from 'react'
import AddNewStudent from './_components/AddNewStudent'
import GlobalApi from '@/app/_services/GlobalApi'
import StudentListTable from './_components/StudentListTable';
import StudentDataUploader from '@/components/StudentDataUploader';


function Student() {

  const [studentList,setStudentList]=useState([]);
  useEffect(()=>{
    GetAllStudents();
  },[])
  /**
   * Used to Get All Students
   */
  const GetAllStudents=()=>{
    GlobalApi.GetAllStudents().then(resp=>{
      setStudentList(resp.data);
    })
  }
  return (
    <div className='p-4 sm:p-7'>
        <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4'>
          <h2 className='font-bold text-2xl'>Students</h2>
          <div className='flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto'>
            <AddNewStudent refreshData={GetAllStudents}/>
            <StudentDataUploader />
          </div>
        </div>
        <div className='overflow-x-auto rounded-lg bg-white shadow'>
          <StudentListTable studentList={studentList}
            refreshData={GetAllStudents} />
        </div>
    </div>
  )
}

export default Student
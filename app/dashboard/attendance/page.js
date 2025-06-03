"use client"
import GradeSelect from '@/app/_components/GradeSelect'
import MonthSelection from '@/app/_components/MonthSelection'
import GlobalApi from '@/app/_services/GlobalApi'
import { Button } from '@/components/ui/button'
import moment from 'moment'
import React, { useState } from 'react'
import AttendanceGrid from './_components/AttendanceGrid'
import{motion} from 'framer-motion'
import * as XLSX from 'xlsx';
import Link from 'next/link'
import { ScanFace } from 'lucide-react'
import { toast } from 'sonner'

function Attendance() {

    const [selectedMonth,setSelectedMonth]=useState();
    const [selectedGrade,setSelectedGrade]=useState('5th');
    const [attendanceList,setAttendceList]=useState();

    /**
     * Used to fetch attendance list for give month and Grade
     */
    const onSearchHandler=()=>{
        const month=moment(selectedMonth).format('MM/YYYY');
        GlobalApi.GetAttendanceList(selectedGrade,month).then(resp=>{
            console.log(resp.data)
            setAttendceList(resp.data);
        })
    }
    const exportAttendanceToExcel = () => {
      try {
          if (!attendanceList || attendanceList.length === 0) {
              console.error("No attendance data to export.");
              toast.error("No data available to export. Please search for attendance data first.");
              return;
          }

          // Format the data for Excel
          const formattedData = attendanceList.map(record => ({
              StudentID: record.studentId,
              Name: record.name,
              Grade: record.grade,
              Attendance: record.present ? 'Present' : 'Absent',
              Day: record.day,
              Date: record.date
          }));

          // Create a worksheet
          const ws = XLSX.utils.json_to_sheet(formattedData);

          // Create a workbook and add the worksheet
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Attendance");

          // Generate the Excel file and trigger a download
          const fileName = `Attendance_${selectedGrade}_${moment(selectedMonth).format('MM_YYYY')}.xlsx`;
          XLSX.writeFile(wb, fileName);

      } catch (error) {
          console.error("Error exporting to Excel:", error);
      }
  };
    return (
        <div className='p-10'>
            <h2 className='text-2xl font-bold'>Attendance</h2>
            {/* Search option  */}

            <div 
            
          className="flex flex-wrap gap-5 my-5 p-5 border rounded-lg shadow-sm">
  <div className="flex flex-col sm:flex-row gap-2 items-center w-full sm:w-auto">
    <label className="whitespace-nowrap">Select Month:</label>
    <MonthSelection selectedMonth={(value) => setSelectedMonth(value)} />
  </div>
  <div className="flex flex-col sm:flex-row gap-2 items-center w-full sm:w-auto">
    <label className="whitespace-nowrap">Select Department:</label>
    <GradeSelect selectedGrade={(v) => setSelectedGrade(v)} />
  </div>
  <div className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto" onClick={exportAttendanceToExcel}>
                        Export to Excel
                    </Button>
                </div>
  <div className="w-full sm:w-auto">
    <Button className="w-full sm:w-auto" onClick={() => onSearchHandler()}>
      Search
    </Button>

     <Link href="/dashboard/faceID" className="w-full bg-primary text-primary-foreground  rounded-md py-2 px-3 shadow hover:bg-primary/90 ml-1 mt-4 sm:w-auto" >
     
       Face ID  Attendance
    </Link>
  </div>
</div>

            {/* Student Attendance Grid  */}
            <AttendanceGrid attadanceList={attendanceList}
            selectedMonth={selectedMonth}/>
        </div>
    )
}

export default Attendance
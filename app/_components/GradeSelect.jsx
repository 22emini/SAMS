"use client"
import React, { useEffect, useState } from 'react'
import GlobalApi from '../_services/GlobalApi';

function GradeSelect({selectedGrade}) {

    const [grades,setGrades]=useState([]);

    useEffect(()=>{
        GetAllGradesList();
    },[])

    const GetAllGradesList = () => {
        GlobalApi.GetAllGrades()
            .then((resp) => {
                setGrades(resp.data);
            })
            .catch((error) => {
                console.error("Error fetching grades:", error);
            });
    };
    
    return (
        <div>
            <select className='p-2 border rounded-lg'
            onChange={(e)=>selectedGrade(e.target.value)}
              >
                <option value="">Select Grade</option>
                {grades.map((item, index) => (
                    
                    <option key={index} value={item.grade}>{item.grade}</option>
                ))}
            </select>
        </div>
    )
}

export default GradeSelect
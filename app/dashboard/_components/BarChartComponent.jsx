import { getUniqueRecord } from '@/app/_services/service';
import React, { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function BarChartComponent({ attendaceList, totalPresentData }) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    formatAttendanceListCount();
  }, [attendaceList, totalPresentData]);

  const formatAttendanceListCount = () => {
    if (!attendaceList || !totalPresentData) {
      setIsLoading(false);
      return;
    }
    
    const totalStudent = getUniqueRecord(attendaceList);
    const totalStudentCount = totalStudent?.length || 0;
    
    const result = totalPresentData.map(item => ({
      day: item.day,
      presentCount: Number(item.presentCount),
      absentCount: totalStudentCount - Number(item.presentCount),
      // Calculate percentage for tooltip
      presentPercentage: ((Number(item.presentCount) / totalStudentCount) * 100).toFixed(1),
      absentPercentage: (((totalStudentCount - Number(item.presentCount)) / totalStudentCount) * 100).toFixed(1)
    }));
    
    setData(result);
    setIsLoading(false);
  };

  // Custom tooltip to show percentages
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-md shadow-md border border-gray-200">
          <p className="font-bold">{label}</p>
          <p className="text-blue-600">
            Present: {payload[0].value} ({payload[0].payload.presentPercentage}%)
          </p>
          <p className="text-teal-500">
            Absent: {payload[1].value} ({payload[1].payload.absentPercentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 border rounded-lg shadow-md bg-white transition-all duration-300 hover:shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-xl text-gray-800">Attendance Overview</h2>
        {!isLoading && data.length > 0 && (
          <div className="text-sm text-gray-500">
            Total Students: {getUniqueRecord(attendaceList)?.length || 0}
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse flex space-x-4 w-full">
            <div className="flex-1 space-y-6 py-1">
              <div className="h-48 bg-gray-200 rounded w-full"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-500">
          No attendance data available
        </div>
      ) : (
        <div className="transform transition-all duration-300 ease-in-out">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
              barGap={8}
              barSize={32}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#4B5563', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#4B5563', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: 20 }}
                iconSize={12}
                iconType="circle"
              />
              <Bar 
                dataKey="presentCount" 
                name="Present" 
                fill="#4c8cf8" 
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
              <Bar 
                dataKey="absentCount" 
                name="Absent" 
                fill="#ff0000" 
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
                animationEasing="ease-in-out"
                animationBegin={300}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default BarChartComponent;
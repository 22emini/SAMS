import { getUniqueRecord } from '@/app/_services/service';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

function PieChartComponent({ attendaceList }) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalDays: 0,
    presentCount: 0,
    absentCount: 0
  });

  // Colors
  const COLORS = {
    present: '#4c8cf8',
    absent: '#ff5252' // Red color for absent as requested
  };

  useEffect(() => {
    setIsLoading(true);
    if (attendaceList && attendaceList.length > 0) {
      calculateAttendanceData();
    } else {
      setIsLoading(false);
    }
  }, [attendaceList]);

  const calculateAttendanceData = () => {
    try {
      // Get unique students
      const totalStudents = getUniqueRecord(attendaceList);
      // Get current day of month
      const today = moment().format('D');
      // Calculate total possible attendance entries
      const totalPossibleAttendance = totalStudents.length * Number(today);
      // Calculate actual present count
      const presentCount = attendaceList.length;
      // Calculate absent count
      const absentCount = totalPossibleAttendance - presentCount;
      
      // Calculate percentages
      const presentPercentage = (presentCount / totalPossibleAttendance) * 100;
      const absentPercentage = 100 - presentPercentage;
      
      // Store stats for display
      setStats({
        totalStudents: totalStudents.length,
        totalDays: Number(today),
        presentCount,
        absentCount
      });

      // Set data for pie chart
      setData([
        {
          name: 'Present',
          value: Number(presentPercentage.toFixed(1)),
          fill: COLORS.present,
          actualCount: presentCount
        },
        {
          name: 'Absent',
          value: Number(absentPercentage.toFixed(1)),
          fill: COLORS.absent,
          actualCount: absentCount
        },
      ]);
    } catch (error) {
      console.error("Error calculating attendance data:", error);
    }
    
    setIsLoading(false);
  };

  // Custom label for pie sections
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
          <p className="font-bold text-gray-800">{data.name}</p>
          <p className="text-gray-600">{`${data.value}% (${data.actualCount} entries)`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="border rounded-lg shadow-md bg-white p-6 transition-all duration-300 hover:shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-xl text-gray-800">Monthly Attendance Overview</h2>
        {!isLoading && stats.totalStudents > 0 && (
          <div className="text-sm text-gray-600">
            {stats.totalStudents} students / {stats.totalDays} days
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse flex space-x-4 w-full">
            <div className="flex-1 space-y-6 py-1">
              <div className="h-48 bg-gray-200 rounded-full w-48 mx-auto"></div>
            </div>
          </div>
        </div>
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-500">
          No attendance data available
        </div>
      ) : (
        <div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                labelLine={false}
                label={renderCustomizedLabel}
                animationDuration={1500}
                animationBegin={0}
                animationEasing="ease-out"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                iconSize={10}
                formatter={(value) => {
                  return <span className="text-gray-700">{value}</span>;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          
         
         
          
        </div>
      )}
    </div>
  );
}

export default PieChartComponent;
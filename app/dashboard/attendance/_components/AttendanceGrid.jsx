import React, { useEffect, useState, useMemo } from 'react'
import moment from 'moment';
import GlobalApi from '@/app/_services/GlobalApi';
import { toast } from 'sonner';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/table';

function AttendanceGrid({ attadanceList, selectedMonth }) {
    const [rowData, setRowData] = useState([]);
    const [colDefs, setColDefs] = useState([]);
    const [search, setSearch] = useState("");

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const numberOfDays = daysInMonth(
        moment(selectedMonth).format('yyyy'),
        moment(selectedMonth).format('MM')
    );
    let daysArrays = Array.from({ length: numberOfDays }, (_, i) => i + 1);

    useEffect(() => {
        if (attadanceList) {
            const userList = getUniqueRecord();
            // Add attendance per day to each user
            userList.forEach((obj) => {
                daysArrays.forEach((date) => {
                    obj[date] = isPresent(obj.studentId, date);
                });
            });
            setRowData(userList);
            setColDefs([
                { field: 'studentId', label: 'Student ID' },
                { field: 'name', label: 'Name' },
                ...daysArrays.map((d) => ({ field: d.toString(), label: d.toString() })),
            ]);
        }
    }, [attadanceList, selectedMonth]);

    /**
     * used to check if user present or not
     */
    const isPresent = (studentId, day) => {
        const result = attadanceList.find(
            (item) => item.day == day && item.studentId == studentId
        );
        return result ? true : false;
    };

    /**
     * Used to get Distict User List
     */
    const getUniqueRecord = () => {
        const uniqueRecord = [];
        const existingUser = new Set();

        attadanceList?.forEach((record) => {
            if (!existingUser.has(record.studentId)) {
                existingUser.add(record.studentId);
                uniqueRecord.push({ ...record });
            }
        });

        return uniqueRecord;
    };

    /**
     * Used to mark student attendance
     */
    const onMarkAttendace = (day, studentId, presentStatus) => {
        const date = moment(selectedMonth).format('MM/yyyy');
        if (presentStatus) {
            const data = {
                day: day,
                studentId: studentId,
                present: presentStatus,
                date: date,
            };
            GlobalApi.MarkAttendance(data).then((resp) => {
                toast('Student Id:' + studentId + ' Marked as present');
            });
        } else {
            GlobalApi.MarkAbsent(studentId, day, date).then((resp) => {
                toast('Student Id:' + studentId + ' Marked as absent');
            });
        }
    };

    // Handle checkbox change
    const handleCheckboxChange = (studentId, day, checked) => {
        setRowData((prev) =>
            prev.map((row) =>
                row.studentId === studentId
                    ? { ...row, [day]: checked }
                    : row
            )
        );
        onMarkAttendace(day, studentId, checked);
    };

    // Filtered data based on search
    const filteredRowData = useMemo(() => {
        if (!search) return rowData;
        const lower = search.toLowerCase();
        return rowData.filter(row =>
            row.name?.toLowerCase().includes(lower) ||
            row.studentId?.toString().toLowerCase().includes(lower)
        );
    }, [rowData, search]);

    return (
        <div style={{ overflowX: 'auto' }} className="border rounded-lg shadow-lg p-4 bg-white">
            <div className="mb-4 flex  rounded-full ">
                <input
                    type="text"
                    placeholder="Search by name or ID..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="border rounded px-3 py-2 w-64 focus:outline-none focus:ring focus:border-blue-300"
                />
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        {colDefs.map((col) => (
                            <TableHead key={col.field}>{col.label}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredRowData.map((row) => (
                        <TableRow key={row.studentId}>
                            <TableCell>{row.studentId}</TableCell>
                            <TableCell>{row.name}</TableCell>
                            {daysArrays.map((day) => (
                                <TableCell key={day} style={{ textAlign: 'center' }}>
                                    <input
                                        type="checkbox"
                                        checked={!!row[day]}
                                        onChange={(e) =>
                                            handleCheckboxChange(
                                                row.studentId,
                                                day,
                                                e.target.checked
                                            )
                                        }
                                    />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export default AttendanceGrid
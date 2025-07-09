import React, { useEffect, useState } from 'react'
import { Search, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import GlobalApi from '@/app/_services/GlobalApi';
import { toast } from 'sonner';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '@/components/ui/table';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function StudentListTable({ studentList, refreshData }) {
    const [searchInput, setSearchInput] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        if (studentList) {
            setFilteredData(studentList);
            setCurrentPage(1);
        }
    }, [studentList]);

    useEffect(() => {
        if (studentList) {
            const lower = searchInput.toLowerCase();
            setFilteredData(
                studentList.filter(
                    (s) =>
                        s.name?.toLowerCase().includes(lower) ||
                        s.email?.toLowerCase().includes(lower) ||
                        s.grade?.toString().includes(lower) ||
                        s.address?.toLowerCase().includes(lower) ||
                        s.contact?.toLowerCase().includes(lower) ||
                        s.id?.toString().includes(lower)
                )
            );
            setCurrentPage(1);
        }
    }, [searchInput, studentList]);

    const DeleteRecord = (id) => {
        GlobalApi.DeleteStudentRecord(id).then(resp => {
            if (resp) {
                toast('Record deleted successfully !')
                refreshData()
            }
        })
    }

    // Pagination logic
    const totalRows = filteredData.length;
    const totalPages = Math.ceil(totalRows / pageSize);
    const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className='my-7'>
            <div style={{ height: 500 }}>
                <div className='p-2 rounded-full  w-80 ml-3 border shadow-sm flex gap-2 mb-4 max-w-sm'>
                    <Search />
                    <input
                        type='text'
                        placeholder='Search on Anything...'
                        className='outline-none rounded-full w-80'
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                    />
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Grade</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center">No students found.</TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell>{student.id}</TableCell>
                                    <TableCell>{student.name}</TableCell>
                                    <TableCell>{student.grade}</TableCell>
                                    <TableCell>{student.address}</TableCell>
                                    <TableCell>{student.contact}</TableCell>
                                    <TableCell>{student.email}</TableCell>
                                    <TableCell>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="sm" variant="destructive">
                                                    <Trash />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete your record
                                                        and remove your data from our servers.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => DeleteRecord(student.id)}>Continue</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                {/* Pagination Controls */}
                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                        <span>Rows per page:</span>
                        <select
                            className="border rounded px-2 py-1"
                            value={pageSize}
                            onChange={e => {
                                setPageSize(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                        >
                            {PAGE_SIZE_OPTIONS.map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            Prev
                        </Button>
                        <span>
                            Page {currentPage} of {totalPages || 1}
                        </span>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StudentListTable
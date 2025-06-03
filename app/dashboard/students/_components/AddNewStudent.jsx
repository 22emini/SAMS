"use client"
import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import GlobalApi from '@/app/_services/GlobalApi';
import { toast } from 'sonner';
import { LoaderIcon } from 'lucide-react';

function AddNewStudent({refreshData}) {
    const [open, setOpen] = useState(false);
    const [grades,setGrades]=useState([]);
    const [loading,setLoading]=useState(false);
    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm()

    useEffect(()=>{
        GetAllGradesList();
    },[])

    const GetAllGradesList=()=>{
        GlobalApi.GetAllGrades().then(resp=>{
            setGrades(resp.data);
            
        })
    }
    const onSubmit = async (data) => {
        setLoading(true);
        try {
            // Validate data before submission
            if (!data.name || !data.grade) {
                toast.error('Name and grade are required');
                return;
            }

            // Clean the data
            const studentData = {
                name: data.name.trim(),
                grade: data.grade.trim(),
                address: data.address ? data.address.trim() : null,
                contact: data.contact ? data.contact.trim() : null,
                email: data.email ? data.email.trim() : null,
                
            };

            console.log('Submitting student data:', studentData);
            const resp = await GlobalApi.CreateNewStudent(studentData);
            console.log("Response from create student:", resp);
            
            if (resp.data) {
                reset();
                refreshData();
                setOpen(false);
                toast.success('New Student Added!');
            } else {
                throw new Error('No data received from server');
            }
        } catch (error) {
            console.error("Error creating student:", error);
            const errorMessage = error.response?.data?.message || 
                               error.response?.data?.error || 
                               error.message || 
                               'Failed to create student';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    
    return (
        <div>
            <Button onClick={() => setOpen(true)}>+ Add New Student</Button>
            <Dialog open={open}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Student</DialogTitle>
                        <DialogDescription>
                            Fill in the details below to add a new student.
                        </DialogDescription>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className='py-2'>
                                <label>Full Name</label>
                                <Input placeholder='Ex. Jhon Carry'
                                    {...register('name', { required: true })}
                                />
                            </div>
                            <div className='flex flex-col  py-2'>
                                <label>Select Grade</label>
                                <select className='p-3 border rounded-lg'
                                    {...register('grade', { required: true })}>
                                        {grades.map((item,index)=>(
                                            <option key={index} value={item.grade}>{item.grade}</option>
                                        ))}
                                </select>
                            </div>
                            <div className='py-2'>
                                <label>Contact Number</label>
                                <Input type="number" placeholder='Ex. 9876543210'
                                    {...register('contact')} />
                            </div>
                            <div className='py-2'>
                                <label>Address</label>
                                <Input placeholder='Ex. 525 N tryon Streen, NC'
                                    {...register('address')} />
                            </div>
                            <div className='py-2'>
                                <label>Email</label>
                                <Input placeholder='email@gmail.com'
                                    {...register('email')} />
                            </div>

                            <div className='flex gap-3 items-center justify-end mt-5'>
                                <Button type="button" 
                                onClick={() => setOpen(false)} variant="ghost">Cancel</Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                >
                                  {loading?  <LoaderIcon className='animate-spin'/>:
                                    'Save'}</Button>

                            </div>
                        </form>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

        </div>
    )
}

export default AddNewStudent
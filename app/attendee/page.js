"use client"
import React, { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import GlobalApi from '@/app/_services/GlobalApi';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function AttendeeRegisterPage() {
   const router = useRouter()
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    grade: '',
    contact: '',
    address: '',
    email: '',
    lecturerEmail: '',
  });

  // Fetch grades for a specific lecturer
  useEffect(() => {
    if (form.lecturerEmail) {
      GlobalApi.GetGradesByLecturerEmail(form.lecturerEmail.trim()).then(resp => {
        const gradesData = resp.data || [];
        setGrades(gradesData);
        if (Array.isArray(gradesData) && gradesData.length === 0) {
          toast.error('No grades found for this lecturer.');
        }
      });
    } else {
      setGrades([]);
    }
  }, [form.lecturerEmail]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!form.name || !form.lecturerEmail || !form.grade) {
        toast.error('Name, lecturer email, and grade are required');
        setLoading(false);
        return;
      }

      // Step 1: Verify lecturer email exists and get clerkUserId
      let lecturerUserId = null;
      try {
        const lecturerResp = await GlobalApi.VerifyLecturerEmail(form.lecturerEmail.trim());
        if (lecturerResp.data && lecturerResp.data.clerkUserId) {
          lecturerUserId = lecturerResp.data.clerkUserId;
        } else {
          toast.error('Lecturer email not found or not registered.');
          setLoading(false);
          return;
        }
      } catch (err) {
        toast.error('Failed to verify lecturer email.');
        setLoading(false);
        return;
      }

      // Step 2: Register student with lecturer's clerkUserId and selected grade
      const studentData = {
        name: form.name.trim(),
        grade: form.grade.trim(),
        address: form.address ? form.address.trim() : null,
        contact: form.contact ? form.contact.trim() : null,
        email: form.email ? form.email.trim() : null,
        clerkUserId: lecturerUserId,
      };
      const resp = await GlobalApi.CreateNewStudent(studentData);
      if (resp.data) {
        setForm({ name: '', grade: '', contact: '', address: '', email: '', lecturerEmail: '' });
        toast.success('Registration successful!');
          router.push('/attendee/faceID')
      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to register';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Student Registration</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Full Name <span className="text-red-500">*</span></label>
            <Input name="name" placeholder="Ex. John Carry" value={form.name} onChange={handleChange} required />
          </div>
          <div>
            <label className="block mb-1 font-medium">Grade <span className="text-red-500">*</span></label>
            <select
              name="grade"
              value={form.grade}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!grades.length}
            >
              <option value="">{grades.length ? 'Select grade' : 'Enter lecturer email first'}</option>
              {grades.map((g) => (
                <option key={g.id} value={g.grade}>{g.grade}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Lecturer Email <span className="text-red-500">*</span></label>
            <Input name="lecturerEmail" type="email" placeholder="lecturer@email.com" value={form.lecturerEmail} onChange={handleChange} required />
          </div>
          <div>
            <label className="block mb-1 font-medium">Contact Number</label>
            <Input name="contact" type="number" placeholder="Ex. 9876543210" value={form.contact} onChange={handleChange} />
          </div>
          <div>
            <label className="block mb-1 font-medium">Address</label>
            <Input name="address" placeholder="Ex. 525 N Tryon Street, NC" value={form.address} onChange={handleChange} />
          </div>
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <Input name="email" type="email" placeholder="email@gmail.com" value={form.email} onChange={handleChange} />
          </div>
          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </Button>
          <Button variant="outline" className="w-full mt-4">
            <Link href="/">Back</Link>
          </Button>
          <Button variant="outline" className="w-full mt-4">
            <Link href="/attendee/take-attendance">Take Attendance</Link>
          </Button>
        </form>
      </div>
    </div>
  );
}

export default AttendeeRegisterPage;
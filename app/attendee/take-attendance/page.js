"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import GlobalApi from "@/app/_services/GlobalApi";

const TakeAttendancePage = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    lecturerEmail: "",
    grade: "",
  });
  const [loading, setLoading] = useState(false);
  const [grades, setGrades] = useState([]);
  // Fetch grades when lecturerEmail changes
  useEffect(() => {
    const fetchGrades = async () => {
      if (form.lecturerEmail) {
        try {
          const resp = await GlobalApi.GetGradesByLecturerEmail(form.lecturerEmail.trim());
          setGrades(resp.data || []);
        } catch (err) {
          setGrades([]);
        }
      } else {
        setGrades([]);
      }
    };
    fetchGrades();
  }, [form.lecturerEmail]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!form.email || !form.lecturerEmail || !form.grade) {
        toast.error("All fields are required");
        setLoading(false);
        return;
      }

      // 1. Get lecturer's clerkUserId
      let lecturerUserId = null;
      try {
        const lecturerResp = await GlobalApi.VerifyLecturerEmail(form.lecturerEmail.trim());
        if (lecturerResp.data && lecturerResp.data.clerkUserId) {
          lecturerUserId = lecturerResp.data.clerkUserId;
        } else {
          toast.error("Lecturer email not found or not registered.");
          setLoading(false);
          return;
        }
      } catch (err) {
        toast.error("Failed to verify lecturer email.");
        setLoading(false);
        return;
      }

      // 2. Check if student exists for this lecturer and grade
      try {
        const resp = await GlobalApi.GetStudentsByLecturerAndGrade({
          email: form.email.trim(),
          clerkUserId: lecturerUserId,
          grade: form.grade.trim(),
        });
        if (resp.data && Array.isArray(resp.data) && resp.data.length > 0) {
          toast.success("Student found. Redirecting to Face ID...");
          // Pass params to faceID page for correct attendance context
          router.push(`/attendee/take-attendance/faceID?email=${encodeURIComponent(form.email)}&lecturerEmail=${encodeURIComponent(form.lecturerEmail)}&grade=${encodeURIComponent(form.grade)}`);
        } else {
          toast.error("No student found for this lecturer and grade.");
        }
      } catch (err) {
        toast.error("Error checking student: " + (err.response?.data?.message || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Take Attendance</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Student Email <span className="text-red-500">*</span></label>
            <Input name="email" type="email" placeholder="student@email.com" value={form.email} onChange={handleChange} required />
          </div>
          <div>
            <label className="block mb-1 font-medium">Lecturer Email <span className="text-red-500">*</span></label>
            <Input name="lecturerEmail" type="email" placeholder="lecturer@email.com" value={form.lecturerEmail} onChange={handleChange} required />
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
          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? "Checking..." : "Proceed to Face ID"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default TakeAttendancePage;
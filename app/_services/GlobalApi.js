
const { default: axios } = require("axios");
// Verify lecturer email and get clerkUserId
const VerifyLecturerEmail = (email) => axios.get(`/api/verify-lecturer?email=${encodeURIComponent(email)}`);

const GetAllGrades=()=>axios.get('/api/grade');
// Get grades by lecturer email
const GetGradesByLecturerEmail = (email) => axios.get(`/api/grade?lecturerEmail=${encodeURIComponent(email)}`);
const CreateNewStudent=(data)=>axios.post('/api/student',data)
const GetAllStudents=()=>axios.get('/api/student');
// Get students by lecturer and grade (and optionally email)
const GetStudentsByLecturerAndGrade = ({ email, clerkUserId, grade }) => {
    let url = `/api/student?clerkUserId=${encodeURIComponent(clerkUserId)}&grade=${encodeURIComponent(grade)}`;
    if (email) url += `&email=${encodeURIComponent(email)}`;
    return axios.get(url);
};
const DeleteStudentRecord=(id)=>axios.delete('/api/student?id='+id)
const GetAttendanceList=(grade,month)=>axios.get('/api/attendance?grade='+grade+"&month="+month)
const MarkAttendance=(data)=>axios.post('/api/attendance',data);
const MarkAbsent=(studentId,day,date)=>axios.delete('/api/attendance?studentId='+studentId+"&day="+day+"&date="+date)
const TotalPresentCountByDay=(date,grade)=>axios.get('/api/dashboard?date='+date+"&grade="+grade);

// Face recognition endpoints
const RegisterFaceId=(studentId, faceDescriptor)=>
    axios.post('/api/student/faceId', { studentId, faceDescriptor });

const MarkAttendanceWithFace = (faceDescriptor, grade) =>
    axios.post(
        '/api/face-attendance',
        { faceDescriptor, grade }
    );

export default{
    GetAllGrades,
    GetGradesByLecturerEmail,
    CreateNewStudent,
    GetAllStudents,
    DeleteStudentRecord,
    GetAttendanceList,
    MarkAttendance,
    MarkAbsent,
    TotalPresentCountByDay,
    RegisterFaceId,
    MarkAttendanceWithFace,
    VerifyLecturerEmail,
    GetStudentsByLecturerAndGrade
}
import React, { useState, useEffect } from 'react';
import { Pencil, Search, RefreshCw, AlertCircle } from 'lucide-react';
import EditOne from '../_components/EditOne';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageStudent, setMessageStudent] = useState(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sending, setSending] = useState(false);
  const [gmail, setGmail] = useState("");
  const [gmailPassword, setGmailPassword] = useState("");
  const [gmailList, setGmailList] = useState([]);

  useEffect(() => {
    fetchStudents();
    fetchSavedGmails();
  }, []);

  const fetchStudents = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      
      const response = await fetch('/api/student');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError(error.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchSavedGmails = async () => {
    try {
      const res = await fetch('/api/usergmail');
      if (!res.ok) throw new Error('Failed to fetch saved Gmail accounts');
      const data = await res.json();
      setGmailList(data);
    } catch (err) {
      setGmailList([]);
    }
  };

  const handleEditClick = (student) => {
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    fetchStudents();
    setIsEditModalOpen(false);
  };

  const handleSendMessageClick = (student) => {
    setMessageStudent(student);
    setEmailSubject('');
    setEmailBody('');
    setIsMessageModalOpen(true);
  };

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast.error('Please provide both subject and message.');
      return;
    }
    if (!gmail.trim() || !gmailPassword.trim()) {
      toast.error('Please provide both Gmail and password.');
      return;
    }
    setSending(true);
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          students: [{ ...messageStudent }],
          subject: emailSubject,
          message: emailBody,
          month: '',
          gmail,
          gmailPassword
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send email');
      }
      setIsMessageModalOpen(false);
      setGmail("");
      setGmailPassword("");
      toast.success('Message sent successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const filteredStudents = students.filter(student => 
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.grade?.toString().includes(searchTerm)
  );

  const EmptyState = () => (
    <div className="text-center py-8">
      <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-lg font-medium text-gray-900">No students found</h3>
      <p className="mt-1 text-sm text-gray-500">
        {searchTerm ? 'Try adjusting your search term' : 'Add students to get started'}
      </p>
    </div>
  );

  const ErrorState = () => (
    <div className="text-center py-8 bg-red-50 rounded-lg">
      <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
      <h3 className="mt-2 text-lg font-medium text-red-800">Error loading students</h3>
      <p className="mt-1 text-sm text-red-600">{error}</p>
      <button 
        onClick={fetchStudents}
        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold">Student List</h1>
        
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <div className="relative rounded-3xl  bg-white shadow-lg">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center  pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent outline-none  block w-full pl-10 sm:text-sm  rounded-md"
            />
          </div>
          
          <button
            onClick={fetchStudents}
            disabled={isRefreshing}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      ) : error ? (
        <ErrorState />
      ) : filteredStudents.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.grade}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.address || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.contact || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.email || 'N/A'}
                    {student.email && (
                      <Button size="sm" variant="outline" className="ml-2" title="Send Message" onClick={() => handleSendMessageClick(student)}>
                        <Mail className="w-4 h-4 mr-1" />
                        Message
                      </Button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditClick(student)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedStudent && (
        <EditOne
          student={selectedStudent}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Message Modal */}
      {isMessageModalOpen && messageStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md" key={messageStudent.id}>
            <h2 className="text-xl font-bold mb-4">Send Message to {messageStudent.name}</h2>
            {gmailList.length > 0 && (
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Select Saved Gmail</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={gmailList.find(g => g.gmail === gmail && (g.gmail_password === gmailPassword || g.gmailPassword === gmailPassword))?.id || ''}
                  onChange={e => {
                    const selected = gmailList.find(g => g.id === Number(e.target.value));
                    if (selected) {
                      setGmail(selected.gmail);
                      setGmailPassword(selected.gmail_password || selected.gmailPassword || '');
                    } else {
                      setGmail('');
                      setGmailPassword('');
                    }
                  }}
                >
                  <option value="">-- Select an account --</option>
                  {gmailList.map(g => (
                    <option key={g.id} value={g.id}>{g.gmail}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Gmail Address</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={gmail}
                onChange={e => setGmail(e.target.value)}
                placeholder="youraddress@gmail.com"
                type="email"
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Gmail Password (App Password recommended)</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={gmailPassword}
                onChange={e => setGmailPassword(e.target.value)}
                placeholder="Gmail App Password"
                type="password"
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Subject</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={emailSubject}
                onChange={e => { setEmailSubject(e.target.value); console.log('Subject:', e.target.value); }}
                placeholder="Subject"
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                className="w-full border rounded px-3 py-2 min-h-[100px]"
                value={emailBody}
                onChange={e => { setEmailBody(e.target.value); console.log('Body:', e.target.value); }}
                placeholder="Type your message..."
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" onClick={() => setIsMessageModalOpen(false)} disabled={sending}>Cancel</Button>
              <Button onClick={handleSendEmail} disabled={sending || !emailSubject || !emailBody || !gmail || !gmailPassword}>
                {sending ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;
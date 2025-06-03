"use client"
import React, { useState, useEffect } from 'react'
import MonthSelection from '@/app/_components/MonthSelection'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Send, Mail, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import moment from 'moment'

const SendMessage = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(new Date().getDate())
  const [attendanceData, setAttendanceData] = useState([])
  const [absentStudents, setAbsentStudents] = useState([])
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [allStudents, setAllStudents] = useState([])
  const [gmail, setGmail] = useState("")
  const [gmailPassword, setGmailPassword] = useState("")
  const [useDefaultMessage, setUseDefaultMessage] = useState(true)
  const [gmailList, setGmailList] = useState([])
  const [grades, setGrades] = useState([])
  const defaultMessage = "You are absent from class today."

  // Fetch all grades on mount
  useEffect(() => {
    fetchAllGrades()
  }, [])

  const fetchAllGrades = async () => {
    try {
      const response = await fetch('/api/grade')
      if (!response.ok) throw new Error('Failed to fetch grades')
      const data = await response.json()
      setGrades(data.map(g => g.grade))
    } catch (error) {
      setGrades([])
    }
  }

  // Fetch attendance data and all students when month or grades change
  useEffect(() => {
    if (grades.length > 0) {
      fetchAttendanceData()
      fetchAllStudents()
    }
  }, [selectedMonth, grades])

  // Fetch all students
  const fetchAllStudents = async () => {
    try {
      const response = await fetch(`/api/student`)
      if (!response.ok) throw new Error('Failed to fetch students')
      const data = await response.json()
      setAllStudents(data)
    } catch (error) {
      setAllStudents([])
    }
  }

  // Process attendance data to find absent students for the selected day
  useEffect(() => {
    if (attendanceData.length > 0 && allStudents.length > 0) {
      processAbsentStudents()
    }
  }, [attendanceData, allStudents, selectedDay])

  // Fetch attendance for all grades and merge
  const fetchAttendanceData = async () => {
    setLoading(true)
    try {
      const formattedMonth = moment(selectedMonth).format('MM/yyyy')
      let allAttendance = []
      for (const grade of grades) {
        const response = await fetch(`/api/attendance?grade=${grade}&month=${formattedMonth}`)
        if (response.ok) {
          const data = await response.json()
          allAttendance = allAttendance.concat(data)
        }
      }
      setAttendanceData(allAttendance)
    } catch (error) {
      console.error('Error fetching attendance data:', error)
      toast.error('Failed to fetch attendance data')
    } finally {
      setLoading(false)
    }
  }

  const processAbsentStudents = () => {
    // Map attendance by studentId and day
    const attendanceMap = new Map()
    attendanceData.forEach(record => {
      if (!attendanceMap.has(record.studentId)) attendanceMap.set(record.studentId, {})
      attendanceMap.get(record.studentId)[record.day] = record.present
    })
    // Find absent students: no record for the day or present is false
    const absent = allStudents.filter(student => {
      const studentAttendance = attendanceMap.get(student.id)
      return !studentAttendance || studentAttendance[selectedDay] !== true
    }).map(student => ({
      ...student,
      absentDaysCount: 1,
      absentDays: [selectedDay],
      presentDays: attendanceMap.get(student.id)
        ? Object.keys(attendanceMap.get(student.id)).filter(day => attendanceMap.get(student.id)[day])
        : [],
    }))
    setAbsentStudents(absent)
  }

  // Fetch saved Gmail accounts on mount
  useEffect(() => {
    fetchSavedGmails()
  }, [])

  const fetchSavedGmails = async () => {
    try {
      const res = await fetch('/api/usergmail')
      if (!res.ok) throw new Error('Failed to fetch saved Gmail accounts')
      const data = await res.json()
      setGmailList(data)
    } catch (err) {
      setGmailList([])
    }
  }

  const handleSendEmails = async () => {
    if (!emailSubject.trim() || !(useDefaultMessage || emailBody.trim())) {
      toast.error('Please provide both subject and message content')
      return
    }
    if (!gmail.trim() || !gmailPassword.trim()) {
      toast.error('Please provide both Gmail and password')
      return
    }
    if (absentStudents.length === 0) {
      toast.error('No absent students with email addresses found')
      return
    }
    setSending(true)
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          students: absentStudents,
          subject: emailSubject,
          message: useDefaultMessage ? defaultMessage : emailBody,
          month: moment(selectedMonth).format('MMMM YYYY'),
          gmail,
          gmailPassword
        })
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send emails')
      }
      const result = await response.json()
      toast.success(`Successfully sent ${result.sent} emails`)
      setEmailSubject('')
      setEmailBody('')
      setGmail("")
      setGmailPassword("")
    } catch (error) {
      console.error('Error sending emails:', error)
      toast.error(error.message || 'Failed to send emails')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Send Notifications to Absent Students</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Select Month</label>
          <MonthSelection selectedMonth={setSelectedMonth} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Select Day</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedDay}
            onChange={e => setSelectedDay(Number(e.target.value))}
          >
            {Array.from({ length: new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate() }, (_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Absent Students</h2>
            {absentStudents.length > 0 ? (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent Days</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {absentStudents.map((student) => (
                      <tr key={student.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.grade}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.absentDaysCount} days</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No absent students found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {'All students were present or no attendance data available'}
                </p>
              </div>
            )}
          </div>
          
          {absentStudents.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Compose Email</h2>
              
              {gmailList.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Select Saved Gmail</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={gmailList.find(g => g.gmail === gmail && g.gmail_password === gmailPassword)?.id || ''}
                    onChange={e => {
                      const selected = gmailList.find(g => g.id === Number(e.target.value))
                      if (selected) {
                        setGmail(selected.gmail)
                        setGmailPassword(selected.gmail_password || selected.gmailPassword || '')
                      } else {
                        setGmail('')
                        setGmailPassword('')
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
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Gmail Address</label>
                <Input
                  value={gmail}
                  onChange={e => setGmail(e.target.value)}
                  placeholder="youraddress@gmail.com"
                  type="email"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Gmail Password (App Password recommended)</label>
                <Input
                  value={gmailPassword}
                  onChange={e => setGmailPassword(e.target.value)}
                  placeholder="Gmail App Password"
                  type="password"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Subject</label>
                <Input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Attendance Notification"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Use Default Message</label>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="useDefaultMessage"
                    checked={useDefaultMessage}
                    onChange={() => setUseDefaultMessage(!useDefaultMessage)}
                    className="mr-2"
                  />
                  <label htmlFor="useDefaultMessage" className="text-sm">Use default message</label>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Message</label>
                <Textarea
                  value={useDefaultMessage ? defaultMessage : emailBody}
                  onChange={e => setEmailBody(e.target.value)}
                  placeholder="Dear parent, we are writing to inform you about your child's absence..."
                  className="min-h-[200px]"
                  disabled={useDefaultMessage}
                />
                <p className="text-sm text-gray-500 mt-1">
                  You can use {'{studentName}'}, {'{absentDays}'}, and {'{month}'} as placeholders.
                </p>
              </div>
              
              <Button
                onClick={handleSendEmails}
                disabled={
                  sending ||
                  !emailSubject ||
                  (!useDefaultMessage && !emailBody) ||
                  !gmail ||
                  !gmailPassword
                }
                className="w-full"
              >
                {sending ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Emails to {absentStudents.length} Students
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default SendMessage
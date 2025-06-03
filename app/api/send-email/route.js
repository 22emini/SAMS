import { NextResponse } from "next/server";
import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    // Parse request body
    let data;
    try {
      data = await req.json();
      console.log("Request body data:", data);
    } catch (err) {
      console.error("Error parsing request body:", err);
      return NextResponse.json({ error: "Invalid JSON in request body", message: err.message }, { status: 400 });
    }
    const { students, subject, message, month, gmail, gmailPassword } = data;
    if (!students || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: "No students provided" }, { status: 400 });
    }
    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
    }
    if (!gmail || !gmailPassword) {
      return NextResponse.json({ error: "Gmail and password are required" }, { status: 400 });
    }

    // Setup nodemailer transporter
    let transporter;
    try {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmail,
          pass: gmailPassword
        }
      });
      console.log("Transporter created");
    } catch (err) {
      console.error("Error creating transporter:", err);
      return NextResponse.json({ error: "Failed to create email transporter", message: err.message }, { status: 500 });
    }

    const results = { sent: 0, failed: 0, errors: [] };
    for (const student of students) {
      if (!student.email) continue;
      try {
        const personalizedMessage = message
          .replace(/{studentName}/g, student.name)
          .replace(/{absentDays}/g, student.absentDaysCount)
          .replace(/{month}/g, month);
        await transporter.sendMail({
          from: gmail,
          to: student.email,
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8faff; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); border: 1px solid #e3e9f7; overflow: hidden;">
              <div style="background: linear-gradient(90deg, #0a2342 0%, #1976d2 100%); padding: 24px 32px; text-align: center;">
  <h2 style="color: #fff; margin: 0; font-size: 2rem; letter-spacing: 1px; display: inline-block;">${subject}</h2>
</div>
              <div style="padding: 32px 32px 16px 32px;">
                <p style="font-size: 17px; line-height: 1.7; color: #222; margin: 0 0 24px 0;">
                  ${personalizedMessage.replace(/\n/g, '<br>')}
                </p>
              </div>
              <div style="background: #0a2342; color: #fff; padding: 18px 32px; border-top: 1px solid #1976d2; font-size: 15px; text-align: center;">
                <p style="margin: 0;">This is an automated message from the <span style='color:#1976d2;font-weight:600;'>Student Attendance Monitoring System</span>.</p>
              </div>
            </div>
          `
        });
        console.log(`Email sent to ${student.email}`);
        results.sent++;
      } catch (error) {
        console.error(`Failed to send email to ${student.email}:`, error);
        results.failed++;
        results.errors.push({ student: student.email, error: error.message });
      }
    }
    return NextResponse.json(results);
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Server error", message: error.message }, { status: 500 });
  }
}
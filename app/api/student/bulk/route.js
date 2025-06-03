import { db } from "@/utils";
import { STUDENTS } from "@/utils/schema";
import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';

export async function POST(req) {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { students } = await req.json();
        
        if (!students || !Array.isArray(students)) {
            return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
        }

        // Validate required fields and clean data
        const validStudents = students.filter(student => {
            return student.name && student.name.trim() && 
                   student.grade && student.grade.trim();
        }).map(student => ({
            name: student.name.trim(),
            grade: student.grade.trim(),
            address: student.address?.trim() || '',
            contact: student.contact?.trim() || '',
            email: student.email?.trim() || '',
            clerkUserId: userId // Add clerk user ID to each student record
        }));

        if (validStudents.length === 0) {
            return NextResponse.json({ error: "No valid student data found" }, { status: 400 });
        }

        const result = await db.insert(STUDENTS).values(validStudents);
        return NextResponse.json({ 
            success: true, 
            count: validStudents.length 
        });
    } catch (error) {
        console.error('Error in bulk upload:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

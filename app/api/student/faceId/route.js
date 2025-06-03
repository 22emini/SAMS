import { db } from "@/utils";
import { STUDENTS } from "@/utils/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';

export async function POST(req) {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { studentId, faceDescriptor } = await req.json();

        if (!studentId || !faceDescriptor) {
            return NextResponse.json({ error: "Student ID and face descriptor are required" }, { status: 400 });
        }

        // Verify that the student belongs to the current user
        const student = await db
            .select()
            .from(STUDENTS)
            .where(
                eq(STUDENTS.id, studentId)
            )
            .limit(1);

        if (!student || student.length === 0) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        // Update the student record with the face descriptor
        const result = await db
            .update(STUDENTS)
            .set({
                faceDescriptor: JSON.stringify(faceDescriptor)
            })
            .where(eq(STUDENTS.id, studentId));

        return NextResponse.json({ 
            success: true,
            message: "Face ID registered successfully"
        });
    } catch (error) {
        console.error("Error registering face ID:", error);
        return NextResponse.json({ error: "Failed to register face ID" }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const searchParams = req.nextUrl.searchParams;
        const studentId = searchParams.get('studentId');

        if (!studentId) {
            return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
        }

        const student = await db
            .select()
            .from(STUDENTS)
            .where(
                and(
                    eq(STUDENTS.id, studentId),
                    eq(STUDENTS.clerkUserId, userId)
                )
            )
            .limit(1);

        if (!student || student.length === 0) {
            return NextResponse.json({ error: "Student not found or unauthorized" }, { status: 403 });
        }

        return NextResponse.json({ 
            faceDescriptor: student[0].faceDescriptor ? JSON.parse(student[0].faceDescriptor) : null 
        });
    } catch (error) {
        console.error("Error fetching face ID:", error);
        return NextResponse.json({ error: "Failed to fetch face ID" }, { status: 500 });
    }
}
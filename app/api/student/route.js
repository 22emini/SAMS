import { db } from "@/utils";
import { STUDENTS } from "@/utils/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';

export async function POST(req) {
    try {
        const data = await req.json();
        console.log('Received data:', data);

        if (!data.name || !data.grade || !data.clerkUserId) {
            console.log('Validation failed:', { name: data.name, grade: data.grade, clerkUserId: data.clerkUserId });
            return NextResponse.json({ error: "Name, grade, and clerkUserId are required" }, { status: 400 });
        }

        // Prepare the data to be inserted
        const studentData = {
            name: data.name.trim(),
            grade: data.grade.trim(),
            address: data.address ? data.address.trim() : null,
            contact: data.contact ? data.contact.trim() : null,
            email: data.email ? data.email.trim() : null,
            clerkUserId: data.clerkUserId.trim()
        };
        console.log('Attempting to insert student:', studentData);

        // Check for duplicate email (case-insensitive)
        if (studentData.email) {
            const existing = await db
                .select()
                .from(STUDENTS)
                .where(eq(STUDENTS.email, studentData.email.toLowerCase()));
            if (existing.length > 0) {
                return NextResponse.json({ error: "A student with this email already exists." }, { status: 409 });
            }
        }

        try {
            const result = await db.insert(STUDENTS).values(studentData);
            console.log('Insert result:', result);

            // If insert was successful, fetch the created student
            const createdStudent = await db
                .select()
                .from(STUDENTS)
                .where(eq(STUDENTS.clerkUserId, data.clerkUserId.trim()))
                .orderBy(desc(STUDENTS.id))
                .limit(1);

            return NextResponse.json(createdStudent[0] || result);
        } catch (dbError) {
            console.error('Database error:', dbError);
            return NextResponse.json({ 
                error: "Database error",
                message: dbError.message,
                code: dbError.code
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Error in POST /api/student:', error);
        return NextResponse.json({ 
            error: "Server error",
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const grade = searchParams.get('grade');
        const clerkUserId = searchParams.get('clerkUserId');
        const email = searchParams.get('email');

        // Public lookup for attendance: allow if all three are present
        if (clerkUserId && grade && email) {
            const result = await db.select().from(STUDENTS)
                .where(eq(STUDENTS.clerkUserId, clerkUserId))
                .where(eq(STUDENTS.grade, grade))
                .where(eq(STUDENTS.email, email));
            return NextResponse.json(result);
        }

        // Otherwise, require authentication (for dashboard etc)
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let query = db.select().from(STUDENTS);
        if (grade) {
            query = query.where(eq(STUDENTS.grade, grade));
        }
        // Only return students associated with the current user
        query = query.where(eq(STUDENTS.clerkUserId, userId));
        const result = await query;
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const id = searchParams.get('id');
        
        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        const result = await db.delete(STUDENTS)
            .where(eq(STUDENTS.id, id));

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const id = searchParams.get('id');
        const data = await req.json();

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        const result = await db.update(STUDENTS)
            .set({
                name: data.name,
                grade: data.grade,
                address: data.address || null,
                contact: data.contact || null,
                email: data.email || null,
            })
            .where(eq(STUDENTS.id, id));

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
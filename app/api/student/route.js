import { db } from "@/utils";
import { STUDENTS } from "@/utils/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';

export async function POST(req) {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            console.log('Unauthorized: No user ID found');
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        console.log('Received data:', data);

        if (!data.name || !data.grade) {
            console.log('Validation failed:', { name: data.name, grade: data.grade });
            return NextResponse.json({ error: "Name and grade are required" }, { status: 400 });
        }

        // Prepare the data to be inserted
        const studentData = {
            name: data.name.trim(),
            grade: data.grade.trim(),
            address: data.address ? data.address.trim() : null,
            contact: data.contact ? data.contact.trim() : null,
            email: data.email ? data.email.trim() : null,
            clerkUserId: userId
        };
        console.log('Attempting to insert student:', studentData);

        try {
            const result = await db.insert(STUDENTS).values(studentData);
            console.log('Insert result:', result);

            // If insert was successful, fetch the created student
            const createdStudent = await db
                .select()
                .from(STUDENTS)
                .where(eq(STUDENTS.clerkUserId, userId))
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
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const searchParams = req.nextUrl.searchParams;
        const grade = searchParams.get('grade');

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
import { db } from "@/utils";
import { ATTENDACE, STUDENTS } from "@/utils/schema";
import { and, asc, eq, isNull, or } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const grade = searchParams.get('grade');
        const month = searchParams.get('month');

        if (!grade || !month) {
            return NextResponse.json({ error: "Grade and month are required parameters." }, { status: 400 });
        }

        const result = await db
            .select({
                name: STUDENTS.name,
                present: ATTENDACE.present,
                day: ATTENDACE.day,
                date: ATTENDACE.date,
                grade: STUDENTS.grade,
                studentId: STUDENTS.id,
                attendanceId: ATTENDACE.id
            })
            .from(STUDENTS)
            .leftJoin(
                ATTENDACE,
                and(eq(STUDENTS.id, ATTENDACE.studentId), eq(ATTENDACE.date, month))
            )
            .where(
                eq(STUDENTS.grade, grade)
            )
            .orderBy(asc(STUDENTS.id));

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching attendance data:", error);
        return NextResponse.json({ error: "Failed to fetch attendance data." }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const data = await req.json();

        const result = await db.insert(ATTENDACE).values({
            studentId: data.studentId,
            present: data.present,
            day: data.day,
            date: data.date
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error recording attendance:", error);
        return NextResponse.json({ error: "Failed to record attendance." }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const studentId = searchParams.get('studentId');
        const date = searchParams.get('date');
        const day = searchParams.get('day');

        if (!studentId || !date || !day) {
            return NextResponse.json({ error: "studentId, date, and day are required parameters." }, { status: 400 });
        }

        const result = await db.delete(ATTENDACE).where(
            and(
                eq(ATTENDACE.studentId, studentId),
                eq(ATTENDACE.day, day),
                eq(ATTENDACE.date, date)
            )
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: "No matching record found to delete." }, { status: 404 });
        }

        return NextResponse.json({ message: "Attendance record deleted successfully.", result });
    } catch (error) {
        console.error("Error deleting attendance record:", error);
        return NextResponse.json({ error: "Failed to delete attendance record." }, { status: 500 });
    }
}

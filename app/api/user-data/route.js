import { auth } from '@clerk/nextjs/server';
import { db } from "@/utils";
import { STUDENTS } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const { userId } = auth();
        
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user-specific data from the database
        const result = await db
            .select()
            .from(STUDENTS)
            .where(eq(STUDENTS.clerkUserId, userId));

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching user data:", error);
        return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const { userId } = auth();
        
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        
        // Update or create user-specific data
        const result = await db.insert(STUDENTS)
            .values({
                ...data,
                clerkUserId: userId
            });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error saving user data:", error);
        return NextResponse.json({ error: "Failed to save user data" }, { status: 500 });
    }
} 
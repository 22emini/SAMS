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

        const { faceDescriptor, grade } = await req.json();

        if (!faceDescriptor || !grade) {
            return NextResponse.json({ error: "Face descriptor and grade are required" }, { status: 400 });
        }

        // Threshold for face recognition (lower = stricter, higher = more lenient)
        const FACE_MATCH_THRESHOLD = 0.4; // Adjust as needed (0.35-0.5 typical for best accuracy)

        // Get all students in the same grade with registered face descriptors
        const students = await db
            .select()
            .from(STUDENTS)
            .where(
                and(
                    eq(STUDENTS.grade, grade),
                    eq(STUDENTS.clerkUserId, userId)
                )
            );

        let bestMatch = null;
        let minDistance = Number.MAX_VALUE;

        // Compare the detected face with stored face descriptors
        for (const student of students) {
            if (!student.faceDescriptor) continue;

            const storedDescriptor = JSON.parse(student.faceDescriptor);
            const distance = euclideanDistance(faceDescriptor, storedDescriptor);

            // The lower the distance, the better the match
            if (distance < minDistance && distance < FACE_MATCH_THRESHOLD) {
                minDistance = distance;
                bestMatch = student;
            }
        }

        if (bestMatch) {
            return NextResponse.json({ 
                matched: true, 
                student: {
                    id: bestMatch.id,
                    name: bestMatch.name,
                    grade: bestMatch.grade
                },
                confidence: 1 - minDistance // 1 = perfect match, 0 = no match
            });
        } else {
            return NextResponse.json({ 
                matched: false,
                message: "No matching face found. Please register your face ID first."
            });
        }
    } catch (error) {
        console.error("Error during face recognition:", error);
        return NextResponse.json({ error: "Face recognition failed" }, { status: 500 });
    }
}

// Helper function to calculate Euclidean distance between face descriptors
function euclideanDistance(descriptor1, descriptor2) {
    return Math.sqrt(
        descriptor1.reduce((sum, val, i) => sum + Math.pow(val - descriptor2[i], 2), 0)
    );
}
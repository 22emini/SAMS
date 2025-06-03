import { db } from "@/utils";
import { GRADES } from "@/utils/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from '@clerk/nextjs/server';

// GET all grades
export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Only return grades associated with the current user
    const result = await db.select().from(GRADES).where(eq(GRADES.clerkUserId, userId));
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching grades:", error);
    return NextResponse.json({ error: "Failed to fetch grades" }, { status: 500 });
  }
}

// POST (add) a new grade
export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { grade } = await req.json();
    if (!grade) {
      return NextResponse.json({ error: "Grade is required" }, { status: 400 });
    }
    try {
      // Insert the new grade with clerkUserId
      const result = await db.insert(GRADES).values({ grade, clerkUserId: userId });
      // Get the inserted ID - handling different MySQL driver behaviors
      let insertedId;
      if (result.insertId) {
        insertedId = result.insertId;
      } else if (result[0]?.id) {
        insertedId = result[0].id;
      } else {
        const inserted = await db.select().from(GRADES)
          .where(eq(GRADES.grade, grade))
          .orderBy(GRADES.id, "desc")
          .limit(1);
        insertedId = inserted[0]?.id || Date.now();
      }
      return NextResponse.json({ id: insertedId, grade }, { status: 201 });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json({ error: "Database error: " + dbError.message }, { status: 500 });
    }
  } catch (error) {
    console.error("Error parsing request:", error);
    return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
  }
}

// PUT (edit) an existing grade
export async function PUT(req) {
  try {
    const { id, grade } = await req.json();
    
    if (!id || !grade) {
      return NextResponse.json({ error: "ID and Grade are required" }, { status: 400 });
    }
    
    try {
      // Convert id to number if it's a string
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      // Update the grade
      const updateResult = await db.update(GRADES)
        .set({ grade })
        .where(eq(GRADES.id, numericId));
      
      // Check if any rows were affected
      if (updateResult.affectedRows === 0) {
        return NextResponse.json({ error: "Grade not found" }, { status: 404 });
      }
      
      return NextResponse.json({ id: numericId, grade });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json({ error: "Database error: " + dbError.message }, { status: 500 });
    }
  } catch (error) {
    console.error("Error parsing request:", error);
    return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
  }
}

// DELETE a grade - Supporting request body as used in the GroupsModal component
export async function DELETE(req) {
  try {
    const { id } = await req.json();
    
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    
    // Convert to number if it's a string
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    
    try {
      const deleteResult = await db.delete(GRADES)
        .where(eq(GRADES.id, numericId));
      
      // Check if any rows were affected
      if (deleteResult.affectedRows === 0) {
        return NextResponse.json({ error: "Grade not found" }, { status: 404 });
      }
      
      return NextResponse.json({ success: true, id: numericId });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json({ error: "Database error: " + dbError.message }, { status: 500 });
    }
  } catch (error) {
    console.error("Error processing delete request:", error);
    return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
  }
}
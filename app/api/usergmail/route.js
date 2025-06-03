import { db } from "@/utils";
import { USERGMAIL } from "@/utils/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from '@clerk/nextjs/server';

export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Only return usergmail associated with the current user
    const result = await db.select().from(USERGMAIL).where(eq(USERGMAIL.clerkUserId, userId));
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching usergmail:", error);
    return NextResponse.json({ error: "Failed to fetch usergmail" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { gmail, gmail_password } = await req.json();
    if (!gmail || !gmail_password) {
      return NextResponse.json({ error: "Gmail and Gmail Password are required" }, { status: 400 });
    }
    try {
      // Insert the new usergmail with clerkUserId
      const result = await db.insert(USERGMAIL).values({ gmail, gmailPassword: gmail_password, clerkUserId: userId });
      // Get the inserted ID - handling different MySQL driver behaviors
      let insertedId;
      if (result.insertId) {
        insertedId = result.insertId;
      } else if (result[0]?.id) {
        insertedId = result[0].id;
      } else {
        const inserted = await db.select().from(USERGMAIL)
          .where(eq(USERGMAIL.gmail, gmail))
          .orderBy(USERGMAIL.id, "desc")
          .limit(1);
        insertedId = inserted[0]?.id || Date.now();
      }
      return NextResponse.json({ id: insertedId, gmail }, { status: 201 });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json({ error: "Database error: " + dbError.message }, { status: 500 });
    }
  } catch (error) {
    console.error("Error parsing request:", error);
    return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
  }
}


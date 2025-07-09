import { db } from "@/utils";
import { USERGMAIL } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// POST not needed, only GET for verification
export async function GET(req) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const email = searchParams.get("email");
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    // Find the lecturer by email
    const result = await db
      .select({ clerkUserId: USERGMAIL.clerkUserId })
      .from(USERGMAIL)
      .where(eq(USERGMAIL.gmail, email))
      .limit(1);
    if (!result || result.length === 0 || !result[0].clerkUserId) {
      return NextResponse.json({ error: "Lecturer not found" }, { status: 404 });
    }
    return NextResponse.json({ clerkUserId: result[0].clerkUserId });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

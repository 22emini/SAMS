import { db } from "@/utils";
import { USERGMAIL } from "@/utils/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from '@clerk/nextjs/server';

export async function GET(req) {
  // ...existing code...
}

export async function POST(req) {
  // ...existing code...
}

export async function PUT(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const id = params?.id;
    const { gmail, gmailPassword } = await req.json();
    if (!id || !gmail || !gmailPassword) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const result = await db.update(USERGMAIL)
      .set({ gmail, gmailPassword })
      .where(eq(USERGMAIL.id, Number(id)), eq(USERGMAIL.clerkUserId, userId));
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error updating usergmail:", error);
    return NextResponse.json({ error: "Failed to update usergmail" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    const result = await db.delete(USERGMAIL)
      .where(eq(USERGMAIL.id, Number(id)) && eq(USERGMAIL.clerkUserId, userId));
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error deleting usergmail:", error);
    return NextResponse.json({ error: "Failed to delete usergmail" }, { status: 500 });
  }
}

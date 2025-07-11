import { STUDENTS } from '../../../../utils/schema';
import { eq, and } from 'drizzle-orm';
import { db } from '../../../../utils/index';

export async function POST(req) {
  const { email, grade } = await req.json();
  if (!email || !grade) {
    return Response.json({ exists: false, error: 'Email and grade are required.' }, { status: 400 });
  }
  // Check if a student with this email and grade exists for any clerk user
  const students = await db.select().from(STUDENTS).where(
    and(
      eq(STUDENTS.email, email),
      eq(STUDENTS.grade, grade)
    )
  );
  if (students && students.length > 0) {
    return Response.json({ exists: true });
  } else {
    return Response.json({ exists: false });
  }
}

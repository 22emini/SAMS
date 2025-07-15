import { NextResponse } from 'next/server';
import { db } from '@/utils/index';
import { eq } from 'drizzle-orm';
import { GEOFENCING } from '@/utils/schema';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('clerkUserId');
  let result;
  if (userId) {
    result = await db.select().from(GEOFENCING).where(eq(GEOFENCING.clerkUserId, userId));
  } else {
    // If no clerkUserId, return the first available geofencing record (for attendees)
    result = await db.select().from(GEOFENCING);
  }
  if (result.length === 0) {
    return NextResponse.json({ enabled: false, location: null });
  }
  const { enabled, lat, lng } = result[0];
  return NextResponse.json({ enabled, location: lat && lng ? { lat, lng } : null });
}

export async function POST(req) {
  const body = await req.json();
  const { clerkUserId: postUserId, enabled: postEnabled, location: postLocation } = body;
  if (!postUserId) {
    return NextResponse.json({ error: 'Missing clerkUserId' }, { status: 400 });
  }
  // Upsert geofencing status for user
  const existing = await db.select().from(GEOFENCING).where(eq(GEOFENCING.clerkUserId, postUserId));
  if (existing.length > 0) {
    await db.update(GEOFENCING)
      .set({
        enabled: typeof postEnabled === 'boolean' ? postEnabled : existing[0].enabled,
        lat: postLocation && typeof postLocation.lat === 'number' ? postLocation.lat : existing[0].lat,
        lng: postLocation && typeof postLocation.lng === 'number' ? postLocation.lng : existing[0].lng,
      })
      .where(eq(GEOFENCING.clerkUserId, postUserId));
  } else {
    await db.insert(GEOFENCING).values({
      clerkUserId: postUserId,
      enabled: typeof postEnabled === 'boolean' ? postEnabled : false,
      lat: postLocation && typeof postLocation.lat === 'number' ? postLocation.lat : null,
      lng: postLocation && typeof postLocation.lng === 'number' ? postLocation.lng : null,
    });
  }
  // Return updated status
  const updated = await db.select().from(GEOFENCING).where(eq(GEOFENCING.clerkUserId, postUserId));
  const { enabled: updEnabled, lat: updLat, lng: updLng } = updated[0] || {};
  return NextResponse.json({ success: true, enabled: updEnabled, location: updLat && updLng ? { lat: updLat, lng: updLng } : null });
}

export async function DELETE(req) {
  // Accept clerkUserId from body or query string
  let clerkUserId;
  if (req.method === 'DELETE') {
    try {
      const body = await req.json();
      clerkUserId = body.clerkUserId;
    } catch {
      // fallback to query param if no body
      const { searchParams } = new URL(req.url);
      clerkUserId = searchParams.get('clerkUserId');
    }
  }
  if (!clerkUserId) {
    return NextResponse.json({ error: 'Missing clerkUserId' }, { status: 400 });
  }
  // Delete geofencing record for user
  await db.delete(GEOFENCING).where(eq(GEOFENCING.clerkUserId, clerkUserId));
  return NextResponse.json({ success: true });
}

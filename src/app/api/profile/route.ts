import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { ensureDatabaseInitialized } from "@/lib/db-init";

// GET /api/profile — get current user's profile
export async function GET() {
  await ensureDatabaseInitialized();
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
  });

  return NextResponse.json(profile);
}

// POST /api/profile — create or update current user's profile
export async function POST(request: NextRequest) {
  await ensureDatabaseInitialized();
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { email, fullName, schoolName } = body;

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const profile = await prisma.userProfile.upsert({
    where: { clerkUserId: userId },
    update: {
      ...(fullName !== undefined ? { fullName } : {}),
      ...(schoolName !== undefined ? { schoolName } : {}),
    },
    create: {
      clerkUserId: userId,
      email,
      fullName: fullName || null,
      schoolName: schoolName || null,
    },
  });

  return NextResponse.json(profile, { status: 201 });
}

// PATCH /api/profile — update user profile fields
export async function PATCH(request: NextRequest) {
  await ensureDatabaseInitialized();
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const data: Record<string, unknown> = {};
  if (body.hasSeenAbout !== undefined) data.hasSeenAbout = body.hasSeenAbout;
  if (body.language !== undefined) data.language = body.language;
  if (body.fullName !== undefined) data.fullName = body.fullName;
  if (body.schoolName !== undefined) data.schoolName = body.schoolName;

  const profile = await prisma.userProfile.update({
    where: { clerkUserId: userId },
    data,
  });

  return NextResponse.json(profile);
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureDatabaseInitialized } from "@/lib/db-init";
import { ensureUserProfile } from "@/lib/auth";

// POST /api/sessions — create a new session (scoped to user)
export async function POST(request: NextRequest) {
  await ensureDatabaseInitialized();
  const userId = await ensureUserProfile();

  const body = await request.json();
  const { childId, gateAnswers, homeLanguage } = body;

  if (!childId) {
    return NextResponse.json(
      { error: "childId is required" },
      { status: 400 }
    );
  }

  // Verify the child belongs to this user
  const child = await prisma.child.findFirst({
    where: { id: childId, userId },
  });
  if (!child) {
    return NextResponse.json({ error: "Child not found" }, { status: 404 });
  }

  const session = await prisma.session.create({
    data: {
      childId,
      gateAnswers: gateAnswers ? JSON.stringify(gateAnswers) : null,
      homeLanguage: homeLanguage || "Urdu",
    },
    include: {
      child: true,
    },
  });

  return NextResponse.json(session, { status: 201 });
}

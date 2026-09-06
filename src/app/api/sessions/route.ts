import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureDatabaseInitialized } from "@/lib/db-init";

// POST /api/sessions — create a new session
export async function POST(request: NextRequest) {
  await ensureDatabaseInitialized();
  const body = await request.json();
  const { childId, gateAnswers, homeLanguage } = body;

  if (!childId) {
    return NextResponse.json(
      { error: "childId is required" },
      { status: 400 }
    );
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

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/sessions/[id] — get full session
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      child: true,
    },
  });

  if (!session) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Parse JSON fields for the response
  const parsed = {
    ...session,
    gateAnswers: session.gateAnswers
      ? JSON.parse(session.gateAnswers)
      : null,
    matchResponses: session.matchResponses
      ? JSON.parse(session.matchResponses)
      : null,
    retryResponses: session.retryResponses
      ? JSON.parse(session.retryResponses)
      : null,
    computedActions: session.computedActions
      ? JSON.parse(session.computedActions)
      : null,
  };

  return NextResponse.json(parsed);
}

// PATCH /api/sessions/[id] — update session (add task data progressively)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};

  if (body.gateAnswers !== undefined) {
    data.gateAnswers = JSON.stringify(body.gateAnswers);
  }
  if (body.homeLanguage !== undefined) {
    data.homeLanguage = body.homeLanguage;
  }
  if (body.ranTimeSeconds !== undefined) {
    data.ranTimeSeconds = body.ranTimeSeconds;
  }
  if (body.ranTotalTaps !== undefined) {
    data.ranTotalTaps = body.ranTotalTaps;
  }
  if (body.ranMissedTiles !== undefined) {
    data.ranMissedTiles = body.ranMissedTiles;
  }
  if (body.matchResponses !== undefined) {
    data.matchResponses = JSON.stringify(body.matchResponses);
  }
  if (body.retryResponses !== undefined) {
    data.retryResponses = JSON.stringify(body.retryResponses);
  }
  if (body.completedAt !== undefined) {
    data.completedAt = body.completedAt ? new Date(body.completedAt) : null;
  }
  if (body.teacherNotes !== undefined) {
    data.teacherNotes = body.teacherNotes;
  }

  const session = await prisma.session.update({
    where: { id },
    data,
    include: { child: true },
  });

  return NextResponse.json(session);
}

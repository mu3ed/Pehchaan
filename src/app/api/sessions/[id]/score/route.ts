import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { scoreSession } from "@/lib/scoring";
import type { GateAnswer, MatchResponse, RetryResponse, ScoringInput } from "@/types";

// POST /api/sessions/[id]/score — run scoring engine and persist result
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await prisma.session.findUnique({
    where: { id },
    include: { child: true },
  });

  if (!session) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Parse stored JSON fields
  const gateAnswers: GateAnswer[] = session.gateAnswers
    ? JSON.parse(session.gateAnswers)
    : [];
  const matchResponses: MatchResponse[] = session.matchResponses
    ? JSON.parse(session.matchResponses)
    : [];
  const retryResponses: RetryResponse[] = session.retryResponses
    ? JSON.parse(session.retryResponses)
    : [];

  // Build scoring input
  const input: ScoringInput = {
    gateAnswers,
    homeLanguage: session.homeLanguage,
    ranTimeSeconds: session.ranTimeSeconds || 10,
    ranTotalTaps: session.ranTotalTaps || 20,
    matchResponses,
    retryResponses,
  };

  // Run scoring engine
  const result = scoreSession(input);

  // Persist the computed results
  const updated = await prisma.session.update({
    where: { id },
    data: {
      barrierCategory: result.barrierCategory,
      computedActions: JSON.stringify(result.actions),
      referralFlag: result.referralFlag,
      completedAt: new Date(),
    },
    include: { child: true },
  });

  return NextResponse.json({
    session: {
      ...updated,
      gateAnswers,
      matchResponses,
      retryResponses,
      computedActions: result.actions,
    },
    result,
  });
}

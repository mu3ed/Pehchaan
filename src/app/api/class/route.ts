import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureDatabaseInitialized } from "@/lib/db-init";
import {
  BARRIER_LABELS,
  BARRIER_HINTS,
  BARRIER_TONES,
} from "@/content/action-library";
import type { ClassGroup, BarrierCategory, GateAnswer } from "@/types";
import { getSeverityTier } from "@/lib/severity";

// GET /api/class — class overview with children grouped by barrier category
export async function GET() {
  await ensureDatabaseInitialized();
  // Get all children with their latest session
  const children = await prisma.child.findMany({
    include: {
      sessions: {
        orderBy: { startedAt: "desc" },
        take: 1,
      },
    },
    orderBy: { name: "asc" },
  });

  // Group by most recent barrier category
  const groups: Record<string, ClassGroup> = {};

  for (const child of children) {
    const latest = child.sessions[0];
    if (!latest || !latest.completedAt) continue; // skip children with no completed sessions

    const cat = latest.barrierCategory as string;
    const gateAnswers: GateAnswer[] = latest.gateAnswers
      ? JSON.parse(latest.gateAnswers)
      : [];
    const gateConcerns = {
      vision: gateAnswers.some((answer) => answer.questionIndex === 0 && answer.referral),
      hearing: gateAnswers.some((answer) => answer.questionIndex === 1 && answer.referral),
    };
    const tier = getSeverityTier({ barrierCategory: cat, gateConcerns });
    if (!groups[cat]) {
      groups[cat] = {
        barrierCategory: cat as BarrierCategory,
        label: BARRIER_LABELS[cat] || cat,
        hint: BARRIER_HINTS[cat] || "",
        tone: BARRIER_TONES[cat] || "note",
        tier: tier.tier,
        children: [],
      };
    }

    // Build a detail line based on the child's session
    const detail = buildDetailLine(cat, latest.computedActions);

    groups[cat].children.push({
      id: child.id,
      name: child.name,
      detail,
      sessionDate: latest.startedAt.toISOString(),
    });
  }

  // Sort: concerns first, no_concerns last
  const order = [
    "vision_hearing_referral",
    "language_mismatch",
    "dot_identity_pattern",
    "letter_position_pattern",
    "diacritic_pattern",
    "memorization_reliance",
    "needs_general_practice",
    "no_concerns",
  ];

  const sorted = Object.values(groups).sort((a, b) => {
    const tierOrder = (a.tier === "red" ? 0 : a.tier === "yellow" ? 1 : a.tier === "context" ? 2 : 3) -
      (b.tier === "red" ? 0 : b.tier === "yellow" ? 1 : b.tier === "context" ? 2 : 3);
    return tierOrder || order.indexOf(a.barrierCategory) - order.indexOf(b.barrierCategory);
  });

  const totalChecked = sorted.reduce(
    (sum, g) => sum + g.children.length,
    0
  );
  const totalChildren = children.length;

  return NextResponse.json({
    groups: sorted,
    totalChecked,
    totalChildren,
  });
}

function buildDetailLine(
  barrierCategory: string,
  computedActions: string | null
): string {
  if (!computedActions) return "Assessed — see report for details.";

  try {
    const actions = JSON.parse(computedActions);
    if (Array.isArray(actions) && actions.length > 0) {
      return actions[0].title;
    }
  } catch {
    // ignore parse errors
  }

  return BARRIER_LABELS[barrierCategory] || "Assessed.";
}

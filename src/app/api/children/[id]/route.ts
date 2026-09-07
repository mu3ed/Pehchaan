import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureDatabaseInitialized } from "@/lib/db-init";
import { ensureUserProfile } from "@/lib/auth";

// GET /api/children/[id] — get child with all sessions (scoped to user)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureDatabaseInitialized();
  const userId = await ensureUserProfile();

  const { id } = await params;
  const child = await prisma.child.findFirst({
    where: { id, userId },
    include: {
      sessions: {
        orderBy: { startedAt: "desc" },
      },
    },
  });

  if (!child) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(child);
}

// PATCH /api/children/[id] — update child (scoped to user)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureDatabaseInitialized();
  const userId = await ensureUserProfile();

  const { id } = await params;

  // Verify ownership
  const existing = await prisma.child.findFirst({
    where: { id, userId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.className !== undefined) data.className = body.className;
  if (body.grade !== undefined) data.grade = body.grade;
  if (body.homeLanguage !== undefined) data.homeLanguage = body.homeLanguage;
  if (body.notes !== undefined) data.notes = body.notes;

  const child = await prisma.child.update({
    where: { id },
    data,
  });

  return NextResponse.json(child);
}

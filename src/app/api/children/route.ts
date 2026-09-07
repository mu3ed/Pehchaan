import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { ensureDatabaseInitialized } from "@/lib/db-init";

// GET /api/children — list all children for the current user
export async function GET() {
  await ensureDatabaseInitialized();
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const children = await prisma.child.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      sessions: {
        orderBy: { startedAt: "desc" },
        take: 1,
        select: {
          id: true,
          barrierCategory: true,
          referralFlag: true,
          completedAt: true,
          startedAt: true,
        },
      },
    },
  });

  return NextResponse.json(children);
}

// POST /api/children — create a new child for the current user
export async function POST(request: NextRequest) {
  await ensureDatabaseInitialized();
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, className, grade, homeLanguage, notes } = body;

  if (!name || typeof name !== "string") {
    return NextResponse.json(
      { error: "Name is required" },
      { status: 400 }
    );
  }

  const child = await prisma.child.create({
    data: {
      userId,
      name: name.trim(),
      className: className || null,
      grade: grade ? Number(grade) : null,
      homeLanguage: homeLanguage || "Urdu",
      notes: notes || null,
    },
  });

  return NextResponse.json(child, { status: 201 });
}

import { PrismaClient } from "@prisma/client";
import { prisma } from "./db";

let initPromise: Promise<void> | null = null;

export async function ensureDatabaseInitialized(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return;
    } catch (error) {
      const initClient = new PrismaClient({
        datasourceUrl: process.env.DATABASE_URL || "file:./dev.db",
      });

      try {
        await initClient.$executeRaw`SELECT 1`;
      } catch {
        await initClient.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "Child" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "name" TEXT NOT NULL,
            "className" TEXT,
            "grade" INTEGER,
            "homeLanguage" TEXT NOT NULL DEFAULT 'Urdu',
            "notes" TEXT,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" DATETIME NOT NULL
          )
        `);

        await initClient.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "Session" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "childId" TEXT NOT NULL,
            "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "completedAt" DATETIME,
            "gateAnswers" TEXT,
            "homeLanguage" TEXT NOT NULL DEFAULT 'Urdu',
            "ranTimeSeconds" REAL,
            "ranTotalTaps" INTEGER,
            "ranMissedTiles" INTEGER NOT NULL DEFAULT 0,
            "matchResponses" TEXT,
            "retryResponses" TEXT,
            "barrierCategory" TEXT NOT NULL DEFAULT 'no_concerns',
            "computedActions" TEXT,
            "referralFlag" BOOLEAN NOT NULL DEFAULT false,
            "teacherNotes" TEXT,
            CONSTRAINT "Session_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child" ("id") ON DELETE CASCADE ON UPDATE CASCADE
          )
        `);
      }

      await initClient.$disconnect();
    }
  })();

  return initPromise;
}

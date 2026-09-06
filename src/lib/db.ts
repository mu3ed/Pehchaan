import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const databaseUrl =
  process.env.DATABASE_URL || "file:/tmp/pehchaan.db";

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasourceUrl: databaseUrl,
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

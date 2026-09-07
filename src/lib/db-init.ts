import { prisma } from "./db";

let initPromise: Promise<void> | null = null;

export async function ensureDatabaseInitialized(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // Verify the database connection is working
    await prisma.$queryRaw`SELECT 1`;
  })();

  return initPromise;
}

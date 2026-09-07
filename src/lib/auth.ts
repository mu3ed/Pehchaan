import { auth } from "@clerk/nextjs/server";
import { prisma } from "./db";

/**
 * Ensures the current authenticated user has a UserProfile record.
 * Auto-creates one if missing (e.g. right after sign-up).
 * Returns the Clerk userId or throws if not authenticated.
 */
export async function ensureUserProfile(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  await prisma.userProfile.upsert({
    where: { clerkUserId: userId },
    update: {},
    create: {
      clerkUserId: userId,
      email: `${userId}@clerk.user`,
    },
  });

  return userId;
}

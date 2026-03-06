import { headers } from "next/headers";

/**
 * Returns the current user id from the request context.
 * Phase 4 will replace this with NextAuth getServerSession().
 * Until then: uses x-user-id header for development (set in frontend or API client).
 */
export async function getSessionUserId(): Promise<string | null> {
  const headersList = await headers();
  const userId = headersList.get("x-user-id");
  if (userId) return userId;
  // Fallback for dev when no auth: use env seed user (optional)
  return process.env.DEV_USER_ID ?? null;
}

/**
 * Throws if user is not authenticated. Use in API routes that require auth.
 */
export async function requireUserId(): Promise<string> {
  const userId = await getSessionUserId();
  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }
  return userId;
}

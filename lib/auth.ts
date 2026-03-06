import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

const secret = process.env.NEXTAUTH_SECRET;

/**
 * Returns the current user id from the NextAuth JWT (server-side).
 * Pass the request from the Route Handler so cookies can be read.
 */
export async function getSessionUserId(
  request: NextRequest
): Promise<string | null> {
  if (!secret) return null;
  const token = await getToken({
    req: request,
    secret,
    secureCookie: process.env.NODE_ENV === "production",
  });
  return (token?.id as string) ?? null;
}

/**
 * Throws if user is not authenticated.
 */
export async function requireUserId(
  request: NextRequest
): Promise<string> {
  const userId = await getSessionUserId(request);
  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }
  return userId;
}

import { NextResponse } from "next/server";

/**
 * Health check for API and deployments.
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "easy-money",
    timestamp: new Date().toISOString(),
  });
}

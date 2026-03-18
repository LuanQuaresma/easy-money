import { NextRequest } from "next/server";
import { getBudgetRule, upsertBudgetRule } from "@/lib/controllers/budgetRuleController";

export async function GET(request: NextRequest) {
  return getBudgetRule(request);
}

export async function POST(request: NextRequest) {
  return upsertBudgetRule(request);
}


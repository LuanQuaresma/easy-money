import { z } from "zod";
import { apiError, apiSuccess } from "@/types/api";
import { getSessionUserId } from "@/lib/auth";
import { budgetRuleRepository } from "@/lib/repositories/budgetRuleRepository";
import { budgetRuleService } from "@/lib/services/budgetRuleService";

const budgetBodySchema = z.object({
  necessityPercent: z.number(),
  lifestylePercent: z.number(),
  investmentPercent: z.number(),
});

function toNumberMaybeDecimal(v: unknown): number {
  // Prisma Decimal usually has `toNumber()`.
  if (v && typeof v === "object" && "toNumber" in (v as any)) {
    return (v as any).toNumber();
  }
  return typeof v === "number" ? v : Number(v);
}

export async function getBudgetRule(request: any) {
  const userId = await getSessionUserId(request);
  if (!userId) {
    return apiError("UNAUTHORIZED", "Authentication required", 401);
  }

  const rule = await budgetRuleRepository.findByUserId(userId);
  if (!rule) {
    return apiSuccess({
      necessityPercent: 50,
      lifestylePercent: 30,
      investmentPercent: 20,
    });
  }

  return apiSuccess({
    necessityPercent: toNumberMaybeDecimal((rule as any).necessityPercent),
    lifestylePercent: toNumberMaybeDecimal((rule as any).lifestylePercent),
    investmentPercent: toNumberMaybeDecimal((rule as any).investmentPercent),
  });
}

export async function upsertBudgetRule(request: any) {
  const userId = await getSessionUserId(request);
  if (!userId) {
    return apiError("UNAUTHORIZED", "Authentication required", 401);
  }

  const parsed = await request.json().catch(() => null);
  const body = budgetBodySchema.safeParse(parsed);
  if (!body.success) {
    return apiError("BAD_REQUEST", "Invalid body", 400, body.error.flatten());
  }

  try {
    const validated = budgetRuleService.validate(body.data);
    const saved = await budgetRuleRepository.upsert(userId, validated);

    return apiSuccess({
      necessityPercent: toNumberMaybeDecimal((saved as any).necessityPercent),
      lifestylePercent: toNumberMaybeDecimal((saved as any).lifestylePercent),
      investmentPercent: toNumberMaybeDecimal((saved as any).investmentPercent),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to save budget rule";
    if (message.includes("Percent values")) {
      return apiError("BAD_REQUEST", message, 400);
    }
    return apiError("INTERNAL_ERROR", message, 500);
  }
}


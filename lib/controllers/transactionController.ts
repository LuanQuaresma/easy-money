import { TransactionType } from "@prisma/client";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiSuccess } from "@/types/api";
import { getSessionUserId } from "@/lib/auth";
import { transactionService } from "@/lib/services/transactionService";

const createBodySchema = z.object({
  amount: z.number(),
  date: z.string().min(1),
  type: z.nativeEnum(TransactionType),
  description: z.string().max(500).optional(),
  categoryId: z.string().optional(),
  expenseId: z.string().optional(),
  fixedIncomeId: z.string().optional(),
  freelancePaymentId: z.string().optional(),
});

export async function listTransactions(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return apiError("UNAUTHORIZED", "Authentication required", 401);
  }
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as TransactionType | null;
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");
  const list = await transactionService.list(userId, {
    type: type ?? undefined,
    fromDate: fromDate ?? undefined,
    toDate: toDate ?? undefined,
  });
  return apiSuccess(list);
}

export async function getTransactionById(
  _request: NextRequest,
  { id }: { id: string }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return apiError("UNAUTHORIZED", "Authentication required", 401);
  }
  const transaction = await transactionService.getById(id, userId);
  if (!transaction) {
    return apiError("NOT_FOUND", "Transaction not found", 404);
  }
  return apiSuccess(transaction);
}

export async function createTransaction(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return apiError("UNAUTHORIZED", "Authentication required", 401);
  }
  const parsed = await request.json().catch(() => null);
  const body = createBodySchema.safeParse(parsed);
  if (!body.success) {
    return apiError("BAD_REQUEST", "Invalid body", 400, body.error.flatten());
  }
  try {
    const transaction = await transactionService.create(userId, body.data);
    return apiSuccess(transaction, 201);
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to create transaction";
    return apiError("INTERNAL_ERROR", message, 500);
  }
}

export async function deleteTransaction(
  _request: NextRequest,
  { id }: { id: string }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return apiError("UNAUTHORIZED", "Authentication required", 401);
  }
  const result = await transactionService.delete(id, userId);
  if (!result.found) {
    return apiError("NOT_FOUND", "Transaction not found", 404);
  }
  return apiSuccess({ ok: true }, 200);
}

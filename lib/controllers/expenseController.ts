import { ExpensePaymentStatus } from "@prisma/client";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiSuccess } from "@/types/api";
import { getSessionUserId } from "@/lib/auth";
import { expenseService } from "@/lib/services/expenseService";

const createBodySchema = z.object({
  name: z.string().min(1).max(200),
  categoryId: z.string().min(1),
  amount: z.number().positive(),
  dueDate: z.string().min(1),
  recurring: z.boolean().optional().default(false),
  paymentStatus: z.nativeEnum(ExpensePaymentStatus).optional(),
});

const statusBodySchema = z.object({
  paymentStatus: z.nativeEnum(ExpensePaymentStatus),
});

export async function listExpenses(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return apiError("UNAUTHORIZED", "Authentication required", 401);
  }
  const { searchParams } = new URL(request.url);
  const paymentStatus = searchParams.get("paymentStatus") as
    | ExpensePaymentStatus
    | null;
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");
  const list = await expenseService.list(userId, {
    paymentStatus: paymentStatus ?? undefined,
    fromDate: fromDate ?? undefined,
    toDate: toDate ?? undefined,
  });
  return apiSuccess(list);
}

export async function getExpenseById(
  _request: NextRequest,
  { id }: { id: string }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return apiError("UNAUTHORIZED", "Authentication required", 401);
  }
  const expense = await expenseService.getById(id, userId);
  if (!expense) {
    return apiError("NOT_FOUND", "Expense not found", 404);
  }
  return apiSuccess(expense);
}

export async function createExpense(request: NextRequest) {
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
    const expense = await expenseService.create(userId, body.data);
    return apiSuccess(expense, 201);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create expense";
    return apiError("INTERNAL_ERROR", message, 500);
  }
}

export async function updateExpenseStatus(
  request: NextRequest,
  { id }: { id: string }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return apiError("UNAUTHORIZED", "Authentication required", 401);
  }
  const parsed = await request.json().catch(() => null);
  const body = statusBodySchema.safeParse(parsed);
  if (!body.success) {
    return apiError("BAD_REQUEST", "Invalid body", 400, body.error.flatten());
  }
  const expense = await expenseService.updatePaymentStatus(
    id,
    userId,
    body.data.paymentStatus
  );
  if (!expense) {
    return apiError("NOT_FOUND", "Expense not found", 404);
  }
  return apiSuccess(expense);
}

export async function deleteExpense(
  _request: NextRequest,
  { id }: { id: string }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return apiError("UNAUTHORIZED", "Authentication required", 401);
  }
  const result = await expenseService.delete(id, userId);
  if (!result.found) {
    return apiError("NOT_FOUND", "Expense not found", 404);
  }
  return apiSuccess({ ok: true }, 200);
}

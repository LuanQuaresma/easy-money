import {
  getExpenseById,
  updateExpenseStatus,
  deleteExpense,
} from "@/lib/controllers/expenseController";
import { NextRequest } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return getExpenseById(request, { id });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return updateExpenseStatus(request, { id });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return deleteExpense(request, { id });
}

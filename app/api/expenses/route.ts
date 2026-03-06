import {
  listExpenses,
  createExpense,
} from "@/lib/controllers/expenseController";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return listExpenses(request);
}

export async function POST(request: NextRequest) {
  return createExpense(request);
}

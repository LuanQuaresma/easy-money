import {
  getTransactionById,
  deleteTransaction,
} from "@/lib/controllers/transactionController";
import { NextRequest } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return getTransactionById(request, { id });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return deleteTransaction(request, { id });
}

import {
  listTransactions,
  createTransaction,
} from "@/lib/controllers/transactionController";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return listTransactions(request);
}

export async function POST(request: NextRequest) {
  return createTransaction(request);
}

import { listCategories, createCategory } from "@/lib/controllers/categoryController";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return listCategories(request);
}

export async function POST(request: NextRequest) {
  return createCategory(request);
}

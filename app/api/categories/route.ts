import { listCategories, createCategory } from "@/lib/controllers/categoryController";
import { NextRequest } from "next/server";

export async function GET() {
  return listCategories();
}

export async function POST(request: NextRequest) {
  return createCategory(request);
}

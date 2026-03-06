import { CategoryType } from "@prisma/client";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiSuccess } from "@/types/api";
import { getSessionUserId } from "@/lib/auth";
import { categoryService } from "@/lib/services/categoryService";

const createBodySchema = z.object({
  name: z.string().min(1).max(100),
  type: z.nativeEnum(CategoryType),
});

export async function listCategories() {
  const userId = await getSessionUserId();
  if (!userId) {
    return apiError("UNAUTHORIZED", "Authentication required", 401);
  }
  const list = await categoryService.list(userId);
  return apiSuccess(list);
}

export async function createCategory(request: NextRequest) {
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
    const category = await categoryService.create(userId, body.data);
    return apiSuccess(category, 201);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create category";
    if (message.includes("Unique constraint")) {
      return apiError("CONFLICT", "Category name already exists", 409);
    }
    return apiError("INTERNAL_ERROR", message, 500);
  }
}

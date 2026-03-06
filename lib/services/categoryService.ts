import { CategoryType } from "@prisma/client";
import { categoryRepository } from "@/lib/repositories/categoryRepository";

export const categoryService = {
  async list(userId: string) {
    return categoryRepository.findManyByUserId(userId);
  },

  async getById(id: string, userId: string) {
    const category = await categoryRepository.findById(id, userId);
    if (!category) return null;
    return category;
  },

  async create(userId: string, data: { name: string; type: CategoryType }) {
    return categoryRepository.create({
      name: data.name,
      type: data.type,
      userId,
    });
  },

  async delete(id: string, userId: string) {
    const category = await categoryRepository.findById(id, userId);
    if (!category) return { found: false };
    await categoryRepository.delete(id, userId);
    return { found: true };
  },
};

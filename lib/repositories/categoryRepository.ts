import { CategoryType } from "@prisma/client";
import { prisma } from "@/lib/db";

export interface CreateCategoryInput {
  name: string;
  type: CategoryType;
  userId: string;
}

export const categoryRepository = {
  async findManyByUserId(userId: string) {
    return prisma.category.findMany({
      where: { userId },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });
  },

  async findById(id: string, userId: string) {
    return prisma.category.findFirst({
      where: { id, userId },
    });
  },

  async create(data: CreateCategoryInput) {
    return prisma.category.create({
      data: {
        name: data.name,
        type: data.type,
        userId: data.userId,
      },
    });
  },

  async delete(id: string, userId: string) {
    return prisma.category.deleteMany({
      where: { id, userId },
    });
  },
};

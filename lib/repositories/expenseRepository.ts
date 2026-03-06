import { ExpensePaymentStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export interface CreateExpenseInput {
  name: string;
  categoryId: string;
  amount: number;
  dueDate: Date;
  recurring: boolean;
  paymentStatus?: ExpensePaymentStatus;
  userId: string;
}

export interface ListExpensesFilters {
  userId: string;
  paymentStatus?: ExpensePaymentStatus;
  fromDate?: Date;
  toDate?: Date;
}

export const expenseRepository = {
  async findMany(filters: ListExpensesFilters) {
    const where: Prisma.ExpenseWhereInput = {
      userId: filters.userId,
    };
    if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;
    if (filters.fromDate || filters.toDate) {
      where.dueDate = {};
      if (filters.fromDate) where.dueDate.gte = filters.fromDate;
      if (filters.toDate) where.dueDate.lte = filters.toDate;
    }
    return prisma.expense.findMany({
      where,
      include: { category: true },
      orderBy: { dueDate: "asc" },
    });
  },

  async findById(id: string, userId: string) {
    return prisma.expense.findFirst({
      where: { id, userId },
      include: { category: true },
    });
  },

  async create(data: CreateExpenseInput) {
    return prisma.expense.create({
      data: {
        name: data.name,
        categoryId: data.categoryId,
        amount: data.amount,
        dueDate: data.dueDate,
        recurring: data.recurring ?? false,
        paymentStatus: data.paymentStatus ?? "PENDING",
        userId: data.userId,
      },
      include: { category: true },
    });
  },

  async updatePaymentStatus(
    id: string,
    userId: string,
    paymentStatus: ExpensePaymentStatus
  ) {
    return prisma.expense.updateMany({
      where: { id, userId },
      data: { paymentStatus },
    });
  },

  async delete(id: string, userId: string) {
    return prisma.expense.deleteMany({
      where: { id, userId },
    });
  },
};

import { TransactionType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export interface CreateTransactionInput {
  amount: number;
  date: Date;
  type: TransactionType;
  description?: string;
  userId: string;
  categoryId?: string;
  expenseId?: string;
  fixedIncomeId?: string;
  freelancePaymentId?: string;
}

export interface ListTransactionsFilters {
  userId: string;
  type?: TransactionType;
  fromDate?: Date;
  toDate?: Date;
}

export const transactionRepository = {
  async findMany(filters: ListTransactionsFilters) {
    const where: Prisma.TransactionWhereInput = {
      userId: filters.userId,
    };
    if (filters.type) where.type = filters.type;
    if (filters.fromDate || filters.toDate) {
      where.date = {};
      if (filters.fromDate) where.date.gte = filters.fromDate;
      if (filters.toDate) where.date.lte = filters.toDate;
    }
    return prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { date: "desc" },
      take: 200,
    });
  },

  async findById(id: string, userId: string) {
    return prisma.transaction.findFirst({
      where: { id, userId },
      include: { category: true },
    });
  },

  async create(data: CreateTransactionInput) {
    return prisma.transaction.create({
      data: {
        amount: data.amount,
        date: data.date,
        type: data.type,
        description: data.description ?? null,
        userId: data.userId,
        categoryId: data.categoryId ?? null,
        expenseId: data.expenseId ?? null,
        fixedIncomeId: data.fixedIncomeId ?? null,
        freelancePaymentId: data.freelancePaymentId ?? null,
      },
      include: { category: true },
    });
  },

  async delete(id: string, userId: string) {
    return prisma.transaction.deleteMany({
      where: { id, userId },
    });
  },
};

import { TransactionType } from "@prisma/client";
import { transactionRepository } from "@/lib/repositories/transactionRepository";

export interface CreateTransactionDto {
  amount: number;
  date: string; // ISO date
  type: TransactionType;
  description?: string;
  categoryId?: string;
  expenseId?: string;
  fixedIncomeId?: string;
  freelancePaymentId?: string;
}

export const transactionService = {
  async list(
    userId: string,
    filters?: {
      type?: TransactionType;
      fromDate?: string;
      toDate?: string;
    }
  ) {
    const fromDate = filters?.fromDate ? new Date(filters.fromDate) : undefined;
    const toDate = filters?.toDate ? new Date(filters.toDate) : undefined;
    return transactionRepository.findMany({
      userId,
      type: filters?.type,
      fromDate,
      toDate,
    });
  },

  async getById(id: string, userId: string) {
    return transactionRepository.findById(id, userId);
  },

  async create(userId: string, data: CreateTransactionDto) {
    const date = new Date(data.date);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }
    return transactionRepository.create({
      amount: data.amount,
      date,
      type: data.type,
      description: data.description,
      userId,
      categoryId: data.categoryId,
      expenseId: data.expenseId,
      fixedIncomeId: data.fixedIncomeId,
      freelancePaymentId: data.freelancePaymentId,
    });
  },

  async delete(id: string, userId: string) {
    const tx = await transactionRepository.findById(id, userId);
    if (!tx) return { found: false };
    await transactionRepository.delete(id, userId);
    return { found: true };
  },
};

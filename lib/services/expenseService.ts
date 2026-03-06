import { ExpensePaymentStatus } from "@prisma/client";
import { expenseRepository } from "@/lib/repositories/expenseRepository";

export interface CreateExpenseDto {
  name: string;
  categoryId: string;
  amount: number;
  dueDate: string; // ISO date
  recurring?: boolean;
  paymentStatus?: ExpensePaymentStatus;
}

export const expenseService = {
  async list(
    userId: string,
    filters?: {
      paymentStatus?: ExpensePaymentStatus;
      fromDate?: string;
      toDate?: string;
    }
  ) {
    const fromDate = filters?.fromDate ? new Date(filters.fromDate) : undefined;
    const toDate = filters?.toDate ? new Date(filters.toDate) : undefined;
    return expenseRepository.findMany({
      userId,
      paymentStatus: filters?.paymentStatus,
      fromDate,
      toDate,
    });
  },

  async getById(id: string, userId: string) {
    return expenseRepository.findById(id, userId);
  },

  async create(userId: string, data: CreateExpenseDto) {
    const dueDate = new Date(data.dueDate);
    if (isNaN(dueDate.getTime())) {
      throw new Error("Invalid dueDate");
    }
    return expenseRepository.create({
      name: data.name,
      categoryId: data.categoryId,
      amount: data.amount,
      dueDate,
      recurring: data.recurring ?? false,
      paymentStatus: data.paymentStatus,
      userId,
    });
  },

  async updatePaymentStatus(
    id: string,
    userId: string,
    paymentStatus: ExpensePaymentStatus
  ) {
    const expense = await expenseRepository.findById(id, userId);
    if (!expense) return null;
    await expenseRepository.updatePaymentStatus(id, userId, paymentStatus);
    return expenseRepository.findById(id, userId);
  },

  async delete(id: string, userId: string) {
    const expense = await expenseRepository.findById(id, userId);
    if (!expense) return { found: false };
    await expenseRepository.delete(id, userId);
    return { found: true };
  },
};

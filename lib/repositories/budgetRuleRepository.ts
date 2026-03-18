import { prisma } from "@/lib/db";

export interface BudgetRuleInput {
  necessityPercent: number;
  lifestylePercent: number;
  investmentPercent: number;
}

export const budgetRuleRepository = {
  async findByUserId(userId: string) {
    return prisma.budgetRule.findUnique({
      where: { userId },
    });
  },

  async upsert(userId: string, data: BudgetRuleInput) {
    return prisma.budgetRule.upsert({
      where: { userId },
      update: {
        necessityPercent: data.necessityPercent,
        lifestylePercent: data.lifestylePercent,
        investmentPercent: data.investmentPercent,
      },
      create: {
        userId,
        necessityPercent: data.necessityPercent,
        lifestylePercent: data.lifestylePercent,
        investmentPercent: data.investmentPercent,
      },
    });
  },
};


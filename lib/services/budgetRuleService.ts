import type { BudgetRuleInput } from "@/lib/repositories/budgetRuleRepository";

export interface BudgetRuleOutput {
  necessityPercent: number;
  lifestylePercent: number;
  investmentPercent: number;
}

function isValidPercent(n: number) {
  return Number.isFinite(n) && n >= 0 && n <= 100;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export const budgetRuleService = {
  validate(input: BudgetRuleInput): BudgetRuleOutput {
    const necessityPercent = round2(input.necessityPercent);
    const lifestylePercent = round2(input.lifestylePercent);
    const investmentPercent = round2(input.investmentPercent);

    if (
      !isValidPercent(necessityPercent) ||
      !isValidPercent(lifestylePercent) ||
      !isValidPercent(investmentPercent)
    ) {
      throw new Error("Percent values must be between 0 and 100.");
    }

    const sum = round2(
      necessityPercent + lifestylePercent + investmentPercent
    );
    // Allow a tiny epsilon for floats (though we round to 2 decimals).
    if (Math.abs(sum - 100) > 0.01) {
      throw new Error("Percent values must sum to 100.");
    }

    return { necessityPercent, lifestylePercent, investmentPercent };
  },
};


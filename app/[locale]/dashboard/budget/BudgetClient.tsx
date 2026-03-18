"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/t";
import { formatBRL } from "@/lib/utils/currency";

type CategoryType = "NECESSITY" | "LIFESTYLE" | "INVESTMENT";
type TransactionType = "INCOME" | "EXPENSE";
type ExpensePaymentStatus = "PAID" | "PENDING" | "OVERDUE";

type Transaction = {
  id: string;
  amount: unknown;
  date: string;
  type: TransactionType;
};

type Category = {
  id: string;
  name: string;
  type: CategoryType;
};

type Expense = {
  id: string;
  amount: unknown;
  dueDate: string;
  paymentStatus: ExpensePaymentStatus;
  category?: Category | null;
};

type BudgetRule = {
  necessityPercent: number;
  lifestylePercent: number;
  investmentPercent: number;
};

function toNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v);
  if (v && typeof v === "object" && "toString" in v) {
    return Number((v as { toString: () => string }).toString());
  }
  return 0;
}

function isoDateRange(days: number) {
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

const DEFAULT_RULE = {
  necessityPercent: 50,
  lifestylePercent: 30,
  investmentPercent: 20,
} as const;

export function BudgetClient({ locale }: { locale: Locale }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [rule, setRule] = useState<BudgetRule>(DEFAULT_RULE);
  const [input, setInput] = useState<BudgetRule>(DEFAULT_RULE);

  const [referenceIncome, setReferenceIncome] = useState<number>(0);
  const [spentByType, setSpentByType] = useState<
    Record<CategoryType, number>
  >({
    NECESSITY: 0,
    LIFESTYLE: 0,
    INVESTMENT: 0,
  });

  const sum = useMemo(
    () =>
      Number(input.necessityPercent) +
      Number(input.lifestylePercent) +
      Number(input.investmentPercent),
    [input]
  );

  const sumError = Math.abs(sum - 100) > 0.01;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { from, to } = isoDateRange(30);

        const [ruleRes, incRes, expRes] = await Promise.all([
          fetch("/api/budget"),
          fetch(`/api/transactions?type=INCOME&fromDate=${encodeURIComponent(from)}&toDate=${encodeURIComponent(to)}`),
          fetch(`/api/expenses?paymentStatus=PAID&fromDate=${encodeURIComponent(from)}&toDate=${encodeURIComponent(to)}`),
        ]);

        if (!ruleRes.ok) throw new Error("rule failed");
        if (!incRes.ok) throw new Error("income failed");
        if (!expRes.ok) throw new Error("expenses failed");

        const [ruleJson, incJson, expJson] = await Promise.all([
          ruleRes.json(),
          incRes.json(),
          expRes.json(),
        ]);

        if (cancelled) return;

        const loadedRule = (ruleJson as BudgetRule) ?? DEFAULT_RULE;
        setRule(loadedRule);
        setInput(loadedRule);

        const incomes = incJson as Transaction[];
        const expenses = expJson as Expense[];

        const incomeTotal = incomes.reduce(
          (acc, tx) => acc + toNumber(tx.amount),
          0
        );

        const spent = { NECESSITY: 0, LIFESTYLE: 0, INVESTMENT: 0 } as Record<
          CategoryType,
          number
        >;

        for (const e of expenses) {
          const type = e.category?.type;
          if (!type) continue;
          spent[type] += toNumber(e.amount);
        }

        setReferenceIncome(incomeTotal);
        setSpentByType(spent);
      } catch {
        if (cancelled) return;
        setError("Erro ao carregar orçamento. Tente novamente.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  async function refresh() {
    const { from, to } = isoDateRange(30);
    const [ruleRes, incRes, expRes] = await Promise.all([
      fetch("/api/budget"),
      fetch(`/api/transactions?type=INCOME&fromDate=${encodeURIComponent(from)}&toDate=${encodeURIComponent(to)}`),
      fetch(`/api/expenses?paymentStatus=PAID&fromDate=${encodeURIComponent(from)}&toDate=${encodeURIComponent(to)}`),
    ]);
    const [ruleJson, incJson, expJson] = await Promise.all([
      ruleRes.json(),
      incRes.json(),
      expRes.json(),
    ]);

    const loadedRule = (ruleJson as BudgetRule) ?? DEFAULT_RULE;
    setRule(loadedRule);
    setInput(loadedRule);

    const incomes = incJson as Transaction[];
    const expenses = expJson as Expense[];

    const incomeTotal = incomes.reduce(
      (acc, tx) => acc + toNumber(tx.amount),
      0
    );

    const spent = { NECESSITY: 0, LIFESTYLE: 0, INVESTMENT: 0 } as Record<
      CategoryType,
      number
    >;

    for (const e of expenses) {
      const type = e.category?.type;
      if (!type) continue;
      spent[type] += toNumber(e.amount);
    }

    setReferenceIncome(incomeTotal);
    setSpentByType(spent);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sumError) return;

    setSaving(true);
    try {
      const res = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          necessityPercent: input.necessityPercent,
          lifestylePercent: input.lifestylePercent,
          investmentPercent: input.investmentPercent,
        }),
      });
      if (!res.ok) throw new Error("save failed");
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setInput(DEFAULT_RULE);
  }

  function recommendedFor(type: CategoryType) {
    const percent =
      type === "NECESSITY"
        ? input.necessityPercent
        : type === "LIFESTYLE"
          ? input.lifestylePercent
          : input.investmentPercent;
    return (referenceIncome * percent) / 100;
  }

  const hasReference = referenceIncome > 0;

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {t(locale, "budget.title")}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {t(locale, "budget.subtitle")}
            </p>
          </div>
          <Link
            href={`/${locale}/dashboard`}
            className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:underline"
          >
            {t(locale, "dashboard.nav.overview")}
          </Link>
        </div>

        {loading ? (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <p className="text-slate-600 dark:text-slate-400">
              {t(locale, "common.loading")}
            </p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 dark:border-red-900 p-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : (
          <>
            <section className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                {t(locale, "budget.title")}
              </h2>
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                <label className="block">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t(locale, "budget.form.necessity")}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={input.necessityPercent}
                    onChange={(e) =>
                      setInput((p) => ({
                        ...p,
                        necessityPercent: Number(e.target.value),
                      }))
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t(locale, "budget.form.lifestyle")}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={input.lifestylePercent}
                    onChange={(e) =>
                      setInput((p) => ({
                        ...p,
                        lifestylePercent: Number(e.target.value),
                      }))
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t(locale, "budget.form.investment")}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={input.investmentPercent}
                    onChange={(e) =>
                      setInput((p) => ({
                        ...p,
                        investmentPercent: Number(e.target.value),
                      }))
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100"
                    required
                  />
                </label>

                <div className="sm:col-span-3">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {t(locale, "budget.section.referenceIncome")}:{" "}
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {formatBRL(referenceIncome)}
                      </span>
                    </p>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={handleReset}
                        className="rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                      >
                        {t(locale, "budget.form.reset")}
                      </button>
                      <button
                        type="submit"
                        disabled={saving || sumError}
                        className="rounded-md bg-slate-800 dark:bg-slate-600 px-4 py-2 text-white font-medium hover:bg-slate-700 dark:hover:bg-slate-500 disabled:opacity-50"
                      >
                        {saving ? t(locale, "budget.form.save") : t(locale, "budget.form.save")}
                      </button>
                    </div>
                  </div>
                  {sumError && (
                    <p className="mt-3 text-sm text-rose-700 dark:text-rose-300">
                      {t(locale, "budget.form.sumError")}
                    </p>
                  )}
                </div>
              </form>
            </section>

            <section className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {t(locale, "budget.subtitle")}
              </h2>
              {!hasReference ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t(locale, "budget.cards.none")}
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(
                    [
                      { key: "NECESSITY", label: t(locale, "category.NECESSITY") },
                      { key: "LIFESTYLE", label: t(locale, "category.LIFESTYLE") },
                      { key: "INVESTMENT", label: t(locale, "category.INVESTMENT") },
                    ] as Array<{ key: CategoryType; label: string }>
                  ).map(({ key, label }) => {
                    const recommended = recommendedFor(key);
                    const spent = spentByType[key] ?? 0;
                    const progress = recommended > 0 ? Math.min(100, (spent / recommended) * 100) : 0;

                    return (
                      <div key={key} className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {label}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {key === "NECESSITY"
                                ? `${input.necessityPercent}%`
                                : key === "LIFESTYLE"
                                  ? `${input.lifestylePercent}%`
                                  : `${input.investmentPercent}%`}
                            </p>
                          </div>
                          <p className="text-right text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {formatBRL(spent)}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span>
                              {t(locale, "budget.section.recommended")}:
                            </span>
                            <span className="text-slate-700 dark:text-slate-200 font-medium">
                              {formatBRL(recommended)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span>{t(locale, "budget.section.spent")}:</span>
                            <span className="text-slate-700 dark:text-slate-200 font-medium">
                              {formatBRL(spent)}
                            </span>
                          </div>
                        </div>

                        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-slate-900 dark:bg-slate-600"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}


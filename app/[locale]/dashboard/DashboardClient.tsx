"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/t";
import { formatBRL } from "@/lib/utils/currency";
import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";

type CategoryType = "NECESSITY" | "LIFESTYLE" | "INVESTMENT";
type TxType = "INCOME" | "EXPENSE";

type Transaction = {
  id: string;
  amount: unknown;
  date: string;
  type: TxType;
  description?: string | null;
  category?: {
    id: string;
    name: string;
    type: CategoryType;
  } | null;
};

type ExpensePaymentStatus = "PAID" | "PENDING" | "OVERDUE";
type Expense = {
  id: string;
  amount: unknown;
  dueDate: string;
  paymentStatus: ExpensePaymentStatus;
  name: string;
  category?: {
    id: string;
    name: string;
    type: CategoryType;
  } | null;
};

function toNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v);
  // Prisma Decimal commonly serializes as string via JSON.
  if (v && typeof v === "object" && "toString" in v) {
    return Number((v as { toString: () => string }).toString());
  }
  return 0;
}

function formatDatePtBR(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR");
}

const COLORS: Record<CategoryType, string> = {
  NECESSITY: "#0f766e", // teal-700
  LIFESTYLE: "#1d4ed8", // blue-700
  INVESTMENT: "#7c3aed", // violet-600
};

export function DashboardClient({
  locale,
  userName,
}: {
  locale: Locale;
  userName: string;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [txRes, expRes] = await Promise.all([
          fetch("/api/transactions"),
          fetch("/api/expenses"),
        ]);

        if (!txRes.ok) throw new Error("transactions failed");
        if (!expRes.ok) throw new Error("expenses failed");

        const [tx, exp] = await Promise.all([txRes.json(), expRes.json()]);
        if (cancelled) return;

        setTransactions(tx as Transaction[]);
        setExpenses(exp as Expense[]);
      } catch {
        if (cancelled) return;
        setError(t(locale, "dashboard.error.generic"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [locale]);

  const totals = useMemo(() => {
    const incomeTx = transactions.filter((tx) => tx.type === "INCOME");
    const expenseTx = transactions.filter((tx) => tx.type === "EXPENSE");

    const incomeTotal = incomeTx.reduce(
      (acc, tx) => acc + toNumber(tx.amount),
      0
    );
    const expenseTotal = expenseTx.reduce(
      (acc, tx) => acc + toNumber(tx.amount),
      0
    );

    const balance = incomeTotal - expenseTotal;

    const breakdown = {
      NECESSITY: 0,
      LIFESTYLE: 0,
      INVESTMENT: 0,
    } as Record<CategoryType, number>;

    for (const tx of expenseTx) {
      const type = tx.category?.type;
      if (!type) continue;
      breakdown[type] += toNumber(tx.amount);
    }

    return { incomeTotal, expenseTotal, balance, breakdown };
  }, [transactions]);

  const pieData = useMemo(() => {
    return ([
      {
        key: "NECESSITY" as const,
        name: t(locale, "category.NECESSITY"),
        value: totals.breakdown.NECESSITY,
      },
      {
        key: "LIFESTYLE" as const,
        name: t(locale, "category.LIFESTYLE"),
        value: totals.breakdown.LIFESTYLE,
      },
      {
        key: "INVESTMENT" as const,
        name: t(locale, "category.INVESTMENT"),
        value: totals.breakdown.INVESTMENT,
      },
    ] as const);
  }, [locale, totals.breakdown]);

  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 8);
  }, [transactions]);

  const upcomingExpenses = useMemo(() => {
    const now = new Date();
    const upcoming = expenses
      .filter((e) => new Date(e.dueDate).getTime() >= now.getTime())
      .slice(0, 5);
    return upcoming;
  }, [expenses]);

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="space-y-1">
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {t(locale, "dashboard.title")}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {t(locale, "dashboard.greeting", { name: userName })}
          </p>

          <nav className="flex flex-wrap gap-2 mt-3">
            <Link
              href={`/${locale}/dashboard`}
              className="rounded-md border border-slate-300 dark:border-slate-700 px-3 py-1 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t(locale, "dashboard.nav.overview")}
            </Link>
            <Link
              href={`/${locale}/dashboard/income`}
              className="rounded-md bg-slate-800 dark:bg-slate-600 px-3 py-1 text-sm font-medium text-white hover:bg-slate-700 dark:hover:bg-slate-500"
            >
              {t(locale, "dashboard.nav.income")}
            </Link>
            <Link
              href={`/${locale}/dashboard/expenses`}
              className="rounded-md border border-slate-300 dark:border-slate-700 px-3 py-1 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t(locale, "dashboard.nav.expenses")}
            </Link>
            <Link
              href={`/${locale}/dashboard/budget`}
              className="rounded-md border border-slate-300 dark:border-slate-700 px-3 py-1 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t(locale, "dashboard.nav.budget")}
            </Link>
          </nav>
        </header>

        {loading ? (
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <p className="text-slate-600 dark:text-slate-400">
              {t(locale, "common.loading")}
            </p>
          </section>
        ) : error ? (
          <section className="rounded-xl border border-red-200 dark:border-red-900 p-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </section>
        ) : (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t(locale, "dashboard.card.income")}
                </p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  {formatBRL(totals.incomeTotal)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t(locale, "dashboard.card.expenses")}
                </p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  {formatBRL(totals.expenseTotal)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t(locale, "dashboard.card.balance")}
                </p>
                <p
                  className={[
                    "text-2xl font-semibold",
                    totals.balance >= 0
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-rose-700 dark:text-rose-300",
                  ].join(" ")}
                >
                  {formatBRL(totals.balance)}
                </p>
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {t(locale, "dashboard.section.spendingBreakdown")}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t(locale, "dashboard.section.chartSubtitle")}
                  </p>
                </div>
                <div className="mt-4 h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        formatter={(value: unknown) => formatBRL(Number(value))}
                      />
                      <Pie
                        data={
                          pieData as unknown as Array<{
                            key: CategoryType;
                            name: string;
                            value: number;
                          }>
                        }
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={90}
                        strokeWidth={0}
                      >
                        {pieData.map((entry) => (
                          <Cell key={entry.key} fill={COLORS[entry.key]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {t(locale, "dashboard.section.upcomingExpenses")}
                </h2>
                <div className="mt-3 space-y-3">
                  {upcomingExpenses.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {t(locale, "dashboard.upcoming.none")}
                    </p>
                  ) : (
                    upcomingExpenses.map((e) => (
                      <div
                        key={e.id}
                        className="flex items-start justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                            {e.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {formatDatePtBR(e.dueDate)} •{" "}
                            {t(locale, `expense.status.${e.paymentStatus}` as any)}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          {formatBRL(toNumber(e.amount))}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-4">
                  <Link
                    href={`/${locale}/dashboard`}
                    className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:underline"
                  >
                    {t(locale, "dashboard.tx.table.viewDetails")}
                  </Link>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {t(locale, "dashboard.section.recentActivity")}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t(locale, "dashboard.section.recentActivity")}
                </p>
              </div>
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs uppercase text-slate-500 dark:text-slate-400">
                      <th className="pb-2 font-semibold">
                        {t(locale, "dashboard.tx.table.type")}
                      </th>
                      <th className="pb-2 font-semibold">
                        {t(locale, "dashboard.tx.table.description")}
                      </th>
                      <th className="pb-2 font-semibold">
                        {t(locale, "dashboard.tx.table.date")}
                      </th>
                      <th className="pb-2 font-semibold text-right">
                        {t(locale, "dashboard.tx.table.value")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {recentTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-3 text-slate-500 dark:text-slate-400">
                          {t(locale, "dashboard.tx.table.empty")}
                        </td>
                      </tr>
                    ) : (
                      recentTransactions.map((tx) => {
                        const isIncome = tx.type === "INCOME";
                        const amount = toNumber(tx.amount);
                        return (
                          <tr key={tx.id} className="align-top">
                            <td className="py-3">
                              <span className="font-medium text-slate-900 dark:text-slate-100">
                                {t(
                                  locale,
                                  isIncome ? "dashboard.tx.income" : "dashboard.tx.expense"
                                )}
                              </span>
                            </td>
                            <td className="py-3 text-slate-600 dark:text-slate-300">
                              {tx.description ?? tx.category?.name ?? "-"}
                            </td>
                            <td className="py-3 text-slate-500 dark:text-slate-400">
                              {formatDatePtBR(tx.date)}
                            </td>
                            <td
                              className={[
                                "py-3 text-right font-semibold whitespace-nowrap",
                                isIncome
                                  ? "text-emerald-700 dark:text-emerald-300"
                                  : "text-rose-700 dark:text-rose-300",
                              ].join(" ")}
                            >
                              {isIncome ? "+" : "-"}
                              {formatBRL(Math.abs(amount))}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}


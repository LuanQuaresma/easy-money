"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/t";
import { formatBRL } from "@/lib/utils/currency";

type CategoryType = "NECESSITY" | "LIFESTYLE" | "INVESTMENT";
type TransactionType = "INCOME" | "EXPENSE";

type Category = {
  id: string;
  name: string;
  type: CategoryType;
};

type Transaction = {
  id: string;
  amount: unknown;
  date: string;
  type: TransactionType;
  description?: string | null;
  category?: Category | null;
};

function toNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v);
  if (v && typeof v === "object" && "toString" in v) {
    return Number((v as { toString: () => string }).toString());
  }
  return 0;
}

function formatDatePtBR(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR");
}

function todayISODate(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function IncomeClient({ locale }: { locale: Locale }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [incomes, setIncomes] = useState<Transaction[]>([]);

  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState<string>(todayISODate());
  const [description, setDescription] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [catRes, incRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/transactions?type=INCOME"),
        ]);

        if (!catRes.ok) throw new Error("categories failed");
        if (!incRes.ok) throw new Error("incomes failed");

        const [cat, inc] = await Promise.all([
          catRes.json(),
          incRes.json(),
        ]);

        if (cancelled) return;
        setCategories(cat as Category[]);
        setIncomes(inc as Transaction[]);
      } catch {
        if (cancelled) return;
        setError(t(locale, "income.form.error.generic"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const submitDisabled = useMemo(() => {
    const amt = Number(amount);
    return !amt || amt <= 0 || !date || saving;
  }, [amount, date, saving]);

  async function refresh() {
    const [catRes, incRes] = await Promise.all([
      fetch("/api/categories"),
      fetch("/api/transactions?type=INCOME"),
    ]);
    const [cat, inc] = await Promise.all([catRes.json(), incRes.json()]);
    setCategories(cat as Category[]);
    setIncomes(inc as Transaction[]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const amt = Number(amount);
      const body = {
        amount: amt,
        date,
        type: "INCOME",
        description: description || undefined,
        categoryId: categoryId || undefined,
      };

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("create failed");

      setAmount("");
      setDescription("");
      setCategoryId("");
      setDate(todayISODate());

      await refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("delete failed");
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {t(locale, "income.title")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {t(locale, "income.subtitle")}
              </p>
            </div>
            <Link
              href={`/${locale}/dashboard`}
              className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:underline"
            >
              {t(locale, "dashboard.nav.overview")}
            </Link>
          </div>
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
                {t(locale, "income.form.add")}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t(locale, "income.form.amount")}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t(locale, "income.form.date")}
                  </span>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t(locale, "income.form.description")}
                  </span>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t(locale, "income.form.category")}
                  </span>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100"
                  >
                    <option value="">—</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({t(locale, `category.${c.type}` as any)})
                      </option>
                    ))}
                  </select>
                </label>

                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitDisabled}
                    className="rounded-md bg-slate-800 dark:bg-slate-600 px-4 py-2 text-white font-medium hover:bg-slate-700 dark:hover:bg-slate-500 disabled:opacity-50"
                  >
                    {saving ? t(locale, "income.form.loading") : t(locale, "income.form.add")}
                  </button>
                </div>
              </form>
            </section>

            <section className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
              <div className="flex items-baseline justify-between gap-4 mb-3">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {t(locale, "income.title")}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Últimos registros
                </p>
              </div>

              {incomes.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t(locale, "income.table.empty")}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="text-xs uppercase text-slate-500 dark:text-slate-400">
                        <th className="pb-2 font-semibold">Data</th>
                        <th className="pb-2 font-semibold">Categoria</th>
                        <th className="pb-2 font-semibold">Descrição</th>
                        <th className="pb-2 font-semibold text-right">Valor</th>
                        <th className="pb-2 font-semibold text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {incomes.slice(0, 20).map((tx) => {
                        const amountValue = toNumber(tx.amount);
                        return (
                          <tr key={tx.id}>
                            <td className="py-3 text-slate-700 dark:text-slate-200">
                              {formatDatePtBR(tx.date)}
                            </td>
                            <td className="py-3 text-slate-700 dark:text-slate-200">
                              {tx.category ? tx.category.name : "—"}
                            </td>
                            <td className="py-3 text-slate-600 dark:text-slate-300">
                              {tx.description ?? "—"}
                            </td>
                            <td className="py-3 text-right font-semibold text-emerald-700 dark:text-emerald-300 whitespace-nowrap">
                              {formatBRL(amountValue)}
                            </td>
                            <td className="py-3 text-right">
                              <button
                                type="button"
                                disabled={saving}
                                onClick={() => handleDelete(tx.id)}
                                className="text-sm font-medium text-rose-700 dark:text-rose-300 hover:underline disabled:opacity-50"
                              >
                                {t(locale, "income.form.delete")}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}


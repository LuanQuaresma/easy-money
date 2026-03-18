"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/t";
import { formatBRL } from "@/lib/utils/currency";

type CategoryType = "NECESSITY" | "LIFESTYLE" | "INVESTMENT";
type ExpensePaymentStatus = "PAID" | "PENDING" | "OVERDUE";

type Category = {
  id: string;
  name: string;
  type: CategoryType;
};

type Expense = {
  id: string;
  name: string;
  amount: unknown;
  dueDate: string;
  recurring: boolean;
  paymentStatus: ExpensePaymentStatus;
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

export function ExpensesClient({ locale }: { locale: Locale }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>(todayISODate());
  const [categoryId, setCategoryId] = useState<string>("");
  const [recurring, setRecurring] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [catRes, expRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/expenses"),
        ]);
        if (!catRes.ok) throw new Error("categories failed");
        if (!expRes.ok) throw new Error("expenses failed");

        const [cat, exp] = await Promise.all([catRes.json(), expRes.json()]);
        if (cancelled) return;
        setCategories(cat as Category[]);
        setExpenses(exp as Expense[]);
      } catch {
        if (cancelled) return;
        setError(t(locale, "expenses.form.error.generic"));
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
    return !name.trim() || !categoryId || !dueDate || !amt || amt <= 0 || saving;
  }, [amount, categoryId, dueDate, name, saving]);

  async function refresh() {
    const [catRes, expRes] = await Promise.all([
      fetch("/api/categories"),
      fetch("/api/expenses"),
    ]);
    const [cat, exp] = await Promise.all([catRes.json(), expRes.json()]);
    setCategories(cat as Category[]);
    setExpenses(exp as Expense[]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const amt = Number(amount);
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          categoryId,
          amount: amt,
          dueDate,
          recurring,
        }),
      });

      if (!res.ok) throw new Error("create failed");

      setName("");
      setAmount("");
      setDueDate(todayISODate());
      setCategoryId("");
      setRecurring(false);

      await refresh();
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id: string, paymentStatus: ExpensePaymentStatus) {
    setSaving(true);
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus }),
      });
      if (!res.ok) throw new Error("update failed");
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  function statusPill(status: ExpensePaymentStatus) {
    const base =
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
    if (status === "PAID") {
      return (
        <span className={`${base} bg-emerald-100 text-emerald-800`}>
          {t(locale, `expense.status.${status}` as any)}
        </span>
      );
    }
    if (status === "OVERDUE") {
      return (
        <span className={`${base} bg-rose-100 text-rose-800`}>
          {t(locale, `expense.status.${status}` as any)}
        </span>
      );
    }
    return (
      <span className={`${base} bg-slate-100 text-slate-800`}>
        {t(locale, `expense.status.${status}` as any)}
      </span>
    );
  }

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {t(locale, "expenses.title")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {t(locale, "expenses.subtitle")}
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
                {t(locale, "expenses.form.add")}
              </h2>
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t(locale, "expenses.form.name")}
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t(locale, "expenses.form.amount")}
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
                    {t(locale, "expenses.form.dueDate")}
                  </span>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t(locale, "expenses.form.category")}
                  </span>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
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

                <label className="flex items-center gap-2 sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={recurring}
                    onChange={(e) => setRecurring(e.target.checked)}
                    className="rounded border-slate-300 text-slate-800"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t(locale, "expenses.form.recurring")}
                  </span>
                </label>

                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitDisabled}
                    className="rounded-md bg-slate-800 dark:bg-slate-600 px-4 py-2 text-white font-medium hover:bg-slate-700 dark:hover:bg-slate-500 disabled:opacity-50"
                  >
                    {saving ? t(locale, "expenses.form.loading") : t(locale, "expenses.form.add")}
                  </button>
                </div>
              </form>
            </section>

            <section className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
              <div className="flex items-baseline justify-between gap-4 mb-3">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {t(locale, "expenses.title")}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {expenses.length} itens
                </p>
              </div>

              {expenses.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t(locale, "expenses.table.empty")}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="text-xs uppercase text-slate-500 dark:text-slate-400">
                        <th className="pb-2 font-semibold">
                          {t(locale, "expenses.table.name")}
                        </th>
                        <th className="pb-2 font-semibold">
                          {t(locale, "expenses.table.category")}
                        </th>
                        <th className="pb-2 font-semibold">
                          {t(locale, "expenses.table.dueDate")}
                        </th>
                        <th className="pb-2 font-semibold">
                          {t(locale, "expenses.table.status")}
                        </th>
                        <th className="pb-2 font-semibold text-right">
                          {t(locale, "expenses.table.value")}
                        </th>
                        <th className="pb-2 font-semibold text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {expenses.slice(0, 30).map((e) => (
                        <tr key={e.id} className="align-top">
                          <td className="py-3 font-medium text-slate-900 dark:text-slate-100">
                            {e.name}
                          </td>
                          <td className="py-3 text-slate-700 dark:text-slate-200">
                            {e.category ? e.category.name : "—"}
                          </td>
                          <td className="py-3 text-slate-700 dark:text-slate-200">
                            {formatDatePtBR(e.dueDate)}
                          </td>
                          <td className="py-3">{statusPill(e.paymentStatus)}</td>
                          <td className="py-3 text-right font-semibold text-rose-700 dark:text-rose-300 whitespace-nowrap">
                            {formatBRL(toNumber(e.amount))}
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex flex-col gap-2 items-end">
                              {e.paymentStatus !== "PAID" && (
                                <button
                                  type="button"
                                  disabled={saving}
                                  onClick={() => updateStatus(e.id, "PAID")}
                                  className="text-sm font-medium text-emerald-700 dark:text-emerald-300 hover:underline disabled:opacity-50"
                                >
                                  {t(locale, "expenses.actions.markPaid")}
                                </button>
                              )}
                              {e.paymentStatus !== "PENDING" && (
                                <button
                                  type="button"
                                  disabled={saving}
                                  onClick={() => updateStatus(e.id, "PENDING")}
                                  className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:underline disabled:opacity-50"
                                >
                                  {t(locale, "expenses.actions.markPending")}
                                </button>
                              )}
                              {e.paymentStatus !== "OVERDUE" && (
                                <button
                                  type="button"
                                  disabled={saving}
                                  onClick={() => updateStatus(e.id, "OVERDUE")}
                                  className="text-sm font-medium text-rose-700 dark:text-rose-300 hover:underline disabled:opacity-50"
                                >
                                  {t(locale, "expenses.actions.markOverdue")}
                                </button>
                              )}
                              <button
                                type="button"
                                disabled={saving}
                                onClick={() => handleDelete(e.id)}
                                className="text-sm font-medium text-rose-800 dark:text-rose-200 hover:underline disabled:opacity-50"
                              >
                                {t(locale, "expenses.actions.delete")}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
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


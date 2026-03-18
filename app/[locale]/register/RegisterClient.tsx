"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/t";

export function RegisterClient({ locale }: { locale: Locale }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name: name || undefined }),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.message ?? t(locale, "register.error.generic"));
      return;
    }

    router.push(`/${locale}/login?callbackUrl=/${locale}/dashboard`);
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-900">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {t(locale, "app.name")}
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            {t(locale, "register.subtitle")}
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-lg bg-white dark:bg-slate-800 p-6 shadow"
        >
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          )}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t(locale, "register.nameOptional")}
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t(locale, "register.email")}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t(locale, "register.password")}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-slate-800 dark:bg-slate-600 py-2 px-4 font-medium text-white hover:bg-slate-700 dark:hover:bg-slate-500 disabled:opacity-50"
          >
            {loading ? t(locale, "register.button.loading") : t(locale, "register.button")}
          </button>
        </form>
        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          {t(locale, "register.alreadyAccount")}{" "}
          <Link
            href={`/${locale}/login`}
            className="font-medium text-slate-800 dark:text-slate-200 hover:underline"
          >
            {t(locale, "register.loginLink")}
          </Link>
        </p>
      </div>
    </main>
  );
}


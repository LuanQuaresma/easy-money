"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/t";

export function LoginClient({ locale }: { locale: Locale }) {
  function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const callbackUrl =
      searchParams.get("callbackUrl") ?? `/${locale}/dashboard`;

    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      setError("");
      setLoading(true);

      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      setLoading(false);

      if (res?.error) {
        setError(t(locale, "login.error.invalid"));
        return;
      }
      if (res?.url) window.location.href = res.url;
    }

    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-900">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {t(locale, "app.name")}
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              {t(locale, "login.subtitle")}
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
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                {t(locale, "login.email")}
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
                {t(locale, "login.password")}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-slate-800 dark:bg-slate-600 py-2 px-4 font-medium text-white hover:bg-slate-700 dark:hover:bg-slate-500 disabled:opacity-50"
            >
              {loading ? t(locale, "login.button.loading") : t(locale, "login.button")}
            </button>
          </form>
          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            {t(locale, "login.noAccount")}{" "}
            <Link
              href={`/${locale}/register`}
              className="font-medium text-slate-800 dark:text-slate-200 hover:underline"
            >
              {t(locale, "login.registerLink")}
            </Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-900">
          <p className="text-slate-600 dark:text-slate-400">{t(locale, "common.loading")}</p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}


import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/t";

export default function HomePage({
  params,
}: {
  params: { locale: Locale };
}) {
  const locale = params.locale;

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          {t(locale, "app.name")}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          {t(locale, "app.tagline")}
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href={`/${locale}/login`}
            className="rounded-md bg-slate-800 dark:bg-slate-600 px-4 py-2 text-white font-medium hover:bg-slate-700"
          >
            {t(locale, "nav.login")}
          </Link>
          <Link
            href={`/${locale}/register`}
            className="rounded-md border border-slate-300 dark:border-slate-600 px-4 py-2 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {t(locale, "nav.register")}
          </Link>
        </div>
      </div>
    </main>
  );
}


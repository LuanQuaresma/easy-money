import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { defaultLocale, supportedLocales, type Locale } from "@/lib/i18n/config";

export default function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const locale = params.locale;
  if (!(supportedLocales as readonly string[]).includes(locale)) {
    redirect(`/${defaultLocale}`);
  }

  // We validate here so nested pages can safely cast `params.locale` to `Locale`.
  return <>{children}</>;
}


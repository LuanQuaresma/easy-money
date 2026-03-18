import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth.config";
import type { Locale } from "@/lib/i18n/config";
import { ExpensesClient } from "./ExpensesClient";

export default async function ExpensesPage({
  params,
}: {
  params: { locale: Locale };
}) {
  const locale = params.locale;

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/${locale}/login?callbackUrl=/${locale}/dashboard/expenses`);
  }

  return <ExpensesClient locale={locale} />;
}


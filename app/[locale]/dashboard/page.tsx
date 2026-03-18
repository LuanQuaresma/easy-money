import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth.config";
import type { Locale } from "@/lib/i18n/config";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage({
  params,
}: {
  params: { locale: Locale };
}) {
  const locale = params.locale;

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/${locale}/login?callbackUrl=/${locale}/dashboard`);
  }

  const name = session.user.name ?? session.user.email ?? "";

  return <DashboardClient locale={locale} userName={name} />;
}


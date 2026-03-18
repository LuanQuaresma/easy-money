import type { Locale } from "@/lib/i18n/config";
import { LoginClient } from "./LoginClient";

export default function LoginPage({
  params,
}: {
  params: { locale: Locale };
}) {
  return <LoginClient locale={params.locale} />;
}


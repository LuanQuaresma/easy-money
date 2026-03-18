import type { Locale } from "@/lib/i18n/config";
import { RegisterClient } from "./RegisterClient";

export default function RegisterPage({
  params,
}: {
  params: { locale: Locale };
}) {
  return <RegisterClient locale={params.locale} />;
}


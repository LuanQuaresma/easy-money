import { redirect } from "next/navigation";
import { defaultLocale } from "@/lib/i18n/config";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { callbackUrl?: string };
}) {
  let callbackUrl = searchParams?.callbackUrl ?? `/${defaultLocale}/dashboard`;

  // Backward compatibility: antigo callbackUrl era `/dashboard` (sem locale).
  if (callbackUrl === "/dashboard") {
    callbackUrl = `/${defaultLocale}/dashboard`;
  }
  if (!callbackUrl.startsWith(`/${defaultLocale}/`) && callbackUrl.startsWith("/")) {
    callbackUrl = `/${defaultLocale}${callbackUrl}`;
  }

  redirect(
    `/${defaultLocale}/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
  );
}

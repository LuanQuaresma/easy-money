import type { Locale } from "./config";
import type { TranslationKey } from "./messages";
import { getDictionary } from "./messages";

type Vars = Record<string, string | number | boolean | null | undefined>;

export function t(
  locale: Locale | string,
  key: TranslationKey,
  vars?: Vars
): string {
  const dict = getDictionary(locale);
  const template = dict[key] ?? String(key);
  return applyVars(template, vars);
}

function applyVars(template: string, vars?: Vars): string {
  if (!vars) return template;
  return Object.entries(vars).reduce((acc, [k, v]) => {
    return acc.replaceAll(`{${k}}`, String(v ?? ""));
  }, template);
}


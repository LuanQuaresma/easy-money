import type { Locale } from "./config";
import { defaultLocale, supportedLocales } from "./config";
import { messages as ptBR } from "./messages/pt-BR";

export const dictionaries = {
  "pt-BR": ptBR,
} as const satisfies Record<Locale, typeof ptBR>;

export type TranslationKey = keyof typeof ptBR;

export function getDictionary(locale: string): typeof ptBR {
  if ((supportedLocales as readonly string[]).includes(locale)) {
    return dictionaries[locale as Locale];
  }
  return dictionaries[defaultLocale];
}


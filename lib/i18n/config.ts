/**
 * i18n configuration.
 * Default locale: pt-BR (Brazilian Portuguese).
 */
export const defaultLocale = "pt-BR" as const;
export const supportedLocales = ["pt-BR"] as const;
export type Locale = (typeof supportedLocales)[number];

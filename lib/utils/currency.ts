/**
 * Format value as Brazilian Real (BRL).
 * Examples: R$ 1.500,00 | R$ 2.450,90
 */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Money input helpers: form/API value is a decimal string with dot (e.g. "1234.56");
 * display follows pt-BR (e.g. "1.234,56"). Typing uses digit-only cent semantics
 * (last two digits are centavos), which matches common POS-style entry.
 */

export function decimalApiStringToCents(value: string): number {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return 0;
  const n = Number.parseFloat(normalized);
  if (Number.isNaN(n)) return 0;
  return Math.round(n * 100);
}

export function centsToApiDecimalString(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function formatCentsAsBrlDisplay(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/** Interprets raw input as digit-only centavos (empty → 0). */
export function parseMoneyInputToCents(raw: string): number {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return 0;
  return Number.parseInt(digits, 10);
}

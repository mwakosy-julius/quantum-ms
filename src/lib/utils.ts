export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Format number as TZS with 3-digit grouping (e.g. 5,000,000 TZS) */
export function formatCurrency(value: number | string): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (typeof n !== "number" || isNaN(n)) return String(value);
  return `${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} TZS`;
}

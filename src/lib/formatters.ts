const trLocale = "tr-TR";

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat(trLocale, {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat(trLocale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number): string {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${formatNumber(value, 2)}%`;
}

export function formatMarketCap(value: number): string {
  if (value >= 1e12) return `${formatNumber(value / 1e12, 1)} T₺`;
  if (value >= 1e9) return `${formatNumber(value / 1e9, 1)} Mr₺`;
  if (value >= 1e6) return `${formatNumber(value / 1e6, 1)} Mn₺`;
  return formatCurrency(value);
}

export function formatVolume(value: number | bigint): string {
  const v = Number(value);
  if (v >= 1e9) return `${formatNumber(v / 1e9, 1)} Mr`;
  if (v >= 1e6) return `${formatNumber(v / 1e6, 1)} Mn`;
  if (v >= 1e3) return `${formatNumber(v / 1e3, 1)} B`;
  return v.toString();
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat(trLocale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat(trLocale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

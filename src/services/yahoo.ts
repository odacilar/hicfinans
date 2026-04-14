import { YAHOO_FINANCE_BASE_URL } from "@/lib/constants";

interface YahooChartResult {
  timestamp: number[];
  indicators: {
    quote: {
      open: number[];
      high: number[];
      low: number[];
      close: number[];
      volume: number[];
    }[];
    adjclose?: { adjclose: number[] }[];
  };
}

interface YahooFinancialData {
  totalRevenue?: { raw: number };
  grossProfits?: { raw: number };
  ebitda?: { raw: number };
  operatingCashflow?: { raw: number };
  freeCashflow?: { raw: number };
  totalCash?: { raw: number };
  totalDebt?: { raw: number };
  earningsGrowth?: { raw: number };
  revenueGrowth?: { raw: number };
  returnOnEquity?: { raw: number };
  returnOnAssets?: { raw: number };
  profitMargins?: { raw: number };
  grossMargins?: { raw: number };
}

export async function fetchPriceHistory(
  ticker: string,
  range = "1y",
  interval = "1d"
): Promise<YahooChartResult | null> {
  const symbol = `${ticker}.IS`;
  const url = `${YAHOO_FINANCE_BASE_URL}/v8/finance/chart/${symbol}?range=${range}&interval=${interval}`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const json = await res.json();
  return json.chart?.result?.[0] ?? null;
}

export async function fetchFinancialData(
  ticker: string
): Promise<YahooFinancialData | null> {
  const symbol = `${ticker}.IS`;
  const modules = "financialData,balanceSheetHistory,incomeStatementHistory,cashflowStatementHistory";
  const url = `${YAHOO_FINANCE_BASE_URL}/v10/finance/quoteSummary/${symbol}?modules=${modules}`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const json = await res.json();
  return json.quoteSummary?.result?.[0]?.financialData ?? null;
}

export function yahooTimestampToDate(ts: number): Date {
  return new Date(ts * 1000);
}

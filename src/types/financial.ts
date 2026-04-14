export interface FinancialPeriod {
  period: string;
  periodEndDate: string;
  revenue: number | null;
  grossProfit: number | null;
  operatingProfit: number | null;
  ebitda: number | null;
  netIncome: number | null;
  eps: number | null;
  totalAssets: number | null;
  totalLiabilities: number | null;
  totalEquity: number | null;
  cash: number | null;
  totalDebt: number | null;
  netDebt: number | null;
  operatingCashFlow: number | null;
  freeCashFlow: number | null;
}

export interface FinancialRatios {
  peRatio: number | null;
  pbRatio: number | null;
  evToEbitda: number | null;
  debtToEquity: number | null;
  currentRatio: number | null;
  roe: number | null;
  roa: number | null;
  grossMargin: number | null;
  netMargin: number | null;
  dividendYield: number | null;
}

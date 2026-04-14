export interface ScreenerFilter {
  field: string;
  operator: "gt" | "gte" | "lt" | "lte" | "eq" | "between";
  value: number;
  valueTo?: number;
}

export interface ScreenerRequest {
  filters: ScreenerFilter[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
  sectors?: string[];
}

export interface ScreenerResponse {
  results: ScreenerResultItem[];
  total: number;
  page: number;
  limit: number;
}

export interface ScreenerResultItem {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  marketCap: number;
  peRatio: number | null;
  pbRatio: number | null;
  roe: number | null;
  netMargin: number | null;
  dividendYield: number | null;
  overallScore: number;
}

export interface StockListItem {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  overallScore: number;
}

export interface StockDetail {
  ticker: string;
  name: string;
  sector: string;
  subSector: string | null;
  marketCap: number | null;
  website: string | null;
  logo: string | null;
  listingDate: string | null;
  latestPrice: {
    close: number;
    change: number;
    changePercent: number;
    volume: number;
    date: string;
  } | null;
  scores: {
    valueScore: number;
    futureScore: number;
    pastScore: number;
    healthScore: number;
    dividendScore: number;
    overallScore: number;
  } | null;
}

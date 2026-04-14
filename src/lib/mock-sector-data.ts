import { MOCK_STOCKS } from "./mock-data";

// ── Interfaces ──

export interface SectorData {
  name: string;
  stockCount: number;
  totalMarketCap: number;
  avgChange: number;
  avgPE: number;
  avgPB: number;
  avgROE: number;
  avgDividendYield: number;
  avgNetMargin: number;
  weeklyPerformance: number;
  monthlyPerformance: number;
  ytdPerformance: number;
  topStock: string;
  worstStock: string;
  marketCapShare: number;
  momentum: "güçlü" | "yükselen" | "nötr" | "zayıflıyor" | "düşüşte";
}

export interface SectorRotation {
  period: string;
  sectors: { name: string; performance: number }[];
}

// ── Deterministic pseudo-random based on string seed ──

function seededRandom(seed: string, offset: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i) + offset * 137) | 0;
  }
  return ((hash & 0x7fffffff) % 10000) / 10000;
}

// ── Compute sector aggregates from MOCK_STOCKS ──

const totalBISTMarketCap = MOCK_STOCKS.reduce((sum, s) => sum + s.marketCap, 0);

const sectorGroups = MOCK_STOCKS.reduce<Record<string, typeof MOCK_STOCKS>>((acc, stock) => {
  if (!acc[stock.sector]) acc[stock.sector] = [];
  acc[stock.sector].push(stock);
  return acc;
}, {});

function pickMomentum(avgChange: number): SectorData["momentum"] {
  if (avgChange > 1.8) return "güçlü";
  if (avgChange > 0.8) return "yükselen";
  if (avgChange > -0.3) return "nötr";
  if (avgChange > -1.0) return "zayıflıyor";
  return "düşüşte";
}

export const MOCK_SECTOR_DATA: SectorData[] = Object.entries(sectorGroups)
  .map(([sectorName, stocks]) => {
    const stockCount = stocks.length;
    const totalMarketCap = stocks.reduce((s, st) => s + st.marketCap, 0);
    const avgChange = stocks.reduce((s, st) => s + st.changePercent, 0) / stockCount;

    // Deterministic mock ratios per sector
    const r = (offset: number) => seededRandom(sectorName, offset);
    const avgPE = 5 + r(1) * 20;
    const avgPB = 0.8 + r(2) * 4;
    const avgROE = 8 + r(3) * 30;
    const avgDividendYield = r(4) * 7;
    const avgNetMargin = 3 + r(5) * 22;

    // Performance figures (seeded)
    const weeklyPerformance = (r(6) - 0.45) * 8;
    const monthlyPerformance = (r(7) - 0.4) * 15;
    const ytdPerformance = (r(8) - 0.3) * 40;

    // Best/worst by daily change
    const sorted = [...stocks].sort((a, b) => b.changePercent - a.changePercent);
    const topStock = sorted[0].ticker;
    const worstStock = sorted[sorted.length - 1].ticker;

    const marketCapShare = (totalMarketCap / totalBISTMarketCap) * 100;

    return {
      name: sectorName,
      stockCount,
      totalMarketCap,
      avgChange: Math.round(avgChange * 100) / 100,
      avgPE: Math.round(avgPE * 100) / 100,
      avgPB: Math.round(avgPB * 100) / 100,
      avgROE: Math.round(avgROE * 100) / 100,
      avgDividendYield: Math.round(avgDividendYield * 100) / 100,
      avgNetMargin: Math.round(avgNetMargin * 100) / 100,
      weeklyPerformance: Math.round(weeklyPerformance * 100) / 100,
      monthlyPerformance: Math.round(monthlyPerformance * 100) / 100,
      ytdPerformance: Math.round(ytdPerformance * 100) / 100,
      topStock,
      worstStock,
      marketCapShare: Math.round(marketCapShare * 100) / 100,
      momentum: pickMomentum(avgChange),
    };
  })
  .sort((a, b) => b.totalMarketCap - a.totalMarketCap);

// ── Sector Rotation (last 6 quarters) ──

const QUARTERS = ["2024-Q4", "2025-Q1", "2025-Q2", "2025-Q3", "2025-Q4", "2026-Q1"];

const sectorNames = MOCK_SECTOR_DATA.map((s) => s.name);

export const MOCK_SECTOR_ROTATION: SectorRotation[] = QUARTERS.map((period, qi) => ({
  period,
  sectors: sectorNames.map((name) => {
    const r = seededRandom(name + period, qi * 7);
    const performance = Math.round(((r - 0.4) * 30) * 100) / 100;
    return { name, performance };
  }),
}));

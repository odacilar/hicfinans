"use client";

import { useState, useMemo } from "react";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/formatters";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MonthlyReturn {
  month: string;
  value: number;       // monthly return %
  cumulative: number;  // portfolio value at that point
}

interface BacktestResult {
  strategy: string;
  strategyKey: string;
  startYear: number;
  initialAmount: number;
  finalAmount: number;
  totalReturn: number;
  annualizedReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  winRate: number;
  bestMonth: number;
  worstMonth: number;
  volatility: number;
  monthlyReturns: MonthlyReturn[];
}

// ---------------------------------------------------------------------------
// Strategy definitions
// ---------------------------------------------------------------------------

const STRATEGIES = [
  { key: "bist100", label: "BIST-100 Endeks", icon: "📊", color: "#6B7280" },
  { key: "buffett", label: "Buffett Deger", icon: "🏦", color: "#10B981" },
  { key: "canslim", label: "CANSLIM Buyume", icon: "🚀", color: "#3B82F6" },
  { key: "dividend", label: "Yuksek Temettu", icon: "💰", color: "#F59E0B" },
  { key: "lowpe", label: "Dusuk F/K", icon: "📉", color: "#8B5CF6" },
  { key: "momentum", label: "Momentum", icon: "⚡", color: "#EF4444" },
  { key: "karma", label: "Karma Strateji", icon: "🎯", color: "#EC4899" },
] as const;

const START_YEARS = [2021, 2022, 2023, 2024] as const;
const REBALANCE_OPTIONS = [
  { key: "monthly", label: "Aylik" },
  { key: "quarterly", label: "Ceyreklik" },
  { key: "yearly", label: "Yillik" },
] as const;

const MONTH_LABELS = [
  "Oca", "Sub", "Mar", "Nis", "May", "Haz",
  "Tem", "Agu", "Eyl", "Eki", "Kas", "Ara",
];

// ---------------------------------------------------------------------------
// Mock data generator — realistic Turkish market returns 2021-2026
// BIST-100 had very high TL returns due to inflation/currency depreciation
// ---------------------------------------------------------------------------

function generateMonthlyReturns(
  baseReturns: number[],
  noise: number,
  seed: number,
): number[] {
  // Simple seeded pseudo-random
  let s = seed;
  const rng = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return (s / 0x7fffffff - 0.5) * 2;
  };
  return baseReturns.map((r) => r + rng() * noise);
}

function buildCumulative(
  monthlyPctReturns: number[],
  initial: number,
  startYear: number,
): MonthlyReturn[] {
  let value = initial;
  const result: MonthlyReturn[] = [];
  let year = startYear;
  let monthIdx = 0;

  for (const pct of monthlyPctReturns) {
    value = value * (1 + pct / 100);
    const monthLabel = `${MONTH_LABELS[monthIdx % 12]} ${year}`;
    result.push({ month: monthLabel, value: pct, cumulative: Math.round(value) });
    monthIdx++;
    if (monthIdx % 12 === 0) year++;
  }
  return result;
}

function computeStats(
  monthly: MonthlyReturn[],
  initial: number,
): Omit<BacktestResult, "strategy" | "strategyKey" | "startYear" | "initialAmount" | "monthlyReturns"> {
  const finalAmount = monthly[monthly.length - 1].cumulative;
  const totalReturn = ((finalAmount - initial) / initial) * 100;
  const years = monthly.length / 12;
  const annualizedReturn = (Math.pow(finalAmount / initial, 1 / years) - 1) * 100;

  let peak = initial;
  let maxDrawdown = 0;
  for (const m of monthly) {
    if (m.cumulative > peak) peak = m.cumulative;
    const dd = ((peak - m.cumulative) / peak) * 100;
    if (dd > maxDrawdown) maxDrawdown = dd;
  }

  const pctReturns = monthly.map((m) => m.value);
  const mean = pctReturns.reduce((a, b) => a + b, 0) / pctReturns.length;
  const variance = pctReturns.reduce((a, b) => a + (b - mean) ** 2, 0) / pctReturns.length;
  const volatility = Math.sqrt(variance);
  const annualVol = volatility * Math.sqrt(12);
  const riskFreeMonthly = 3.5; // ~42% annual in Turkey
  const sharpeRatio = annualVol > 0 ? (annualizedReturn - 42) / annualVol : 0;

  const winRate = (pctReturns.filter((r) => r > 0).length / pctReturns.length) * 100;
  const bestMonth = Math.max(...pctReturns);
  const worstMonth = Math.min(...pctReturns);

  return {
    finalAmount,
    totalReturn,
    annualizedReturn,
    maxDrawdown,
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    winRate: Math.round(winRate * 10) / 10,
    bestMonth: Math.round(bestMonth * 10) / 10,
    worstMonth: Math.round(worstMonth * 10) / 10,
    volatility: Math.round(annualVol * 10) / 10,
  };
}

// Base monthly returns by strategy and start year (realistic BIST data)
// BIST-100: 2021 +26%, 2022 +197%, 2023 +37%, 2024 +35%, 2025 +15% (TL terms)

const BASE_MONTHLY: Record<string, Record<number, number[]>> = {
  bist100: {
    2021: [
      3.5, -2.1, 1.8, 4.2, -1.5, 2.8, -3.2, 5.1, -0.8, 3.4, 2.1, 4.5, // 2021
      8.2, 6.5, -4.1, 12.3, 15.8, -2.5, 18.4, 10.2, 7.6, 14.1, 9.8, 12.5, // 2022
      5.2, -3.1, 8.4, -2.8, 4.5, -1.2, 6.3, -4.5, 3.8, 2.1, 5.6, -1.8, // 2023
      4.8, 3.2, -2.5, 5.1, -1.8, 3.5, 2.8, -3.2, 6.1, -0.5, 4.2, 3.8, // 2024
      2.1, 1.5, -0.8, 3.2, -1.2, 2.5, 1.8, -0.5, 2.8, 1.2, -0.3, 1.5, // 2025
      1.8, -0.2, 2.1, // 2026 Q1
    ],
    2022: [
      8.2, 6.5, -4.1, 12.3, 15.8, -2.5, 18.4, 10.2, 7.6, 14.1, 9.8, 12.5,
      5.2, -3.1, 8.4, -2.8, 4.5, -1.2, 6.3, -4.5, 3.8, 2.1, 5.6, -1.8,
      4.8, 3.2, -2.5, 5.1, -1.8, 3.5, 2.8, -3.2, 6.1, -0.5, 4.2, 3.8,
      2.1, 1.5, -0.8, 3.2, -1.2, 2.5, 1.8, -0.5, 2.8, 1.2, -0.3, 1.5,
      1.8, -0.2, 2.1,
    ],
    2023: [
      5.2, -3.1, 8.4, -2.8, 4.5, -1.2, 6.3, -4.5, 3.8, 2.1, 5.6, -1.8,
      4.8, 3.2, -2.5, 5.1, -1.8, 3.5, 2.8, -3.2, 6.1, -0.5, 4.2, 3.8,
      2.1, 1.5, -0.8, 3.2, -1.2, 2.5, 1.8, -0.5, 2.8, 1.2, -0.3, 1.5,
      1.8, -0.2, 2.1,
    ],
    2024: [
      4.8, 3.2, -2.5, 5.1, -1.8, 3.5, 2.8, -3.2, 6.1, -0.5, 4.2, 3.8,
      2.1, 1.5, -0.8, 3.2, -1.2, 2.5, 1.8, -0.5, 2.8, 1.2, -0.3, 1.5,
      1.8, -0.2, 2.1,
    ],
  },
  buffett: {
    2021: [
      4.2, -1.5, 2.5, 5.1, -0.8, 3.5, -2.1, 6.2, 0.5, 4.8, 3.2, 5.8,
      9.5, 7.8, -3.2, 14.1, 17.2, -1.8, 20.1, 11.5, 8.9, 15.8, 11.2, 14.1,
      6.8, -2.5, 9.8, -1.5, 5.8, 0.2, 7.5, -3.2, 5.1, 3.5, 6.8, -0.5,
      5.8, 4.1, -1.8, 6.2, -0.5, 4.2, 3.5, -2.5, 7.2, 0.8, 5.1, 4.5,
      3.2, 2.1, 0.5, 4.1, -0.5, 3.2, 2.5, 0.2, 3.5, 1.8, 0.5, 2.1,
      2.5, 0.5, 2.8,
    ],
    2022: [
      9.5, 7.8, -3.2, 14.1, 17.2, -1.8, 20.1, 11.5, 8.9, 15.8, 11.2, 14.1,
      6.8, -2.5, 9.8, -1.5, 5.8, 0.2, 7.5, -3.2, 5.1, 3.5, 6.8, -0.5,
      5.8, 4.1, -1.8, 6.2, -0.5, 4.2, 3.5, -2.5, 7.2, 0.8, 5.1, 4.5,
      3.2, 2.1, 0.5, 4.1, -0.5, 3.2, 2.5, 0.2, 3.5, 1.8, 0.5, 2.1,
      2.5, 0.5, 2.8,
    ],
    2023: [
      6.8, -2.5, 9.8, -1.5, 5.8, 0.2, 7.5, -3.2, 5.1, 3.5, 6.8, -0.5,
      5.8, 4.1, -1.8, 6.2, -0.5, 4.2, 3.5, -2.5, 7.2, 0.8, 5.1, 4.5,
      3.2, 2.1, 0.5, 4.1, -0.5, 3.2, 2.5, 0.2, 3.5, 1.8, 0.5, 2.1,
      2.5, 0.5, 2.8,
    ],
    2024: [
      5.8, 4.1, -1.8, 6.2, -0.5, 4.2, 3.5, -2.5, 7.2, 0.8, 5.1, 4.5,
      3.2, 2.1, 0.5, 4.1, -0.5, 3.2, 2.5, 0.2, 3.5, 1.8, 0.5, 2.1,
      2.5, 0.5, 2.8,
    ],
  },
  canslim: {
    2021: [
      5.8, -3.2, 3.5, 6.8, -2.1, 4.5, -4.5, 8.2, 1.2, 6.1, 4.5, 7.2,
      11.2, 8.5, -5.8, 16.5, 19.8, -3.5, 22.5, 13.1, 10.2, 17.5, 12.8, 16.2,
      7.5, -4.2, 11.5, -3.5, 6.8, -0.5, 8.8, -5.8, 6.2, 4.1, 7.5, -2.1,
      6.5, 5.2, -3.5, 7.8, -1.2, 5.5, 4.2, -4.1, 8.5, 1.2, 6.2, 5.1,
      3.8, 2.5, -1.2, 4.8, -2.1, 3.8, 2.8, -1.5, 4.2, 2.1, -0.8, 2.5,
      3.1, -0.5, 3.5,
    ],
    2022: [
      11.2, 8.5, -5.8, 16.5, 19.8, -3.5, 22.5, 13.1, 10.2, 17.5, 12.8, 16.2,
      7.5, -4.2, 11.5, -3.5, 6.8, -0.5, 8.8, -5.8, 6.2, 4.1, 7.5, -2.1,
      6.5, 5.2, -3.5, 7.8, -1.2, 5.5, 4.2, -4.1, 8.5, 1.2, 6.2, 5.1,
      3.8, 2.5, -1.2, 4.8, -2.1, 3.8, 2.8, -1.5, 4.2, 2.1, -0.8, 2.5,
      3.1, -0.5, 3.5,
    ],
    2023: [
      7.5, -4.2, 11.5, -3.5, 6.8, -0.5, 8.8, -5.8, 6.2, 4.1, 7.5, -2.1,
      6.5, 5.2, -3.5, 7.8, -1.2, 5.5, 4.2, -4.1, 8.5, 1.2, 6.2, 5.1,
      3.8, 2.5, -1.2, 4.8, -2.1, 3.8, 2.8, -1.5, 4.2, 2.1, -0.8, 2.5,
      3.1, -0.5, 3.5,
    ],
    2024: [
      6.5, 5.2, -3.5, 7.8, -1.2, 5.5, 4.2, -4.1, 8.5, 1.2, 6.2, 5.1,
      3.8, 2.5, -1.2, 4.8, -2.1, 3.8, 2.8, -1.5, 4.2, 2.1, -0.8, 2.5,
      3.1, -0.5, 3.5,
    ],
  },
  dividend: {
    2021: [
      2.8, -0.5, 1.2, 3.5, 0.5, 2.1, -1.5, 3.8, 0.8, 2.5, 1.8, 3.2,
      6.5, 5.1, -2.8, 10.5, 13.2, -1.2, 15.8, 8.5, 6.2, 12.1, 8.2, 10.8,
      4.5, -1.8, 7.2, -1.2, 3.8, 0.5, 5.5, -2.8, 3.5, 2.1, 4.8, 0.2,
      4.2, 2.8, -1.5, 4.5, 0.2, 3.1, 2.5, -1.8, 5.5, 0.5, 3.8, 3.2,
      2.5, 1.8, 0.2, 3.1, 0.5, 2.8, 2.1, 0.5, 3.2, 1.5, 0.8, 2.1,
      2.2, 0.8, 2.5,
    ],
    2022: [
      6.5, 5.1, -2.8, 10.5, 13.2, -1.2, 15.8, 8.5, 6.2, 12.1, 8.2, 10.8,
      4.5, -1.8, 7.2, -1.2, 3.8, 0.5, 5.5, -2.8, 3.5, 2.1, 4.8, 0.2,
      4.2, 2.8, -1.5, 4.5, 0.2, 3.1, 2.5, -1.8, 5.5, 0.5, 3.8, 3.2,
      2.5, 1.8, 0.2, 3.1, 0.5, 2.8, 2.1, 0.5, 3.2, 1.5, 0.8, 2.1,
      2.2, 0.8, 2.5,
    ],
    2023: [
      4.5, -1.8, 7.2, -1.2, 3.8, 0.5, 5.5, -2.8, 3.5, 2.1, 4.8, 0.2,
      4.2, 2.8, -1.5, 4.5, 0.2, 3.1, 2.5, -1.8, 5.5, 0.5, 3.8, 3.2,
      2.5, 1.8, 0.2, 3.1, 0.5, 2.8, 2.1, 0.5, 3.2, 1.5, 0.8, 2.1,
      2.2, 0.8, 2.5,
    ],
    2024: [
      4.2, 2.8, -1.5, 4.5, 0.2, 3.1, 2.5, -1.8, 5.5, 0.5, 3.8, 3.2,
      2.5, 1.8, 0.2, 3.1, 0.5, 2.8, 2.1, 0.5, 3.2, 1.5, 0.8, 2.1,
      2.2, 0.8, 2.5,
    ],
  },
  lowpe: {
    2021: [
      3.8, -1.8, 2.2, 4.5, -0.5, 3.2, -2.5, 5.5, 0.2, 3.8, 2.5, 4.8,
      8.8, 7.2, -3.5, 13.2, 16.5, -2.1, 19.2, 10.8, 8.1, 14.5, 10.5, 13.2,
      5.8, -2.8, 9.1, -2.1, 5.2, -0.2, 6.8, -3.8, 4.5, 2.8, 6.2, -0.8,
      5.2, 3.8, -2.1, 5.8, -0.8, 3.8, 3.2, -2.8, 6.5, 0.5, 4.5, 4.1,
      2.8, 1.8, -0.2, 3.5, -0.8, 2.8, 2.2, 0.2, 3.1, 1.5, 0.2, 1.8,
      2.1, 0.2, 2.5,
    ],
    2022: [
      8.8, 7.2, -3.5, 13.2, 16.5, -2.1, 19.2, 10.8, 8.1, 14.5, 10.5, 13.2,
      5.8, -2.8, 9.1, -2.1, 5.2, -0.2, 6.8, -3.8, 4.5, 2.8, 6.2, -0.8,
      5.2, 3.8, -2.1, 5.8, -0.8, 3.8, 3.2, -2.8, 6.5, 0.5, 4.5, 4.1,
      2.8, 1.8, -0.2, 3.5, -0.8, 2.8, 2.2, 0.2, 3.1, 1.5, 0.2, 1.8,
      2.1, 0.2, 2.5,
    ],
    2023: [
      5.8, -2.8, 9.1, -2.1, 5.2, -0.2, 6.8, -3.8, 4.5, 2.8, 6.2, -0.8,
      5.2, 3.8, -2.1, 5.8, -0.8, 3.8, 3.2, -2.8, 6.5, 0.5, 4.5, 4.1,
      2.8, 1.8, -0.2, 3.5, -0.8, 2.8, 2.2, 0.2, 3.1, 1.5, 0.2, 1.8,
      2.1, 0.2, 2.5,
    ],
    2024: [
      5.2, 3.8, -2.1, 5.8, -0.8, 3.8, 3.2, -2.8, 6.5, 0.5, 4.5, 4.1,
      2.8, 1.8, -0.2, 3.5, -0.8, 2.8, 2.2, 0.2, 3.1, 1.5, 0.2, 1.8,
      2.1, 0.2, 2.5,
    ],
  },
  momentum: {
    2021: [
      6.5, -4.2, 4.2, 7.8, -3.1, 5.8, -5.5, 9.5, 2.1, 7.2, 5.5, 8.5,
      12.5, 9.8, -6.5, 18.2, 21.5, -4.2, 24.8, 14.5, 11.8, 19.2, 14.5, 18.1,
      8.5, -5.2, 12.8, -4.2, 7.5, -1.5, 9.8, -6.5, 7.2, 5.1, 8.8, -2.8,
      7.2, 5.8, -4.2, 8.5, -2.1, 6.2, 5.1, -5.2, 9.5, 1.8, 7.1, 5.8,
      4.2, 2.8, -2.1, 5.5, -2.8, 4.2, 3.2, -2.1, 4.8, 2.5, -1.5, 2.8,
      3.5, -1.2, 4.1,
    ],
    2022: [
      12.5, 9.8, -6.5, 18.2, 21.5, -4.2, 24.8, 14.5, 11.8, 19.2, 14.5, 18.1,
      8.5, -5.2, 12.8, -4.2, 7.5, -1.5, 9.8, -6.5, 7.2, 5.1, 8.8, -2.8,
      7.2, 5.8, -4.2, 8.5, -2.1, 6.2, 5.1, -5.2, 9.5, 1.8, 7.1, 5.8,
      4.2, 2.8, -2.1, 5.5, -2.8, 4.2, 3.2, -2.1, 4.8, 2.5, -1.5, 2.8,
      3.5, -1.2, 4.1,
    ],
    2023: [
      8.5, -5.2, 12.8, -4.2, 7.5, -1.5, 9.8, -6.5, 7.2, 5.1, 8.8, -2.8,
      7.2, 5.8, -4.2, 8.5, -2.1, 6.2, 5.1, -5.2, 9.5, 1.8, 7.1, 5.8,
      4.2, 2.8, -2.1, 5.5, -2.8, 4.2, 3.2, -2.1, 4.8, 2.5, -1.5, 2.8,
      3.5, -1.2, 4.1,
    ],
    2024: [
      7.2, 5.8, -4.2, 8.5, -2.1, 6.2, 5.1, -5.2, 9.5, 1.8, 7.1, 5.8,
      4.2, 2.8, -2.1, 5.5, -2.8, 4.2, 3.2, -2.1, 4.8, 2.5, -1.5, 2.8,
      3.5, -1.2, 4.1,
    ],
  },
  karma: {
    2021: [
      4.5, -2.2, 2.9, 5.3, -1.2, 3.8, -3.2, 6.4, 0.8, 4.7, 3.3, 5.7,
      9.4, 7.5, -4.3, 14.1, 17.3, -2.5, 20.1, 11.4, 8.8, 15.5, 11.2, 14.1,
      6.5, -3.2, 9.8, -2.5, 5.6, -0.4, 7.4, -4.4, 5.0, 3.3, 6.6, -1.3,
      5.6, 4.2, -2.6, 6.4, -1.1, 4.4, 3.6, -3.3, 7.1, 0.9, 5.3, 4.4,
      3.2, 2.1, -0.6, 4.0, -1.2, 3.2, 2.5, -0.5, 3.5, 1.8, -0.2, 2.1,
      2.5, 0.1, 2.9,
    ],
    2022: [
      9.4, 7.5, -4.3, 14.1, 17.3, -2.5, 20.1, 11.4, 8.8, 15.5, 11.2, 14.1,
      6.5, -3.2, 9.8, -2.5, 5.6, -0.4, 7.4, -4.4, 5.0, 3.3, 6.6, -1.3,
      5.6, 4.2, -2.6, 6.4, -1.1, 4.4, 3.6, -3.3, 7.1, 0.9, 5.3, 4.4,
      3.2, 2.1, -0.6, 4.0, -1.2, 3.2, 2.5, -0.5, 3.5, 1.8, -0.2, 2.1,
      2.5, 0.1, 2.9,
    ],
    2023: [
      6.5, -3.2, 9.8, -2.5, 5.6, -0.4, 7.4, -4.4, 5.0, 3.3, 6.6, -1.3,
      5.6, 4.2, -2.6, 6.4, -1.1, 4.4, 3.6, -3.3, 7.1, 0.9, 5.3, 4.4,
      3.2, 2.1, -0.6, 4.0, -1.2, 3.2, 2.5, -0.5, 3.5, 1.8, -0.2, 2.1,
      2.5, 0.1, 2.9,
    ],
    2024: [
      5.6, 4.2, -2.6, 6.4, -1.1, 4.4, 3.6, -3.3, 7.1, 0.9, 5.3, 4.4,
      3.2, 2.1, -0.6, 4.0, -1.2, 3.2, 2.5, -0.5, 3.5, 1.8, -0.2, 2.1,
      2.5, 0.1, 2.9,
    ],
  },
};

function getBacktestResult(
  strategyKey: string,
  startYear: number,
  initialAmount: number,
): BacktestResult {
  const strategyDef = STRATEGIES.find((s) => s.key === strategyKey)!;
  const baseMonthly = BASE_MONTHLY[strategyKey]?.[startYear] ?? BASE_MONTHLY.bist100[startYear]!;
  const monthly = buildCumulative(baseMonthly, initialAmount, startYear);
  const stats = computeStats(monthly, initialAmount);

  return {
    strategy: strategyDef.label,
    strategyKey,
    startYear,
    initialAmount,
    monthlyReturns: monthly,
    ...stats,
  };
}

// ---------------------------------------------------------------------------
// Custom Tooltip
// ---------------------------------------------------------------------------

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 !rounded-lg text-sm">
      <p className="text-text-muted mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }} className="font-mono">
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

export default function BacktestPage() {
  const [selectedStrategy, setSelectedStrategy] = useState("buffett");
  const [startYear, setStartYear] = useState<number>(2021);
  const [initialAmount, setInitialAmount] = useState(100000);
  const [rebalance, setRebalance] = useState("quarterly");

  // Compute selected result
  const result = useMemo(
    () => getBacktestResult(selectedStrategy, startYear, initialAmount),
    [selectedStrategy, startYear, initialAmount],
  );

  // Benchmark for comparison
  const benchmark = useMemo(
    () => getBacktestResult("bist100", startYear, initialAmount),
    [startYear, initialAmount],
  );

  // All strategies for comparison table
  const allResults = useMemo(
    () => STRATEGIES.map((s) => getBacktestResult(s.key, startYear, initialAmount)),
    [startYear, initialAmount],
  );

  // Equity curve data: merge strategy + benchmark
  const equityCurveData = useMemo(() => {
    return result.monthlyReturns.map((m, i) => ({
      month: m.month,
      strategy: m.cumulative,
      benchmark: benchmark.monthlyReturns[i]?.cumulative ?? 0,
    }));
  }, [result, benchmark]);

  // Monthly returns heatmap data
  const heatmapData = useMemo(() => {
    const years: Record<number, number[]> = {};
    let year = startYear;
    let monthIdx = 0;
    for (const m of result.monthlyReturns) {
      if (!years[year]) years[year] = [];
      years[year].push(m.value);
      monthIdx++;
      if (monthIdx % 12 === 0) {
        year++;
        monthIdx = 0;
      }
    }
    return years;
  }, [result, startYear]);

  const strategyColor = STRATEGIES.find((s) => s.key === selectedStrategy)?.color ?? "#3B82F6";

  return (
    <div className="min-h-screen hero-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ── Header ── */}
        <header className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text">
            Strateji Backtest
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto text-sm sm:text-base">
            Gecmise donuk strateji simulasyonu — eger X yilinda Y stratejisi ile
            yatirim yapsaydiniz?
          </p>
        </header>

        {/* ── Strategy Selector ── */}
        <section className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Strateji Sec</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {STRATEGIES.map((s) => (
              <button
                key={s.key}
                onClick={() => setSelectedStrategy(s.key)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all text-sm ${
                  selectedStrategy === s.key
                    ? "border-accent bg-accent/10 text-text-primary shadow-lg shadow-accent/10"
                    : "border-border bg-surface/50 text-text-secondary hover:border-accent/40 hover:bg-surface-hover"
                }`}
              >
                <span className="text-xl">{s.icon}</span>
                <span className="font-medium text-center leading-tight">{s.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── Parameters ── */}
        <section className="glass-card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Parametreler</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Start Year */}
            <div className="space-y-2">
              <label className="text-text-secondary text-sm">Baslangic Yili</label>
              <div className="flex gap-2 flex-wrap">
                {START_YEARS.map((y) => (
                  <button
                    key={y}
                    onClick={() => setStartYear(y)}
                    className={`px-4 py-2 rounded-lg font-mono text-sm transition-all ${
                      startYear === y
                        ? "bg-accent text-white"
                        : "bg-surface border border-border text-text-secondary hover:border-accent/40"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>

            {/* Initial Amount */}
            <div className="space-y-2">
              <label className="text-text-secondary text-sm">Baslangic Tutari</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-mono text-sm">
                  ₺
                </span>
                <input
                  type="number"
                  min={1000}
                  step={10000}
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(Math.max(1000, Number(e.target.value)))}
                  className="w-full pl-8 pr-4 py-2 rounded-lg bg-surface border border-border text-text-primary font-mono text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            {/* Rebalance */}
            <div className="space-y-2">
              <label className="text-text-secondary text-sm">Yeniden Dengeleme</label>
              <div className="flex gap-2 flex-wrap">
                {REBALANCE_OPTIONS.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => setRebalance(r.key)}
                    className={`px-4 py-2 rounded-lg text-sm transition-all ${
                      rebalance === r.key
                        ? "bg-accent text-white"
                        : "bg-surface border border-border text-text-secondary hover:border-accent/40"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Summary Cards ── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            label="Son Deger"
            value={formatCurrency(result.finalAmount)}
            isPositive={result.finalAmount > initialAmount}
          />
          <SummaryCard
            label="Toplam Getiri"
            value={formatPercent(result.totalReturn)}
            isPositive={result.totalReturn > 0}
          />
          <SummaryCard
            label="Yillik Getiri (CAGR)"
            value={formatPercent(result.annualizedReturn)}
            isPositive={result.annualizedReturn > 0}
          />
          <SummaryCard
            label="Maks Dusus"
            value={formatPercent(-result.maxDrawdown)}
            isPositive={false}
          />
        </section>

        {/* ── Equity Curve Chart ── */}
        <section className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Portfoy Degeri</h2>
          <div className="h-[350px] sm:h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityCurveData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="strategyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={strategyColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={strategyColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) =>
                    v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : `${(v / 1e3).toFixed(0)}K`
                  }
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  verticalAlign="top"
                  height={36}
                  formatter={(value: string) =>
                    value === "strategy"
                      ? STRATEGIES.find((s) => s.key === selectedStrategy)?.label
                      : "BIST-100 Endeks"
                  }
                />
                <Area
                  type="monotone"
                  dataKey="strategy"
                  stroke={strategyColor}
                  strokeWidth={2}
                  fill="url(#strategyGrad)"
                  name="strategy"
                />
                <Area
                  type="monotone"
                  dataKey="benchmark"
                  stroke="#6B7280"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fill="none"
                  name="benchmark"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ── Monthly Returns Heatmap ── */}
        <section className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Aylik Getiri Haritasi</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left text-text-muted py-2 pr-4 font-normal">Yil</th>
                  {MONTH_LABELS.map((m) => (
                    <th key={m} className="text-center text-text-muted py-2 px-1 font-normal min-w-[48px]">
                      {m}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(heatmapData).map(([year, months]) => (
                  <tr key={year}>
                    <td className="text-text-secondary font-mono py-1 pr-4">{year}</td>
                    {months.map((val, i) => (
                      <td key={i} className="text-center py-1 px-1">
                        <span
                          className={`inline-block w-full rounded px-1 py-0.5 font-mono text-xs ${
                            val > 5
                              ? "bg-up/30 text-up"
                              : val > 0
                              ? "bg-up/15 text-up"
                              : val > -5
                              ? "bg-down/15 text-down"
                              : "bg-down/30 text-down"
                          }`}
                        >
                          {val > 0 ? "+" : ""}
                          {val.toFixed(1)}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Strategy Comparison Table ── */}
        <section className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">
            Strateji Karsilastirmasi ({startYear} baslangic)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-text-muted py-3 pr-4 font-normal">Strateji</th>
                  <th className="text-right text-text-muted py-3 px-3 font-normal">Toplam Getiri</th>
                  <th className="text-right text-text-muted py-3 px-3 font-normal">CAGR</th>
                  <th className="text-right text-text-muted py-3 px-3 font-normal">Sharpe</th>
                  <th className="text-right text-text-muted py-3 px-3 font-normal">Maks Dusus</th>
                  <th className="text-right text-text-muted py-3 px-3 font-normal">Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {allResults
                  .sort((a, b) => b.totalReturn - a.totalReturn)
                  .map((r) => {
                    const bestReturn = Math.max(...allResults.map((x) => x.totalReturn));
                    const bestSharpe = Math.max(...allResults.map((x) => x.sharpeRatio));
                    const bestWin = Math.max(...allResults.map((x) => x.winRate));
                    const isSelected = r.strategyKey === selectedStrategy;

                    return (
                      <tr
                        key={r.strategyKey}
                        className={`border-b border-border/50 transition-colors ${
                          isSelected ? "bg-accent/5" : "hover:bg-surface-hover/30"
                        }`}
                      >
                        <td className="py-3 pr-4">
                          <button
                            onClick={() => setSelectedStrategy(r.strategyKey)}
                            className="flex items-center gap-2 hover:text-accent transition-colors"
                          >
                            <span>{STRATEGIES.find((s) => s.key === r.strategyKey)?.icon}</span>
                            <span className={isSelected ? "text-accent font-semibold" : "text-text-primary"}>
                              {r.strategy}
                            </span>
                          </button>
                        </td>
                        <td
                          className={`text-right py-3 px-3 font-mono ${
                            r.totalReturn === bestReturn ? "text-up font-semibold" : "text-text-primary"
                          }`}
                        >
                          {formatPercent(r.totalReturn)}
                        </td>
                        <td className="text-right py-3 px-3 font-mono text-text-primary">
                          {formatPercent(r.annualizedReturn)}
                        </td>
                        <td
                          className={`text-right py-3 px-3 font-mono ${
                            r.sharpeRatio === bestSharpe ? "text-up font-semibold" : "text-text-primary"
                          }`}
                        >
                          {formatNumber(r.sharpeRatio, 2)}
                        </td>
                        <td className="text-right py-3 px-3 font-mono text-down">
                          {formatPercent(-r.maxDrawdown)}
                        </td>
                        <td
                          className={`text-right py-3 px-3 font-mono ${
                            r.winRate === bestWin ? "text-up font-semibold" : "text-text-primary"
                          }`}
                        >
                          %{formatNumber(r.winRate, 1)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Statistics Box ── */}
        <section className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Detayli Istatistikler</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatBox label="Sharpe Orani" value={formatNumber(result.sharpeRatio, 2)} />
            <StatBox label="Volatilite" value={`%${formatNumber(result.volatility, 1)}`} />
            <StatBox label="Win Rate" value={`%${formatNumber(result.winRate, 1)}`} />
            <StatBox
              label="En Iyi Ay"
              value={formatPercent(result.bestMonth)}
              valueClass="text-up"
            />
            <StatBox
              label="En Kotu Ay"
              value={formatPercent(result.worstMonth)}
              valueClass="text-down"
            />
            <StatBox
              label="Riske Gore Getiri"
              value={
                result.sharpeRatio > 0.5
                  ? "Iyi"
                  : result.sharpeRatio > 0
                  ? "Orta"
                  : "Zayif"
              }
              valueClass={
                result.sharpeRatio > 0.5
                  ? "text-up"
                  : result.sharpeRatio > 0
                  ? "text-yellow-400"
                  : "text-down"
              }
            />
          </div>

          {/* Risk-adjusted comparison */}
          <div className="mt-4 p-4 rounded-xl bg-surface/50 border border-border/50">
            <p className="text-text-secondary text-sm leading-relaxed">
              <span className="text-accent font-semibold">
                {STRATEGIES.find((s) => s.key === selectedStrategy)?.label}
              </span>{" "}
              stratejisi {startYear} yilindan bu yana{" "}
              <span className="text-up font-mono font-semibold">
                {formatPercent(result.totalReturn)}
              </span>{" "}
              toplam getiri saglarken, BIST-100 endeksi{" "}
              <span className="font-mono font-semibold text-text-primary">
                {formatPercent(benchmark.totalReturn)}
              </span>{" "}
              getiri sagladi.{" "}
              {result.totalReturn > benchmark.totalReturn
                ? `Strateji endeksi ${formatNumber(result.totalReturn - benchmark.totalReturn, 1)} puan gecti.`
                : `Endeks stratejiyi ${formatNumber(benchmark.totalReturn - result.totalReturn, 1)} puan gecti.`}
              {" "}Sharpe orani{" "}
              <span className="font-mono">{formatNumber(result.sharpeRatio, 2)}</span> ile{" "}
              {result.sharpeRatio > benchmark.sharpeRatio
                ? "endeksten daha iyi risk-getiri dengesi sunuyor."
                : "endeksin gerisinde kaliyor."}
            </p>
          </div>
        </section>

        {/* ── Disclaimer ── */}
        <div className="text-center py-6 border-t border-border/30">
          <p className="text-text-muted text-xs leading-relaxed max-w-xl mx-auto">
            Gecmis performans gelecek getirilerin gostergesi degildir. Bu sayfa bilgilendirme
            amaciyla hazirlanmis olup yatirim tavsiyesi niteliginde degildir. Yatirim kararlari
            tamamen kendi sorumlulugundadir.
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SummaryCard({
  label,
  value,
  isPositive,
}: {
  label: string;
  value: string;
  isPositive: boolean;
}) {
  return (
    <div className="glass-card p-5 space-y-2">
      <p className="text-text-muted text-sm">{label}</p>
      <p
        className={`text-xl sm:text-2xl font-bold font-mono ${
          isPositive ? "text-up" : "text-down"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function StatBox({
  label,
  value,
  valueClass = "text-text-primary",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="bg-surface/50 rounded-xl border border-border/50 p-4 text-center space-y-1">
      <p className="text-text-muted text-xs">{label}</p>
      <p className={`font-mono font-semibold text-lg ${valueClass}`}>{value}</p>
    </div>
  );
}

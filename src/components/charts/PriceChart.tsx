"use client";

import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  ReferenceLine,
  Cell,
} from "recharts";

interface PriceChartProps {
  data: { date: string; close: number; volume: number }[];
}

const PERIODS = [
  { label: "1H", days: 7 },
  { label: "1A", days: 30 },
  { label: "3A", days: 90 },
  { label: "Tümü", days: 0 },
];

// ── Technical Indicator Calculations ──

function calcSMA(data: number[], period: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < period - 1) return null;
    const slice = data.slice(i - period + 1, i + 1);
    return slice.reduce((a, b) => a + b, 0) / period;
  });
}

function calcEMA(data: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const ema: number[] = [data[0]];
  for (let i = 1; i < data.length; i++) {
    ema.push(data[i] * k + ema[i - 1] * (1 - k));
  }
  return ema;
}

function calcRSI(closes: number[], period = 14): (number | null)[] {
  const rsi: (number | null)[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < period) { rsi.push(null); continue; }
    let gains = 0, losses = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const diff = closes[j] - closes[j - 1];
      if (diff > 0) gains += diff;
      else losses -= diff;
    }
    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi.push(100 - 100 / (1 + rs));
  }
  return rsi;
}

function calcMACD(closes: number[]) {
  const ema12 = calcEMA(closes, 12);
  const ema26 = calcEMA(closes, 26);
  const macdLine = ema12.map((v, i) => v - ema26[i]);
  const signal = calcEMA(macdLine, 9);
  const histogram = macdLine.map((v, i) => v - signal[i]);
  return { macdLine, signal, histogram };
}

function calcBollinger(closes: number[], period = 20, mult = 2) {
  const sma = calcSMA(closes, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (sma[i] === null) { upper.push(null); lower.push(null); continue; }
    const slice = closes.slice(i - period + 1, i + 1);
    const std = Math.sqrt(slice.reduce((a, v) => a + (v - sma[i]!) ** 2, 0) / period);
    upper.push(sma[i]! + mult * std);
    lower.push(sma[i]! - mult * std);
  }
  return { sma, upper, lower };
}

// ── Indicator toggle type ──
type Indicator = "bollinger" | "rsi" | "macd" | "sma50" | "sma200";

const INDICATORS: { key: Indicator; label: string; color: string }[] = [
  { key: "bollinger", label: "Bollinger", color: "#8B5CF6" },
  { key: "sma50", label: "SMA 50", color: "#F59E0B" },
  { key: "sma200", label: "SMA 200", color: "#EC4899" },
  { key: "rsi", label: "RSI", color: "#06B6D4" },
  { key: "macd", label: "MACD", color: "#3B82F6" },
];

export default function PriceChart({ data }: PriceChartProps) {
  const [periodIdx, setPeriodIdx] = useState(2);
  const [activeIndicators, setActiveIndicators] = useState<Set<Indicator>>(new Set());

  const period = PERIODS[periodIdx];
  const chartData = period.days === 0 ? data : data.slice(-period.days);

  const closes = chartData.map((d) => d.close);

  // Compute technical data
  const techData = useMemo(() => {
    const rsi = calcRSI(closes);
    const macd = calcMACD(closes);
    const bollinger = calcBollinger(closes);
    const sma50 = calcSMA(closes, Math.min(50, closes.length));
    const sma200 = calcSMA(closes, Math.min(200, closes.length));

    return chartData.map((d, i) => ({
      ...d,
      rsi: rsi[i],
      macdLine: macd.macdLine[i],
      macdSignal: macd.signal[i],
      macdHist: macd.histogram[i],
      bbUpper: bollinger.upper[i],
      bbMiddle: bollinger.sma[i],
      bbLower: bollinger.lower[i],
      sma50: sma50[i],
      sma200: sma200[i],
    }));
  }, [chartData, closes]);

  const minPrice = Math.min(
    ...techData.map((d) => Math.min(d.close, d.bbLower ?? Infinity))
  ) * 0.98;
  const maxPrice = Math.max(
    ...techData.map((d) => Math.max(d.close, d.bbUpper ?? -Infinity))
  ) * 1.02;

  const firstPrice = chartData[0]?.close ?? 0;
  const lastPrice = chartData[chartData.length - 1]?.close ?? 0;
  const isPositive = lastPrice >= firstPrice;
  const color = isPositive ? "#10B981" : "#EF4444";

  const hasRSI = activeIndicators.has("rsi");
  const hasMACD = activeIndicators.has("macd");
  const hasBollinger = activeIndicators.has("bollinger");
  const hasSMA50 = activeIndicators.has("sma50");
  const hasSMA200 = activeIndicators.has("sma200");

  function toggleIndicator(ind: Indicator) {
    setActiveIndicators((prev) => {
      const next = new Set(prev);
      if (next.has(ind)) next.delete(ind);
      else next.add(ind);
      return next;
    });
  }

  // Latest RSI value
  const latestRSI = techData[techData.length - 1]?.rsi;
  const rsiColor = latestRSI !== null && latestRSI !== undefined
    ? latestRSI > 70 ? "#EF4444" : latestRSI < 30 ? "#10B981" : "#06B6D4"
    : "#06B6D4";

  const dateFormatter = (v: string) => {
    const d = new Date(v);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  const tooltipStyle = {
    background: "#1E293B",
    border: "1px solid #334155",
    borderRadius: 10,
    fontSize: 11,
    color: "#F8FAFC",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  };

  return (
    <div>
      {/* Controls row */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* Period selector */}
        <div className="flex items-center gap-1">
          {PERIODS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => setPeriodIdx(i)}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                periodIdx === i
                  ? "bg-accent text-white"
                  : "text-text-muted hover:bg-surface-hover hover:text-text-primary"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-border/50" />

        {/* Indicator toggles */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[10px] text-text-muted mr-1">Göstergeler:</span>
          {INDICATORS.map((ind) => (
            <button
              key={ind.key}
              onClick={() => toggleIndicator(ind.key)}
              className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold transition-all cursor-pointer border ${
                activeIndicators.has(ind.key)
                  ? "border-current shadow-sm"
                  : "border-transparent text-text-muted hover:text-text-secondary"
              }`}
              style={activeIndicators.has(ind.key) ? { color: ind.color, backgroundColor: `${ind.color}15` } : {}}
            >
              {ind.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price area chart with overlays */}
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={techData}>
          <defs>
            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
            {hasBollinger && (
              <linearGradient id="bbGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.08} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.02} />
              </linearGradient>
            )}
          </defs>
          <CartesianGrid stroke="#334155" strokeDasharray="3 3" strokeOpacity={0.3} />
          <XAxis
            dataKey="date"
            tick={{ fill: "#64748B", fontSize: 10 }}
            tickFormatter={dateFormatter}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[minPrice, maxPrice]}
            tick={{ fill: "#64748B", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={55}
            tickFormatter={(v: number) => `₺${v.toFixed(0)}`}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelFormatter={(v) => new Date(String(v)).toLocaleDateString("tr-TR", { weekday: "short", day: "numeric", month: "short" })}
            formatter={(value, name) => {
              const n = Number(value);
              const labels: Record<string, string> = {
                close: "Kapanış",
                bbUpper: "BB Üst",
                bbMiddle: "BB Orta",
                bbLower: "BB Alt",
                sma50: "SMA 50",
                sma200: "SMA 200",
              };
              return [`₺${n.toFixed(2)}`, labels[String(name)] ?? String(name)];
            }}
          />

          {/* Bollinger Bands */}
          {hasBollinger && (
            <>
              <Area type="monotone" dataKey="bbUpper" stroke="#8B5CF6" strokeWidth={1} strokeDasharray="4 2" fill="none" dot={false} />
              <Area type="monotone" dataKey="bbMiddle" stroke="#8B5CF680" strokeWidth={1} fill="none" dot={false} />
              <Area type="monotone" dataKey="bbLower" stroke="#8B5CF6" strokeWidth={1} strokeDasharray="4 2" fill="url(#bbGrad)" dot={false} />
            </>
          )}

          {/* SMA lines */}
          {hasSMA50 && <Area type="monotone" dataKey="sma50" stroke="#F59E0B" strokeWidth={1.5} fill="none" dot={false} />}
          {hasSMA200 && <Area type="monotone" dataKey="sma200" stroke="#EC4899" strokeWidth={1.5} fill="none" dot={false} />}

          {/* Main price */}
          <Area
            type="monotone"
            dataKey="close"
            stroke={color}
            strokeWidth={2}
            fill="url(#priceGrad)"
            dot={false}
            activeDot={{ r: 5, fill: color, stroke: "#1E293B", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Volume bars */}
      <ResponsiveContainer width="100%" height={50}>
        <BarChart data={techData}>
          <XAxis dataKey="date" hide />
          <YAxis hide />
          <Tooltip
            contentStyle={{ ...tooltipStyle, borderRadius: 8 }}
            labelFormatter={(v) => new Date(String(v)).toLocaleDateString("tr-TR")}
            formatter={(value) => [`${(Number(value) / 1e6).toFixed(1)}M`, "Hacim"]}
          />
          <Bar dataKey="volume" fill="#334155" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* RSI Panel */}
      {hasRSI && (
        <div className="mt-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-semibold text-[#06B6D4]">RSI (14)</span>
            {latestRSI != null && (
              <span className="font-mono text-[10px] font-bold" style={{ color: rsiColor }}>
                {latestRSI.toFixed(1)}
                {latestRSI > 70 ? " — Aşırı Alım" : latestRSI < 30 ? " — Aşırı Satım" : ""}
              </span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={techData}>
              <CartesianGrid stroke="#334155" strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="date" hide />
              <YAxis domain={[0, 100]} tick={{ fill: "#64748B", fontSize: 9 }} tickLine={false} axisLine={false} width={30} />
              <ReferenceLine y={70} stroke="#EF4444" strokeDasharray="3 3" strokeOpacity={0.5} />
              <ReferenceLine y={30} stroke="#10B981" strokeDasharray="3 3" strokeOpacity={0.5} />
              <ReferenceLine y={50} stroke="#64748B" strokeDasharray="2 4" strokeOpacity={0.3} />
              <Tooltip
                contentStyle={{ ...tooltipStyle, borderRadius: 8 }}
                labelFormatter={(v) => new Date(String(v)).toLocaleDateString("tr-TR")}
                formatter={(value) => [Number(value).toFixed(1), "RSI"]}
              />
              <Line type="monotone" dataKey="rsi" stroke="#06B6D4" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* MACD Panel */}
      {hasMACD && (
        <div className="mt-2">
          <span className="text-[10px] font-semibold text-[#3B82F6] mb-1 block">MACD (12, 26, 9)</span>
          <ResponsiveContainer width="100%" height={90}>
            <BarChart data={techData}>
              <CartesianGrid stroke="#334155" strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="date" hide />
              <YAxis tick={{ fill: "#64748B", fontSize: 9 }} tickLine={false} axisLine={false} width={30} />
              <ReferenceLine y={0} stroke="#64748B" strokeOpacity={0.3} />
              <Tooltip
                contentStyle={{ ...tooltipStyle, borderRadius: 8 }}
                labelFormatter={(v) => new Date(String(v)).toLocaleDateString("tr-TR")}
                formatter={(value, name) => {
                  const labels: Record<string, string> = { macdHist: "Histogram", macdLine: "MACD", macdSignal: "Sinyal" };
                  return [Number(value).toFixed(2), labels[String(name)] ?? String(name)];
                }}
              />
              <Bar dataKey="macdHist" radius={[1, 1, 0, 0]}>
                {techData.map((d, i) => (
                  <Cell key={i} fill={d.macdHist >= 0 ? "#10B98180" : "#EF444480"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <ResponsiveContainer width="100%" height={50}>
            <LineChart data={techData}>
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Line type="monotone" dataKey="macdLine" stroke="#3B82F6" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="macdSignal" stroke="#EF4444" strokeWidth={1} strokeDasharray="3 3" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

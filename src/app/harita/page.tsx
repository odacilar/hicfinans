"use client";

import { useState, useMemo, useRef } from "react";
import { MOCK_STOCKS } from "@/lib/mock-data";
import { formatNumber, formatPercent, formatMarketCap, formatVolume } from "@/lib/formatters";
import type { StockListItem } from "@/types/stock";

// ── Color scale ──

function getHeatColor(change: number): string {
  if (change >= 3) return "#15803d";
  if (change >= 2) return "#16a34a";
  if (change >= 1) return "#22c55e";
  if (change >= 0.5) return "#4ade80";
  if (change >= 0) return "#86efac";
  if (change >= -0.5) return "#fca5a5";
  if (change >= -1) return "#f87171";
  if (change >= -2) return "#ef4444";
  if (change >= -3) return "#dc2626";
  return "#991b1b";
}

function getScoreColor(score: number): string {
  if (score >= 4) return "#15803d";
  if (score >= 3.5) return "#16a34a";
  if (score >= 3) return "#22c55e";
  if (score >= 2.5) return "#4ade80";
  if (score >= 2) return "#fca5a5";
  if (score >= 1.5) return "#f87171";
  return "#ef4444";
}

function getTextColor(bgHex: string): string {
  const r = parseInt(bgHex.slice(1, 3), 16);
  const g = parseInt(bgHex.slice(3, 5), 16);
  const b = parseInt(bgHex.slice(5, 7), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.5 ? "#0f172a" : "#f8fafc";
}

// ── Types ──

type SizeBy = "marketCap" | "volume";
type ColorBy = "daily" | "weekly" | "score";
type GroupBy = "sector" | "all";

interface SectorGroup {
  sector: string;
  stocks: StockListItem[];
  totalSize: number;
  avgChange: number;
}

// Generate mock weekly change from daily using a deterministic seed
function getWeeklyChange(stock: StockListItem): number {
  const seed = stock.ticker.charCodeAt(0) + stock.ticker.charCodeAt(1) * 7;
  const pseudo = ((seed * 9301 + 49297) % 233280) / 233280;
  return stock.changePercent * (1.5 + pseudo * 3) - 1;
}

// ── UI Labels (Turkish) ──

const LABELS = {
  pageTitle: "Piyasa Haritas\u0131",
  pageDesc: "BIST piyasas\u0131n\u0131n g\u00F6r\u00FCn\u00FCm\u00FC \u2014 hisse b\u00FCy\u00FCkl\u00FCkleri ve performanslar\u0131 tek bak\u0131\u015Fta",
  rising: "Y\u00FCkselen",
  falling: "D\u00FC\u015Fen",
  topGainer: "En \u00C7ok Y\u00FCkselen",
  topLoser: "En \u00C7ok D\u00FC\u015Fen",
  shares: "hisse",
  sectorWeights: "Sekt\u00F6r A\u011F\u0131rl\u0131klar\u0131",
  sizeLabel: "B\u00FCy\u00FCkl\u00FCk:",
  marketCap: "Piyasa De\u011Feri",
  volume: "Hacim",
  colorLabel: "Renk:",
  dailyChange: "G\u00FCnl\u00FCk De\u011Fi\u015Fim",
  weekly: "Haftal\u0131k",
  snowflakeScore: "Snowflake Skor",
  groupLabel: "Gruplama:",
  sector: "Sekt\u00F6r",
  all: "T\u00FCm\u00FC",
  low: "D\u00FC\u015F\u00FCk",
  high: "Y\u00FCksek",
  price: "Fiyat",
  mktCap: "Piy. De\u011F.",
  score: "Skor",
  disclaimer: "Veriler bilgilendirme ama\u00E7l\u0131d\u0131r, yat\u0131r\u0131m tavsiyesi niteli\u011Finde de\u011Fildir. Fiyatlar 15 dakika gecikmeli olabilir.",
};

// ── Component ──

export default function HaritaPage() {
  const [sizeBy, setSizeBy] = useState<SizeBy>("marketCap");
  const [colorBy, setColorBy] = useState<ColorBy>("daily");
  const [groupBy, setGroupBy] = useState<GroupBy>("sector");
  const [tooltip, setTooltip] = useState<{
    stock: StockListItem;
    x: number;
    y: number;
  } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // ── Computed data ──

  const sectorGroups = useMemo<SectorGroup[]>(() => {
    const map = new Map<string, StockListItem[]>();
    for (const s of MOCK_STOCKS) {
      const key = groupBy === "sector" ? s.sector : LABELS.all;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }

    const groups: SectorGroup[] = [];
    for (const [sector, stocks] of map) {
      const totalSize = stocks.reduce(
        (sum, s) => sum + (sizeBy === "marketCap" ? s.marketCap : s.volume),
        0
      );
      const avgChange =
        stocks.reduce((sum, s) => sum + s.changePercent, 0) / stocks.length;
      // Sort stocks within sector by size descending
      stocks.sort((a, b) => {
        const aVal = sizeBy === "marketCap" ? a.marketCap : a.volume;
        const bVal = sizeBy === "marketCap" ? b.marketCap : b.volume;
        return bVal - aVal;
      });
      groups.push({ sector, stocks, totalSize, avgChange });
    }

    // Sort sectors by total size descending
    groups.sort((a, b) => b.totalSize - a.totalSize);
    return groups;
  }, [sizeBy, groupBy]);

  const totalMarketSize = useMemo(
    () => sectorGroups.reduce((sum, g) => sum + g.totalSize, 0),
    [sectorGroups]
  );

  // ── Stats ──

  const stats = useMemo(() => {
    const rising = MOCK_STOCKS.filter((s) => s.changePercent > 0);
    const falling = MOCK_STOCKS.filter((s) => s.changePercent < 0);
    const sorted = [...MOCK_STOCKS].sort(
      (a, b) => b.changePercent - a.changePercent
    );
    return {
      risingCount: rising.length,
      fallingCount: falling.length,
      flatCount: MOCK_STOCKS.length - rising.length - falling.length,
      topGainer: sorted[0],
      topLoser: sorted[sorted.length - 1],
    };
  }, []);

  // ── Color getter based on mode ──

  function getColor(stock: StockListItem): string {
    if (colorBy === "daily") return getHeatColor(stock.changePercent);
    if (colorBy === "weekly") return getHeatColor(getWeeklyChange(stock));
    return getScoreColor(stock.overallScore);
  }

  function getColorValue(stock: StockListItem): string {
    if (colorBy === "daily") return formatPercent(stock.changePercent);
    if (colorBy === "weekly") return formatPercent(getWeeklyChange(stock));
    return stock.overallScore.toFixed(1);
  }

  // ── Tooltip handlers ──

  function handleMouseEnter(e: React.MouseEvent, stock: StockListItem) {
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({ stock, x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  function handleMouseMove(e: React.MouseEvent, stock: StockListItem) {
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({ stock, x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  function handleMouseLeave() {
    setTooltip(null);
  }

  // ── Determine box text size based on flex proportion ──

  function getBoxClasses(stock: StockListItem, sectorTotal: number): string {
    const val = sizeBy === "marketCap" ? stock.marketCap : stock.volume;
    const ratio = val / sectorTotal;
    if (ratio > 0.15) return "text-sm";
    if (ratio > 0.05) return "text-xs";
    return "text-[10px]";
  }

  function getTickerSize(stock: StockListItem, sectorTotal: number): string {
    const val = sizeBy === "marketCap" ? stock.marketCap : stock.volume;
    const ratio = val / sectorTotal;
    if (ratio > 0.15) return "text-base font-bold";
    if (ratio > 0.05) return "text-xs font-bold";
    return "text-[9px] font-semibold";
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          <span className="gradient-text">{LABELS.pageTitle}</span>
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {LABELS.pageDesc}
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface p-3">
          <div className="text-[10px] font-medium text-text-muted">{LABELS.rising}</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-xl font-bold text-up">
              {stats.risingCount}
            </span>
            <span className="text-xs text-text-muted">{LABELS.shares}</span>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-3">
          <div className="text-[10px] font-medium text-text-muted">{LABELS.falling}</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-xl font-bold text-down">
              {stats.fallingCount}
            </span>
            <span className="text-xs text-text-muted">{LABELS.shares}</span>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-3">
          <div className="text-[10px] font-medium text-text-muted">{LABELS.topGainer}</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-sm font-bold text-up">
              {stats.topGainer.ticker}
            </span>
            <span className="font-mono text-xs text-up">
              {formatPercent(stats.topGainer.changePercent)}
            </span>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-3">
          <div className="text-[10px] font-medium text-text-muted">{LABELS.topLoser}</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-sm font-bold text-down">
              {stats.topLoser.ticker}
            </span>
            <span className="font-mono text-xs text-down">
              {formatPercent(stats.topLoser.changePercent)}
            </span>
          </div>
        </div>
      </div>

      {/* Sector Summary Bar */}
      <div className="rounded-xl border border-border bg-surface p-3">
        <div className="mb-2 text-[10px] font-medium text-text-muted">
          {LABELS.sectorWeights}
        </div>
        <div className="flex h-7 overflow-hidden rounded-lg">
          {sectorGroups.map((group) => {
            const widthPct = (group.totalSize / totalMarketSize) * 100;
            if (widthPct < 1.5) return null;
            const bg = getHeatColor(group.avgChange);
            return (
              <div
                key={group.sector}
                className="flex items-center justify-center overflow-hidden border-r border-primary/30 last:border-r-0"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: bg,
                  minWidth: widthPct > 4 ? undefined : "0",
                }}
                title={`${group.sector}: ${formatPercent(group.avgChange)}`}
              >
                {widthPct > 5 && (
                  <span
                    className="truncate px-1 text-[9px] font-semibold"
                    style={{ color: getTextColor(bg) }}
                  >
                    {group.sector}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* View Controls */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Size By */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-text-muted">
            {LABELS.sizeLabel}
          </span>
          <div className="flex rounded-lg bg-surface/50 p-0.5">
            {(
              [
                ["marketCap", LABELS.marketCap],
                ["volume", LABELS.volume],
              ] as [SizeBy, string][]
            ).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setSizeBy(val)}
                className={`rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-all ${
                  sizeBy === val
                    ? "bg-accent/15 text-accent"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Color By */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-text-muted">
            {LABELS.colorLabel}
          </span>
          <div className="flex rounded-lg bg-surface/50 p-0.5">
            {(
              [
                ["daily", LABELS.dailyChange],
                ["weekly", LABELS.weekly],
                ["score", LABELS.snowflakeScore],
              ] as [ColorBy, string][]
            ).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setColorBy(val)}
                className={`rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-all ${
                  colorBy === val
                    ? "bg-accent/15 text-accent"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Group By */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-text-muted">
            {LABELS.groupLabel}
          </span>
          <div className="flex rounded-lg bg-surface/50 p-0.5">
            {(
              [
                ["sector", LABELS.sector],
                ["all", LABELS.all],
              ] as [GroupBy, string][]
            ).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setGroupBy(val)}
                className={`rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-all ${
                  groupBy === val
                    ? "bg-accent/15 text-accent"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Color Legend */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-text-muted">
          {colorBy === "score" ? LABELS.low : "-3%"}
        </span>
        <div className="flex h-3 flex-1 overflow-hidden rounded-full">
          {colorBy === "score"
            ? [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5].map((v) => (
                <div
                  key={v}
                  className="flex-1"
                  style={{ backgroundColor: getScoreColor(v) }}
                />
              ))
            : [-3, -2, -1, -0.5, 0, 0.5, 1, 2, 3].map((v) => (
                <div
                  key={v}
                  className="flex-1"
                  style={{ backgroundColor: getHeatColor(v) }}
                />
              ))}
        </div>
        <span className="text-[10px] text-text-muted">
          {colorBy === "score" ? LABELS.high : "+3%"}
        </span>
      </div>

      {/* Treemap */}
      <div
        ref={mapRef}
        className="relative min-h-[500px] overflow-hidden rounded-2xl border border-border bg-primary/50"
      >
        <div className="flex h-full min-h-[500px] flex-wrap">
          {sectorGroups.map((group) => {
            const sectorFlexGrow = Math.max(
              (group.totalSize / totalMarketSize) * 1000,
              1
            );

            return (
              <div
                key={group.sector}
                className="flex flex-col"
                style={{
                  flexGrow: sectorFlexGrow,
                  flexBasis: 0,
                  minWidth: groupBy === "sector" ? "120px" : "0",
                }}
              >
                {/* Sector label */}
                {groupBy === "sector" && (
                  <div className="border-b border-primary/50 bg-surface/30 px-2 py-1">
                    <span className="text-[10px] font-semibold text-text-secondary">
                      {group.sector}
                    </span>
                    <span className="ml-1.5 font-mono text-[9px] text-text-muted">
                      {formatPercent(group.avgChange)}
                    </span>
                  </div>
                )}

                {/* Stocks grid */}
                <div className="flex flex-1 flex-wrap">
                  {group.stocks.map((stock) => {
                    const val =
                      sizeBy === "marketCap" ? stock.marketCap : stock.volume;
                    const flexGrow = Math.max(
                      (val / group.totalSize) * 100,
                      1
                    );
                    const bg = getColor(stock);
                    const textColor = getTextColor(bg);

                    return (
                      <div
                        key={stock.ticker}
                        className="relative flex cursor-pointer flex-col items-center justify-center overflow-hidden transition-all duration-150 hover:brightness-110 hover:z-10"
                        style={{
                          flexGrow,
                          flexBasis: 0,
                          minWidth: "48px",
                          minHeight: "40px",
                          backgroundColor: bg,
                          margin: "1px",
                          borderRadius: "4px",
                        }}
                        onMouseEnter={(e) => handleMouseEnter(e, stock)}
                        onMouseMove={(e) => handleMouseMove(e, stock)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <span
                          className={`font-mono leading-tight ${getTickerSize(stock, group.totalSize)}`}
                          style={{ color: textColor }}
                        >
                          {stock.ticker}
                        </span>
                        <span
                          className={`font-mono leading-tight ${getBoxClasses(stock, group.totalSize)}`}
                          style={{ color: textColor, opacity: 0.85 }}
                        >
                          {getColorValue(stock)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="pointer-events-none absolute z-50 rounded-xl border border-border bg-surface/95 px-3.5 py-2.5 shadow-xl backdrop-blur-md"
            style={{
              left: Math.min(tooltip.x + 12, (mapRef.current?.clientWidth ?? 600) - 220),
              top: Math.min(tooltip.y + 12, (mapRef.current?.clientHeight ?? 400) - 120),
            }}
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-text-primary">
                {tooltip.stock.ticker}
              </span>
              <span
                className={`font-mono text-xs font-semibold ${
                  tooltip.stock.changePercent >= 0 ? "text-up" : "text-down"
                }`}
              >
                {formatPercent(tooltip.stock.changePercent)}
              </span>
            </div>
            <div className="mt-0.5 max-w-[200px] truncate text-[11px] text-text-secondary">
              {tooltip.stock.name}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
              <span className="text-text-muted">{LABELS.price}</span>
              <span className="text-right font-mono text-text-primary">
                {formatNumber(tooltip.stock.price)} TL
              </span>
              <span className="text-text-muted">{LABELS.mktCap}</span>
              <span className="text-right font-mono text-text-primary">
                {formatMarketCap(tooltip.stock.marketCap)}
              </span>
              <span className="text-text-muted">{LABELS.volume}</span>
              <span className="text-right font-mono text-text-primary">
                {formatVolume(tooltip.stock.volume)}
              </span>
              <span className="text-text-muted">{LABELS.score}</span>
              <span className="text-right font-mono text-text-primary">
                {tooltip.stock.overallScore.toFixed(1)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <p className="text-center text-[10px] text-text-muted">
        {LABELS.disclaimer}
      </p>
    </div>
  );
}

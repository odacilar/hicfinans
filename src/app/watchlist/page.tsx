"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { MOCK_STOCKS } from "@/lib/mock-data";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatMarketCap,
  formatVolume,
} from "@/lib/formatters";

// ─── Types ───────────────────────────────────────────────
interface PriceAlert {
  id: string;
  ticker: string;
  type: "above" | "below";
  targetPrice: number;
  currentPrice: number;
  createdAt: string;
}

type SortKey =
  | "ticker"
  | "price"
  | "changePercent"
  | "overallScore"
  | "volume"
  | "marketCap";

type SortDir = "asc" | "desc";

// ─── Helpers ─────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function stockByTicker(ticker: string) {
  return MOCK_STOCKS.find((s) => s.ticker === ticker);
}

/** Generate pseudo-random sparkline bars for the last 7 days */
function generateSparkline(ticker: string, changePercent: number): number[] {
  let seed = 0;
  for (let i = 0; i < ticker.length; i++) seed += ticker.charCodeAt(i);
  const bars: number[] = [];
  for (let i = 0; i < 7; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    const rand = seed / 233280;
    bars.push((rand - 0.5) * 4 + changePercent * 0.3);
  }
  return bars;
}

const DEFAULT_TICKERS = [
  "THYAO",
  "GARAN",
  "ASELS",
  "BIMAS",
  "KCHOL",
  "EREGL",
  "TUPRS",
  "SISE",
];

const MAX_WATCHLIST = 20;

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════
export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<string[]>(DEFAULT_TICKERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("ticker");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Alert modal state
  const [alertModalTicker, setAlertModalTicker] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<"above" | "below">("above");
  const [alertTargetPrice, setAlertTargetPrice] = useState("");

  // ── Derived data ───────────────────────────────────────
  const watchlistStocks = useMemo(() => {
    return watchlist
      .map((ticker) => stockByTicker(ticker))
      .filter(<T,>(v: T): v is NonNullable<T> => v != null);
  }, [watchlist]);

  const sorted = useMemo(() => {
    const arr = [...watchlistStocks];
    arr.sort((a, b) => {
      let va: number | string = 0;
      let vb: number | string = 0;
      switch (sortKey) {
        case "ticker":
          va = a.ticker;
          vb = b.ticker;
          break;
        case "price":
          va = a.price;
          vb = b.price;
          break;
        case "changePercent":
          va = a.changePercent;
          vb = b.changePercent;
          break;
        case "overallScore":
          va = a.overallScore;
          vb = b.overallScore;
          break;
        case "volume":
          va = a.volume;
          vb = b.volume;
          break;
        case "marketCap":
          va = a.marketCap;
          vb = b.marketCap;
          break;
      }
      if (typeof va === "string" && typeof vb === "string") {
        return sortDir === "asc"
          ? va.localeCompare(vb, "tr")
          : vb.localeCompare(va, "tr");
      }
      return sortDir === "asc"
        ? (va as number) - (vb as number)
        : (vb as number) - (va as number);
    });
    return arr;
  }, [watchlistStocks, sortKey, sortDir]);

  // ── Summary ────────────────────────────────────────────
  const summary = useMemo(() => {
    if (watchlistStocks.length === 0)
      return {
        totalChange: 0,
        best: null as typeof watchlistStocks[0] | null,
        worst: null as typeof watchlistStocks[0] | null,
        avgScore: 0,
      };

    const totalChange = watchlistStocks.reduce(
      (sum, s) => sum + s.changePercent,
      0
    );
    const best = watchlistStocks.reduce((b, s) =>
      s.changePercent > b.changePercent ? s : b
    );
    const worst = watchlistStocks.reduce((w, s) =>
      s.changePercent < w.changePercent ? s : w
    );
    const avgScore =
      watchlistStocks.reduce((sum, s) => sum + s.overallScore, 0) /
      watchlistStocks.length;

    return { totalChange, best, worst, avgScore };
  }, [watchlistStocks]);

  // ── Search filtered stocks ─────────────────────────────
  const filteredStocks = useMemo(() => {
    if (!searchQuery) return MOCK_STOCKS.slice(0, 8);
    const q = searchQuery.toUpperCase();
    return MOCK_STOCKS.filter(
      (s) => s.ticker.includes(q) || s.name.toUpperCase().includes(q)
    ).slice(0, 8);
  }, [searchQuery]);

  // ── Alert helpers ──────────────────────────────────────
  const alertsForTicker = useCallback(
    (ticker: string) => alerts.filter((a) => a.ticker === ticker),
    [alerts]
  );

  const isAlertTriggered = useCallback((alert: PriceAlert) => {
    if (alert.type === "above") return alert.currentPrice >= alert.targetPrice;
    return alert.currentPrice <= alert.targetPrice;
  }, []);

  // ── Handlers ───────────────────────────────────────────
  const handleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir("desc");
      }
    },
    [sortKey]
  );

  const addToWatchlist = useCallback(
    (ticker: string) => {
      if (watchlist.length >= MAX_WATCHLIST) return;
      if (watchlist.includes(ticker)) return;
      setWatchlist((prev) => [...prev, ticker]);
      setSearchQuery("");
      setShowDropdown(false);
    },
    [watchlist]
  );

  const removeFromWatchlist = useCallback((ticker: string) => {
    setWatchlist((prev) => prev.filter((t) => t !== ticker));
    setAlerts((prev) => prev.filter((a) => a.ticker !== ticker));
  }, []);

  const openAlertModal = useCallback(
    (ticker: string) => {
      const stock = stockByTicker(ticker);
      setAlertModalTicker(ticker);
      setAlertType("above");
      setAlertTargetPrice(stock ? (stock.price * 1.1).toFixed(2) : "");
    },
    []
  );

  const saveAlert = useCallback(() => {
    if (!alertModalTicker || !alertTargetPrice) return;
    const target = parseFloat(alertTargetPrice);
    if (isNaN(target) || target <= 0) return;
    const stock = stockByTicker(alertModalTicker);
    if (!stock) return;

    const newAlert: PriceAlert = {
      id: uid(),
      ticker: alertModalTicker,
      type: alertType,
      targetPrice: target,
      currentPrice: stock.price,
      createdAt: new Date().toLocaleDateString("tr-TR"),
    };
    setAlerts((prev) => [...prev, newAlert]);
    setAlertModalTicker(null);
    setAlertTargetPrice("");
  }, [alertModalTicker, alertType, alertTargetPrice]);

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // ── Sort indicator ─────────────────────────────────────
  function SortIcon({ column }: { column: SortKey }) {
    if (sortKey !== column)
      return <span className="ml-1 text-text-muted/40">&#8693;</span>;
    return (
      <span className="ml-1 text-accent">
        {sortDir === "asc" ? "\u25B2" : "\u25BC"}
      </span>
    );
  }

  // ═══════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════
  return (
    <div className="hero-gradient min-h-screen">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        {/* ── Header ──────────────────────────────────── */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight gradient-text">
            Watchlist
          </h1>
          <p className="text-sm text-text-muted">
            Takip listenizdeki hisseleri izleyin ve fiyat alarmlari kurun
          </p>
        </div>

        {/* ── Summary Cards ───────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="glass-card p-4">
            <p className="text-xs text-text-muted">Toplam Degisim</p>
            <p
              className={`mt-1 text-lg font-bold font-mono ${
                summary.totalChange >= 0 ? "text-up" : "text-down"
              }`}
            >
              {formatPercent(summary.totalChange / (watchlistStocks.length || 1))}
            </p>
            <p className="text-[10px] text-text-muted">
              Ortalama gunluk degisim
            </p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs text-text-muted">En Iyi Performans</p>
            {summary.best ? (
              <>
                <p className="mt-1 text-lg font-bold font-mono text-up">
                  {summary.best.ticker}
                </p>
                <p className="text-[10px] text-up">
                  {formatPercent(summary.best.changePercent)}
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm text-text-muted">-</p>
            )}
          </div>
          <div className="glass-card p-4">
            <p className="text-xs text-text-muted">En Kotu Performans</p>
            {summary.worst ? (
              <>
                <p className="mt-1 text-lg font-bold font-mono text-down">
                  {summary.worst.ticker}
                </p>
                <p className="text-[10px] text-down">
                  {formatPercent(summary.worst.changePercent)}
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm text-text-muted">-</p>
            )}
          </div>
          <div className="glass-card p-4">
            <p className="text-xs text-text-muted">Ortalama Skor</p>
            <p className="mt-1 text-lg font-bold font-mono text-accent">
              {formatNumber(summary.avgScore, 1)}
              <span className="text-xs text-text-muted">/5</span>
            </p>
            <p className="text-[10px] text-text-muted">
              {watchlistStocks.length} hisse
            </p>
          </div>
        </div>

        {/* ── Add Stock ───────────────────────────────── */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-text-secondary">
              Hisse Ekle
            </h2>
            <span className="text-xs text-text-muted">
              {watchlist.length}/{MAX_WATCHLIST}
            </span>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Hisse ara (ornegin THYAO)..."
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 outline-none focus:border-accent/50 transition-colors"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
            {showDropdown && (
              <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-border bg-surface shadow-xl">
                {filteredStocks.map((s) => {
                  const inList = watchlist.includes(s.ticker);
                  return (
                    <button
                      key={s.ticker}
                      type="button"
                      disabled={inList || watchlist.length >= MAX_WATCHLIST}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                        inList
                          ? "opacity-40 cursor-not-allowed"
                          : "hover:bg-surface-hover"
                      }`}
                      onClick={() => addToWatchlist(s.ticker)}
                    >
                      <span className="font-mono font-bold text-accent">
                        {s.ticker}
                      </span>
                      <span className="truncate text-text-muted text-xs">
                        {s.name}
                      </span>
                      <span className="ml-auto flex items-center gap-2">
                        <span className="font-mono text-xs">
                          {formatCurrency(s.price)}
                        </span>
                        {inList && (
                          <span className="text-[10px] text-accent">
                            Listede
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
                {filteredStocks.length === 0 && (
                  <div className="px-3 py-2 text-xs text-text-muted">
                    Sonuc bulunamadi
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Watchlist Table (Desktop) ───────────────── */}
        {watchlistStocks.length > 0 && (
          <>
            {/* Desktop table */}
            <div className="glass-card hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-text-muted">
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={() => handleSort("ticker")}
                        className="flex items-center hover:text-text-primary transition-colors"
                      >
                        Hisse
                        <SortIcon column="ticker" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleSort("price")}
                        className="ml-auto flex items-center hover:text-text-primary transition-colors"
                      >
                        Fiyat
                        <SortIcon column="price" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleSort("changePercent")}
                        className="ml-auto flex items-center hover:text-text-primary transition-colors"
                      >
                        Degisim
                        <SortIcon column="changePercent" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-center">Son 7 Gun</th>
                    <th className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleSort("overallScore")}
                        className="mx-auto flex items-center hover:text-text-primary transition-colors"
                      >
                        Skor
                        <SortIcon column="overallScore" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleSort("volume")}
                        className="ml-auto flex items-center hover:text-text-primary transition-colors"
                      >
                        Hacim
                        <SortIcon column="volume" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleSort("marketCap")}
                        className="ml-auto flex items-center hover:text-text-primary transition-colors"
                      >
                        Piyasa Deg.
                        <SortIcon column="marketCap" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-center">Alarmlar</th>
                    <th className="px-4 py-3 text-center">Islemler</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((stock) => {
                    const sparkline = generateSparkline(
                      stock.ticker,
                      stock.changePercent
                    );
                    const stockAlerts = alertsForTicker(stock.ticker);
                    const triggeredCount = stockAlerts.filter((a) =>
                      isAlertTriggered(a)
                    ).length;

                    return (
                      <tr
                        key={stock.ticker}
                        className="border-b border-border/50 hover:bg-surface-hover/30 transition-colors"
                      >
                        {/* Ticker + Name */}
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <Link
                              href={`/hisseler/${stock.ticker}`}
                              className="font-mono font-bold text-accent hover:underline"
                            >
                              {stock.ticker}
                            </Link>
                            <span className="text-xs text-text-muted truncate max-w-[200px]">
                              {stock.name}
                            </span>
                            <span className="text-[10px] text-text-muted/60">
                              {stock.sector}
                            </span>
                          </div>
                        </td>
                        {/* Price */}
                        <td className="px-4 py-3 text-right font-mono">
                          {formatCurrency(stock.price)}
                        </td>
                        {/* Change */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex flex-col items-end">
                            <span
                              className={`font-mono font-bold ${
                                stock.changePercent >= 0
                                  ? "text-up"
                                  : "text-down"
                              }`}
                            >
                              {formatPercent(stock.changePercent)}
                            </span>
                            <span
                              className={`text-xs font-mono ${
                                stock.change >= 0 ? "text-up/60" : "text-down/60"
                              }`}
                            >
                              {stock.change >= 0 ? "+" : ""}
                              {formatNumber(stock.change)}
                            </span>
                          </div>
                        </td>
                        {/* Sparkline */}
                        <td className="px-4 py-3">
                          <div className="flex items-end justify-center gap-[2px] h-6">
                            {sparkline.map((val, i) => {
                              const absMax = Math.max(
                                ...sparkline.map(Math.abs),
                                0.01
                              );
                              const height = Math.max(
                                2,
                                (Math.abs(val) / absMax) * 20
                              );
                              return (
                                <div
                                  key={i}
                                  className={`w-[4px] rounded-sm ${
                                    val >= 0 ? "bg-up/70" : "bg-down/70"
                                  }`}
                                  style={{ height: `${height}px` }}
                                />
                              );
                            })}
                          </div>
                        </td>
                        {/* Score */}
                        <td className="px-4 py-3">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-mono font-bold text-accent">
                              {formatNumber(stock.overallScore, 1)}
                            </span>
                            <div className="w-14 h-1.5 rounded-full bg-border overflow-hidden">
                              <div
                                className="h-full rounded-full bg-accent"
                                style={{
                                  width: `${(stock.overallScore / 5) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        {/* Volume */}
                        <td className="px-4 py-3 text-right font-mono text-xs text-text-muted">
                          {formatVolume(stock.volume)}
                        </td>
                        {/* Market Cap */}
                        <td className="px-4 py-3 text-right font-mono text-xs text-text-muted">
                          {formatMarketCap(stock.marketCap)}
                        </td>
                        {/* Alerts badge */}
                        <td className="px-4 py-3 text-center">
                          {stockAlerts.length > 0 ? (
                            <span className="inline-flex items-center gap-1">
                              <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
                              <span className="text-xs font-mono text-accent">
                                {stockAlerts.length}
                              </span>
                              {triggeredCount > 0 && (
                                <span className="text-[10px] font-bold text-up bg-up/10 px-1.5 py-0.5 rounded">
                                  {triggeredCount} Tetiklendi!
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-text-muted/30 text-xs">-</span>
                          )}
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            {/* Alert bell */}
                            <button
                              onClick={() => openAlertModal(stock.ticker)}
                              className="rounded-lg p-1.5 text-text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                              title="Fiyat alarmi kur"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                />
                              </svg>
                            </button>
                            {/* Detail link */}
                            <Link
                              href={`/hisseler/${stock.ticker}`}
                              className="rounded-lg p-1.5 text-text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                              title="Detay"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                                />
                              </svg>
                            </Link>
                            {/* Compare link */}
                            <Link
                              href={`/hisseler/karsilastir?stocks=${stock.ticker}`}
                              className="rounded-lg p-1.5 text-text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                              title="Karsilastir"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                              </svg>
                            </Link>
                            {/* Remove */}
                            <button
                              onClick={() => removeFromWatchlist(stock.ticker)}
                              className="rounded-lg p-1.5 text-text-muted hover:text-down hover:bg-down/10 transition-colors"
                              title="Kaldir"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="flex flex-col gap-3 lg:hidden">
              {sorted.map((stock) => {
                const sparkline = generateSparkline(
                  stock.ticker,
                  stock.changePercent
                );
                const stockAlerts = alertsForTicker(stock.ticker);
                const triggeredCount = stockAlerts.filter((a) =>
                  isAlertTriggered(a)
                ).length;

                return (
                  <div key={stock.ticker} className="glass-card p-4">
                    {/* Top row: ticker + price + change */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/hisseler/${stock.ticker}`}
                            className="font-mono font-bold text-accent hover:underline"
                          >
                            {stock.ticker}
                          </Link>
                          {stockAlerts.length > 0 && (
                            <span className="inline-flex items-center gap-1">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                              {triggeredCount > 0 && (
                                <span className="text-[9px] font-bold text-up bg-up/10 px-1 py-0.5 rounded">
                                  Tetiklendi!
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted truncate">
                          {stock.name}
                        </p>
                        <p className="text-[10px] text-text-muted/60">
                          {stock.sector}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-mono font-bold text-sm">
                          {formatCurrency(stock.price)}
                        </p>
                        <p
                          className={`font-mono text-xs font-bold ${
                            stock.changePercent >= 0 ? "text-up" : "text-down"
                          }`}
                        >
                          {formatPercent(stock.changePercent)}
                        </p>
                      </div>
                    </div>

                    {/* Middle row: sparkline + score */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                      {/* Sparkline */}
                      <div className="flex items-end gap-[2px] h-5">
                        {sparkline.map((val, i) => {
                          const absMax = Math.max(
                            ...sparkline.map(Math.abs),
                            0.01
                          );
                          const height = Math.max(
                            2,
                            (Math.abs(val) / absMax) * 16
                          );
                          return (
                            <div
                              key={i}
                              className={`w-[3px] rounded-sm ${
                                val >= 0 ? "bg-up/70" : "bg-down/70"
                              }`}
                              style={{ height: `${height}px` }}
                            />
                          );
                        })}
                      </div>
                      {/* Score */}
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 rounded-full bg-border overflow-hidden">
                          <div
                            className="h-full rounded-full bg-accent"
                            style={{
                              width: `${(stock.overallScore / 5) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-mono font-bold text-accent">
                          {formatNumber(stock.overallScore, 1)}
                        </span>
                      </div>
                      {/* Volume + mcap */}
                      <div className="text-right">
                        <p className="text-[10px] text-text-muted font-mono">
                          H: {formatVolume(stock.volume)}
                        </p>
                        <p className="text-[10px] text-text-muted font-mono">
                          PD: {formatMarketCap(stock.marketCap)}
                        </p>
                      </div>
                    </div>

                    {/* Bottom row: actions */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openAlertModal(stock.ticker)}
                          className="rounded-lg px-2 py-1 text-xs text-text-muted hover:text-accent hover:bg-accent/10 transition-colors flex items-center gap-1"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                            />
                          </svg>
                          Alarm
                        </button>
                        <Link
                          href={`/hisseler/${stock.ticker}`}
                          className="rounded-lg px-2 py-1 text-xs text-text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                        >
                          Detay
                        </Link>
                        <Link
                          href={`/hisseler/karsilastir?stocks=${stock.ticker}`}
                          className="rounded-lg px-2 py-1 text-xs text-text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                        >
                          Karsilastir
                        </Link>
                      </div>
                      <button
                        onClick={() => removeFromWatchlist(stock.ticker)}
                        className="rounded-lg p-1.5 text-text-muted hover:text-down hover:bg-down/10 transition-colors"
                        title="Kaldir"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Empty state */}
        {watchlistStocks.length === 0 && (
          <div className="glass-card p-12 text-center">
            <p className="text-lg text-text-muted">
              Watchlist&apos;iniz bos. Yukardaki arama kutusundan hisse ekleyin.
            </p>
          </div>
        )}

        {/* ── Active Alerts Section ───────────────────── */}
        {alerts.length > 0 && (
          <div className="glass-card p-5">
            <h2 className="mb-4 text-sm font-bold text-text-secondary flex items-center gap-2">
              <svg
                className="w-4 h-4 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              Aktif Alarmlar ({alerts.length})
            </h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {alerts.map((alert) => {
                const triggered = isAlertTriggered(alert);
                return (
                  <div
                    key={alert.id}
                    className={`rounded-xl border p-3 transition-colors ${
                      triggered
                        ? "border-up/40 bg-up/5"
                        : "border-border bg-surface/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-accent text-sm">
                          {alert.ticker}
                        </span>
                        {triggered && (
                          <span className="text-[10px] font-bold text-up bg-up/10 px-1.5 py-0.5 rounded animate-pulse">
                            Tetiklendi!
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeAlert(alert.id)}
                        className="text-text-muted hover:text-down transition-colors"
                        title="Alarmi sil"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-text-muted">
                      {alert.type === "above"
                        ? "Fiyat su seviyenin ustune cikarsa:"
                        : "Fiyat su seviyenin altina duserse:"}
                    </p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="font-mono text-sm font-bold">
                        {formatCurrency(alert.targetPrice)}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        Mevcut: {formatCurrency(alert.currentPrice)}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-text-muted/60">
                      {alert.createdAt}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Alert Modal ─────────────────────────────── */}
        {alertModalTicker && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="glass-card w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  Fiyat Alarmi
                </h3>
                <button
                  onClick={() => setAlertModalTicker(null)}
                  className="text-text-muted hover:text-text-primary transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Ticker + current price */}
              {(() => {
                const stock = stockByTicker(alertModalTicker);
                return stock ? (
                  <div className="mb-4 flex items-center justify-between rounded-lg border border-border bg-surface/50 px-4 py-3">
                    <div>
                      <span className="font-mono font-bold text-accent">
                        {stock.ticker}
                      </span>
                      <p className="text-xs text-text-muted">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold">
                        {formatCurrency(stock.price)}
                      </p>
                      <p
                        className={`text-xs font-mono ${
                          stock.changePercent >= 0 ? "text-up" : "text-down"
                        }`}
                      >
                        {formatPercent(stock.changePercent)}
                      </p>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Alert type */}
              <div className="mb-4">
                <label className="mb-2 block text-xs text-text-muted">
                  Alarm Tipi
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAlertType("above")}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      alertType === "above"
                        ? "border-up/50 bg-up/10 text-up"
                        : "border-border bg-surface/50 text-text-muted hover:border-border/80"
                    }`}
                  >
                    Ustune Cikarsa
                  </button>
                  <button
                    onClick={() => setAlertType("below")}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      alertType === "below"
                        ? "border-down/50 bg-down/10 text-down"
                        : "border-border bg-surface/50 text-text-muted hover:border-border/80"
                    }`}
                  >
                    Altina Duserse
                  </button>
                </div>
              </div>

              {/* Target price */}
              <div className="mb-6">
                <label className="mb-2 block text-xs text-text-muted">
                  Hedef Fiyat (TL)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm font-mono text-text-primary placeholder:text-text-muted/50 outline-none focus:border-accent/50 transition-colors"
                  placeholder="0.00"
                  value={alertTargetPrice}
                  onChange={(e) => setAlertTargetPrice(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveAlert();
                  }}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setAlertModalTicker(null)}
                  className="flex-1 rounded-lg border border-border px-4 py-2 text-sm text-text-muted hover:bg-surface-hover transition-colors"
                >
                  Iptal
                </button>
                <button
                  onClick={saveAlert}
                  className="flex-1 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/80 transition-colors"
                >
                  Alarmi Kaydet
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Disclaimer ──────────────────────────────── */}
        <p className="text-center text-[10px] text-text-muted/40 py-4">
          Bu sayfa yatirim tavsiyesi niteliginde degildir. Veriler bilgilendirme
          amaçlidir.
        </p>
      </div>
    </div>
  );
}

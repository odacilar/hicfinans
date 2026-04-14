"use client";

import { useState, useMemo } from "react";
import {
  MOCK_INSIDER_TRANSACTIONS,
  type InsiderTransaction,
} from "@/lib/mock-insider-data";

// ── Helpers ──

function fmtCurrency(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString("tr-TR");
}

function fmtFullCurrency(n: number) {
  return n.toLocaleString("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function fmtPrice(n: number) {
  return n.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function fmtShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
  });
}

function fmtShares(n: number) {
  return n.toLocaleString("tr-TR");
}

function relationLabel(r: InsiderTransaction["relation"]) {
  if (r === "yönetici") return "Yönetici";
  if (r === "ortak") return "Ortak";
  return "Aile";
}

function relationBadgeClass(r: InsiderTransaction["relation"]) {
  if (r === "yönetici") return "bg-accent/15 text-accent";
  if (r === "ortak") return "bg-score-health/15 text-score-health";
  return "bg-score-past/15 text-score-past";
}

// ── Aggregation helper ──

interface StockAggregation {
  ticker: string;
  companyName: string;
  buyCount: number;
  sellCount: number;
  totalBuyValue: number;
  totalSellValue: number;
  netValue: number;
}

function aggregateByTicker(
  transactions: InsiderTransaction[]
): StockAggregation[] {
  const map: Record<string, StockAggregation> = {};

  for (const tx of transactions) {
    if (!map[tx.ticker]) {
      map[tx.ticker] = {
        ticker: tx.ticker,
        companyName: tx.companyName,
        buyCount: 0,
        sellCount: 0,
        totalBuyValue: 0,
        totalSellValue: 0,
        netValue: 0,
      };
    }
    const agg = map[tx.ticker];
    if (tx.transactionType === "alım") {
      agg.buyCount++;
      agg.totalBuyValue += tx.totalValue;
    } else {
      agg.sellCount++;
      agg.totalSellValue += tx.totalValue;
    }
    agg.netValue = agg.totalBuyValue - agg.totalSellValue;
  }

  return Object.values(map).sort((a, b) => b.netValue - a.netValue);
}

// ── Sort types ──

type SortKey = "date" | "value" | "ticker";
type FilterType = "all" | "alım" | "satım";

// ── Component ──

export default function InsiderTradingPage() {
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");

  // Filter
  const filtered = useMemo(() => {
    let result = [...MOCK_INSIDER_TRANSACTIONS];
    if (filterType !== "all") {
      result = result.filter((tx) => tx.transactionType === filterType);
    }
    return result;
  }, [filterType]);

  // Sort
  const sorted = useMemo(() => {
    const items = [...filtered];
    if (sortKey === "date") {
      items.sort(
        (a, b) =>
          new Date(b.transactionDate).getTime() -
          new Date(a.transactionDate).getTime()
      );
    } else if (sortKey === "value") {
      items.sort((a, b) => b.totalValue - a.totalValue);
    } else {
      items.sort((a, b) => a.ticker.localeCompare(b.ticker));
    }
    return items;
  }, [filtered, sortKey]);

  // Summary stats (all transactions)
  const totalBuying = MOCK_INSIDER_TRANSACTIONS.filter(
    (tx) => tx.transactionType === "alım"
  ).reduce((sum, tx) => sum + tx.totalValue, 0);

  const totalSelling = MOCK_INSIDER_TRANSACTIONS.filter(
    (tx) => tx.transactionType === "satım"
  ).reduce((sum, tx) => sum + tx.totalValue, 0);

  const netAmount = totalBuying - totalSelling;
  const isNetBuying = netAmount > 0;

  const largestTransaction = MOCK_INSIDER_TRANSACTIONS.reduce((best, tx) =>
    tx.totalValue > best.totalValue ? tx : best
  );

  // Aggregation
  const aggregated = useMemo(
    () => aggregateByTicker(MOCK_INSIDER_TRANSACTIONS),
    []
  );

  return (
    <main className="min-h-screen hero-gradient">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold sm:text-4xl">
            <span className="gradient-text">İçeriden İşlemler</span>
          </h1>
          <p className="mt-2 text-text-secondary">
            Yönetici ve ortakların alım-satım hareketleri
          </p>
        </div>

        {/* ── Summary Stats ── */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="glass-card p-5">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Son 30 Gün Alım
            </p>
            <p className="mt-2 text-2xl font-bold font-mono text-up">
              ₺{fmtCurrency(totalBuying)}
            </p>
            <p className="mt-1 text-xs text-text-muted">toplam alım tutarı</p>
          </div>
          <div className="glass-card p-5">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Son 30 Gün Satım
            </p>
            <p className="mt-2 text-2xl font-bold font-mono text-down">
              ₺{fmtCurrency(totalSelling)}
            </p>
            <p className="mt-1 text-xs text-text-muted">toplam satım tutarı</p>
          </div>
          <div className="glass-card p-5">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Net Alım/Satım
            </p>
            <p
              className={`mt-2 text-2xl font-bold font-mono ${
                isNetBuying ? "text-up" : "text-down"
              }`}
            >
              {isNetBuying ? "+" : "-"}₺{fmtCurrency(Math.abs(netAmount))}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              {isNetBuying ? "net alım" : "net satım"}
            </p>
          </div>
          <div className="glass-card p-5">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
              En Büyük İşlem
            </p>
            <p className="mt-2 text-2xl font-bold font-mono text-accent">
              ₺{fmtCurrency(largestTransaction.totalValue)}
            </p>
            <p className="mt-1 text-xs text-text-muted font-mono">
              {largestTransaction.ticker} —{" "}
              {largestTransaction.transactionType === "alım" ? "Alım" : "Satım"}
            </p>
          </div>
        </div>

        {/* ── Signal Indicator ── */}
        <div className="mb-8 glass-card p-5">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${
                isNetBuying
                  ? "bg-up/15 text-up border border-up/25"
                  : "bg-down/15 text-down border border-down/25"
              }`}
            >
              {isNetBuying ? (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              )}
              {isNetBuying ? "NET ALIM" : "NET SATIM"}
            </span>
            <p className="text-sm text-text-secondary">
              Son 30 günde yöneticiler net olarak{" "}
              <span
                className={`font-mono font-semibold ${
                  isNetBuying ? "text-up" : "text-down"
                }`}
              >
                ₺{fmtCurrency(Math.abs(netAmount))}
              </span>{" "}
              {isNetBuying ? "alım" : "satım"} yaptı —{" "}
              <span
                className={`font-medium ${
                  isNetBuying ? "text-up" : "text-down"
                }`}
              >
                {isNetBuying ? "pozitif sinyal" : "negatif sinyal"}
              </span>
            </p>
          </div>
        </div>

        {/* ── Filters & Sort ── */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Type filter */}
          <div className="flex items-center gap-1 rounded-xl bg-surface/50 p-1">
            {(
              [
                { key: "all", label: "Tümü" },
                { key: "alım", label: "Alımlar" },
                { key: "satım", label: "Satımlar" },
              ] as const
            ).map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterType(f.key)}
                className={`rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                  filterType === f.key
                    ? f.key === "alım"
                      ? "bg-up/15 text-up shadow-sm"
                      : f.key === "satım"
                        ? "bg-down/15 text-down shadow-sm"
                        : "bg-accent/15 text-accent shadow-sm"
                    : "text-text-muted hover:bg-surface-hover hover:text-text-primary"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1 rounded-xl bg-surface/50 p-1">
            {(
              [
                { key: "date", label: "Tarih" },
                { key: "value", label: "Tutar" },
                { key: "ticker", label: "Hisse" },
              ] as const
            ).map((s) => (
              <button
                key={s.key}
                onClick={() => setSortKey(s.key)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  sortKey === s.key
                    ? "bg-accent/15 text-accent"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Transaction Cards ── */}
        <div className="mb-10 space-y-3">
          {sorted.map((tx) => {
            const isBuy = tx.transactionType === "alım";
            return (
              <div
                key={tx.id}
                className="glass-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
              >
                {/* Arrow icon */}
                <div className="flex shrink-0 items-center gap-4 sm:w-14 sm:justify-center">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full ${
                      isBuy
                        ? "bg-up/15 border border-up/25"
                        : "bg-down/15 border border-down/25"
                    }`}
                  >
                    {isBuy ? (
                      <svg
                        className="h-5 w-5 text-up"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 10l7-7m0 0l7 7m-7-7v18"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5 text-down"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-bold text-accent">
                      {tx.ticker}
                    </span>
                    <span className="text-sm text-text-secondary truncate">
                      {tx.companyName}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                        isBuy
                          ? "bg-up/20 text-up"
                          : "bg-down/20 text-down"
                      }`}
                    >
                      {isBuy ? "ALIM" : "SATIM"}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${relationBadgeClass(
                        tx.relation
                      )}`}
                    >
                      {relationLabel(tx.relation)}
                    </span>
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                    <span className="text-sm text-text-primary font-medium">
                      {tx.insiderName}
                    </span>
                    <span className="text-xs text-text-muted">
                      — {tx.insiderTitle}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-text-muted">
                    <span>
                      Tarih:{" "}
                      <span className="text-text-secondary">
                        {fmtShortDate(tx.transactionDate)}
                      </span>
                    </span>
                    <span>
                      KAP:{" "}
                      <span className="text-text-secondary">
                        {fmtShortDate(tx.announcementDate)}
                      </span>
                    </span>
                    <span>
                      Sahiplik:{" "}
                      <span className="text-text-secondary font-mono">
                        %{tx.ownershipAfter.toFixed(2)}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  <div className="text-center">
                    <p className="text-xs text-text-muted">Lot</p>
                    <p className="font-mono text-sm font-bold">
                      {fmtShares(tx.shares)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-text-muted">Fiyat</p>
                    <p className="font-mono text-sm font-bold">
                      ₺{fmtPrice(tx.pricePerShare)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-text-muted">Toplam</p>
                    <p
                      className={`font-mono text-lg font-bold ${
                        isBuy ? "text-up" : "text-down"
                      }`}
                    >
                      ₺{fmtCurrency(tx.totalValue)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Per-Stock Aggregation ── */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-bold gradient-text">
            Hisse Bazında Özet
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {aggregated.map((agg) => {
              const isPositive = agg.netValue >= 0;
              return (
                <div
                  key={agg.ticker}
                  className="glass-card p-4 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-accent">
                        {agg.ticker}
                      </span>
                      <span className="text-xs text-text-muted truncate max-w-[140px]">
                        {agg.companyName}
                      </span>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        isPositive
                          ? "bg-up/15 text-up"
                          : "bg-down/15 text-down"
                      }`}
                    >
                      {isPositive ? "NET ALIM" : "NET SATIM"}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-text-muted">
                    <span>
                      <span className="text-up font-semibold">
                        {agg.buyCount}
                      </span>{" "}
                      alım
                    </span>
                    <span>
                      <span className="text-down font-semibold">
                        {agg.sellCount}
                      </span>{" "}
                      satım
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">Net tutar</span>
                    <span
                      className={`font-mono text-sm font-bold ${
                        isPositive ? "text-up" : "text-down"
                      }`}
                    >
                      {isPositive ? "+" : "-"}₺
                      {fmtCurrency(Math.abs(agg.netValue))}
                    </span>
                  </div>

                  {/* Mini bar showing buy vs sell proportion */}
                  <div className="h-1.5 w-full rounded-full bg-surface overflow-hidden flex">
                    {agg.totalBuyValue + agg.totalSellValue > 0 && (
                      <>
                        <div
                          className="h-full bg-up/60 rounded-l-full"
                          style={{
                            width: `${
                              (agg.totalBuyValue /
                                (agg.totalBuyValue + agg.totalSellValue)) *
                              100
                            }%`,
                          }}
                        />
                        <div
                          className="h-full bg-down/60 rounded-r-full"
                          style={{
                            width: `${
                              (agg.totalSellValue /
                                (agg.totalBuyValue + agg.totalSellValue)) *
                              100
                            }%`,
                          }}
                        />
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-text-muted">
                    <span>
                      Alım: ₺{fmtCurrency(agg.totalBuyValue)}
                    </span>
                    <span>
                      Satım: ₺{fmtCurrency(agg.totalSellValue)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-text-muted mt-8">
          Bu sayfa yatırım tavsiyesi niteliği taşımaz. İçeriden öğrenenlerin
          ticareti bilgileri KAP bildirimlerinden derlenmiş olup bilgilendirme
          amaçlıdır.
        </p>
      </div>
    </main>
  );
}

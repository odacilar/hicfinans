"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_STOCKS, MOCK_STOCK_DETAIL } from "@/lib/mock-data";

// ── Types ──
interface StockCompData {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  volume: number;
  overallScore: number;
  // Mock fundamental data per stock (derived from detail)
  peRatio: number;
  pbRatio: number;
  evEbitda: number;
  roe: number;
  netMargin: number;
  debtToEquity: number;
  currentRatio: number;
  dividendYield: number;
  grossMargin: number;
  revenueGrowth: number;
}

// Generate comparison data from MOCK_STOCKS with randomized fundamentals
function getStockCompData(ticker: string): StockCompData | null {
  const stock = MOCK_STOCKS.find((s) => s.ticker === ticker);
  if (!stock) return null;

  // Deterministic pseudo-random from ticker hash
  const hash = ticker.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const r = (offset: number) => ((hash * 17 + offset * 31) % 100) / 100;

  return {
    ...stock,
    peRatio: +(5 + r(1) * 25).toFixed(1),
    pbRatio: +(0.5 + r(2) * 5).toFixed(2),
    evEbitda: +(3 + r(3) * 15).toFixed(1),
    roe: +(5 + r(4) * 35).toFixed(1),
    netMargin: +(2 + r(5) * 25).toFixed(1),
    debtToEquity: +(0.1 + r(6) * 2.5).toFixed(2),
    currentRatio: +(0.5 + r(7) * 2.5).toFixed(2),
    dividendYield: +(r(8) * 8).toFixed(1),
    grossMargin: +(15 + r(9) * 45).toFixed(1),
    revenueGrowth: +(-5 + r(10) * 60).toFixed(1),
  };
}

// ── Helpers ──
function formatMC(v: number): string {
  if (v >= 1e12) return `₺${(v / 1e12).toFixed(1)}T`;
  if (v >= 1e9) return `₺${(v / 1e9).toFixed(0)} Mr`;
  if (v >= 1e6) return `₺${(v / 1e6).toFixed(0)} Mn`;
  return `₺${v.toLocaleString("tr-TR")}`;
}

// ── Comparison Rows ──
interface CompRow {
  label: string;
  key: keyof StockCompData;
  format?: (v: number) => string;
  colorize?: boolean;
  reverseColor?: boolean;
}

const COMP_ROWS: CompRow[] = [
  { label: "Sektör", key: "sector" },
  { label: "Fiyat", key: "price", format: (v) => `₺${v.toFixed(2)}` },
  { label: "Günlük Değişim", key: "changePercent", format: (v) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`, colorize: true },
  { label: "Piyasa Değeri", key: "marketCap", format: (v) => formatMC(v) },
  { label: "Snowflake Skor", key: "overallScore", format: (v) => `${v.toFixed(1)} / 5`, colorize: true },
  { label: "F/K Oranı", key: "peRatio", format: (v) => `${v}x`, reverseColor: true },
  { label: "PD/DD", key: "pbRatio", format: (v) => `${v}x`, reverseColor: true },
  { label: "FD/FAVÖK", key: "evEbitda", format: (v) => `${v}x`, reverseColor: true },
  { label: "ROE", key: "roe", format: (v) => `%${v}`, colorize: true },
  { label: "Net Kar Marjı", key: "netMargin", format: (v) => `%${v}`, colorize: true },
  { label: "Brüt Kar Marjı", key: "grossMargin", format: (v) => `%${v}`, colorize: true },
  { label: "Gelir Büyümesi", key: "revenueGrowth", format: (v) => `${v >= 0 ? "+" : ""}%${v}`, colorize: true },
  { label: "Borç/Özkaynak", key: "debtToEquity", format: (v) => `${v}x`, reverseColor: true },
  { label: "Cari Oran", key: "currentRatio", format: (v) => `${v}x`, colorize: true },
  { label: "Temettü Verimi", key: "dividendYield", format: (v) => `%${v}`, colorize: true },
];

// ── Defaults ──
const DEFAULT_TICKERS = ["THYAO", "GARAN", "ASELS"];

export default function HisseKarsilastirPage() {
  const [selectedTickers, setSelectedTickers] = useState<string[]>(DEFAULT_TICKERS);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");

  const selectedData = selectedTickers
    .map(getStockCompData)
    .filter(Boolean) as StockCompData[];

  const available = MOCK_STOCKS
    .filter((s) => !selectedTickers.includes(s.ticker))
    .filter((s) =>
      search === "" ||
      s.ticker.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, 20);

  function addStock(ticker: string) {
    if (selectedTickers.length < 5) {
      setSelectedTickers([...selectedTickers, ticker]);
    }
    setAdding(false);
    setSearch("");
  }

  function removeStock(ticker: string) {
    setSelectedTickers(selectedTickers.filter((t) => t !== ticker));
  }

  function getBestWorst(row: CompRow): { best: number; worst: number } {
    if (!row.colorize && !row.reverseColor) return { best: -1, worst: -1 };
    const values = selectedData.map((d) => Number(d[row.key]));
    const bestIdx = row.reverseColor
      ? values.indexOf(Math.min(...values))
      : values.indexOf(Math.max(...values));
    const worstIdx = row.reverseColor
      ? values.indexOf(Math.max(...values))
      : values.indexOf(Math.min(...values));
    return { best: bestIdx, worst: worstIdx };
  }

  // Verdicts
  const verdicts = selectedData.length >= 2 ? [
    { label: "En Ucuz (F/K)", stock: [...selectedData].sort((a, b) => a.peRatio - b.peRatio)[0] },
    { label: "En Karlı (ROE)", stock: [...selectedData].sort((a, b) => b.roe - a.roe)[0] },
    { label: "En Yüksek Skor", stock: [...selectedData].sort((a, b) => b.overallScore - a.overallScore)[0] },
    { label: "En Düşük Borç", stock: [...selectedData].sort((a, b) => a.debtToEquity - b.debtToEquity)[0] },
    { label: "En Yüksek Temettü", stock: [...selectedData].sort((a, b) => b.dividendYield - a.dividendYield)[0] },
  ] : [];

  const maxScore = 5;

  return (
    <div className="hero-gradient min-h-screen">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Hisse Karşılaştırma</h1>
          <p className="mt-1 text-sm text-text-muted">BIST hisselerini yan yana kıyasla — değerleme, karlılık, büyüme</p>
        </div>

        {/* Stock selector */}
        <div className="glass-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-text-secondary">Seçili Hisseler:</span>
            {selectedData.map((stock) => (
              <div key={stock.ticker} className="flex items-center gap-1.5 rounded-lg bg-accent/10 border border-accent/20 px-3 py-1.5">
                <Link href={`/hisseler/${stock.ticker.toLowerCase()}`} className="font-mono text-xs font-bold text-accent hover:underline">
                  {stock.ticker}
                </Link>
                <span className="text-[10px] text-text-muted hidden sm:inline">{stock.name.split(" ").slice(0, 2).join(" ")}</span>
                <button onClick={() => removeStock(stock.ticker)} className="ml-1 text-text-muted hover:text-down transition-colors text-xs cursor-pointer">×</button>
              </div>
            ))}

            {selectedTickers.length < 5 && (
              <div className="relative">
                <button
                  onClick={() => setAdding(!adding)}
                  className="flex items-center gap-1 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs text-text-muted hover:border-accent hover:text-accent transition-all cursor-pointer"
                >
                  <span className="text-sm">+</span> Hisse Ekle
                </button>

                {adding && (
                  <div className="absolute left-0 top-full z-20 mt-1 w-80 rounded-xl border border-border bg-surface shadow-xl">
                    <div className="p-2 border-b border-border">
                      <input
                        type="text"
                        placeholder="Hisse ara... (THYAO, Garanti...)"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text-primary placeholder-text-muted outline-none focus:ring-1 focus:ring-accent"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-56 overflow-y-auto">
                      {available.map((stock) => (
                        <button
                          key={stock.ticker}
                          onClick={() => addStock(stock.ticker)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-surface-hover transition-colors cursor-pointer"
                        >
                          <span className="font-mono font-bold text-accent w-12">{stock.ticker}</span>
                          <span className="text-text-secondary truncate flex-1">{stock.name}</span>
                          <span className={`font-mono text-[10px] ${stock.changePercent >= 0 ? "text-up" : "text-down"}`}>
                            {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <span className="text-[10px] text-text-muted ml-2">({selectedTickers.length}/5)</span>
          </div>
        </div>

        {selectedData.length < 2 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-text-muted text-sm">Karşılaştırma için en az 2 hisse seçin</p>
          </div>
        ) : (
          <>
            {/* Score comparison visual */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-bold mb-4">Snowflake Skor Karşılaştırması</h3>
              <div className="space-y-3">
                {[...selectedData].sort((a, b) => b.overallScore - a.overallScore).map((stock) => (
                  <div key={stock.ticker} className="flex items-center gap-3">
                    <Link href={`/hisseler/${stock.ticker.toLowerCase()}`} className="font-mono text-xs font-bold text-accent w-12 hover:underline">
                      {stock.ticker}
                    </Link>
                    <div className="flex-1 h-7 bg-border/20 rounded-full overflow-hidden relative">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-accent/60 to-accent/30 transition-all duration-700"
                        style={{ width: `${(stock.overallScore / maxScore) * 100}%` }}
                      />
                      <span className="absolute inset-y-0 flex items-center px-3 text-xs font-mono font-bold text-text-primary">
                        {stock.overallScore.toFixed(1)} / 5
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main comparison table */}
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="sticky left-0 bg-surface px-4 py-3 text-left font-semibold text-text-muted w-36">Metrik</th>
                      {selectedData.map((stock) => (
                        <th key={stock.ticker} className="px-4 py-3 text-center min-w-[130px]">
                          <Link href={`/hisseler/${stock.ticker.toLowerCase()}`} className="font-mono text-sm font-bold text-accent hover:underline">
                            {stock.ticker}
                          </Link>
                          <div className="text-[10px] text-text-muted mt-0.5">{stock.sector}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMP_ROWS.map((row) => {
                      const { best, worst } = getBestWorst(row);
                      return (
                        <tr key={row.label} className="border-b border-border/30 hover:bg-surface-hover/30 transition-colors">
                          <td className="sticky left-0 bg-surface px-4 py-2.5 font-medium text-text-secondary">{row.label}</td>
                          {selectedData.map((stock, idx) => {
                            const rawVal = stock[row.key];
                            const numVal = Number(rawVal);
                            const displayed = row.format ? row.format(numVal) : String(rawVal);
                            const isBest = idx === best && selectedData.length > 1;
                            const isWorst = idx === worst && selectedData.length > 1 && best !== worst;

                            let cellColor = "";
                            if (row.colorize || row.reverseColor) {
                              if (isBest) cellColor = "bg-up/8 text-up font-semibold";
                              else if (isWorst) cellColor = "bg-down/8 text-down";
                            }

                            return (
                              <td key={stock.ticker} className={`px-4 py-2.5 text-center font-mono ${cellColor}`}>
                                {displayed}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Visual bars: ROE, Net Margin, P/E side by side */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* ROE */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-bold mb-3">ROE (Özkaynak Karlılığı)</h3>
                <div className="space-y-2.5">
                  {[...selectedData].sort((a, b) => b.roe - a.roe).map((stock) => (
                    <div key={stock.ticker} className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-accent w-10">{stock.ticker}</span>
                      <div className="flex-1 h-5 bg-border/20 rounded-full overflow-hidden relative">
                        <div className="h-full rounded-full bg-up/50" style={{ width: `${Math.min(stock.roe / 40 * 100, 100)}%` }} />
                        <span className="absolute inset-y-0 flex items-center px-2 text-[10px] font-mono font-bold text-up">%{stock.roe}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Net Margin */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-bold mb-3">Net Kar Marjı</h3>
                <div className="space-y-2.5">
                  {[...selectedData].sort((a, b) => b.netMargin - a.netMargin).map((stock) => (
                    <div key={stock.ticker} className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-accent w-10">{stock.ticker}</span>
                      <div className="flex-1 h-5 bg-border/20 rounded-full overflow-hidden relative">
                        <div className="h-full rounded-full bg-score-future/50" style={{ width: `${Math.min(stock.netMargin / 30 * 100, 100)}%` }} />
                        <span className="absolute inset-y-0 flex items-center px-2 text-[10px] font-mono font-bold text-score-future">%{stock.netMargin}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* P/E (lower is better) */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-bold mb-3">F/K Oranı <span className="text-text-muted font-normal">(düşük = ucuz)</span></h3>
                <div className="space-y-2.5">
                  {[...selectedData].sort((a, b) => a.peRatio - b.peRatio).map((stock) => (
                    <div key={stock.ticker} className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-accent w-10">{stock.ticker}</span>
                      <div className="flex-1 h-5 bg-border/20 rounded-full overflow-hidden relative">
                        <div className="h-full rounded-full bg-score-health/50" style={{ width: `${Math.min(stock.peRatio / 30 * 100, 100)}%` }} />
                        <span className="absolute inset-y-0 flex items-center px-2 text-[10px] font-mono font-bold text-score-health">{stock.peRatio}x</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Verdicts */}
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {verdicts.map((v) => (
                <div key={v.label} className="glass-card p-4">
                  <div className="text-[10px] text-text-muted mb-1">{v.label}</div>
                  <Link href={`/hisseler/${v.stock.ticker.toLowerCase()}`} className="flex items-center gap-2 group">
                    <span className="font-mono text-lg font-bold text-accent group-hover:underline">{v.stock.ticker}</span>
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="rounded-xl border border-border/50 bg-surface/50 p-3 text-center text-[10px] text-text-muted">
          Veriler bilgilendirme amaçlıdır, yatırım tavsiyesi niteliği taşımaz.
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { MOCK_STOCKS } from "@/lib/mock-data";
import { formatNumber, formatPercent, formatMarketCap } from "@/lib/formatters";
import Link from "next/link";

type SortField = "ticker" | "price" | "changePercent" | "volume" | "marketCap" | "overallScore";

export default function HisselerPage() {
  const [activeSector, setActiveSector] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("overallScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");

  const sectors = useMemo(() => [...new Set(MOCK_STOCKS.map((s) => s.sector))], []);

  const filtered = useMemo(() => {
    let list = [...MOCK_STOCKS];
    if (activeSector) list = list.filter((s) => s.sector === activeSector);
    if (search) {
      const q = search.toUpperCase();
      list = list.filter((s) => s.ticker.includes(q) || s.name.toUpperCase().includes(q));
    }
    list.sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      if (typeof av === "string") return sortDir === "asc" ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return list;
  }, [activeSector, sortField, sortDir, search]);

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  }

  return (
    <div className="hero-gradient min-h-screen">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight gradient-text">Hisseler</h1>
            <p className="mt-1 text-sm text-text-muted">{filtered.length} hisse listeleniyor</p>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Hisse ara... (THYAO, Garanti)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border/50 bg-surface/50 px-4 py-2.5 pl-10 text-sm text-text-primary outline-none backdrop-blur-sm placeholder:text-text-muted/50 focus:border-accent/50 focus:shadow-lg focus:shadow-accent/5 transition-all sm:w-80"
            />
            <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Sector chips */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveSector(null)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 ${
              !activeSector
                ? "bg-gradient-to-r from-accent to-blue-700 text-white shadow-lg shadow-accent/25"
                : "glass-card !rounded-xl text-text-muted hover:text-text-primary"
            }`}
          >
            Tümü
          </button>
          {sectors.map((s) => (
            <button
              key={s}
              onClick={() => setActiveSector(activeSector === s ? null : s)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                activeSector === s
                  ? "bg-gradient-to-r from-accent to-blue-700 text-white shadow-lg shadow-accent/25"
                  : "glass-card !rounded-xl text-text-muted hover:text-text-primary"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden !rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-[11px] uppercase tracking-wider text-text-muted">
                  {([
                    ["ticker", "Hisse", "left"],
                    ["price", "Fiyat", "right"],
                    ["changePercent", "Değişim", "right"],
                    ["volume", "Hacim", "right sm:table-cell hidden"],
                    ["marketCap", "Piy. Değeri", "right md:table-cell hidden"],
                    ["overallScore", "Skor", "right"],
                  ] as [SortField, string, string][]).map(([field, label, align]) => (
                    <th
                      key={field}
                      onClick={() => toggleSort(field)}
                      className={`cursor-pointer px-5 py-4 font-semibold transition-colors hover:text-accent ${
                        align.includes("right") ? "text-right" : "text-left"
                      } ${align.includes("hidden") ? align.split(" ").filter(c => c !== "right").join(" ") : ""} ${
                        sortField === field ? "text-accent" : ""
                      }`}
                    >
                      {label} {sortField === field && (sortDir === "asc" ? "↑" : "↓")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((stock) => {
                  const pct = (stock.overallScore / 5) * 100;
                  return (
                    <tr key={stock.ticker} className="table-row-hover border-b border-border/20">
                      <td className="px-5 py-4">
                        <Link href={`/hisseler/${stock.ticker}`} className="flex items-center gap-3 group">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent/15 to-accent/5 font-mono text-[11px] font-bold text-accent transition-transform group-hover:scale-105">
                            {stock.ticker.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-mono text-sm font-bold group-hover:text-accent transition-colors">{stock.ticker}</div>
                            <div className="max-w-[200px] truncate text-[11px] text-text-muted">{stock.name}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-right font-mono text-sm font-semibold">{formatNumber(stock.price)}</td>
                      <td className={`px-5 py-4 text-right font-mono text-sm font-bold ${stock.changePercent >= 0 ? "text-up" : "text-down"}`}>
                        <span className={`rounded-lg px-2 py-0.5 ${stock.changePercent >= 0 ? "bg-up/10" : "bg-down/10"}`}>
                          {formatPercent(stock.changePercent)}
                        </span>
                      </td>
                      <td className="hidden px-5 py-4 text-right font-mono text-sm text-text-secondary sm:table-cell">
                        {formatNumber(stock.volume / 1e6, 1)}M
                      </td>
                      <td className="hidden px-5 py-4 text-right font-mono text-sm text-text-secondary md:table-cell">
                        {formatMarketCap(stock.marketCap)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <div className="h-1.5 w-12 overflow-hidden rounded-full bg-border/50">
                            <div className="h-full rounded-full bg-gradient-to-r from-score-value to-score-future" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="font-mono text-xs font-bold text-score-value">{stock.overallScore.toFixed(1)}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

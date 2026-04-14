"use client";

import { useState, useMemo } from "react";
import { MOCK_STOCKS } from "@/lib/mock-data";
import { formatNumber, formatPercent, formatMarketCap } from "@/lib/formatters";
import { SECTORS } from "@/lib/constants";
import Link from "next/link";

interface RangeFilter {
  label: string;
  field: string;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  mockValueFn: () => number;
}

const FILTERS: RangeFilter[] = [
  { label: "F/K Oranı", field: "peRatio", min: 0, max: 50, step: 1, format: (v) => `${v}x`, mockValueFn: () => 5 + Math.random() * 20 },
  { label: "PD/DD", field: "pbRatio", min: 0, max: 10, step: 0.5, format: (v) => `${v.toFixed(1)}x`, mockValueFn: () => 0.5 + Math.random() * 5 },
  { label: "ROE (%)", field: "roe", min: 0, max: 60, step: 1, format: (v) => `%${v}`, mockValueFn: () => 5 + Math.random() * 35 },
  { label: "Temettü Verimi (%)", field: "dividendYield", min: 0, max: 15, step: 0.5, format: (v) => `%${v.toFixed(1)}`, mockValueFn: () => Math.random() * 8 },
  { label: "Net Kar Marjı (%)", field: "netMargin", min: 0, max: 40, step: 1, format: (v) => `%${v}`, mockValueFn: () => 3 + Math.random() * 25 },
  { label: "Borç/Özkaynak", field: "debtToEquity", min: 0, max: 3, step: 0.1, format: (v) => v.toFixed(1), mockValueFn: () => Math.random() * 2.5 },
];

// Generate stable mock ratios per stock
const STOCK_RATIOS = MOCK_STOCKS.map((s) => {
  const seed = s.ticker.charCodeAt(0) + s.ticker.charCodeAt(1);
  const pseudoRandom = (n: number) => ((seed * 9301 + 49297 + n * 233) % 233280) / 233280;
  return {
    ...s,
    peRatio: 5 + pseudoRandom(1) * 20,
    pbRatio: 0.5 + pseudoRandom(2) * 5,
    roe: 5 + pseudoRandom(3) * 35,
    dividendYield: pseudoRandom(4) * 8,
    netMargin: 3 + pseudoRandom(5) * 25,
    debtToEquity: pseudoRandom(6) * 2.5,
  };
});

export default function TarayiciPage() {
  const [filterValues, setFilterValues] = useState<Record<string, [number, number]>>({});
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);

  const activeFilterCount = Object.keys(filterValues).length + (selectedSectors.length > 0 ? 1 : 0);

  const results = useMemo(() => {
    let list = [...STOCK_RATIOS];
    if (selectedSectors.length > 0) {
      list = list.filter((s) => selectedSectors.includes(s.sector));
    }
    for (const [field, [min, max]] of Object.entries(filterValues)) {
      list = list.filter((s) => {
        const v = (s as unknown as Record<string, number>)[field];
        return v >= min && v <= max;
      });
    }
    return list;
  }, [filterValues, selectedSectors]);

  function setRange(field: string, min: number, max: number) {
    setFilterValues((prev) => ({ ...prev, [field]: [min, max] }));
  }

  function clearFilter(field: string) {
    setFilterValues((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function clearAll() {
    setFilterValues({});
    setSelectedSectors([]);
  }

  function toggleSector(s: string) {
    setSelectedSectors((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold">Hisse Tarayıcı</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Kriterlerinize göre BIST hisselerini filtreleyin
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold">Filtreler</h2>
          {activeFilterCount > 0 && (
            <button onClick={clearAll} className="text-xs text-accent hover:underline">
              Tümünü temizle ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Sector chips */}
        <div className="mb-5">
          <span className="mb-2 block text-xs text-text-muted">Sektörler</span>
          <div className="flex flex-wrap gap-1.5">
            {SECTORS.slice(0, 12).map((s) => (
              <button
                key={s}
                onClick={() => toggleSector(s)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                  selectedSectors.includes(s)
                    ? "bg-accent text-white"
                    : "border border-border text-text-muted hover:border-accent/40 hover:text-text-secondary"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Range filters */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FILTERS.map((f) => {
            const current = filterValues[f.field];
            return (
              <div key={f.field} className="rounded-xl bg-surface/50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-medium text-text-secondary">{f.label}</label>
                  {current && (
                    <button onClick={() => clearFilter(f.field)} className="text-[10px] text-accent hover:underline">
                      Temizle
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder={f.format(f.min)}
                    value={current?.[0] ?? ""}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!isNaN(v)) setRange(f.field, v, current?.[1] ?? f.max);
                    }}
                    step={f.step}
                    className="w-full rounded-lg border border-border bg-surface px-2.5 py-2 font-mono text-xs text-text-primary outline-none focus:border-accent"
                  />
                  <span className="text-xs text-text-muted">—</span>
                  <input
                    type="number"
                    placeholder={f.format(f.max)}
                    value={current?.[1] ?? ""}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!isNaN(v)) setRange(f.field, current?.[0] ?? f.min, v);
                    }}
                    step={f.step}
                    className="w-full rounded-lg border border-border bg-surface px-2.5 py-2 font-mono text-xs text-text-primary outline-none focus:border-accent"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-text-muted">Aktif filtreler:</span>
          {selectedSectors.map((s) => (
            <span key={s} className="flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-medium text-accent">
              {s}
              <button onClick={() => toggleSector(s)} className="ml-0.5 text-accent/60 hover:text-accent">&times;</button>
            </span>
          ))}
          {Object.entries(filterValues).map(([field, [min, max]]) => {
            const f = FILTERS.find((x) => x.field === field)!;
            return (
              <span key={field} className="flex items-center gap-1 rounded-full bg-score-future/10 px-2.5 py-1 text-[11px] font-medium text-score-future">
                {f.label}: {f.format(min)} — {f.format(max)}
                <button onClick={() => clearFilter(field)} className="ml-0.5 text-score-future/60 hover:text-score-future">&times;</button>
              </span>
            );
          })}
        </div>
      )}

      {/* Results */}
      <div className="rounded-2xl border border-border">
        <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
          <span className="text-sm font-semibold">{results.length} sonuç</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/50 text-xs text-text-muted">
                <th className="px-4 py-2.5 text-left font-medium">Hisse</th>
                <th className="px-4 py-2.5 text-right font-medium">Fiyat</th>
                <th className="px-4 py-2.5 text-right font-medium">Değişim</th>
                <th className="hidden px-4 py-2.5 text-right font-medium sm:table-cell">Piy. Değeri</th>
                <th className="hidden px-4 py-2.5 text-right font-medium md:table-cell">F/K</th>
                <th className="hidden px-4 py-2.5 text-right font-medium md:table-cell">ROE</th>
                <th className="hidden px-4 py-2.5 text-right font-medium lg:table-cell">Temettü</th>
                <th className="px-4 py-2.5 text-right font-medium">Skor</th>
              </tr>
            </thead>
            <tbody>
              {results.map((stock) => (
                <tr key={stock.ticker} className="border-b border-border/30 transition-colors hover:bg-surface-hover">
                  <td className="px-4 py-3">
                    <Link href={`/hisseler/${stock.ticker}`} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 font-mono text-[10px] font-bold text-accent">
                        {stock.ticker.slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-mono text-sm font-bold">{stock.ticker}</div>
                        <div className="text-[10px] text-text-muted">{stock.sector}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium">{formatNumber(stock.price)}</td>
                  <td className={`px-4 py-3 text-right font-mono font-semibold ${stock.changePercent >= 0 ? "text-up" : "text-down"}`}>
                    {formatPercent(stock.changePercent)}
                  </td>
                  <td className="hidden px-4 py-3 text-right font-mono text-text-secondary sm:table-cell">
                    {formatMarketCap(stock.marketCap)}
                  </td>
                  <td className="hidden px-4 py-3 text-right font-mono text-text-secondary md:table-cell">
                    {stock.peRatio.toFixed(1)}x
                  </td>
                  <td className="hidden px-4 py-3 text-right font-mono text-text-secondary md:table-cell">
                    %{stock.roe.toFixed(1)}
                  </td>
                  <td className="hidden px-4 py-3 text-right font-mono text-text-secondary lg:table-cell">
                    %{stock.dividendYield.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border font-mono text-xs font-bold ${
                      stock.overallScore >= 4 ? "border-score-value/20 bg-score-value/15 text-score-value" :
                      stock.overallScore >= 3 ? "border-score-future/20 bg-score-future/15 text-score-future" :
                      "border-score-health/20 bg-score-health/15 text-score-health"
                    }`}>
                      {stock.overallScore.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

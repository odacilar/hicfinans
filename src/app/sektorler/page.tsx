"use client";

import { useState, useMemo } from "react";
import { MOCK_SECTOR_DATA, MOCK_SECTOR_ROTATION } from "@/lib/mock-sector-data";
import { MOCK_STOCKS } from "@/lib/mock-data";
import { formatMarketCap, formatPercent, formatNumber } from "@/lib/formatters";
import Link from "next/link";

// ── Types ──

type SortKey = "performance" | "marketCap" | "pe";
type TableSortKey =
  | "name"
  | "stockCount"
  | "avgChange"
  | "avgPE"
  | "avgPB"
  | "avgROE"
  | "avgDividendYield"
  | "weeklyPerformance"
  | "monthlyPerformance"
  | "ytdPerformance";

// ── Helpers ──

const MOMENTUM_STYLES: Record<string, { bg: string; text: string }> = {
  güçlü: { bg: "bg-up/15", text: "text-up" },
  yükselen: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
  nötr: { bg: "bg-neutral/15", text: "text-neutral" },
  zayıflıyor: { bg: "bg-amber-500/10", text: "text-amber-400" },
  düşüşte: { bg: "bg-down/15", text: "text-down" },
};

function changeClass(v: number) {
  return v > 0 ? "text-up" : v < 0 ? "text-down" : "text-text-muted";
}

function heatColor(v: number): string {
  if (v > 10) return "bg-emerald-500/70";
  if (v > 5) return "bg-emerald-500/50";
  if (v > 2) return "bg-emerald-500/30";
  if (v > 0) return "bg-emerald-500/15";
  if (v > -2) return "bg-red-500/15";
  if (v > -5) return "bg-red-500/30";
  if (v > -10) return "bg-red-500/50";
  return "bg-red-500/70";
}

function columnBest(data: typeof MOCK_SECTOR_DATA, key: TableSortKey, higherIsBetter = true) {
  const vals = data.map((s) => s[key] as number);
  return higherIsBetter ? Math.max(...vals) : Math.min(...vals);
}

function columnWorst(data: typeof MOCK_SECTOR_DATA, key: TableSortKey, higherIsBetter = true) {
  const vals = data.map((s) => s[key] as number);
  return higherIsBetter ? Math.min(...vals) : Math.max(...vals);
}

// ── Page Component ──

export default function SektorlerPage() {
  // Card sorting
  const [cardSort, setCardSort] = useState<SortKey>("marketCap");
  // Table sorting
  const [tableSort, setTableSort] = useState<TableSortKey>("avgChange");
  const [tableSortDir, setTableSortDir] = useState<"asc" | "desc">("desc");
  // Comparison
  const [sectorA, setSectorA] = useState(MOCK_SECTOR_DATA[0]?.name ?? "");
  const [sectorB, setSectorB] = useState(MOCK_SECTOR_DATA[1]?.name ?? "");

  // Sorted cards
  const sortedCards = useMemo(() => {
    const arr = [...MOCK_SECTOR_DATA];
    switch (cardSort) {
      case "performance":
        return arr.sort((a, b) => b.avgChange - a.avgChange);
      case "marketCap":
        return arr.sort((a, b) => b.totalMarketCap - a.totalMarketCap);
      case "pe":
        return arr.sort((a, b) => a.avgPE - b.avgPE);
      default:
        return arr;
    }
  }, [cardSort]);

  // Sorted table
  const sortedTable = useMemo(() => {
    const arr = [...MOCK_SECTOR_DATA];
    return arr.sort((a, b) => {
      const av = a[tableSort] as number | string;
      const bv = b[tableSort] as number | string;
      if (typeof av === "string") return tableSortDir === "asc" ? (av as string).localeCompare(bv as string) : (bv as string).localeCompare(av as string);
      return tableSortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
  }, [tableSort, tableSortDir]);

  function handleTableSort(key: TableSortKey) {
    if (tableSort === key) {
      setTableSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setTableSort(key);
      setTableSortDir("desc");
    }
  }

  const sortIndicator = (key: TableSortKey) =>
    tableSort === key ? (tableSortDir === "desc" ? " ▾" : " ▴") : "";

  // Comparison data
  const dataA = MOCK_SECTOR_DATA.find((s) => s.name === sectorA);
  const dataB = MOCK_SECTOR_DATA.find((s) => s.name === sectorB);
  const stocksA = MOCK_STOCKS.filter((s) => s.sector === sectorA);
  const stocksB = MOCK_STOCKS.filter((s) => s.sector === sectorB);

  // Heatmap sectors (top 12 by market cap for readability)
  const heatmapSectors = MOCK_SECTOR_DATA.slice(0, 12);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* ── A) Header ── */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold gradient-text sm:text-4xl">Sektor Analizi</h1>
        <p className="mt-2 text-text-secondary">
          BIST sektorlerinin karsilastirmali performans, degerlenme ve rotasyon analizi
        </p>
      </div>

      {/* ── B) Sector Overview Cards ── */}
      <section className="mb-12">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Sektor Kartlari</h2>
          <div className="flex gap-1 rounded-xl bg-surface/50 p-1">
            {([
              ["performance", "Performans"],
              ["marketCap", "Piyasa Degeri"],
              ["pe", "F/K"],
            ] as [SortKey, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setCardSort(key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  cardSort === key
                    ? "bg-accent text-white shadow-lg shadow-accent/20"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedCards.map((sector) => {
            const ms = MOMENTUM_STYLES[sector.momentum] ?? MOMENTUM_STYLES.nötr;
            return (
              <div key={sector.name} className="glass-card p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold">{sector.name}</h3>
                    <span className="text-xs text-text-muted">{sector.stockCount} hisse</span>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${ms.bg} ${ms.text}`}>
                    {sector.momentum}
                  </span>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <span className={`font-mono text-lg font-bold ${changeClass(sector.avgChange)}`}>
                    {formatPercent(sector.avgChange)}
                  </span>
                  <span className="text-xs text-text-muted">ort. degisim</span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Piy. Deg.</span>
                    <span className="font-mono">{formatMarketCap(sector.totalMarketCap)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Ort. F/K</span>
                    <span className="font-mono">{formatNumber(sector.avgPE, 1)}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">En Iyi</span>
                    <Link href={`/hisseler/${sector.topStock}`} className="font-mono text-accent hover:underline">
                      {sector.topStock}
                    </Link>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Pay</span>
                    <span className="font-mono">{formatNumber(sector.marketCapShare, 1)}%</span>
                  </div>
                </div>

                {/* Market cap share bar */}
                <div className="mt-3">
                  <div className="h-1 w-full overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full rounded-full bg-accent/60 transition-all"
                      style={{ width: `${Math.min(sector.marketCapShare, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── C) Sector Comparison Table ── */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold">Sektor Karsilastirma Tablosu</h2>
        <div className="glass-card overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-text-muted">
                {([
                  ["name", "Sektor"],
                  ["stockCount", "Hisse"],
                  ["avgChange", "Ort. Degisim"],
                  ["avgPE", "Ort. F/K"],
                  ["avgPB", "Ort. PD/DD"],
                  ["avgROE", "Ort. ROE"],
                  ["avgDividendYield", "Ort. Temettu"],
                  ["weeklyPerformance", "Haftalik"],
                  ["monthlyPerformance", "Aylik"],
                  ["ytdPerformance", "YTD"],
                ] as [TableSortKey, string][]).map(([key, label]) => (
                  <th
                    key={key}
                    className={`cursor-pointer whitespace-nowrap px-4 py-3 font-medium transition-colors hover:text-text-secondary ${
                      key === "name" ? "text-left" : "text-right"
                    }`}
                    onClick={() => handleTableSort(key)}
                  >
                    {label}{sortIndicator(key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedTable.map((sector) => {
                // Highlight best/worst per numeric column
                const highlights: Record<string, string> = {};
                const numericCols: { key: TableSortKey; higher: boolean }[] = [
                  { key: "avgChange", higher: true },
                  { key: "avgPE", higher: false },
                  { key: "avgPB", higher: false },
                  { key: "avgROE", higher: true },
                  { key: "avgDividendYield", higher: true },
                  { key: "weeklyPerformance", higher: true },
                  { key: "monthlyPerformance", higher: true },
                  { key: "ytdPerformance", higher: true },
                ];
                for (const { key, higher } of numericCols) {
                  const val = sector[key] as number;
                  if (val === columnBest(MOCK_SECTOR_DATA, key, higher)) highlights[key] = "text-up font-semibold";
                  else if (val === columnWorst(MOCK_SECTOR_DATA, key, higher)) highlights[key] = "text-down font-semibold";
                }

                return (
                  <tr key={sector.name} className="table-row-hover border-b border-border/30">
                    <td className="whitespace-nowrap px-4 py-3 font-medium">{sector.name}</td>
                    <td className="px-4 py-3 text-right font-mono">{sector.stockCount}</td>
                    <td className={`px-4 py-3 text-right font-mono ${highlights.avgChange ?? changeClass(sector.avgChange)}`}>
                      {formatPercent(sector.avgChange)}
                    </td>
                    <td className={`px-4 py-3 text-right font-mono ${highlights.avgPE ?? ""}`}>
                      {formatNumber(sector.avgPE, 1)}x
                    </td>
                    <td className={`px-4 py-3 text-right font-mono ${highlights.avgPB ?? ""}`}>
                      {formatNumber(sector.avgPB, 1)}x
                    </td>
                    <td className={`px-4 py-3 text-right font-mono ${highlights.avgROE ?? ""}`}>
                      %{formatNumber(sector.avgROE, 1)}
                    </td>
                    <td className={`px-4 py-3 text-right font-mono ${highlights.avgDividendYield ?? ""}`}>
                      %{formatNumber(sector.avgDividendYield, 1)}
                    </td>
                    <td className={`px-4 py-3 text-right font-mono ${highlights.weeklyPerformance ?? changeClass(sector.weeklyPerformance)}`}>
                      {formatPercent(sector.weeklyPerformance)}
                    </td>
                    <td className={`px-4 py-3 text-right font-mono ${highlights.monthlyPerformance ?? changeClass(sector.monthlyPerformance)}`}>
                      {formatPercent(sector.monthlyPerformance)}
                    </td>
                    <td className={`px-4 py-3 text-right font-mono ${highlights.ytdPerformance ?? changeClass(sector.ytdPerformance)}`}>
                      {formatPercent(sector.ytdPerformance)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── D) Sector Rotation Heatmap ── */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold">Sektor Rotasyonu</h2>
        <p className="mb-4 text-sm text-text-muted">
          Son 6 ceyrek bazinda sektor performanslari. Yesil = pozitif, kirmizi = negatif.
        </p>
        <div className="glass-card overflow-x-auto p-4">
          <table className="w-full min-w-[700px] text-xs">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-text-muted font-medium">Sektor</th>
                {MOCK_SECTOR_ROTATION.map((q) => (
                  <th key={q.period} className="px-3 py-2 text-center text-text-muted font-medium font-mono">
                    {q.period}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatmapSectors.map((sector) => (
                <tr key={sector.name} className="border-t border-border/20">
                  <td className="whitespace-nowrap px-3 py-2 font-medium text-text-secondary">
                    {sector.name}
                  </td>
                  {MOCK_SECTOR_ROTATION.map((q) => {
                    const entry = q.sectors.find((s) => s.name === sector.name);
                    const perf = entry?.performance ?? 0;
                    return (
                      <td key={q.period} className="px-1 py-1 text-center">
                        <div
                          className={`mx-auto flex h-9 w-full items-center justify-center rounded-md font-mono font-semibold transition-colors ${heatColor(perf)} ${
                            perf >= 0 ? "text-emerald-200" : "text-red-200"
                          }`}
                        >
                          {perf > 0 ? "+" : ""}
                          {perf.toFixed(1)}%
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── E) Sector vs Sector Comparison ── */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold">Sektor Karsilastirma</h2>
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <select
            value={sectorA}
            onChange={(e) => setSectorA(e.target.value)}
            className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent"
          >
            {MOCK_SECTOR_DATA.map((s) => (
              <option key={s.name} value={s.name}>{s.name}</option>
            ))}
          </select>
          <span className="text-lg font-bold text-accent">vs</span>
          <select
            value={sectorB}
            onChange={(e) => setSectorB(e.target.value)}
            className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent"
          >
            {MOCK_SECTOR_DATA.map((s) => (
              <option key={s.name} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>

        {dataA && dataB && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Side by side stats */}
            {[
              { data: dataA, stocks: stocksA },
              { data: dataB, stocks: stocksB },
            ].map(({ data, stocks }) => (
              <div key={data.name} className="glass-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{data.name}</h3>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${MOMENTUM_STYLES[data.momentum]?.bg} ${MOMENTUM_STYLES[data.momentum]?.text}`}>
                    {data.momentum}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {([
                    ["Hisse Sayisi", data.stockCount.toString()],
                    ["Piy. Degeri", formatMarketCap(data.totalMarketCap)],
                    ["Ort. Degisim", formatPercent(data.avgChange)],
                    ["Ort. F/K", `${formatNumber(data.avgPE, 1)}x`],
                    ["Ort. PD/DD", `${formatNumber(data.avgPB, 1)}x`],
                    ["Ort. ROE", `%${formatNumber(data.avgROE, 1)}`],
                    ["Ort. Temettu", `%${formatNumber(data.avgDividendYield, 1)}`],
                    ["Ort. Net Marj", `%${formatNumber(data.avgNetMargin, 1)}`],
                    ["Haftalik", formatPercent(data.weeklyPerformance)],
                    ["Aylik", formatPercent(data.monthlyPerformance)],
                    ["YTD", formatPercent(data.ytdPerformance)],
                    ["BIST Payi", `%${formatNumber(data.marketCapShare, 1)}`],
                  ] as [string, string][]).map(([label, value]) => (
                    <div key={label} className="flex justify-between rounded-lg bg-surface/50 px-3 py-2">
                      <span className="text-text-muted">{label}</span>
                      <span className="font-mono font-medium">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Stock list */}
                <div className="mt-4">
                  <h4 className="mb-2 text-xs font-medium text-text-muted uppercase tracking-wider">Hisseler</h4>
                  <div className="flex flex-wrap gap-2">
                    {stocks
                      .sort((a, b) => b.marketCap - a.marketCap)
                      .map((st) => (
                        <Link
                          key={st.ticker}
                          href={`/hisseler/${st.ticker}`}
                          className="flex items-center gap-1.5 rounded-lg bg-surface/70 px-2.5 py-1.5 text-xs transition-colors hover:bg-surface-hover"
                        >
                          <span className="font-mono font-semibold text-accent">{st.ticker}</span>
                          <span className={`font-mono ${changeClass(st.changePercent)}`}>
                            {formatPercent(st.changePercent)}
                          </span>
                        </Link>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Disclaimer */}
      <p className="text-center text-xs text-text-muted">
        Veriler bilgilendirme amacidir, yatirim tavsiyesi degildir. HiC Finans &copy; {new Date().getFullYear()} focusoda.com
      </p>
    </main>
  );
}

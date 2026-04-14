"use client";

import { useState, useMemo, useCallback } from "react";
import { MOCK_STOCKS } from "@/lib/mock-data";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/formatters";

// ─── Types ───────────────────────────────────────────────
interface Position {
  id: string;
  ticker: string;
  quantity: number;
  buyPrice: number;
}

type SortKey =
  | "ticker"
  | "name"
  | "quantity"
  | "buyPrice"
  | "currentPrice"
  | "pnl"
  | "pnlPercent"
  | "dailyChange"
  | "weight";

type SortDir = "asc" | "desc";

// ─── Helpers ─────────────────────────────────────────────
function stockByTicker(ticker: string) {
  return MOCK_STOCKS.find((s) => s.ticker === ticker);
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const SECTOR_COLORS: Record<string, string> = {
  "Bankacılık": "#3B82F6",
  "Holding ve Yatırım": "#8B5CF6",
  "Ulaştırma": "#10B981",
  "Savunma": "#F59E0B",
  "Teknoloji": "#06B6D4",
  "Telekomünikasyon": "#EC4899",
  "Enerji": "#EF4444",
  "Perakende Ticaret": "#F97316",
  "Gıda ve İçecek": "#84CC16",
  "Demir, Çelik ve Metal": "#6B7280",
  "Cam": "#14B8A6",
  "Kimya, Petrol ve Plastik": "#A855F7",
  "Otomotiv": "#D946EF",
  "İnşaat": "#78716C",
  "Sigorta": "#0EA5E9",
  "Tekstil": "#FB923C",
  "Sağlık": "#22D3EE",
  "Madencilik": "#A3A3A3",
  "Havacılık": "#2DD4BF",
  "Diğer": "#525252",
};

function sectorColor(sector: string): string {
  return SECTOR_COLORS[sector] ?? "#525252";
}

// ─── Default demo portfolio ──────────────────────────────
const DEMO_POSITIONS: Position[] = [
  { id: uid(), ticker: "THYAO", quantity: 100, buyPrice: 280 },
  { id: uid(), ticker: "GARAN", quantity: 500, buyPrice: 118 },
  { id: uid(), ticker: "ASELS", quantity: 200, buyPrice: 72 },
  { id: uid(), ticker: "BIMAS", quantity: 50, buyPrice: 450 },
  { id: uid(), ticker: "KCHOL", quantity: 150, buyPrice: 175 },
  { id: uid(), ticker: "TUPRS", quantity: 80, buyPrice: 165 },
];

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════
export default function PortfolioPage() {
  const [positions, setPositions] = useState<Position[]>(DEMO_POSITIONS);
  const [sortKey, setSortKey] = useState<SortKey>("weight");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Form state
  const [selectedTicker, setSelectedTicker] = useState("");
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // ── Derived data ───────────────────────────────────────
  const enriched = useMemo(() => {
    return positions
      .map((p) => {
        const stock = stockByTicker(p.ticker);
        if (!stock) return null;
        const currentPrice = stock.price;
        const cost = p.quantity * p.buyPrice;
        const currentValue = p.quantity * currentPrice;
        const pnl = currentValue - cost;
        const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;
        const dailyChange = p.quantity * stock.change;
        const dailyChangePercent = stock.changePercent;
        return {
          ...p,
          stock,
          currentPrice,
          cost,
          currentValue,
          pnl,
          pnlPercent,
          dailyChange,
          dailyChangePercent,
          weight: 0,
        };
      })
      .filter(<T,>(v: T): v is NonNullable<T> => v != null);
  }, [positions]);

  const totalValue = useMemo(
    () => enriched.reduce((s, e) => s + e.currentValue, 0),
    [enriched]
  );

  const withWeights = useMemo(
    () =>
      enriched.map((e) => ({
        ...e,
        weight: totalValue > 0 ? (e.currentValue / totalValue) * 100 : 0,
      })),
    [enriched, totalValue]
  );

  const totalCost = useMemo(
    () => withWeights.reduce((s, e) => s + e.cost, 0),
    [withWeights]
  );
  const totalPnl = totalValue - totalCost;
  const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
  const totalDailyChange = useMemo(
    () => withWeights.reduce((s, e) => s + e.dailyChange, 0),
    [withWeights]
  );
  const totalDailyChangePercent =
    totalValue - totalDailyChange > 0
      ? (totalDailyChange / (totalValue - totalDailyChange)) * 100
      : 0;

  const bestPosition = useMemo(
    () =>
      withWeights.length > 0
        ? withWeights.reduce((best, e) => (e.pnlPercent > best.pnlPercent ? e : best))
        : null,
    [withWeights]
  );
  const worstPosition = useMemo(
    () =>
      withWeights.length > 0
        ? withWeights.reduce((worst, e) => (e.pnlPercent < worst.pnlPercent ? e : worst))
        : null,
    [withWeights]
  );

  // ── Sorting ────────────────────────────────────────────
  const sorted = useMemo(() => {
    const arr = [...withWeights];
    arr.sort((a, b) => {
      let va: number | string = 0;
      let vb: number | string = 0;
      switch (sortKey) {
        case "ticker":
          va = a.ticker;
          vb = b.ticker;
          break;
        case "name":
          va = a.stock.name;
          vb = b.stock.name;
          break;
        case "quantity":
          va = a.quantity;
          vb = b.quantity;
          break;
        case "buyPrice":
          va = a.buyPrice;
          vb = b.buyPrice;
          break;
        case "currentPrice":
          va = a.currentPrice;
          vb = b.currentPrice;
          break;
        case "pnl":
          va = a.pnl;
          vb = b.pnl;
          break;
        case "pnlPercent":
          va = a.pnlPercent;
          vb = b.pnlPercent;
          break;
        case "dailyChange":
          va = a.dailyChange;
          vb = b.dailyChange;
          break;
        case "weight":
          va = a.weight;
          vb = b.weight;
          break;
      }
      if (typeof va === "string" && typeof vb === "string") {
        return sortDir === "asc" ? va.localeCompare(vb, "tr") : vb.localeCompare(va, "tr");
      }
      return sortDir === "asc" ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });
    return arr;
  }, [withWeights, sortKey, sortDir]);

  // ── Sector breakdown ───────────────────────────────────
  const sectorBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    withWeights.forEach((e) => {
      map.set(e.stock.sector, (map.get(e.stock.sector) ?? 0) + e.currentValue);
    });
    return Array.from(map.entries())
      .map(([sector, value]) => ({
        sector,
        value,
        weight: totalValue > 0 ? (value / totalValue) * 100 : 0,
      }))
      .sort((a, b) => b.weight - a.weight);
  }, [withWeights, totalValue]);

  // ── Portfolio score ────────────────────────────────────
  const portfolioScore = useMemo(() => {
    if (withWeights.length === 0) return 0;
    const weightedSum = withWeights.reduce(
      (s, e) => s + e.stock.overallScore * e.currentValue,
      0
    );
    return totalValue > 0 ? weightedSum / totalValue : 0;
  }, [withWeights, totalValue]);

  // ── Risk analysis ──────────────────────────────────────
  const riskAnalysis = useMemo(() => {
    const uniqueSectors = new Set(withWeights.map((e) => e.stock.sector)).size;
    const maxSectors = Math.min(withWeights.length, 10);
    const diversificationScore =
      maxSectors > 1
        ? Math.min(100, Math.round(((uniqueSectors - 1) / (maxSectors - 1)) * 100))
        : 0;

    const maxWeight = withWeights.length > 0 ? Math.max(...withWeights.map((e) => e.weight)) : 0;

    const topSector = sectorBreakdown.length > 0 ? sectorBreakdown[0] : null;

    const suggestions: string[] = [];
    if (maxWeight > 30) {
      const heavy = withWeights.find((e) => e.weight === maxWeight);
      suggestions.push(
        `${heavy?.ticker ?? "Bir hisse"} portfoyun %${maxWeight.toFixed(0)}'ini oluşturuyor. Konsantrasyon riski yuksek.`
      );
    }
    if (topSector && topSector.weight > 40) {
      suggestions.push(
        `Portfoyunuz ${topSector.sector} sektorunde yogunlasmis (%${topSector.weight.toFixed(0)}). Cesitlendirme onerilir.`
      );
    }
    if (uniqueSectors < 3 && withWeights.length >= 3) {
      suggestions.push(
        "Farkli sektorlerden hisse ekleyerek portfoyunuzu cesitlendirebilirsiniz."
      );
    }
    if (withWeights.length < 5) {
      suggestions.push("En az 5-8 farkli hisse ile portfoy cesitlendirmesi saglayin.");
    }
    if (suggestions.length === 0) {
      suggestions.push("Portfoyunuz iyi cesitlendirilmis gorunuyor.");
    }

    return { diversificationScore, maxWeight, topSector, suggestions };
  }, [withWeights, sectorBreakdown]);

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

  const addPosition = useCallback(() => {
    if (!selectedTicker || !quantity || !buyPrice) return;
    const qty = parseFloat(quantity);
    const bp = parseFloat(buyPrice);
    if (isNaN(qty) || isNaN(bp) || qty <= 0 || bp <= 0) return;
    setPositions((prev) => [
      ...prev,
      { id: uid(), ticker: selectedTicker, quantity: qty, buyPrice: bp },
    ]);
    setSelectedTicker("");
    setQuantity("");
    setBuyPrice("");
    setSearchQuery("");
  }, [selectedTicker, quantity, buyPrice]);

  const removePosition = useCallback((id: string) => {
    setPositions((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const filteredStocks = useMemo(() => {
    if (!searchQuery) return MOCK_STOCKS.slice(0, 10);
    const q = searchQuery.toUpperCase();
    return MOCK_STOCKS.filter(
      (s) => s.ticker.includes(q) || s.name.toUpperCase().includes(q)
    ).slice(0, 10);
  }, [searchQuery]);

  // ── Conic gradient for donut ───────────────────────────
  const conicGradient = useMemo(() => {
    if (sectorBreakdown.length === 0) return "conic-gradient(var(--color-border) 0% 100%)";
    let accumulated = 0;
    const stops = sectorBreakdown.map((s) => {
      const start = accumulated;
      accumulated += s.weight;
      return `${sectorColor(s.sector)} ${start}% ${accumulated}%`;
    });
    return `conic-gradient(${stops.join(", ")})`;
  }, [sectorBreakdown]);

  // ── Sort indicator ─────────────────────────────────────
  function SortIcon({ column }: { column: SortKey }) {
    if (sortKey !== column) return <span className="ml-1 text-text-muted/40">&#8693;</span>;
    return (
      <span className="ml-1 text-accent">
        {sortDir === "asc" ? "▲" : "▼"}
      </span>
    );
  }

  // ═══════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════
  return (
    <div className="hero-gradient min-h-screen">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        {/* ── Header ────────────────────────────────────── */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight gradient-text">
            Portfoy Takibi
          </h1>
          <p className="text-sm text-text-muted">
            Portfoyunuzu olusturun, anlik kar/zarar ve risk analizini goruntuleyun
          </p>
        </div>

        {/* ── Add Position Form ─────────────────────────── */}
        <div className="glass-card p-5">
          <h2 className="mb-4 text-sm font-bold text-text-secondary">Pozisyon Ekle</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            {/* Stock search dropdown */}
            <div className="relative flex-1">
              <label className="mb-1 block text-xs text-text-muted">Hisse</label>
              <input
                type="text"
                placeholder="Hisse ara (ornegin THYAO)..."
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 outline-none focus:border-accent/50 transition-colors"
                value={selectedTicker ? selectedTicker : searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedTicker("");
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
              />
              {showDropdown && !selectedTicker && (
                <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-border bg-surface shadow-xl">
                  {filteredStocks.map((s) => (
                    <button
                      key={s.ticker}
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface-hover transition-colors"
                      onClick={() => {
                        setSelectedTicker(s.ticker);
                        setSearchQuery("");
                        setShowDropdown(false);
                        // Pre-fill current price as buy price suggestion
                        if (!buyPrice) setBuyPrice(s.price.toFixed(2));
                      }}
                    >
                      <span className="font-mono font-bold text-accent">{s.ticker}</span>
                      <span className="truncate text-text-muted text-xs">{s.name}</span>
                      <span className="ml-auto font-mono text-xs">
                        {formatCurrency(s.price)}
                      </span>
                    </button>
                  ))}
                  {filteredStocks.length === 0 && (
                    <div className="px-3 py-2 text-xs text-text-muted">
                      Hisse bulunamadi
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="w-full sm:w-32">
              <label className="mb-1 block text-xs text-text-muted">Adet</label>
              <input
                type="number"
                min="1"
                placeholder="100"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm text-text-primary placeholder:text-text-muted/50 outline-none focus:border-accent/50 transition-colors"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div className="w-full sm:w-36">
              <label className="mb-1 block text-xs text-text-muted">Alis Fiyati (TL)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="280.00"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm text-text-primary placeholder:text-text-muted/50 outline-none focus:border-accent/50 transition-colors"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
              />
            </div>

            <button
              onClick={addPosition}
              disabled={!selectedTicker || !quantity || !buyPrice}
              className="rounded-lg bg-accent px-6 py-2 text-sm font-bold text-white transition-all hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Ekle
            </button>
          </div>
        </div>

        {/* ── Summary Cards ─────────────────────────────── */}
        {withWeights.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {/* Toplam Deger */}
              <div className="glass-card p-4">
                <span className="text-[11px] font-medium tracking-wide text-text-muted uppercase">
                  Toplam Deger
                </span>
                <div className="mt-2 font-mono text-xl font-bold tracking-tight">
                  {formatCurrency(totalValue)}
                </div>
              </div>

              {/* Toplam Maliyet */}
              <div className="glass-card p-4">
                <span className="text-[11px] font-medium tracking-wide text-text-muted uppercase">
                  Toplam Maliyet
                </span>
                <div className="mt-2 font-mono text-xl font-bold tracking-tight">
                  {formatCurrency(totalCost)}
                </div>
              </div>

              {/* Toplam K/Z */}
              <div className="glass-card p-4">
                <span className="text-[11px] font-medium tracking-wide text-text-muted uppercase">
                  Toplam Kar/Zarar
                </span>
                <div
                  className={`mt-2 font-mono text-xl font-bold tracking-tight ${
                    totalPnl >= 0 ? "text-up" : "text-down"
                  }`}
                >
                  {totalPnl >= 0 ? "+" : ""}
                  {formatCurrency(totalPnl)}
                </div>
                <div
                  className={`font-mono text-xs font-semibold ${
                    totalPnlPercent >= 0 ? "text-up" : "text-down"
                  }`}
                >
                  {formatPercent(totalPnlPercent)}
                </div>
              </div>

              {/* Gunluk Degisim */}
              <div className="glass-card p-4">
                <span className="text-[11px] font-medium tracking-wide text-text-muted uppercase">
                  Gunluk Degisim
                </span>
                <div
                  className={`mt-2 font-mono text-xl font-bold tracking-tight ${
                    totalDailyChange >= 0 ? "text-up" : "text-down"
                  }`}
                >
                  {totalDailyChange >= 0 ? "+" : ""}
                  {formatCurrency(totalDailyChange)}
                </div>
                <div
                  className={`font-mono text-xs font-semibold ${
                    totalDailyChangePercent >= 0 ? "text-up" : "text-down"
                  }`}
                >
                  {formatPercent(totalDailyChangePercent)}
                </div>
              </div>

              {/* Pozisyon Sayisi */}
              <div className="glass-card p-4">
                <span className="text-[11px] font-medium tracking-wide text-text-muted uppercase">
                  Pozisyon Sayisi
                </span>
                <div className="mt-2 font-mono text-xl font-bold tracking-tight">
                  {withWeights.length}
                </div>
                <div className="text-xs text-text-muted">
                  {sectorBreakdown.length} sektor
                </div>
              </div>

              {/* En Karli / En Zararli */}
              <div className="glass-card p-4">
                <span className="text-[11px] font-medium tracking-wide text-text-muted uppercase">
                  En Karli / Zararli
                </span>
                {bestPosition && (
                  <div className="mt-2 flex items-center gap-1">
                    <span className="font-mono text-xs font-bold text-up">
                      {bestPosition.ticker}
                    </span>
                    <span className="font-mono text-xs text-up">
                      {formatPercent(bestPosition.pnlPercent)}
                    </span>
                  </div>
                )}
                {worstPosition && (
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs font-bold text-down">
                      {worstPosition.ticker}
                    </span>
                    <span className="font-mono text-xs text-down">
                      {formatPercent(worstPosition.pnlPercent)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Holdings Table ───────────────────────────── */}
            <div className="glass-card overflow-hidden">
              <div className="border-b border-border/50 px-5 py-3">
                <h2 className="text-sm font-bold">Pozisyonlar</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/30 text-xs text-text-muted">
                      {([
                        ["ticker", "Hisse"],
                        ["name", "Ad"],
                        ["quantity", "Adet"],
                        ["buyPrice", "Alis Fiyati"],
                        ["currentPrice", "Guncel Fiyat"],
                        ["pnl", "K/Z (TL)"],
                        ["pnlPercent", "K/Z (%)"],
                        ["dailyChange", "Gunluk"],
                        ["weight", "Agirlik"],
                      ] as [SortKey, string][]).map(([key, label]) => (
                        <th
                          key={key}
                          className="cursor-pointer select-none whitespace-nowrap px-3 py-3 text-right first:text-left hover:text-text-primary transition-colors"
                          onClick={() => handleSort(key)}
                        >
                          {label}
                          <SortIcon column={key} />
                        </th>
                      ))}
                      <th className="px-3 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((row) => (
                      <tr
                        key={row.id}
                        className="table-row-hover border-b border-border/20 last:border-0"
                      >
                        <td className="px-3 py-3 text-left">
                          <span className="font-mono font-bold text-accent">
                            {row.ticker}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <span className="truncate text-xs text-text-muted max-w-[120px] inline-block">
                            {row.stock.name.split(" ").slice(0, 2).join(" ")}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right font-mono">
                          {formatNumber(row.quantity, 0)}
                        </td>
                        <td className="px-3 py-3 text-right font-mono">
                          {formatCurrency(row.buyPrice)}
                        </td>
                        <td className="px-3 py-3 text-right font-mono">
                          {formatCurrency(row.currentPrice)}
                        </td>
                        <td
                          className={`px-3 py-3 text-right font-mono font-semibold ${
                            row.pnl >= 0 ? "text-up" : "text-down"
                          }`}
                        >
                          {row.pnl >= 0 ? "+" : ""}
                          {formatCurrency(row.pnl)}
                        </td>
                        <td
                          className={`px-3 py-3 text-right font-mono font-semibold ${
                            row.pnlPercent >= 0 ? "text-up" : "text-down"
                          }`}
                        >
                          {formatPercent(row.pnlPercent)}
                        </td>
                        <td
                          className={`px-3 py-3 text-right font-mono text-xs ${
                            row.dailyChange >= 0 ? "text-up" : "text-down"
                          }`}
                        >
                          {formatPercent(row.dailyChangePercent)}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-border/50">
                              <div
                                className="h-full rounded-full bg-accent"
                                style={{ width: `${Math.min(row.weight, 100)}%` }}
                              />
                            </div>
                            <span className="font-mono text-xs text-text-muted w-10 text-right">
                              %{row.weight.toFixed(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => removePosition(row.id)}
                            className="flex h-6 w-6 items-center justify-center rounded-md text-text-muted/60 hover:bg-down/15 hover:text-down transition-all"
                            title="Pozisyonu sil"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {sorted.length === 0 && (
                  <div className="px-5 py-10 text-center text-sm text-text-muted">
                    Portfoyunuzde henuz pozisyon yok. Yukaridaki formu kullanarak ekleyin.
                  </div>
                )}
              </div>
            </div>

            {/* ── Visualizations ───────────────────────────── */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Sektor dagilimi — donut */}
              <div className="glass-card p-5">
                <h3 className="mb-4 text-sm font-bold">Sektor Dagilimi</h3>
                <div className="flex items-center gap-6">
                  <div
                    className="relative h-40 w-40 shrink-0 rounded-full"
                    style={{ background: conicGradient }}
                  >
                    <div className="absolute inset-6 flex items-center justify-center rounded-full bg-surface">
                      <span className="font-mono text-xs font-bold text-text-muted">
                        {sectorBreakdown.length} Sektor
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 min-w-0">
                    {sectorBreakdown.map((s) => (
                      <div key={s.sector} className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-sm"
                          style={{ backgroundColor: sectorColor(s.sector) }}
                        />
                        <span className="truncate text-xs text-text-muted">{s.sector}</span>
                        <span className="ml-auto font-mono text-xs font-semibold">
                          %{s.weight.toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hisse dagilimi — horizontal bars */}
              <div className="glass-card p-5">
                <h3 className="mb-4 text-sm font-bold">Hisse Dagilimi</h3>
                <div className="space-y-2.5">
                  {[...withWeights]
                    .sort((a, b) => b.weight - a.weight)
                    .map((e) => (
                      <div key={e.id} className="flex items-center gap-3">
                        <span className="w-14 font-mono text-xs font-bold text-accent">
                          {e.ticker}
                        </span>
                        <div className="flex-1 h-4 overflow-hidden rounded-full bg-border/30">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(e.weight, 100)}%`,
                              backgroundColor: sectorColor(e.stock.sector),
                            }}
                          />
                        </div>
                        <span className="w-12 text-right font-mono text-xs text-text-muted">
                          %{e.weight.toFixed(1)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* K/Z dagilimi — horizontal bars */}
              <div className="glass-card p-5">
                <h3 className="mb-4 text-sm font-bold">Kar/Zarar Dagilimi</h3>
                <div className="space-y-2.5">
                  {[...withWeights]
                    .sort((a, b) => b.pnlPercent - a.pnlPercent)
                    .map((e) => {
                      const isProfit = e.pnlPercent >= 0;
                      const absPercent = Math.abs(e.pnlPercent);
                      const maxAbsPnl = Math.max(
                        ...withWeights.map((w) => Math.abs(w.pnlPercent)),
                        1
                      );
                      const barWidth = (absPercent / maxAbsPnl) * 100;

                      return (
                        <div key={e.id} className="flex items-center gap-3">
                          <span className="w-14 font-mono text-xs font-bold text-accent">
                            {e.ticker}
                          </span>
                          <div className="flex-1 flex items-center">
                            {/* Center-aligned bar: left half for loss, right half for profit */}
                            <div className="relative h-4 w-full">
                              <div className="absolute inset-0 flex">
                                <div className="w-1/2 flex justify-end">
                                  {!isProfit && (
                                    <div
                                      className="h-4 rounded-l-full bg-down/70"
                                      style={{ width: `${barWidth}%` }}
                                    />
                                  )}
                                </div>
                                <div className="w-px bg-border/50" />
                                <div className="w-1/2">
                                  {isProfit && (
                                    <div
                                      className="h-4 rounded-r-full bg-up/70"
                                      style={{ width: `${barWidth}%` }}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <span
                            className={`w-16 text-right font-mono text-xs font-semibold ${
                              isProfit ? "text-up" : "text-down"
                            }`}
                          >
                            {formatPercent(e.pnlPercent)}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Portfolio score ring */}
              <div className="glass-card p-5 flex flex-col items-center justify-center">
                <h3 className="mb-4 text-sm font-bold self-start">Portfoy Skoru</h3>
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="score-ring relative flex h-32 w-32 items-center justify-center rounded-full p-[5px]"
                    style={
                      {
                        "--ring-color": "#10B981",
                        "--ring-pct": (portfolioScore / 5) * 100,
                      } as React.CSSProperties
                    }
                  >
                    <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-surface">
                      <span className="font-mono text-3xl font-bold text-score-value">
                        {portfolioScore.toFixed(1)}
                      </span>
                      <span className="text-[10px] text-text-muted">/ 5.0</span>
                    </div>
                  </div>
                  <p className="text-xs text-text-muted text-center max-w-[220px]">
                    Agirlikli ortalama snowflake skoru (portfoydeki her hissenin skor x agirligina gore)
                  </p>
                </div>
              </div>
            </div>

            {/* ── Risk Analysis ────────────────────────────── */}
            <div className="glass-card p-5">
              <h3 className="mb-4 text-sm font-bold">Risk Analizi</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                {/* Diversifikasyon skoru */}
                <div className="rounded-xl bg-surface/50 p-4">
                  <div className="text-xs text-text-muted mb-2">Cesitlendirme Skoru</div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-border/50 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${riskAnalysis.diversificationScore}%`,
                          backgroundColor:
                            riskAnalysis.diversificationScore > 60
                              ? "#10B981"
                              : riskAnalysis.diversificationScore > 30
                                ? "#F59E0B"
                                : "#EF4444",
                        }}
                      />
                    </div>
                    <span className="font-mono text-lg font-bold">
                      {riskAnalysis.diversificationScore}
                    </span>
                  </div>
                </div>

                {/* En buyuk pozisyon */}
                <div className="rounded-xl bg-surface/50 p-4">
                  <div className="text-xs text-text-muted mb-2">
                    En Buyuk Pozisyon Agirligi
                  </div>
                  <div className="font-mono text-lg font-bold">
                    %{riskAnalysis.maxWeight.toFixed(1)}
                  </div>
                  <div className="text-xs text-text-muted">
                    {riskAnalysis.maxWeight > 30 ? (
                      <span className="text-down">Yuksek konsantrasyon</span>
                    ) : (
                      <span className="text-up">Dengeli</span>
                    )}
                  </div>
                </div>

                {/* Sektor yogunlasmasi */}
                <div className="rounded-xl bg-surface/50 p-4">
                  <div className="text-xs text-text-muted mb-2">Sektor Yogunlasmasi</div>
                  {riskAnalysis.topSector && (
                    <>
                      <div className="font-mono text-lg font-bold">
                        %{riskAnalysis.topSector.weight.toFixed(1)}
                      </div>
                      <div className="text-xs text-text-muted">
                        {riskAnalysis.topSector.sector}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Oneriler */}
              <div className="mt-4 space-y-2">
                {riskAnalysis.suggestions.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded-lg bg-surface/40 px-3 py-2"
                  >
                    <span className="mt-0.5 text-xs text-accent">&#9679;</span>
                    <span className="text-xs text-text-secondary">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-center text-[10px] text-text-muted/60">
              Yatirim tavsiyesi niteligi tasimaz. Veriler bilgilendirme amaçlidir ve gecikme icerebilir.
            </p>
          </>
        )}

        {withWeights.length === 0 && (
          <div className="glass-card flex flex-col items-center justify-center py-16">
            <div className="text-4xl mb-3 opacity-30">&#9733;</div>
            <h3 className="text-sm font-bold text-text-secondary">Portfoyunuz Bos</h3>
            <p className="mt-1 text-xs text-text-muted">
              Yukaridaki formu kullanarak hisse ekleyin
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

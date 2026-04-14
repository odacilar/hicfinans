"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MOCK_TEFAS_FUNDS, type TefasFund } from "@/lib/mock-tefas-data";

// ── Sub Navigation ──
function FonlarSubNav() {
  const pathname = usePathname();
  const tabs = [
    { href: "/fonlar", label: "Fon Yöneticileri" },
    { href: "/fonlar/tefas", label: "TEFAS Analizi" },
    { href: "/fonlar/karsilastir", label: "Karşılaştır" },
  ];

  return (
    <div className="flex gap-2">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              isActive
                ? "bg-gradient-to-r from-accent to-blue-700 text-white shadow-lg shadow-accent/25"
                : "glass-card !rounded-xl text-text-muted hover:text-text-primary"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

// ── Helpers ──
function formatAum(value: number): string {
  if (value >= 1_000_000_000) return `₺${(value / 1_000_000_000).toFixed(1)} Mr`;
  if (value >= 1_000_000) return `₺${(value / 1_000_000).toFixed(0)} Mn`;
  return `₺${value.toLocaleString("tr-TR")}`;
}

function RiskDots({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 7 }, (_, i) => (
        <div
          key={i}
          className={`h-2 w-2 rounded-full ${
            i < level
              ? level <= 2 ? "bg-up" : level <= 4 ? "bg-score-health" : "bg-down"
              : "bg-border/40"
          }`}
        />
      ))}
    </div>
  );
}

// ── Comparison Row ──
interface CompRow {
  label: string;
  getValue: (f: TefasFund) => string | number;
  format?: (v: string | number) => string;
  colorize?: boolean; // green=high is good
  reverseColor?: boolean; // green=low is good (fees, risk, drawdown)
  isRisk?: boolean;
}

const COMP_ROWS: CompRow[] = [
  { label: "Fon Tipi", getValue: (f) => f.type },
  { label: "Yönetici", getValue: (f) => f.manager },
  { label: "Risk Seviyesi", getValue: (f) => f.riskLevel, reverseColor: true },
  { label: "Günlük Getiri", getValue: (f) => f.returnDaily, format: (v) => `${Number(v) >= 0 ? "+" : ""}${Number(v).toFixed(2)}%`, colorize: true },
  { label: "Haftalık Getiri", getValue: (f) => f.returnWeekly, format: (v) => `${Number(v) >= 0 ? "+" : ""}${Number(v).toFixed(2)}%`, colorize: true },
  { label: "Aylık Getiri", getValue: (f) => f.returnMonthly, format: (v) => `${Number(v) >= 0 ? "+" : ""}${Number(v).toFixed(1)}%`, colorize: true },
  { label: "YTD Getiri", getValue: (f) => f.returnYtd, format: (v) => `${Number(v) >= 0 ? "+" : ""}${Number(v).toFixed(1)}%`, colorize: true },
  { label: "1 Yıl Getiri", getValue: (f) => f.return1y, format: (v) => `${Number(v) >= 0 ? "+" : ""}${Number(v).toFixed(1)}%`, colorize: true },
  { label: "3 Yıl Getiri", getValue: (f) => f.return3y, format: (v) => `${Number(v) >= 0 ? "+" : ""}${Number(v).toFixed(1)}%`, colorize: true },
  { label: "AUM", getValue: (f) => f.aum, format: (v) => formatAum(Number(v)) },
  { label: "Yatırımcı Sayısı", getValue: (f) => f.investorCount, format: (v) => Number(v).toLocaleString("tr-TR") },
  { label: "Yönetim Ücreti", getValue: (f) => f.managementFee, format: (v) => `%${Number(v).toFixed(2)}`, reverseColor: true },
  { label: "Sharpe Oranı", getValue: (f) => f.sharpeRatio, format: (v) => Number(v).toFixed(2), colorize: true },
  { label: "Volatilite", getValue: (f) => f.volatility, format: (v) => `%${Number(v).toFixed(1)}`, reverseColor: true },
  { label: "Maks. Düşüş", getValue: (f) => f.maxDrawdown, format: (v) => `%${Number(v).toFixed(1)}`, reverseColor: true },
];

// Composition colors
const COMP_COLORS: Record<string, string> = {
  "Hisse Senedi": "#3B82F6",
  "Devlet Tahvili": "#10B981",
  "Özel Sektör Tahvili": "#8B5CF6",
  "Altın": "#F59E0B",
  "Repo/Para Piyasası": "#06B6D4",
  "Döviz": "#EC4899",
  "Nakit": "#6B7280",
  "Eurobond": "#F97316",
  "Diğer": "#64748B",
};

function getCompColor(label: string) {
  return COMP_COLORS[label] ?? "#64748B";
}

// ── Default selection ──
const DEFAULT_CODES = ["TI2", "GAL", "IPL"];

export default function FonKarsilastirPage() {
  const [selectedCodes, setSelectedCodes] = useState<string[]>(DEFAULT_CODES);
  const [addingFund, setAddingFund] = useState(false);

  const selectedFunds = selectedCodes
    .map((code) => MOCK_TEFAS_FUNDS.find((f) => f.code === code))
    .filter(Boolean) as TefasFund[];

  const availableFunds = MOCK_TEFAS_FUNDS.filter((f) => !selectedCodes.includes(f.code));

  function addFund(code: string) {
    if (selectedCodes.length < 4) {
      setSelectedCodes([...selectedCodes, code]);
    }
    setAddingFund(false);
  }

  function removeFund(code: string) {
    setSelectedCodes(selectedCodes.filter((c) => c !== code));
  }

  // Find best/worst for numeric rows
  function getBestWorst(row: CompRow) {
    if (!row.colorize && !row.reverseColor) return { best: -1, worst: -1 };
    const values = selectedFunds.map((f) => Number(row.getValue(f)));
    const bestIdx = row.reverseColor
      ? values.indexOf(Math.min(...values))
      : values.indexOf(Math.max(...values));
    const worstIdx = row.reverseColor
      ? values.indexOf(Math.max(...values))
      : values.indexOf(Math.min(...values));
    return { best: bestIdx, worst: worstIdx };
  }

  // Auto verdicts
  const verdicts = selectedFunds.length >= 2 ? [
    { label: "En Yüksek YTD Getiri", fund: [...selectedFunds].sort((a, b) => b.returnYtd - a.returnYtd)[0] },
    { label: "En Düşük Risk", fund: [...selectedFunds].sort((a, b) => a.riskLevel - b.riskLevel)[0] },
    { label: "En İyi Sharpe (Risk/Getiri)", fund: [...selectedFunds].sort((a, b) => b.sharpeRatio - a.sharpeRatio)[0] },
    { label: "En Düşük Yönetim Ücreti", fund: [...selectedFunds].sort((a, b) => a.managementFee - b.managementFee)[0] },
  ] : [];

  // YTD bar max
  const maxYtd = Math.max(...selectedFunds.map((f) => Math.abs(f.returnYtd)), 1);
  const maxSharpe = Math.max(...selectedFunds.map((f) => Math.abs(f.sharpeRatio)), 0.1);

  return (
    <div className="hero-gradient min-h-screen">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Fon Karşılaştırma</h1>
          <p className="mt-1 text-sm text-text-muted">TEFAS fonlarını yan yana kıyasla — getiri, risk, maliyet</p>
        </div>

        <FonlarSubNav />

        {/* Fund selector */}
        <div className="glass-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-text-secondary">Seçili Fonlar:</span>
            {selectedFunds.map((fund) => (
              <div
                key={fund.code}
                className="flex items-center gap-1.5 rounded-lg bg-accent/10 border border-accent/20 px-3 py-1.5"
              >
                <span className="font-mono text-xs font-bold text-accent">{fund.code}</span>
                <span className="text-[10px] text-text-muted hidden sm:inline">{fund.name.split(" ").slice(0, 3).join(" ")}</span>
                <button
                  onClick={() => removeFund(fund.code)}
                  className="ml-1 text-text-muted hover:text-down transition-colors text-xs cursor-pointer"
                >
                  ×
                </button>
              </div>
            ))}

            {selectedCodes.length < 4 && (
              <div className="relative">
                <button
                  onClick={() => setAddingFund(!addingFund)}
                  className="flex items-center gap-1 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs text-text-muted hover:border-accent hover:text-accent transition-all cursor-pointer"
                >
                  <span className="text-sm">+</span> Fon Ekle
                </button>

                {addingFund && (
                  <div className="absolute left-0 top-full z-20 mt-1 max-h-64 w-72 overflow-y-auto rounded-xl border border-border bg-surface shadow-xl">
                    {availableFunds.map((fund) => (
                      <button
                        key={fund.code}
                        onClick={() => addFund(fund.code)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-surface-hover transition-colors cursor-pointer"
                      >
                        <span className="font-mono font-bold text-accent w-8">{fund.code}</span>
                        <span className="text-text-secondary truncate flex-1">{fund.name}</span>
                        <span className="text-[10px] text-text-muted">{fund.type}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {selectedFunds.length < 2 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-text-muted text-sm">Karşılaştırma için en az 2 fon seçin</p>
          </div>
        ) : (
          <>
            {/* Comparison Table */}
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="sticky left-0 bg-surface px-4 py-3 text-left font-semibold text-text-muted w-36">Metrik</th>
                      {selectedFunds.map((fund) => (
                        <th key={fund.code} className="px-4 py-3 text-center min-w-[140px]">
                          <div className="font-mono text-sm font-bold text-accent">{fund.code}</div>
                          <div className="text-[10px] text-text-muted mt-0.5 truncate">{fund.name.split(" ").slice(0, 4).join(" ")}</div>
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
                          {selectedFunds.map((fund, idx) => {
                            const rawVal = row.getValue(fund);
                            const displayed = row.format ? row.format(rawVal) : String(rawVal);
                            const isBest = idx === best && selectedFunds.length > 1;
                            const isWorst = idx === worst && selectedFunds.length > 1 && best !== worst;

                            let cellColor = "";
                            if (row.isRisk) {
                              // risk dots handled separately
                            } else if (row.colorize || row.reverseColor) {
                              if (isBest) cellColor = "bg-up/8 text-up font-semibold";
                              else if (isWorst) cellColor = "bg-down/8 text-down";
                            }

                            return (
                              <td key={fund.code} className={`px-4 py-2.5 text-center font-mono ${cellColor}`}>
                                {row.label === "Risk Seviyesi" ? (
                                  <div className="flex justify-center">
                                    <RiskDots level={fund.riskLevel} />
                                  </div>
                                ) : (
                                  displayed
                                )}
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

            {/* Visual Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* YTD Return Bars */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-bold mb-4">YTD Getiri Karşılaştırması</h3>
                <div className="space-y-3">
                  {[...selectedFunds].sort((a, b) => b.returnYtd - a.returnYtd).map((fund) => (
                    <div key={fund.code} className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-accent w-8">{fund.code}</span>
                      <div className="flex-1 h-6 bg-border/20 rounded-full overflow-hidden relative">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${fund.returnYtd >= 0 ? "bg-up/60" : "bg-down/60"}`}
                          style={{ width: `${(Math.abs(fund.returnYtd) / maxYtd) * 100}%` }}
                        />
                        <span className={`absolute inset-y-0 flex items-center px-2 text-[11px] font-mono font-bold ${fund.returnYtd >= 0 ? "text-up" : "text-down"}`}>
                          {fund.returnYtd >= 0 ? "+" : ""}{fund.returnYtd.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sharpe Ratio Bars */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-bold mb-4">Sharpe Oranı (Risk/Getiri Dengesi)</h3>
                <div className="space-y-3">
                  {[...selectedFunds].sort((a, b) => b.sharpeRatio - a.sharpeRatio).map((fund) => (
                    <div key={fund.code} className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-accent w-8">{fund.code}</span>
                      <div className="flex-1 h-6 bg-border/20 rounded-full overflow-hidden relative">
                        <div
                          className="h-full rounded-full bg-score-future/50 transition-all duration-500"
                          style={{ width: `${(Math.abs(fund.sharpeRatio) / maxSharpe) * 100}%` }}
                        />
                        <span className="absolute inset-y-0 flex items-center px-2 text-[11px] font-mono font-bold text-score-future">
                          {fund.sharpeRatio.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Composition Comparison */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-bold mb-4">Portföy Dağılımı Karşılaştırması</h3>
              <div className="space-y-4">
                {selectedFunds.map((fund) => (
                  <div key={fund.code} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-accent w-8">{fund.code}</span>
                      <span className="text-[10px] text-text-muted">{fund.type}</span>
                    </div>
                    {/* Stacked bar */}
                    <div className="flex h-5 w-full overflow-hidden rounded-full">
                      {fund.composition.map((comp, i) => (
                        <div
                          key={i}
                          className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
                          style={{
                            width: `${comp.weight}%`,
                            backgroundColor: getCompColor(comp.label),
                            minWidth: comp.weight > 0 ? "4px" : "0",
                          }}
                          title={`${comp.label}: %${comp.weight}`}
                        />
                      ))}
                    </div>
                    {/* Legend */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      {fund.composition.filter((c) => c.weight > 0).map((comp, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: getCompColor(comp.label) }} />
                          <span className="text-[10px] text-text-muted">{comp.label} %{comp.weight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk-Return Scatter */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-bold mb-4">Risk — Getiri Haritası</h3>
              <div className="relative h-64 border border-border/30 rounded-xl overflow-hidden bg-primary/30">
                {/* Axes labels */}
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-text-muted">Volatilite →</span>
                <span className="absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 text-[9px] text-text-muted">Getiri →</span>
                {/* Grid lines */}
                <div className="absolute inset-4">
                  <div className="absolute left-0 right-0 top-1/2 h-px bg-border/20" />
                  <div className="absolute top-0 bottom-0 left-1/2 w-px bg-border/20" />
                </div>
                {/* Dots */}
                {selectedFunds.map((fund) => {
                  const maxVol = Math.max(...selectedFunds.map((f) => f.volatility), 1);
                  const maxRet = Math.max(...selectedFunds.map((f) => Math.abs(f.returnYtd)), 1);
                  const x = 8 + (fund.volatility / maxVol) * 80;
                  const y = 90 - ((fund.returnYtd + maxRet) / (2 * maxRet)) * 80;
                  return (
                    <div
                      key={fund.code}
                      className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${x}%`, top: `${y}%` }}
                    >
                      <div className="h-4 w-4 rounded-full bg-accent shadow-lg shadow-accent/30 border-2 border-white/20" />
                      <span className="mt-0.5 font-mono text-[10px] font-bold text-accent">{fund.code}</span>
                      <span className="text-[8px] text-text-muted">{fund.returnYtd >= 0 ? "+" : ""}{fund.returnYtd.toFixed(1)}% / σ{fund.volatility.toFixed(0)}%</span>
                    </div>
                  );
                })}
                {/* Quadrant labels */}
                <span className="absolute top-2 right-3 text-[8px] text-up/50">Yüksek Getiri / Yüksek Risk</span>
                <span className="absolute top-2 left-3 text-[8px] text-up/50">Yüksek Getiri / Düşük Risk ★</span>
                <span className="absolute bottom-2 right-3 text-[8px] text-down/50">Düşük Getiri / Yüksek Risk</span>
                <span className="absolute bottom-2 left-3 text-[8px] text-text-muted/30">Düşük Getiri / Düşük Risk</span>
              </div>
            </div>

            {/* Verdicts */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {verdicts.map((v) => (
                <div key={v.label} className="glass-card p-4">
                  <div className="text-[10px] text-text-muted mb-1">{v.label}</div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-bold text-accent">{v.fund.code}</span>
                    <span className="text-[10px] text-text-secondary truncate">{v.fund.name.split(" ").slice(0, 3).join(" ")}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="rounded-xl border border-border/50 bg-surface/50 p-3 text-center text-[10px] text-text-muted">
          Geçmiş performans gelecek getirilerin göstergesi değildir. Yatırım tavsiyesi niteliği taşımaz.
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { MOCK_STRATEGY_SCORES, type StockStrategyScores } from "@/lib/mock-strategy-data";
import { formatNumber } from "@/lib/formatters";
import Link from "next/link";

type StrategyTab = "canslim" | "buffett" | "tech";

interface TabConfig {
  key: StrategyTab;
  label: string;
  subtitle: string;
  color: string;        // tailwind accent
  bgGradient: string;   // for active tab
  ringColor: string;    // CSS color for score ring
  description: string;
  sortFn: (a: StockStrategyScores, b: StockStrategyScores) => number;
  getScore: (s: StockStrategyScores) => number;
  getGrade: (s: StockStrategyScores) => string;
  getVerdict: (s: StockStrategyScores) => string;
  getExtra?: (s: StockStrategyScores) => string;
}

const TABS: TabConfig[] = [
  {
    key: "canslim",
    label: "CANSLIM",
    subtitle: "O'Neil Büyüme",
    color: "blue",
    bgGradient: "from-blue-600 to-blue-800",
    ringColor: "#3B82F6",
    description:
      "William O\u2019Neil\u2019in CANSLIM metodolojisi: Çeyreklik kâr büyümesi, yıllık büyüme, yenilik, arz-talep, sektörel liderlik, kurumsal sahiplik ve piyasa yönü kriterlerini birleştirir. Büyüme hisselerini tespit etmek için ideal.",
    sortFn: (a, b) => b.canslim.total - a.canslim.total,
    getScore: (s) => s.canslim.total,
    getGrade: (s) => s.canslim.grade,
    getVerdict: (s) => s.canslim.recommendation,
  },
  {
    key: "buffett",
    label: "Buffett Değer",
    subtitle: "Değer Yatırımı",
    color: "emerald",
    bgGradient: "from-emerald-600 to-emerald-800",
    ringColor: "#10B981",
    description:
      "Warren Buffett\u2019ın değer yatırım felsefesi: Sürdürülebilir rekabet avantajı (moat), güçlü kazanç, düşük borç, yüksek kâr marjları, makul değerleme ve güçlü nakit üretimi arar. Uzun vadeli, düşük riskli yatırımlar için idealdir.",
    sortFn: (a, b) => b.buffett.total - a.buffett.total,
    getScore: (s) => s.buffett.total,
    getGrade: (s) => s.buffett.grade,
    getVerdict: (s) => s.buffett.verdict,
  },
  {
    key: "tech",
    label: "Teknoloji Rasyoları",
    subtitle: "Büyüme Metrikleri",
    color: "violet",
    bgGradient: "from-violet-600 to-violet-800",
    ringColor: "#8B5CF6",
    description:
      "Teknoloji ve büyüme hisseleri için özel rasyolar: PEG oranı, Rule of 40, EV/Gelir, büyüme hızı ve kârlılık dengesi. Yüksek büyümeli şirketlerin değerlemesini ölçmek için uygundur.",
    sortFn: (a, b) => b.techRatios.overallScore - a.techRatios.overallScore,
    getScore: (s) => s.techRatios.overallScore,
    getGrade: (s) => s.techRatios.grade,
    getVerdict: (s) =>
      s.techRatios.overallScore >= 75
        ? "Güçlü büyüme-değerleme dengesi"
        : s.techRatios.overallScore >= 50
        ? "Orta seviye — bazı metrikler iyi"
        : "Zayıf teknoloji rasyoları",
    getExtra: (s) =>
      `PEG: ${s.techRatios.pegRatio.toFixed(2)} | R40: ${s.techRatios.ruleOf40.toFixed(1)}`,
  },
];

const GRADE_STYLES: Record<string, { bg: string; text: string }> = {
  "A+": { bg: "bg-emerald-500/20", text: "text-emerald-400" },
  A: { bg: "bg-emerald-500/15", text: "text-emerald-400" },
  "B+": { bg: "bg-yellow-500/15", text: "text-yellow-400" },
  B: { bg: "bg-yellow-500/10", text: "text-yellow-300" },
  C: { bg: "bg-orange-500/15", text: "text-orange-400" },
  D: { bg: "bg-red-500/15", text: "text-red-400" },
  F: { bg: "bg-red-500/20", text: "text-red-500" },
};

const PODIUM_BORDERS = [
  "border-yellow-500/60 shadow-yellow-500/10",   // 1st — gold
  "border-border shadow-border/10",      // 2nd — silver
  "border-amber-700/40 shadow-amber-700/10",      // 3rd — bronze
];

const PODIUM_BADGES = [
  { emoji: "1", bg: "bg-gradient-to-br from-yellow-500 to-amber-600", text: "text-black" },
  { emoji: "2", bg: "bg-gradient-to-br from-gray-400 to-gray-500", text: "text-black" },
  { emoji: "3", bg: "bg-gradient-to-br from-amber-700 to-amber-800", text: "text-white" },
];

function ScoreRing({ score, maxScore, color, size = 44 }: { score: number; maxScore: number; color: string; size?: number }) {
  const pct = Math.round((score / maxScore) * 100);
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (c * pct) / 100;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={3}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute font-mono text-xs font-bold" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

function GradeBadge({ grade }: { grade: string }) {
  const style = GRADE_STYLES[grade] || GRADE_STYLES["C"];
  return (
    <span className={`inline-flex items-center justify-center rounded-lg px-2.5 py-1 font-mono text-xs font-bold ${style.bg} ${style.text}`}>
      {grade}
    </span>
  );
}

export default function StratejilerPage() {
  const [activeTab, setActiveTab] = useState<StrategyTab>("canslim");

  const tab = TABS.find((t) => t.key === activeTab)!;

  const ranked = useMemo(() => {
    return [...MOCK_STRATEGY_SCORES].sort(tab.sortFn);
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="hero-gradient min-h-screen">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="gradient-text">Yatırım Stratejileri</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-text-muted sm:text-base">
            Üç farklı yatırım metodolojisiyle BIST hisselerini analiz edin.
            Her strateji, farklı yatırımcı profiline hitap eder.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {TABS.map((t) => {
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`group relative overflow-hidden rounded-2xl px-6 py-4 text-left transition-all duration-300 sm:min-w-[220px] ${
                  isActive
                    ? `bg-gradient-to-r ${t.bgGradient} text-white shadow-xl shadow-${t.color}-500/20`
                    : "glass-card text-text-muted hover:text-text-primary"
                }`}
              >
                <div className="relative z-10">
                  <div className="text-sm font-bold tracking-tight">{t.label}</div>
                  <div className={`text-xs ${isActive ? "text-white/70" : "text-text-muted"}`}>
                    {t.subtitle}
                  </div>
                </div>
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent" />
                )}
              </button>
            );
          })}
        </div>

        {/* Strategy Description Card */}
        <div className="glass-card mx-auto max-w-3xl px-6 py-5 !rounded-2xl">
          <div className="flex items-start gap-3">
            <div
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
              style={{ background: tab.ringColor }}
            >
              {tab.key === "canslim" ? "C" : tab.key === "buffett" ? "B" : "T"}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">{tab.label}</h3>
              <p className="mt-1 text-xs leading-relaxed text-text-muted">
                {tab.description}
              </p>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="glass-card overflow-hidden !rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-[11px] uppercase tracking-wider text-text-muted">
                  <th className="px-4 py-4 text-center font-semibold w-12">#</th>
                  <th className="px-4 py-4 text-left font-semibold">Hisse</th>
                  <th className="hidden px-4 py-4 text-left font-semibold md:table-cell">Sektör</th>
                  <th className="px-4 py-4 text-center font-semibold">Skor</th>
                  <th className="px-4 py-4 text-center font-semibold">Not</th>
                  <th className="hidden px-4 py-4 text-left font-semibold lg:table-cell">Değerlendirme</th>
                  {tab.getExtra && (
                    <th className="hidden px-4 py-4 text-center font-semibold sm:table-cell">Detay</th>
                  )}
                  <th className="px-4 py-4 text-right font-semibold">Fiyat</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((stock, idx) => {
                  const isTop3 = idx < 3;
                  const score = tab.getScore(stock);
                  const grade = tab.getGrade(stock);
                  const verdict = tab.getVerdict(stock);

                  return (
                    <tr
                      key={stock.ticker}
                      className={`table-row-hover border-b border-border/20 ${
                        isTop3 ? `border-l-2 ${PODIUM_BORDERS[idx]}` : ""
                      }`}
                    >
                      {/* Rank */}
                      <td className="px-4 py-4 text-center">
                        {isTop3 ? (
                          <span
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${PODIUM_BADGES[idx].bg} ${PODIUM_BADGES[idx].text}`}
                          >
                            {PODIUM_BADGES[idx].emoji}
                          </span>
                        ) : (
                          <span className="font-mono text-xs text-text-muted">{idx + 1}</span>
                        )}
                      </td>

                      {/* Ticker + Name */}
                      <td className="px-4 py-4">
                        <Link href={`/hisseler/${stock.ticker}`} className="flex items-center gap-3 group">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent/15 to-accent/5 font-mono text-[11px] font-bold text-accent transition-transform group-hover:scale-105">
                            {stock.ticker.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-mono text-sm font-bold group-hover:text-accent transition-colors">
                              {stock.ticker}
                            </div>
                            <div className="max-w-[180px] truncate text-[11px] text-text-muted">
                              {stock.name}
                            </div>
                          </div>
                        </Link>
                      </td>

                      {/* Sector */}
                      <td className="hidden px-4 py-4 md:table-cell">
                        <span className="rounded-lg bg-surface/80 px-2.5 py-1 text-[11px] font-medium text-text-secondary">
                          {stock.sector}
                        </span>
                      </td>

                      {/* Score Ring */}
                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          <ScoreRing score={score} maxScore={100} color={tab.ringColor} />
                        </div>
                      </td>

                      {/* Grade */}
                      <td className="px-4 py-4 text-center">
                        <GradeBadge grade={grade} />
                      </td>

                      {/* Verdict */}
                      <td className="hidden max-w-[280px] px-4 py-4 lg:table-cell">
                        <p className="truncate text-xs text-text-muted">{verdict}</p>
                      </td>

                      {/* Extra (tech ratios) */}
                      {tab.getExtra && (
                        <td className="hidden px-4 py-4 text-center sm:table-cell">
                          <span className="font-mono text-[11px] text-text-secondary">
                            {tab.getExtra(stock)}
                          </span>
                        </td>
                      )}

                      {/* Price */}
                      <td className="px-4 py-4 text-right font-mono text-sm font-semibold">
                        {formatNumber(stock.price)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-[10px] leading-relaxed text-text-muted/60">
          Bu sayfa yatırım tavsiyesi niteliği taşımaz. Gösterilen skorlar algoritmik hesaplamalara dayanır
          ve yatırım kararı için tek başına yeterli değildir. Yatırım kararları için profesyonel danışmanlık alınız.
        </p>
      </div>
    </div>
  );
}

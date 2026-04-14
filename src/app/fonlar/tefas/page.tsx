"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MOCK_TEFAS_FUNDS,
  MOCK_PORTFOLIO_RECOMMENDATIONS,
  type TefasFund,
  type FundType,
} from "@/lib/mock-tefas-data";

// ── Helpers ──

function formatAum(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} Mr`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)} Mn`;
  return value.toLocaleString("tr-TR");
}

function formatReturn(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

// ── Sub-nav tabs ──

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

// ── Filter types ──

const FUND_TYPE_FILTERS: { key: FundType | "Tümü"; label: string }[] = [
  { key: "Tümü", label: "Tümü" },
  { key: "Hisse Senedi", label: "Hisse" },
  { key: "Borçlanma Araçları", label: "Borçlanma" },
  { key: "Altın", label: "Altın" },
  { key: "Karma", label: "Karma" },
  { key: "Para Piyasası", label: "Para Piyasası" },
  { key: "Katılım", label: "Katılım" },
  { key: "Fon Sepeti", label: "Fon Sepeti" },
  { key: "Değişken", label: "Değişken" },
];

type SortKey = "ytd" | "aum" | "sharpe" | "risk";
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "ytd", label: "Getiri (YTD)" },
  { key: "aum", label: "Fon Büyüklüğü" },
  { key: "sharpe", label: "Sharpe Oranı" },
  { key: "risk", label: "Risk Seviyesi" },
];

function sortFunds(funds: TefasFund[], key: SortKey): TefasFund[] {
  const sorted = [...funds];
  switch (key) {
    case "ytd":
      return sorted.sort((a, b) => b.returnYtd - a.returnYtd);
    case "aum":
      return sorted.sort((a, b) => b.aum - a.aum);
    case "sharpe":
      return sorted.sort((a, b) => b.sharpeRatio - a.sharpeRatio);
    case "risk":
      return sorted.sort((a, b) => a.riskLevel - b.riskLevel);
  }
}

// ── Risk dots ──

function RiskDots({ level }: { level: number }) {
  const colors = [
    "bg-up",
    "bg-up",
    "bg-score-health",
    "bg-score-health",
    "bg-score-dividend",
    "bg-score-dividend",
    "bg-down",
  ];
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className={`h-2 w-2 rounded-full ${
            i < level ? colors[i] : "bg-border/40"
          }`}
        />
      ))}
    </div>
  );
}

// ── Composition bar ──

const COMP_COLORS: Record<string, string> = {
  "Hisse Senedi": "#3B82F6",
  "Hisse Senedi (Katılım)": "#3B82F6",
  "Devlet Tahvili": "#10B981",
  "Özel Sektör Tahvili": "#22D3EE",
  "Kısa Vadeli Tahvil": "#10B981",
  Bono: "#34D399",
  Eurobond: "#06B6D4",
  "Borçlanma Araçları": "#10B981",
  Altın: "#F59E0B",
  "Altın (Katılım)": "#F59E0B",
  "Kira Sertifikası": "#A78BFA",
  Repo: "#8B5CF6",
  Mevduat: "#A78BFA",
  Nakit: "#64748B",
  Döviz: "#EC4899",
  "Hisse Fonu": "#3B82F6",
  "Borçlanma Fonu": "#10B981",
  "Altın Fonu": "#F59E0B",
  "Para Piyasası Fonu": "#8B5CF6",
};

function CompositionBar({ composition }: { composition: TefasFund["composition"] }) {
  return (
    <div className="space-y-1.5">
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-surface">
        {composition.map((c, i) => (
          <div
            key={i}
            style={{
              width: `${c.weight}%`,
              backgroundColor: COMP_COLORS[c.label] ?? "#64748B",
            }}
            className="h-full first:rounded-l-full last:rounded-r-full"
            title={`${c.label}: %${c.weight}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {composition.map((c, i) => (
          <div key={i} className="flex items-center gap-1">
            <div
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: COMP_COLORS[c.label] ?? "#64748B" }}
            />
            <span className="text-[9px] text-text-muted">
              {c.label} %{c.weight.toFixed(0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Fund card ──

function FundCard({ fund }: { fund: TefasFund }) {
  const [expanded, setExpanded] = useState(false);

  const typeBadgeColor: Record<string, string> = {
    "Hisse Senedi": "bg-score-future/12 text-score-future border-score-future/20",
    "Borçlanma Araçları": "bg-up/12 text-up border-up/20",
    Altın: "bg-score-health/12 text-score-health border-score-health/20",
    Karma: "bg-score-past/12 text-score-past border-score-past/20",
    "Para Piyasası": "bg-accent/12 text-accent border-accent/20",
    Katılım: "bg-score-value/12 text-score-value border-score-value/20",
    "Fon Sepeti": "bg-neutral/12 text-neutral border-neutral/20",
    Değişken: "bg-score-dividend/12 text-score-dividend border-score-dividend/20",
  };

  return (
    <div className="glass-card p-5 sm:p-6">
      {/* Header row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5 mb-1">
            <span className="rounded-lg bg-accent/10 px-2.5 py-1 font-mono text-sm font-bold text-accent">
              {fund.code}
            </span>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
                typeBadgeColor[fund.type] ?? "bg-neutral/12 text-neutral border-neutral/20"
              }`}
            >
              {fund.type}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-text-primary leading-relaxed">
            {fund.name}
          </h3>
          <p className="text-xs text-text-muted mt-0.5">{fund.manager}</p>
        </div>

        {/* Return metrics */}
        <div className="flex items-center gap-3 sm:gap-4">
          {[
            { label: "Günlük", value: fund.returnDaily },
            { label: "Aylık", value: fund.returnMonthly },
            { label: "YTD", value: fund.returnYtd },
            { label: "1Y", value: fund.return1y },
          ].map((m) => (
            <div key={m.label} className="flex flex-col items-center">
              <span className="text-[10px] text-text-muted">{m.label}</span>
              <span
                className={`font-mono text-sm font-bold rounded-md px-2 py-0.5 ${
                  m.value >= 0
                    ? "text-up bg-up/10"
                    : "text-down bg-down/10"
                }`}
              >
                {formatReturn(m.value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div>
          <span className="text-[10px] text-text-muted block">Risk Seviyesi</span>
          <div className="mt-1">
            <RiskDots level={fund.riskLevel} />
          </div>
        </div>
        <div>
          <span className="text-[10px] text-text-muted block">AUM</span>
          <span className="font-mono text-sm font-bold text-accent">
            {formatAum(fund.aum)}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-text-muted block">Sharpe</span>
          <span className="font-mono text-sm font-bold text-text-primary">
            {fund.sharpeRatio.toFixed(2)}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-text-muted block">Volatilite</span>
          <span className="font-mono text-sm font-bold text-text-secondary">
            %{fund.volatility.toFixed(1)}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-text-muted block">Max Düşüş</span>
          <span className="font-mono text-sm font-bold text-down">
            {fund.maxDrawdown.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Composition bar */}
      <div className="mt-4">
        <CompositionBar composition={fund.composition} />
      </div>

      {/* Expandable: top holdings */}
      {fund.topHoldings && fund.topHoldings.length > 0 && (
        <div className="mt-3 border-t border-border/20 pt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-text-muted hover:text-accent transition-colors cursor-pointer"
          >
            <span
              className="inline-block transition-transform"
              style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)" }}
            >
              ▸
            </span>
            En Büyük Pozisyonlar
          </button>
          {expanded && (
            <div className="mt-2 flex flex-wrap gap-2">
              {fund.topHoldings.map((h) => (
                <div
                  key={h.ticker}
                  className="flex items-center gap-1.5 rounded-lg bg-surface px-2.5 py-1.5"
                >
                  <span className="font-mono text-xs font-bold text-accent">
                    {h.ticker}
                  </span>
                  <span className="font-mono text-[11px] text-text-muted">
                    %{h.weight.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between border-t border-border/20 pt-3">
        <span className="text-[10px] text-text-muted">
          Yönetim Ücreti: %{fund.managementFee.toFixed(2)}
        </span>
        <span className="text-[10px] text-text-muted font-mono">
          {fund.investorCount.toLocaleString("tr-TR")} yatırımcı
        </span>
      </div>
    </div>
  );
}

// ── Donut chart via conic-gradient ──

function DonutChart({
  allocations,
}: {
  allocations: { fundCode: string; weight: number }[];
}) {
  const DONUT_COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#EF4444",
    "#EC4899",
    "#06B6D4",
  ];

  let cumulativeDeg = 0;
  const segments = allocations.map((a, i) => {
    const startDeg = cumulativeDeg;
    const endDeg = cumulativeDeg + (a.weight / 100) * 360;
    cumulativeDeg = endDeg;
    return { ...a, startDeg, endDeg, color: DONUT_COLORS[i % DONUT_COLORS.length] };
  });

  const gradient = segments
    .map((s) => `${s.color} ${s.startDeg.toFixed(1)}deg ${s.endDeg.toFixed(1)}deg`)
    .join(", ");

  return (
    <div className="relative mx-auto h-32 w-32">
      <div
        className="h-full w-full rounded-full"
        style={{ background: `conic-gradient(${gradient})` }}
      />
      <div className="absolute inset-3 rounded-full bg-surface" />
    </div>
  );
}

// ── Portfolio recommendation card ──

const STRATEGY_COLORS: Record<string, { ring: string; badge: string }> = {
  Muhafazakar: {
    ring: "border-up/30",
    badge: "bg-up/12 text-up border-up/20",
  },
  Dengeli: {
    ring: "border-accent/30",
    badge: "bg-accent/12 text-accent border-accent/20",
  },
  Büyüme: {
    ring: "border-score-health/30",
    badge: "bg-score-health/12 text-score-health border-score-health/20",
  },
  Agresif: {
    ring: "border-down/30",
    badge: "bg-down/12 text-down border-down/20",
  },
};

function PortfolioCard({
  rec,
}: {
  rec: (typeof MOCK_PORTFOLIO_RECOMMENDATIONS)[number];
}) {
  const style = STRATEGY_COLORS[rec.strategy] ?? STRATEGY_COLORS["Dengeli"];

  return (
    <div className={`glass-card p-5 sm:p-6 border-l-2 ${style.ring}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h3 className="text-lg font-bold text-text-primary">{rec.strategy}</h3>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${style.badge}`}
            >
              Risk: {rec.riskLevel}
            </span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed max-w-xl">
            {rec.description}
          </p>
          <div className="mt-2">
            <span className="text-[10px] text-text-muted">Beklenen Getiri: </span>
            <span className="font-mono text-sm font-bold text-accent">
              {rec.expectedReturn}
            </span>
          </div>
        </div>

        {/* Donut */}
        <div className="flex-shrink-0">
          <DonutChart allocations={rec.allocations} />
        </div>
      </div>

      {/* Allocation list */}
      <div className="mt-5 space-y-2">
        {rec.allocations.map((a, i) => {
          const DONUT_COLORS = [
            "#3B82F6",
            "#10B981",
            "#F59E0B",
            "#8B5CF6",
            "#EF4444",
            "#EC4899",
            "#06B6D4",
          ];
          const color = DONUT_COLORS[i % DONUT_COLORS.length];

          return (
            <div
              key={a.fundCode}
              className="flex items-start gap-3 rounded-lg bg-surface/50 px-3 py-2.5"
            >
              <div
                className="mt-1 h-2.5 w-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-accent">
                    {a.fundCode}
                  </span>
                  <span className="font-mono text-xs font-bold text-text-primary">
                    %{a.weight}
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary mt-0.5 truncate">
                  {a.fundName}
                </p>
                <p className="text-[10px] text-text-muted mt-0.5">{a.reason}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Warnings */}
      {rec.warnings.length > 0 && (
        <div className="mt-4 rounded-lg border border-score-health/20 bg-score-health/5 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-score-health mb-1.5">
            Uyarılar
          </p>
          <ul className="space-y-1">
            {rec.warnings.map((w, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[11px] text-text-muted">
                <span className="text-score-health mt-0.5">•</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Fragility matrix ──

type Impact = "positive" | "negative" | "neutral";

interface ScenarioImpact {
  impact: Impact;
  text: string;
}

const SCENARIOS = [
  "Faiz Artışı",
  "TL Değer Kaybı",
  "Borsa Düşüşü",
  "Enflasyon Artışı",
  "Altın Rallisi",
] as const;

const FRAGILITY_MATRIX: Record<string, Record<(typeof SCENARIOS)[number], ScenarioImpact>> = {
  Muhafazakar: {
    "Faiz Artışı": { impact: "negative", text: "Tahvil fiyatları düşer" },
    "TL Değer Kaybı": { impact: "neutral", text: "Altın payı korur" },
    "Borsa Düşüşü": { impact: "positive", text: "Minimal hisse maruziyeti" },
    "Enflasyon Artışı": { impact: "negative", text: "Reel getiri erir" },
    "Altın Rallisi": { impact: "positive", text: "%20 altın payı faydalanır" },
  },
  Dengeli: {
    "Faiz Artışı": { impact: "negative", text: "Tahvil ve hisse baskılanır" },
    "TL Değer Kaybı": { impact: "neutral", text: "Altın ve ihracatçılar dengeler" },
    "Borsa Düşüşü": { impact: "negative", text: "%35 hisse payı etkilenir" },
    "Enflasyon Artışı": { impact: "neutral", text: "Karma yapı kısmen korur" },
    "Altın Rallisi": { impact: "positive", text: "%15 altın payı faydalanır" },
  },
  Büyüme: {
    "Faiz Artışı": { impact: "negative", text: "Hisse değerlemeleri düşer" },
    "TL Değer Kaybı": { impact: "positive", text: "İhracatçı hisseler yükselir" },
    "Borsa Düşüşü": { impact: "negative", text: "%55 hisse payı sert etkilenir" },
    "Enflasyon Artışı": { impact: "neutral", text: "Hisseler kısmen enflasyon koruması sağlar" },
    "Altın Rallisi": { impact: "positive", text: "%10 altın payı kazandırır" },
  },
  Agresif: {
    "Faiz Artışı": { impact: "negative", text: "Yoğun hisse baskısı" },
    "TL Değer Kaybı": { impact: "positive", text: "İhracatçılar güçlü yükselir" },
    "Borsa Düşüşü": { impact: "negative", text: "%75 hisse ile büyük kayıp" },
    "Enflasyon Artışı": { impact: "neutral", text: "Hisseler uzun vadede enflasyonu yener" },
    "Altın Rallisi": { impact: "neutral", text: "Sınırlı altın payı" },
  },
};

const IMPACT_STYLES: Record<Impact, string> = {
  positive: "bg-up/10 text-up",
  negative: "bg-down/10 text-down",
  neutral: "bg-score-health/10 text-score-health",
};

// ── Main page ──

export default function TefasPage() {
  const [typeFilter, setTypeFilter] = useState<FundType | "Tümü">("Tümü");
  const [sortKey, setSortKey] = useState<SortKey>("ytd");

  const filtered =
    typeFilter === "Tümü"
      ? MOCK_TEFAS_FUNDS
      : MOCK_TEFAS_FUNDS.filter((f) => f.type === typeFilter);
  const sorted = sortFunds(filtered, sortKey);

  // Summary stats
  const totalAum = MOCK_TEFAS_FUNDS.reduce((s, f) => s + f.aum, 0);
  const avgYtd =
    MOCK_TEFAS_FUNDS.reduce((s, f) => s + f.returnYtd, 0) / MOCK_TEFAS_FUNDS.length;
  const bestFund = [...MOCK_TEFAS_FUNDS].sort((a, b) => b.returnYtd - a.returnYtd)[0];

  return (
    <div className="hero-gradient min-h-screen">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">
            TEFAS Fon Analizi
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Türkiye Elektronik Fon Alım Satım Platformu fonlarının detaylı analizi ve
            portföy önerileri
          </p>
        </div>

        {/* Sub-nav */}
        <FonlarSubNav />

        {/* B) Summary Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="glass-card p-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              Toplam Fon Sayısı
            </p>
            <p className="mt-1 font-mono text-xl font-bold text-text-primary">
              {MOCK_TEFAS_FUNDS.length}
            </p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              Toplam AUM
            </p>
            <p className="mt-1 font-mono text-xl font-bold text-accent">
              {formatAum(totalAum)}
            </p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              Ort. YTD Getiri
            </p>
            <p className="mt-1 font-mono text-xl font-bold text-up">
              +{avgYtd.toFixed(1)}%
            </p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              En İyi Performans
            </p>
            <p className="mt-1 font-mono text-lg font-bold text-accent">
              {bestFund.code}{" "}
              <span className="text-up text-sm">+{bestFund.returnYtd.toFixed(1)}%</span>
            </p>
          </div>
        </div>

        {/* C) Filter / Sort */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {FUND_TYPE_FILTERS.map((ft) => (
              <button
                key={ft.key}
                onClick={() => setTypeFilter(ft.key)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                  typeFilter === ft.key
                    ? "bg-gradient-to-r from-accent to-blue-700 text-white shadow-lg shadow-accent/25"
                    : "glass-card !rounded-xl text-text-muted hover:text-text-primary"
                }`}
              >
                {ft.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              Sırala:
            </span>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-primary outline-none focus:border-accent cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* D) Fund Cards */}
        <div className="space-y-4">
          {sorted.map((fund) => (
            <FundCard key={fund.code} fund={fund} />
          ))}
          {sorted.length === 0 && (
            <div className="glass-card p-8 text-center">
              <p className="text-sm text-text-muted">Bu kategoride fon bulunamadı.</p>
            </div>
          )}
        </div>

        {/* ── E) Portföy Önerisi Section ── */}
        <div className="mt-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight gradient-text">
              Portföy Öneri Motoru
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Risk profilinize göre hazırlanmış fon portföy önerileri
            </p>
          </div>

          <div className="space-y-4">
            {MOCK_PORTFOLIO_RECOMMENDATIONS.map((rec) => (
              <PortfolioCard key={rec.strategy} rec={rec} />
            ))}
          </div>
        </div>

        {/* ── F) Strateji Kırılganlık Analizi ── */}
        <div className="mt-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight gradient-text">
              Strateji Kırılganlık Analizi
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Farklı makroekonomik senaryolarda portföy stratejilerinin beklenen tepkileri
            </p>
          </div>

          {/* Desktop table */}
          <div className="glass-card overflow-x-auto hidden sm:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                    Strateji
                  </th>
                  {SCENARIOS.map((s) => (
                    <th
                      key={s}
                      className="px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-text-muted text-center"
                    >
                      {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(FRAGILITY_MATRIX).map(([strategy, scenarios]) => (
                  <tr
                    key={strategy}
                    className="border-b border-border/10 last:border-0 hover:bg-surface-hover/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-text-primary">
                      {strategy}
                    </td>
                    {SCENARIOS.map((s) => {
                      const cell = scenarios[s];
                      return (
                        <td key={s} className="px-3 py-3 text-center">
                          <div
                            className={`inline-block rounded-lg px-2.5 py-1.5 ${IMPACT_STYLES[cell.impact]}`}
                          >
                            <span className="text-[11px] font-medium">{cell.text}</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: stacked cards */}
          <div className="space-y-3 sm:hidden">
            {Object.entries(FRAGILITY_MATRIX).map(([strategy, scenarios]) => (
              <div key={strategy} className="glass-card p-4">
                <h4 className="text-sm font-bold text-text-primary mb-3">{strategy}</h4>
                <div className="space-y-2">
                  {SCENARIOS.map((s) => {
                    const cell = scenarios[s];
                    return (
                      <div key={s} className="flex items-start gap-2">
                        <span className="text-[10px] font-semibold text-text-muted w-24 flex-shrink-0 pt-0.5">
                          {s}
                        </span>
                        <span
                          className={`rounded-lg px-2 py-1 text-[11px] font-medium ${IMPACT_STYLES[cell.impact]}`}
                        >
                          {cell.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 rounded-lg border border-border/30 bg-surface/30 px-4 py-3">
          <p className="text-[10px] text-text-muted leading-relaxed text-center">
            Bu sayfa yatırım tavsiyesi niteliği taşımamaktadır. Gösterilen veriler
            bilgilendirme amaçlıdır. Yatırım kararlarınızı almadan önce mutlaka
            lisanslı bir yatırım danışmanına başvurunuz. Geçmiş performans gelecek
            getirinin garantisi değildir.
          </p>
        </div>
      </div>
    </div>
  );
}

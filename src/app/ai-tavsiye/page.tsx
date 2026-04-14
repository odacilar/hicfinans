"use client";

import { useState, useMemo } from "react";
import { MOCK_AI_RECOMMENDATIONS, type AIRecommendation } from "@/lib/mock-ai-recommendations";

// ── Helpers ──

type SortKey = "aiScore" | "upside" | "confidence";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "aiScore", label: "AI Skor" },
  { key: "upside", label: "Yükseliş Potansiyeli" },
  { key: "confidence", label: "Güven Skoru" },
];

const REC_COLORS: Record<AIRecommendation["recommendation"], string> = {
  "Güçlü Al": "bg-emerald-700/80 text-emerald-100",
  Al: "bg-emerald-500/30 text-emerald-300",
  Tut: "bg-yellow-500/30 text-yellow-300",
  Sat: "bg-red-500/30 text-red-300",
  "Güçlü Sat": "bg-red-700/80 text-red-100",
};

const REC_DOT_COLORS: Record<AIRecommendation["recommendation"], string> = {
  "Güçlü Al": "bg-emerald-400",
  Al: "bg-emerald-300",
  Tut: "bg-yellow-400",
  Sat: "bg-red-400",
  "Güçlü Sat": "bg-red-500",
};

const RISK_COLORS: Record<AIRecommendation["riskLevel"], string> = {
  düşük: "bg-emerald-500/20 text-emerald-300",
  orta: "bg-yellow-500/20 text-yellow-300",
  yüksek: "bg-red-500/20 text-red-300",
};

const HORIZON_COLORS: Record<AIRecommendation["timeHorizon"], string> = {
  "kısa vade": "bg-blue-500/20 text-blue-300",
  "orta vade": "bg-violet-500/20 text-violet-300",
  "uzun vade": "bg-cyan-500/20 text-cyan-300",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

// ── Components ──

function SummaryDashboard({ data }: { data: AIRecommendation[] }) {
  const counts = useMemo(() => {
    const map: Record<string, number> = {
      "Güçlü Al": 0,
      Al: 0,
      Tut: 0,
      Sat: 0,
      "Güçlü Sat": 0,
    };
    data.forEach((d) => (map[d.recommendation] = (map[d.recommendation] || 0) + 1));
    return map;
  }, [data]);

  const avgConfidence = useMemo(
    () => Math.round(data.reduce((s, d) => s + d.confidence, 0) / data.length),
    [data],
  );

  const avgUpside = useMemo(
    () => (data.reduce((s, d) => s + d.upside, 0) / data.length).toFixed(1),
    [data],
  );

  const summaryItems = [
    { label: "Güçlü Al", value: counts["Güçlü Al"], color: "text-emerald-400" },
    { label: "Al", value: counts["Al"], color: "text-emerald-300" },
    { label: "Tut", value: counts["Tut"], color: "text-yellow-400" },
    { label: "Sat", value: counts["Sat"], color: "text-red-400" },
    { label: "Güçlü Sat", value: counts["Güçlü Sat"], color: "text-red-500" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      {summaryItems.map((item) => (
        <div key={item.label} className="glass-card p-4 text-center">
          <p className="text-xs text-text-muted mb-1">{item.label}</p>
          <p className={`text-2xl font-bold font-mono ${item.color}`}>{item.value}</p>
        </div>
      ))}
      <div className="glass-card p-4 text-center">
        <p className="text-xs text-text-muted mb-1">Ort. Güven</p>
        <p className="text-2xl font-bold font-mono text-accent">%{avgConfidence}</p>
      </div>
      <div className="glass-card p-4 text-center">
        <p className="text-xs text-text-muted mb-1">Ort. Potansiyel</p>
        <p className={`text-2xl font-bold font-mono ${Number(avgUpside) >= 0 ? "text-up" : "text-down"}`}>
          %{avgUpside}
        </p>
      </div>
    </div>
  );
}

function ScoreRing({ score, size = 48 }: { score: number; size?: number }) {
  const pct = score;
  const color =
    score >= 75 ? "#10B981" : score >= 50 ? "#F59E0B" : "#EF4444";

  return (
    <div
      className="score-ring rounded-full flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        ["--ring-color" as string]: color,
        ["--ring-pct" as string]: pct,
      }}
    >
      <div
        className="rounded-full bg-primary flex items-center justify-center"
        style={{ width: size - 8, height: size - 8 }}
      >
        <span className="font-mono text-sm font-bold" style={{ color }}>
          {score}
        </span>
      </div>
    </div>
  );
}

function TargetPriceBar({ current, target }: { current: number; target: number }) {
  const isPositive = target >= current;
  const min = Math.min(current, target) * 0.9;
  const max = Math.max(current, target) * 1.1;
  const range = max - min;
  const currentPct = ((current - min) / range) * 100;
  const targetPct = ((target - min) / range) * 100;
  const leftPct = Math.min(currentPct, targetPct);
  const widthPct = Math.abs(targetPct - currentPct);

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-text-muted mb-1">
        <span>Mevcut: <span className="font-mono text-text-primary">{formatCurrency(current)}</span></span>
        <span>Hedef: <span className={`font-mono ${isPositive ? "text-up" : "text-down"}`}>{formatCurrency(target)}</span></span>
      </div>
      <div className="relative h-2.5 rounded-full bg-surface overflow-hidden">
        <div
          className={`absolute h-full rounded-full ${isPositive ? "bg-emerald-500/60" : "bg-red-500/60"}`}
          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
        />
        <div
          className="absolute top-0 h-full w-0.5 bg-text-primary"
          style={{ left: `${currentPct}%` }}
        />
        <div
          className={`absolute top-0 h-full w-0.5 ${isPositive ? "bg-emerald-400" : "bg-red-400"}`}
          style={{ left: `${targetPct}%` }}
        />
      </div>
    </div>
  );
}

function RecommendationCard({ rec }: { rec: AIRecommendation }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`glass-card overflow-hidden transition-all duration-300 ${expanded ? "ring-1 ring-accent/20" : ""}`}
    >
      {/* Collapsed header */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full text-left p-4 sm:p-5 flex items-center gap-3 sm:gap-5 cursor-pointer"
      >
        {/* Score ring */}
        <ScoreRing score={rec.aiScore} />

        {/* Ticker + name */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-bold text-base text-text-primary">{rec.ticker}</span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${REC_COLORS[rec.recommendation]}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${REC_DOT_COLORS[rec.recommendation]}`} />
              {rec.recommendation}
            </span>
          </div>
          <p className="text-xs text-text-muted truncate mt-0.5">{rec.name}</p>
        </div>

        {/* Price */}
        <div className="hidden sm:block text-right shrink-0">
          <p className="font-mono text-sm font-semibold">{formatCurrency(rec.price)}</p>
          <p className="font-mono text-xs text-text-muted">
            Hedef: <span className={rec.upside >= 0 ? "text-up" : "text-down"}>{formatCurrency(rec.targetPrice)}</span>
          </p>
        </div>

        {/* Upside */}
        <div className="hidden md:flex flex-col items-end shrink-0">
          <span className={`font-mono text-sm font-bold ${rec.upside >= 0 ? "text-up" : "text-down"}`}>
            {rec.upside >= 0 ? "+" : ""}
            {rec.upside.toFixed(1)}%
          </span>
          <span className="text-[10px] text-text-muted">potansiyel</span>
        </div>

        {/* Confidence bar */}
        <div className="hidden lg:flex flex-col items-end gap-1 shrink-0 w-24">
          <span className="text-[10px] text-text-muted">Güven %{rec.confidence}</span>
          <div className="w-full h-1.5 rounded-full bg-surface overflow-hidden">
            <div
              className="h-full rounded-full bg-accent/70"
              style={{ width: `${rec.confidence}%` }}
            />
          </div>
        </div>

        {/* Expand icon */}
        <svg
          className={`shrink-0 w-4 h-4 text-text-muted transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-border/30 px-4 sm:px-5 pb-5 pt-4 space-y-5 animate-in">
          {/* AI Reasoning */}
          <div>
            <h4 className="flex items-center gap-1.5 text-sm font-semibold text-accent mb-2">
              <span className="text-base">✦</span> AI Analizi
            </h4>
            <p className="text-sm text-text-secondary leading-relaxed">{rec.reasoning}</p>
          </div>

          {/* Three columns */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Strengths */}
            <div>
              <h5 className="text-xs font-semibold text-emerald-400 mb-2">Güçlü Yönler</h5>
              <ul className="space-y-1.5">
                {rec.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div>
              <h5 className="text-xs font-semibold text-red-400 mb-2">Zayıf Yönler</h5>
              <ul className="space-y-1.5">
                {rec.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>

            {/* Catalysts */}
            <div>
              <h5 className="text-xs font-semibold text-blue-400 mb-2">Katalizörler</h5>
              <ul className="space-y-1.5">
                {rec.catalysts.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Target price bar */}
          <TargetPriceBar current={rec.price} target={rec.targetPrice} />

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${RISK_COLORS[rec.riskLevel]}`}>
              Risk: {rec.riskLevel.charAt(0).toUpperCase() + rec.riskLevel.slice(1)}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${HORIZON_COLORS[rec.timeHorizon]}`}>
              {rec.timeHorizon.charAt(0).toUpperCase() + rec.timeHorizon.slice(1)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold bg-surface text-text-muted">
              Sektör: {rec.sector}
            </span>
            <span className="ml-auto text-[10px] text-text-muted">
              Son güncelleme: {formatDate(rec.lastUpdated)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function MethodologySection() {
  return (
    <div className="glass-card p-6 sm:p-8 mt-8">
      <h3 className="flex items-center gap-2 text-lg font-bold mb-4">
        <span className="text-accent">✦</span> AI Metodolojisi
      </h3>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h4 className="text-sm font-semibold text-emerald-400 mb-2">Temel Analiz</h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            F/K, PD/DD, FD/FAVOK oranları, ROE, net kar marjı, serbest nakit akışı ve bilanço sağlığı incelenir. Sektör ortalamaları ile karşılaştırmalı değerleme yapılır.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-blue-400 mb-2">Teknik Göstergeler</h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            Fiyat momentumu, RSI, hareketli ortalamalar ve hacim trendleri analiz edilir. Kısa ve orta vadeli teknik sinyaller değerlendirilir.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-violet-400 mb-2">Duygu Analizi</h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            KAP bildirimleri, iceriden ticaret verileri ve piyasa haberleri NLP ile analiz edilir. Kurumsal yatırımcı hareketleri takip edilir.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-yellow-400 mb-2">Bileşik Skorlama</h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            Snowflake, CANSLIM ve Buffett Değer skorları ağırlıklı olarak birleştirilir. DCF ve peer-comparison ile içsel değer hesaplanır.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──

export default function AITavsiyePage() {
  const [sortBy, setSortBy] = useState<SortKey>("aiScore");
  const [filterRec, setFilterRec] = useState<AIRecommendation["recommendation"] | "Tümü">("Tümü");

  const sorted = useMemo(() => {
    let list = [...MOCK_AI_RECOMMENDATIONS];
    if (filterRec !== "Tümü") {
      list = list.filter((r) => r.recommendation === filterRec);
    }
    list.sort((a, b) => {
      if (sortBy === "upside") return b.upside - a.upside;
      if (sortBy === "confidence") return b.confidence - a.confidence;
      return b.aiScore - a.aiScore;
    });
    return list;
  }, [sortBy, filterRec]);

  const recFilterOptions: (AIRecommendation["recommendation"] | "Tümü")[] = [
    "Tümü",
    "Güçlü Al",
    "Al",
    "Tut",
    "Sat",
    "Güçlü Sat",
  ];

  return (
    <section className="hero-gradient min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            <span className="text-accent">✦</span>{" "}
            <span className="gradient-text">AI Hisse Tavsiyesi</span>
          </h1>
          <p className="text-sm text-text-secondary mt-2 max-w-2xl">
            Yapay zeka, temel analiz, teknik göstergeler ve duygu analizini birleştirerek BIST hisseleri icin kapsamlı tavsiyeler oluşturur. Her hisse icin AI skoru, hedef fiyat ve detaylı gerekce sunar.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 px-4 py-3 mb-8">
          <div className="flex items-start gap-2">
            <span className="text-yellow-400 text-lg mt-0.5 shrink-0">⚠</span>
            <div>
              <p className="text-xs font-semibold text-yellow-300">
                Yatırım Tavsiyesi Değildir
              </p>
              <p className="text-[11px] text-yellow-200/70 mt-0.5">
                Bu sayfadaki tum analizler yapay zeka tarafından uretilmistir ve bilgilendirme amaclidir. Yatirim kararlari icin profesyonel danismanlik almaniz onerilir. Gecmis performans gelecek sonucların garantisi degildir.
              </p>
            </div>
          </div>
        </div>

        {/* Summary Dashboard */}
        <SummaryDashboard data={MOCK_AI_RECOMMENDATIONS} />

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-8 mb-4">
          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Sırala:</span>
            <div className="flex rounded-lg bg-surface/50 p-0.5">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSortBy(opt.key)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                    sortBy === opt.key
                      ? "bg-accent/20 text-accent"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-text-muted">Filtre:</span>
            {recFilterOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setFilterRec(opt)}
                className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
                  filterRec === opt
                    ? "bg-accent/20 text-accent ring-1 ring-accent/30"
                    : "bg-surface/50 text-text-muted hover:text-text-primary"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Recommendation Cards */}
        <div className="space-y-3">
          {sorted.map((rec) => (
            <RecommendationCard key={rec.ticker} rec={rec} />
          ))}
          {sorted.length === 0 && (
            <div className="glass-card p-8 text-center text-text-muted text-sm">
              Bu filtre icin sonuc bulunamadı.
            </div>
          )}
        </div>

        {/* Methodology */}
        <MethodologySection />

        {/* Bottom disclaimer */}
        <p className="text-center text-[10px] text-text-muted/50 mt-8">
          ✦ AI tarafından uretilen icerik &mdash; Son guncelleme: {formatDate(new Date().toISOString())}
        </p>
      </div>
    </section>
  );
}

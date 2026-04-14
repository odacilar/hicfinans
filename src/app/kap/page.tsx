"use client";

import { useState } from "react";
import { MOCK_KAP_NEWS, MOCK_KAP_SUMMARIES } from "@/lib/mock-data";

// ── Excel Download ──
function downloadAsExcel(news: typeof MOCK_KAP_NEWS[number]) {
  const headers = ["Tarih", "Saat", "Hisse", "Kategori", "Başlık", "Özet", "AI Özet", "Etki", "Tavsiye", "KAP URL"];
  const date = new Date(news.publishedAt);
  const ai = MOCK_KAP_SUMMARIES[news.id];
  const row = [
    date.toLocaleDateString("tr-TR"),
    date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
    news.ticker ?? "-",
    news.category ?? "-",
    news.title,
    news.summary ?? "-",
    ai?.summary ?? "-",
    ai?.impact ?? "-",
    ai?.recommendation ?? "-",
    news.url,
  ];
  const tsv = [headers.join("\t"), row.join("\t")].join("\n");
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + tsv], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `KAP_${news.ticker ?? "bildirim"}_${date.toISOString().split("T")[0]}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadAllAsExcel() {
  const headers = ["Tarih", "Saat", "Hisse", "Kategori", "Başlık", "Özet", "AI Özet", "Etki", "Tavsiye", "KAP URL"];
  const rows = MOCK_KAP_NEWS.map((news) => {
    const date = new Date(news.publishedAt);
    const ai = MOCK_KAP_SUMMARIES[news.id];
    return [
      date.toLocaleDateString("tr-TR"),
      date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      news.ticker ?? "-",
      news.category ?? "-",
      news.title,
      news.summary ?? "-",
      ai?.summary ?? "-",
      ai?.impact ?? "-",
      ai?.recommendation ?? "-",
      news.url,
    ].join("\t");
  });
  const tsv = [headers.join("\t"), ...rows].join("\n");
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + tsv], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `KAP_Tum_Bildirimler_${new Date().toISOString().split("T")[0]}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Categories ──
const CATEGORIES: { key: string; label: string; color: string; dotColor: string }[] = [
  { key: "bilanco", label: "Bilanço", color: "bg-score-future/12 text-score-future border-score-future/20", dotColor: "bg-score-future" },
  { key: "temettü", label: "Temettü", color: "bg-score-dividend/12 text-score-dividend border-score-dividend/20", dotColor: "bg-score-dividend" },
  { key: "genel_kurul", label: "Genel Kurul", color: "bg-score-past/12 text-score-past border-score-past/20", dotColor: "bg-score-past" },
  { key: "ortaklik", label: "Ortaklık", color: "bg-score-health/12 text-score-health border-score-health/20", dotColor: "bg-score-health" },
  { key: "diger", label: "Diğer", color: "bg-neutral/12 text-neutral border-neutral/20", dotColor: "bg-neutral" },
];

function getCat(category: string | null) {
  return CATEGORIES.find((c) => c.key === category) ?? CATEGORIES[4];
}

const IMPACT_STYLE = {
  pozitif: { bg: "bg-up/10", text: "text-up", border: "border-up/20", label: "Pozitif" },
  negatif: { bg: "bg-down/10", text: "text-down", border: "border-down/20", label: "Negatif" },
  nötr: { bg: "bg-neutral/10", text: "text-neutral", border: "border-neutral/20", label: "Nötr" },
};

// ── Accordion Card ──
function KapAccordionCard({ news }: { news: typeof MOCK_KAP_NEWS[number] }) {
  const [open, setOpen] = useState(false);
  const cat = getCat(news.category);
  const ai = MOCK_KAP_SUMMARIES[news.id];
  const impactStyle = ai ? IMPACT_STYLE[ai.impact] : null;

  return (
    <div className="glass-card overflow-hidden transition-all duration-300">
      {/* Header — always visible, clickable */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between cursor-pointer hover:bg-surface-hover/30 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="mb-2 flex items-center gap-2.5">
            {news.ticker && (
              <span className="flex items-center gap-1 rounded-lg bg-accent/10 px-2.5 py-1 font-mono text-xs font-bold text-accent">
                <span className="h-1.5 w-1.5 rounded-full bg-accent pulse-dot" />
                {news.ticker}
              </span>
            )}
            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${cat.color}`}>
              {cat.label}
            </span>
            {ai && (
              <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${impactStyle!.bg} ${impactStyle!.text} ${impactStyle!.border}`}>
                {ai.impact === "pozitif" ? "↑" : ai.impact === "negatif" ? "↓" : "→"} {impactStyle!.label}
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold leading-relaxed">
            {news.title}
          </h3>
          {news.summary && (
            <p className="mt-1.5 text-xs text-text-muted leading-relaxed line-clamp-1">{news.summary}</p>
          )}
        </div>
        <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1 shrink-0">
          <time className="whitespace-nowrap text-xs font-medium text-text-secondary">
            {new Date(news.publishedAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}
          </time>
          <span className="text-[11px] text-text-muted">
            {new Date(news.publishedAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
          </span>
          {/* Chevron */}
          <svg
            className={`h-4 w-4 text-text-muted transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded Content */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-border/50 px-5 pb-5 pt-4 space-y-4">
          {/* Original summary */}
          {news.summary && (
            <p className="text-xs text-text-secondary leading-relaxed">{news.summary}</p>
          )}

          {/* AI Summary Section */}
          {ai && (
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-accent text-sm">✦</span>
                <span className="text-xs font-semibold text-accent">AI Analiz</span>
                <span className="text-[9px] text-text-muted bg-surface/50 px-1.5 py-0.5 rounded">Gemini</span>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${impactStyle!.bg} ${impactStyle!.text}`}>
                    Etki: {ai.impactScore > 0 ? "+" : ""}{ai.impactScore}
                  </span>
                </div>
              </div>

              {/* AI Summary text */}
              <p className="text-xs text-text-primary leading-relaxed">{ai.summary}</p>

              {/* Financial Highlights */}
              {ai.financialHighlights && ai.financialHighlights.length > 0 && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {ai.financialHighlights.map((h, i) => (
                    <div key={i} className="rounded-lg bg-surface/50 p-2.5">
                      <span className="text-[10px] text-text-muted block">{h.metric}</span>
                      <span className="font-mono text-sm font-semibold text-text-primary">{h.value}</span>
                      {h.change && (
                        <span className={`ml-1.5 text-[10px] font-semibold ${
                          h.change.startsWith("+") ? "text-up" : h.change.startsWith("-") ? "text-down" : "text-text-muted"
                        }`}>
                          {h.change}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Key Points */}
              <div>
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Önemli Noktalar</span>
                <ul className="mt-1.5 space-y-1">
                  {ai.keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                      <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-accent/60 shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendation */}
              <div className="rounded-lg border border-score-health/20 bg-score-health/5 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <svg className="h-3 w-3 text-score-health" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-[10px] font-semibold text-score-health">Yatırımcı Notu</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{ai.recommendation}</p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={(e) => { e.stopPropagation(); downloadAsExcel(news); }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-up/10 px-3 py-1.5 text-[11px] font-semibold text-up transition-all hover:bg-up/20 cursor-pointer"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Excel İndir
            </button>
            <a
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 px-3 py-1.5 text-[11px] font-semibold text-text-muted transition-all hover:bg-surface-hover hover:text-text-primary"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              KAP&apos;ta Aç
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──
export default function KapPage() {
  return (
    <div className="hero-gradient min-h-screen">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">KAP Bildirimleri</h1>
          <p className="mt-1 text-sm text-text-muted">
            Kamuyu Aydınlatma Platformu bildirimleri — <span className="text-accent">✦ AI özetleri</span> ile
          </p>
        </div>

        {/* Category chips + download */}
        <div className="flex flex-wrap items-center gap-2">
          <button className="rounded-xl bg-gradient-to-r from-accent to-blue-700 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-accent/25">
            Tümü
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              className="glass-card !rounded-xl flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-text-muted transition-all hover:text-text-primary"
            >
              <div className={`h-2 w-2 rounded-full ${c.dotColor}`} />
              {c.label}
            </button>
          ))}
          <div className="ml-auto">
            <button
              onClick={downloadAllAsExcel}
              className="inline-flex items-center gap-1.5 rounded-xl bg-up/10 px-4 py-2 text-xs font-semibold text-up transition-all hover:bg-up/20 cursor-pointer"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Tümünü Excel&apos;e İndir
            </button>
          </div>
        </div>

        {/* Accordion News Cards */}
        <div className="space-y-3">
          {MOCK_KAP_NEWS.map((news) => (
            <KapAccordionCard key={news.id} news={news} />
          ))}
        </div>

        {/* Footer note */}
        <div className="rounded-xl border border-accent/10 bg-accent/5 p-3 text-center text-[10px] text-text-muted">
          ✦ AI özetleri Google Gemini 2.0 Flash ile oluşturulmaktadır. Yatırım tavsiyesi niteliği taşımaz.
        </div>
      </div>
    </div>
  );
}

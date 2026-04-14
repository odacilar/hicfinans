"use client";

import { useState, useMemo } from "react";
import {
  MOCK_ECONOMIC_EVENTS,
  IMPACT_MATRIX,
  EVENT_CATEGORY_LABELS,
  type EconomicEvent,
  type EventImportance,
  type EventCategory,
} from "@/lib/mock-economic-data";

// ── Helpers ──

const MONTHS = [
  { key: 4, label: "Nisan" },
  { key: 5, label: "Mayis" },
  { key: 6, label: "Haziran" },
];

const DAY_NAMES: Record<number, string> = {
  0: "Pazar",
  1: "Pazartesi",
  2: "Sali",
  3: "Carsamba",
  4: "Persembe",
  5: "Cuma",
  6: "Cumartesi",
};

const CATEGORY_OPTIONS: { key: EventCategory | "all"; label: string }[] = [
  { key: "all", label: "Tumunu Goster" },
  { key: "faiz", label: "Faiz" },
  { key: "enflasyon", label: "Enflasyon" },
  { key: "büyüme", label: "Buyume" },
  { key: "istihdam", label: "Istihdam" },
  { key: "dış_ticaret", label: "Dis Ticaret" },
  { key: "sanayi", label: "Sanayi" },
  { key: "güven", label: "Guven" },
  { key: "diğer", label: "Diger" },
];

const IMPORTANCE_OPTIONS: { key: EventImportance | "all"; label: string; color: string }[] = [
  { key: "all", label: "Tumunu Goster", color: "" },
  { key: "yüksek", label: "Yuksek", color: "bg-red-500" },
  { key: "orta", label: "Orta", color: "bg-yellow-500" },
  { key: "düşük", label: "Dusuk", color: "bg-neutral" },
];

function getMonth(iso: string) {
  return new Date(iso).getMonth() + 1;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
  });
}

function fmtDateFull(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  });
}

function getDayName(iso: string) {
  const d = new Date(iso).getDay();
  return DAY_NAMES[d] ?? "";
}

function isPast(iso: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(iso) < today;
}

function isToday(iso: string) {
  const today = new Date();
  const d = new Date(iso);
  return (
    today.getFullYear() === d.getFullYear() &&
    today.getMonth() === d.getMonth() &&
    today.getDate() === d.getDate()
  );
}

function daysUntil(iso: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(iso);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function countdownLabel(iso: string) {
  if (isToday(iso)) return "Bugun";
  const diff = daysUntil(iso);
  if (diff === 1) return "Yarin";
  if (diff < 0) return `${Math.abs(diff)} gun once`;
  return `${diff} gun sonra`;
}

function importanceDots(imp: EventImportance) {
  const count = imp === "yüksek" ? 3 : imp === "orta" ? 2 : 1;
  const color =
    imp === "yüksek"
      ? "bg-red-500"
      : imp === "orta"
        ? "bg-yellow-500"
        : "bg-neutral";
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={`inline-block h-1.5 w-1.5 rounded-full ${color}`} />
      ))}
    </span>
  );
}

function importanceBorder(imp: EventImportance) {
  if (imp === "yüksek") return "border-l-2 border-l-red-500/60";
  if (imp === "orta") return "border-l-2 border-l-yellow-500/40";
  return "border-l-2 border-l-neutral/30";
}

function actualColor(event: EconomicEvent) {
  // Simple heuristic: if actual and forecast both exist, compare numerically
  if (!event.actual || !event.forecast) return "";
  const parseNum = (s: string) => {
    const cleaned = s.replace(/[^0-9.,\-]/g, "").replace(",", ".");
    return parseFloat(cleaned);
  };
  const a = parseNum(event.actual);
  const f = parseNum(event.forecast);
  if (isNaN(a) || isNaN(f)) return "";

  // For most indicators, higher = better. For unemployment/deficit, lower = better
  const lowerIsBetter = ["istihdam", "dış_ticaret"].includes(event.category);

  if (lowerIsBetter) {
    return a < f ? "text-up" : a > f ? "text-down" : "";
  }
  return a > f ? "text-up" : a < f ? "text-down" : "";
}

// ── Impact Matrix Colors ──

function impactCellClass(level: "yüksek" | "orta" | "düşük" | undefined) {
  if (level === "yüksek") return "bg-red-500/20 text-red-400";
  if (level === "orta") return "bg-yellow-500/15 text-yellow-400";
  if (level === "düşük") return "bg-neutral/10 text-neutral";
  return "bg-transparent text-text-muted";
}

function impactLabel(level: "yüksek" | "orta" | "düşük" | undefined) {
  if (level === "yüksek") return "Yuksek";
  if (level === "orta") return "Orta";
  if (level === "düşük") return "Dusuk";
  return "\u2014";
}

// ── Component ──

export default function EconomicCalendarPage() {
  const [activeMonth, setActiveMonth] = useState(4);
  const [importanceFilter, setImportanceFilter] = useState<EventImportance | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<EventCategory | "all">("all");

  // Filtered events
  const filteredEvents = useMemo(() => {
    return MOCK_ECONOMIC_EVENTS.filter((e) => {
      if (getMonth(e.date) !== activeMonth) return false;
      if (importanceFilter !== "all" && e.importance !== importanceFilter) return false;
      if (categoryFilter !== "all" && e.category !== categoryFilter) return false;
      return true;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [activeMonth, importanceFilter, categoryFilter]);

  // Group by date
  const groupedEvents = useMemo(() => {
    const groups: Record<string, EconomicEvent[]> = {};
    for (const e of filteredEvents) {
      if (!groups[e.date]) groups[e.date] = [];
      groups[e.date].push(e);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredEvents]);

  // This week's high-importance events
  const thisWeekHighlight = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekLater = new Date(today);
    weekLater.setDate(weekLater.getDate() + 7);

    return MOCK_ECONOMIC_EVENTS.filter((e) => {
      const d = new Date(e.date);
      return d >= today && d <= weekLater && e.importance === "yüksek";
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, []);

  // Impact matrix sectors (union of all)
  const matrixSectors = useMemo(() => {
    const set = new Set<string>();
    for (const sectors of Object.values(IMPACT_MATRIX)) {
      for (const s of Object.keys(sectors)) set.add(s);
    }
    return Array.from(set).sort();
  }, []);

  const matrixCategories = Object.keys(IMPACT_MATRIX) as EventCategory[];

  return (
    <div className="hero-gradient min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* ── Header ── */}
        <div>
          <h1 className="gradient-text text-3xl font-bold tracking-tight sm:text-4xl">
            Ekonomik Takvim
          </h1>
          <p className="mt-2 text-text-secondary">
            Turkiye ekonomisini etkileyen temel veri aciklamalari, TCMB kararlari ve makroekonomik gostergeler
          </p>
        </div>

        {/* ── This Week Highlight ── */}
        {thisWeekHighlight.length > 0 && (
          <div className="glass-card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <span className="inline-block h-2 w-2 rounded-full bg-red-500 pulse-dot" />
              Bu Hafta Onemli Veriler
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {thisWeekHighlight.map((event) => (
                <div
                  key={event.id}
                  className="rounded-lg border border-red-500/20 bg-red-500/5 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-red-400">
                      {countdownLabel(event.date)}
                    </span>
                    <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] text-text-muted">
                      {event.source}
                    </span>
                  </div>
                  <p className="mt-2 font-semibold leading-tight">{event.title}</p>
                  <p className="mt-1 text-xs text-text-muted">
                    {fmtDate(event.date)} &middot; {event.time}
                  </p>
                  <div className="mt-2 flex items-center gap-3 font-mono text-xs">
                    <span className="text-text-muted">
                      Onceki: <span className="text-text-secondary">{event.previous}</span>
                    </span>
                    {event.forecast && (
                      <span className="text-text-muted">
                        Beklenti: <span className="text-accent">{event.forecast}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {thisWeekHighlight.length === 0 && (
              <p className="text-sm text-text-muted">
                Bu hafta yuksek onemli veri aciklamasi bulunmuyor.
              </p>
            )}
          </div>
        )}

        {/* ── Filter Bar ── */}
        <div className="glass-card p-4 space-y-4 sm:space-y-3">
          {/* Month Tabs */}
          <div className="flex items-center gap-1">
            {MONTHS.map((m) => (
              <button
                key={m.key}
                onClick={() => setActiveMonth(m.key)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  activeMonth === m.key
                    ? "bg-accent text-white"
                    : "text-text-muted hover:bg-surface-hover hover:text-text-secondary"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-4">
            {/* Importance Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted whitespace-nowrap">Onem:</span>
              <div className="flex items-center gap-1">
                {IMPORTANCE_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setImportanceFilter(opt.key)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      importanceFilter === opt.key
                        ? "bg-accent/20 text-accent"
                        : "text-text-muted hover:bg-surface-hover hover:text-text-secondary"
                    }`}
                  >
                    {opt.color && (
                      <span className={`inline-block h-1.5 w-1.5 rounded-full ${opt.color}`} />
                    )}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted whitespace-nowrap">Kategori:</span>
              <div className="flex flex-wrap items-center gap-1">
                {CATEGORY_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setCategoryFilter(opt.key)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      categoryFilter === opt.key
                        ? "bg-accent/20 text-accent"
                        : "text-text-muted hover:bg-surface-hover hover:text-text-secondary"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Calendar Timeline ── */}
        <div className="space-y-6">
          {groupedEvents.length === 0 && (
            <div className="glass-card p-12 text-center">
              <p className="text-text-muted">
                Secili filtrelere uygun ekonomik veri bulunamadi.
              </p>
            </div>
          )}

          {groupedEvents.map(([date, events]) => {
            const past = isPast(date);
            const today = isToday(date);

            return (
              <div key={date} className={past && !today ? "opacity-60" : ""}>
                {/* Date Header */}
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                      today
                        ? "bg-accent/20 text-accent"
                        : past
                          ? "bg-surface text-text-muted"
                          : "bg-surface text-text-secondary"
                    }`}
                  >
                    {fmtDate(date)}
                  </div>
                  <span className="text-xs text-text-muted">{getDayName(date)}</span>
                  {today && (
                    <span className="flex items-center gap-1 text-xs font-medium text-accent">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent pulse-dot" />
                      Bugun
                    </span>
                  )}
                </div>

                {/* Event Rows */}
                <div className="space-y-2">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className={`glass-card overflow-hidden pl-0 ${importanceBorder(event.importance)}`}
                    >
                      <div className="p-4 sm:p-5">
                        {/* Top Row: Time, Title, Importance, Source */}
                        <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
                          <span className="font-mono text-sm text-text-muted min-w-[3rem]">
                            {event.time}
                          </span>
                          <h3 className="flex-1 font-semibold leading-tight min-w-[200px]">
                            {event.title}
                          </h3>
                          <div className="flex items-center gap-3">
                            {importanceDots(event.importance)}
                            <span className="rounded-full bg-surface px-2.5 py-0.5 text-[10px] font-medium text-text-muted">
                              {event.source}
                            </span>
                            <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-medium text-accent">
                              {EVENT_CATEGORY_LABELS[event.category]}
                            </span>
                          </div>
                        </div>

                        {/* Data Row: Previous | Forecast | Actual */}
                        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-sm">
                          <div className="flex items-center gap-1.5">
                            <span className="text-text-muted text-xs">Onceki</span>
                            <span className="text-text-secondary font-medium">{event.previous}</span>
                          </div>
                          {event.forecast && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-text-muted text-xs">Beklenti</span>
                              <span className="text-accent font-medium">{event.forecast}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <span className="text-text-muted text-xs">Gerceklesen</span>
                            {event.actual ? (
                              <span className={`font-bold ${actualColor(event)}`}>
                                {event.actual}
                              </span>
                            ) : (
                              <span className="text-text-muted">&mdash;</span>
                            )}
                          </div>
                        </div>

                        {/* Impact & Sectors */}
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                          <p className="text-xs text-text-muted leading-relaxed flex-1 min-w-[200px]">
                            {event.impact}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {event.affectedSectors.map((sector) => (
                              <span
                                key={sector}
                                className="rounded-md bg-surface px-2 py-0.5 text-[10px] text-text-muted"
                              >
                                {sector}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Impact Matrix ── */}
        <div className="glass-card p-6">
          <h2 className="mb-1 text-lg font-semibold gradient-text">Etki Matrisi</h2>
          <p className="mb-5 text-xs text-text-muted">
            Ekonomik veri kategorilerinin sektorler uzerindeki etkisi
          </p>

          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-primary py-2 pr-3 text-left text-text-muted font-medium min-w-[100px]">
                    Kategori
                  </th>
                  {matrixSectors.map((sector) => (
                    <th
                      key={sector}
                      className="px-2 py-2 text-center text-text-muted font-medium whitespace-nowrap"
                    >
                      {sector}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrixCategories.map((cat) => (
                  <tr key={cat} className="border-t border-border/30">
                    <td className="sticky left-0 bg-primary py-2.5 pr-3 font-medium text-text-secondary">
                      {EVENT_CATEGORY_LABELS[cat]}
                    </td>
                    {matrixSectors.map((sector) => {
                      const level = IMPACT_MATRIX[cat]?.[sector];
                      return (
                        <td key={sector} className="px-2 py-2.5 text-center">
                          <span
                            className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-medium ${impactCellClass(level)}`}
                          >
                            {impactLabel(level)}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Disclaimer ── */}
        <p className="text-center text-xs text-text-muted py-4">
          Bu takvim bilgilendirme amaciyla hazirlanmistir, yatirim tavsiyesi niteligi tasimaz.
          Veriler resmi kaynaklardan derlenmektedir.
        </p>
      </div>
    </div>
  );
}

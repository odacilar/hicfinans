"use client";

import { useState, useMemo } from "react";
import { MOCK_DIVIDEND_CALENDAR, type DividendEvent } from "@/lib/mock-dividend-data";

// ── Helpers ──

const MONTHS = [
  { key: 4, label: "Nisan" },
  { key: 5, label: "Mayis" },
  { key: 6, label: "Haziran" },
  { key: 7, label: "Temmuz" },
  { key: 8, label: "Agustos" },
];

const DAY_LABELS = ["Pzt", "Sal", "Car", "Per", "Cum", "Cmt", "Paz"];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

function fmtCurrency(n: number) {
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getMonth(iso: string) {
  return new Date(iso).getMonth() + 1; // 1-indexed
}

function getDay(iso: string) {
  return new Date(iso).getDate();
}

function statusColor(s: DividendEvent["status"]) {
  if (s === "onaylandi") return "bg-up/20 text-up";
  if (s === "tavsiye") return "bg-accent/20 text-accent";
  return "bg-text-muted/20 text-text-muted";
}

function statusLabel(s: DividendEvent["status"]) {
  if (s === "onaylandi") return "Onaylandi";
  if (s === "tavsiye") return "Tavsiye";
  return "Bekleniyor";
}

// ── Calendar Grid Helpers ──

function buildCalendarGrid(year: number, month: number) {
  // month is 1-indexed
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();

  // getDay() returns 0=Sun, we want 0=Mon
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

// ── Component ──

export default function DividendCalendarPage() {
  const [activeMonth, setActiveMonth] = useState(4); // April
  const [view, setView] = useState<"timeline" | "calendar">("timeline");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Events for active month
  const monthEvents = useMemo(
    () => MOCK_DIVIDEND_CALENDAR.filter((e) => getMonth(e.exDate) === activeMonth).sort(
      (a, b) => new Date(a.exDate).getTime() - new Date(b.exDate).getTime()
    ),
    [activeMonth]
  );

  // Summary stats
  const now = new Date("2026-04-14");
  const next30 = new Date(now.getTime() + 30 * 86400000);
  const upcoming = MOCK_DIVIDEND_CALENDAR.filter(
    (e) => { const d = new Date(e.exDate); return d >= now && d <= next30; }
  );
  const avgYield = MOCK_DIVIDEND_CALENDAR.reduce((s, e) => s + e.dividendYield, 0) / MOCK_DIVIDEND_CALENDAR.length;
  const highestYield = MOCK_DIVIDEND_CALENDAR.reduce((best, e) => (e.dividendYield > best.dividendYield ? e : best), MOCK_DIVIDEND_CALENDAR[0]);
  const totalDividend = MOCK_DIVIDEND_CALENDAR.reduce((s, e) => s + e.dividendPerShare, 0);

  // Calendar grid
  const calendarCells = useMemo(() => buildCalendarGrid(2026, activeMonth), [activeMonth]);
  const exDateDays = useMemo(() => {
    const map: Record<number, DividendEvent[]> = {};
    monthEvents.forEach((e) => {
      const d = getDay(e.exDate);
      if (!map[d]) map[d] = [];
      map[d].push(e);
    });
    return map;
  }, [monthEvents]);

  // Selected day events (calendar view)
  const selectedDayEvents = selectedDay ? (exDateDays[selectedDay] || []) : [];

  // Sorted by yield descending for ranking table
  const sortedByYield = useMemo(
    () => [...MOCK_DIVIDEND_CALENDAR].sort((a, b) => b.dividendYield - a.dividendYield),
    []
  );

  return (
    <main className="min-h-screen hero-gradient">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">

        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold sm:text-4xl">
            <span className="gradient-text-accent">Temettu Takvimi</span>
          </h1>
          <p className="mt-2 text-text-secondary">
            BIST hisselerinin temettu dagitim tarihleri, verimleri ve odeme planlari
          </p>
        </div>

        {/* ── Summary Stats ── */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="glass-card p-5">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Yaklasan (30 Gun)</p>
            <p className="mt-2 text-2xl font-bold font-mono text-accent">{upcoming.length}</p>
            <p className="mt-1 text-xs text-text-muted">temettu odemesi</p>
          </div>
          <div className="glass-card p-5">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Ort. Temettu Verimi</p>
            <p className="mt-2 text-2xl font-bold font-mono text-up">%{avgYield.toFixed(1)}</p>
            <p className="mt-1 text-xs text-text-muted">tum hisseler</p>
          </div>
          <div className="glass-card p-5">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider">En Yuksek Verim</p>
            <p className="mt-2 text-2xl font-bold font-mono text-score-dividend">%{highestYield.dividendYield.toFixed(1)}</p>
            <p className="mt-1 text-xs text-text-muted font-mono">{highestYield.ticker}</p>
          </div>
          <div className="glass-card p-5">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Toplam HBB Temettu</p>
            <p className="mt-2 text-2xl font-bold font-mono">{fmtCurrency(totalDividend)} TL</p>
            <p className="mt-1 text-xs text-text-muted">tum hisseler toplami</p>
          </div>
        </div>

        {/* ── View Toggle + Month Tabs ── */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Month tabs */}
          <div className="flex items-center gap-1 rounded-xl bg-surface/50 p-1 overflow-x-auto">
            {MONTHS.map((m) => (
              <button
                key={m.key}
                onClick={() => { setActiveMonth(m.key); setSelectedDay(null); }}
                className={`rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                  activeMonth === m.key
                    ? "bg-accent/15 text-accent shadow-sm"
                    : "text-text-muted hover:bg-surface-hover hover:text-text-primary"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 rounded-xl bg-surface/50 p-1">
            <button
              onClick={() => setView("timeline")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                view === "timeline"
                  ? "bg-accent/15 text-accent"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Zaman Cizgisi
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                view === "calendar"
                  ? "bg-accent/15 text-accent"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Takvim
            </button>
          </div>
        </div>

        {/* ── Timeline View ── */}
        {view === "timeline" && (
          <div className="mb-10 space-y-4">
            {monthEvents.length === 0 && (
              <div className="glass-card p-8 text-center text-text-muted">
                Bu ay icin planlanmis temettu odemesi bulunmuyor.
              </div>
            )}
            {monthEvents.map((ev) => (
              <div key={ev.ticker} className="glass-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                {/* Date circle */}
                <div className="flex shrink-0 items-center gap-4 sm:w-24 sm:flex-col sm:gap-1">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-accent/30 bg-accent/10">
                    <span className="text-xl font-bold font-mono text-accent">{getDay(ev.exDate)}</span>
                  </div>
                  <span className="text-xs text-text-muted">
                    {MONTHS.find((m) => m.key === activeMonth)?.label}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-bold text-accent">{ev.ticker}</span>
                    <span className="text-sm text-text-secondary truncate">{ev.name}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusColor(ev.status)}`}>
                      {statusLabel(ev.status)}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-text-muted">
                    <span>Odeme: <span className="text-text-secondary">{fmtDate(ev.paymentDate)}</span></span>
                    <span>Siklик: <span className="text-text-secondary capitalize">{ev.frequency}</span></span>
                    <span>Sektor: <span className="text-text-secondary">{ev.sector}</span></span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  <div className="text-center">
                    <p className="text-xs text-text-muted">HBB Temettu</p>
                    <p className="font-mono text-lg font-bold">{fmtCurrency(ev.dividendPerShare)} TL</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-text-muted">Verim</p>
                    <p className={`font-mono text-lg font-bold ${ev.dividendYield >= 5 ? "text-up" : ""}`}>
                      %{ev.dividendYield.toFixed(1)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-text-muted">Buyume</p>
                    <p className={`font-mono text-sm font-semibold ${ev.growthVsPrevious >= 0 ? "text-up" : "text-down"}`}>
                      {ev.growthVsPrevious >= 0 ? "+" : ""}{ev.growthVsPrevious.toFixed(1)}%
                    </p>
                  </div>
                  <div className="w-24">
                    <p className="text-xs text-text-muted mb-1">Dagitim %{ev.payoutRatio}</p>
                    <div className="h-2 w-full rounded-full bg-surface">
                      <div
                        className="h-2 rounded-full bg-accent/60"
                        style={{ width: `${Math.min(ev.payoutRatio, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Calendar Grid View ── */}
        {view === "calendar" && (
          <div className="mb-10">
            <div className="glass-card p-5">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAY_LABELS.map((d) => (
                  <div key={d} className="text-center text-xs font-semibold text-text-muted py-2">{d}</div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1">
                {calendarCells.map((day, i) => {
                  const hasEvents = day !== null && exDateDays[day];
                  const isSelected = day !== null && day === selectedDay;
                  return (
                    <button
                      key={i}
                      disabled={day === null}
                      onClick={() => day !== null && setSelectedDay(isSelected ? null : day)}
                      className={`relative flex h-14 sm:h-20 flex-col items-center justify-center rounded-lg text-sm transition-all ${
                        day === null
                          ? "cursor-default"
                          : isSelected
                            ? "bg-accent/20 border border-accent/40 text-accent"
                            : hasEvents
                              ? "bg-surface hover:bg-surface-hover cursor-pointer border border-transparent"
                              : "bg-surface/30 text-text-muted border border-transparent"
                      }`}
                    >
                      {day !== null && (
                        <>
                          <span className={`font-mono font-medium ${hasEvents ? "text-text-primary" : ""}`}>{day}</span>
                          {hasEvents && (
                            <div className="mt-1 flex gap-0.5">
                              {exDateDays[day].map((ev) => (
                                <span
                                  key={ev.ticker}
                                  className="h-1.5 w-1.5 rounded-full bg-accent"
                                  title={ev.ticker}
                                />
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected day detail */}
            {selectedDay !== null && selectedDayEvents.length > 0 && (
              <div className="mt-4 space-y-3">
                <h3 className="text-sm font-semibold text-text-secondary">
                  {selectedDay} {MONTHS.find((m) => m.key === activeMonth)?.label} 2026 - Son Hak Kullanim
                </h3>
                {selectedDayEvents.map((ev) => (
                  <div key={ev.ticker} className="glass-card flex items-center gap-4 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                      <span className="font-mono text-xs font-bold text-accent">{ev.ticker}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{ev.name}</p>
                      <p className="text-xs text-text-muted">{ev.sector}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-bold">{fmtCurrency(ev.dividendPerShare)} TL</p>
                      <p className={`font-mono text-xs ${ev.dividendYield >= 5 ? "text-up" : "text-text-secondary"}`}>
                        %{ev.dividendYield.toFixed(1)} verim
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedDay !== null && selectedDayEvents.length === 0 && (
              <div className="mt-4 glass-card p-6 text-center text-text-muted text-sm">
                Bu gunde planlanmis temettu odemesi yok.
              </div>
            )}
          </div>
        )}

        {/* ── Dividend Ranking Table ── */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-bold gradient-text">Temettu Siralamasi</h2>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Hisse</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Ad</th>
                    <th className="px-4 py-3 text-right">Verim</th>
                    <th className="px-4 py-3 text-right">HBB Temettu</th>
                    <th className="px-4 py-3 hidden md:table-cell">Son Hak</th>
                    <th className="px-4 py-3 hidden md:table-cell">Odeme</th>
                    <th className="px-4 py-3 text-center hidden sm:table-cell">Durum</th>
                    <th className="px-4 py-3 text-right">Buyume</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedByYield.map((ev, idx) => (
                    <tr
                      key={ev.ticker}
                      className={`table-row-hover border-b border-border/20 ${ev.dividendYield < 2 ? "opacity-50" : ""}`}
                    >
                      <td className="px-4 py-3 font-mono text-text-muted">{idx + 1}</td>
                      <td className="px-4 py-3 font-mono font-bold text-accent">{ev.ticker}</td>
                      <td className="px-4 py-3 text-text-secondary hidden sm:table-cell truncate max-w-[200px]">{ev.name}</td>
                      <td className={`px-4 py-3 text-right font-mono font-semibold ${ev.dividendYield >= 5 ? "text-up" : ""}`}>
                        %{ev.dividendYield.toFixed(1)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{fmtCurrency(ev.dividendPerShare)} TL</td>
                      <td className="px-4 py-3 hidden md:table-cell text-text-muted text-xs">{fmtDate(ev.exDate)}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-text-muted text-xs">{fmtDate(ev.paymentDate)}</td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColor(ev.status)}`}>
                          {statusLabel(ev.status)}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-right font-mono text-xs ${ev.growthVsPrevious >= 0 ? "text-up" : "text-down"}`}>
                        {ev.growthVsPrevious >= 0 ? "+" : ""}{ev.growthVsPrevious.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-text-muted mt-8">
          Bu sayfa yatirim tavsiyesi niteligi tasimaz. Temettu bilgileri bilgilendirme amaciyla sunulmaktadir.
          Kesinlesmemis veriler tahmini niteliktedir.
        </p>
      </div>
    </main>
  );
}

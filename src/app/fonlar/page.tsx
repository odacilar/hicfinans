"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MOCK_FUND_MANAGERS, type FundManager } from "@/lib/mock-data";

function formatAum(value: number): string {
  if (value >= 1_000_000_000) {
    return `₺${(value / 1_000_000_000).toFixed(1)} Mr`;
  }
  if (value >= 1_000_000) {
    return `₺${(value / 1_000_000).toFixed(0)} Mn`;
  }
  return `₺${value.toLocaleString("tr-TR")}`;
}

function ReturnBadge({ value, label }: { value: number; label: string }) {
  const color = value >= 0 ? "text-up" : "text-down";
  const bg = value >= 0 ? "bg-up/10" : "bg-down/10";
  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] text-text-muted">{label}</span>
      <span className={`font-mono text-sm font-bold ${color} ${bg} rounded-md px-2 py-0.5`}>
        {value >= 0 ? "+" : ""}
        {value.toFixed(1)}%
      </span>
    </div>
  );
}

const CHANGE_STYLES: Record<
  FundManager["topHoldings"][number]["change"],
  { label: string; className: string }
> = {
  arttırdı: { label: "Arttırdı", className: "bg-up/12 text-up border-up/20" },
  azalttı: { label: "Azalttı", className: "bg-down/12 text-down border-down/20" },
  yeni: { label: "Yeni", className: "bg-accent/12 text-accent border-accent/20" },
  sabit: { label: "Sabit", className: "bg-neutral/12 text-neutral border-neutral/20" },
};

const STYLE_COLORS: Record<string, string> = {
  Değer: "bg-score-value/12 text-score-value border-score-value/20",
  Büyüme: "bg-score-future/12 text-score-future border-score-future/20",
  Karma: "bg-score-past/12 text-score-past border-score-past/20",
  "Agresif Büyüme": "bg-score-dividend/12 text-score-dividend border-score-dividend/20",
};

function FundManagerCard({ manager }: { manager: FundManager }) {
  const styleClass = STYLE_COLORS[manager.style] ?? "bg-neutral/12 text-neutral border-neutral/20";

  return (
    <div className="glass-card p-5 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5 mb-1">
            <h2 className="text-lg font-bold text-text-primary">{manager.name}</h2>
            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${styleClass}`}>
              {manager.style}
            </span>
          </div>
          <p className="text-sm text-text-muted">{manager.fund}</p>
        </div>

        <div className="flex items-center gap-4 sm:gap-5">
          <div className="flex flex-col items-center sm:items-end">
            <span className="text-[10px] text-text-muted">AUM</span>
            <span className="font-mono text-base font-bold text-accent">
              {formatAum(manager.aum)}
            </span>
          </div>
          <ReturnBadge value={manager.returnYtd} label="YTD" />
          <ReturnBadge value={manager.return1y} label="1Y" />
          <ReturnBadge value={manager.return3y} label="3Y" />
        </div>
      </div>

      {/* Holdings table */}
      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border/30">
              <th className="pb-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                Hisse
              </th>
              <th className="pb-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted hidden sm:table-cell">
                {"\u015Eirket"}
              </th>
              <th className="pb-2 text-right text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                {"A\u011F\u0131rl\u0131k"}
              </th>
              <th className="pb-2 pl-3 text-[10px] font-semibold uppercase tracking-wider text-text-muted min-w-[120px] hidden sm:table-cell">
                {/* bar column */}
              </th>
              <th className="pb-2 text-right text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                {"De\u011Fi\u015Fim"}
              </th>
            </tr>
          </thead>
          <tbody>
            {manager.topHoldings.map((h) => {
              const changeStyle = CHANGE_STYLES[h.change];
              const maxWeight = Math.max(...manager.topHoldings.map((x) => x.weight));
              const barPercent = (h.weight / maxWeight) * 100;

              return (
                <tr
                  key={h.ticker}
                  className="border-b border-border/10 last:border-0 hover:bg-surface-hover/30 transition-colors"
                >
                  <td className="py-2.5">
                    <span className="rounded-lg bg-accent/10 px-2 py-1 font-mono text-xs font-bold text-accent">
                      {h.ticker}
                    </span>
                  </td>
                  <td className="py-2.5 text-xs text-text-secondary hidden sm:table-cell">
                    {h.name}
                  </td>
                  <td className="py-2.5 text-right font-mono text-sm font-semibold text-text-primary">
                    %{h.weight.toFixed(1)}
                  </td>
                  <td className="py-2.5 pl-3 hidden sm:table-cell">
                    <div className="h-2 w-full rounded-full bg-surface">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-accent/60 to-accent transition-all duration-500"
                        style={{ width: `${barPercent}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-2.5 text-right">
                    <span
                      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold ${changeStyle.className}`}
                    >
                      {changeStyle.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-border/20 pt-3">
        <span className="text-[10px] text-text-muted">
          {"Son G\u00FCncelleme: "}
          {new Date(manager.lastUpdate).toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
        <span className="text-[10px] text-text-muted font-mono">
          {manager.topHoldings.length} pozisyon
        </span>
      </div>
    </div>
  );
}

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

export default function FonlarPage() {
  // Sort by AUM descending
  const sorted = [...MOCK_FUND_MANAGERS].sort((a, b) => b.aum - a.aum);

  return (
    <div className="hero-gradient min-h-screen">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">
            {"Fon Y\u00F6neticileri"}
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {"T\u00FCrkiye\u2019nin \u00F6nde gelen fon y\u00F6neticileri ve portf\u00F6y da\u011F\u0131l\u0131mlar\u0131"}
          </p>
        </div>

        {/* Sub-nav */}
        <FonlarSubNav />

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="glass-card p-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              Toplam AUM
            </p>
            <p className="mt-1 font-mono text-xl font-bold text-accent">
              {formatAum(sorted.reduce((s, m) => s + m.aum, 0))}
            </p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              {"Fon Y\u00F6neticisi"}
            </p>
            <p className="mt-1 font-mono text-xl font-bold text-text-primary">
              {sorted.length}
            </p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              Ort. YTD Getiri
            </p>
            <p className="mt-1 font-mono text-xl font-bold text-up">
              +{(sorted.reduce((s, m) => s + m.returnYtd, 0) / sorted.length).toFixed(1)}%
            </p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              {"En \u00C7ok Tutulan"}
            </p>
            <p className="mt-1 font-mono text-xl font-bold text-accent">THYAO</p>
          </div>
        </div>

        {/* Fund manager cards */}
        <div className="space-y-4">
          {sorted.map((manager) => (
            <FundManagerCard key={manager.id} manager={manager} />
          ))}
        </div>
      </div>
    </div>
  );
}

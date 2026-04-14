import { MOCK_STOCKS, MOCK_MARKET_SUMMARY, MOCK_KAP_NEWS } from "@/lib/mock-data";
import { formatNumber, formatPercent } from "@/lib/formatters";
import Link from "next/link";

function MarketTicker() {
  const items = [
    { label: "BIST 100", ...MOCK_MARKET_SUMMARY.bist100 },
    { label: "BIST 30", ...MOCK_MARKET_SUMMARY.bist30 },
    { label: "USD/TRY", ...MOCK_MARKET_SUMMARY.usdTry },
    { label: "EUR/TRY", ...MOCK_MARKET_SUMMARY.eurTry },
    { label: "Altın/g", ...MOCK_MARKET_SUMMARY.goldTry },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => {
        const isUp = item.change >= 0;
        return (
          <div key={item.label} className="glass-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium tracking-wide text-text-muted uppercase">{item.label}</span>
              <div className={`flex h-5 w-5 items-center justify-center rounded-md text-[9px] ${isUp ? "bg-up/10 text-up" : "bg-down/10 text-down"}`}>
                {isUp ? "▲" : "▼"}
              </div>
            </div>
            <div className="mt-3 font-mono text-2xl font-bold tracking-tight">
              {formatNumber(item.value)}
            </div>
            <div className={`mt-1 font-mono text-sm font-semibold ${isUp ? "text-up" : "text-down"}`}>
              {formatPercent(item.change)}
            </div>
            {/* Mini sparkline bar */}
            <div className="mt-3 flex items-end gap-[2px] h-4">
              {Array.from({ length: 12 }, (_, i) => {
                const h = 30 + Math.sin(i / 2 + item.value) * 40 + Math.random() * 30;
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-sm ${isUp ? "bg-up/30" : "bg-down/30"} ${i === 11 ? (isUp ? "bg-up" : "bg-down") : ""}`}
                    style={{ height: `${h}%` }}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TopMovers() {
  const gainers = [...MOCK_STOCKS].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  const losers = [...MOCK_STOCKS].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);

  function MoverCard({ items, type }: { items: typeof gainers; type: "up" | "down" }) {
    const color = type === "up" ? "up" : "down";
    return (
      <div className="glass-card overflow-hidden">
        <div className={`flex items-center gap-2 border-b border-border/50 px-5 py-3`}>
          <div className={`h-2 w-2 rounded-full bg-${color} pulse-dot`} />
          <h3 className="text-sm font-bold">
            {type === "up" ? "En Çok Yükselenler" : "En Çok Düşenler"}
          </h3>
        </div>
        <div className="p-2">
          {items.map((s, i) => (
            <Link
              key={s.ticker}
              href={`/hisseler/${s.ticker}`}
              className="table-row-hover flex items-center gap-3 rounded-xl px-3 py-3"
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded-lg bg-${color}/10 font-mono text-[11px] font-bold text-${color}`}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold">{s.ticker}</span>
                  <span className="truncate text-[11px] text-text-muted">{s.name.split(" ").slice(0, 2).join(" ")}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm font-semibold">{formatNumber(s.price)}</div>
                <div className={`font-mono text-xs font-bold text-${color}`}>
                  {formatPercent(s.changePercent)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <MoverCard items={gainers} type="up" />
      <MoverCard items={losers} type="down" />
    </div>
  );
}

function TopScores() {
  const top = [...MOCK_STOCKS].sort((a, b) => b.overallScore - a.overallScore).slice(0, 6);

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
        <h3 className="text-sm font-bold">En Yüksek Skorlar</h3>
        <Link href="/hisseler" className="text-xs font-medium text-accent hover:underline">Tümü &rarr;</Link>
      </div>
      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3">
        {top.map((s) => {
          const pct = (s.overallScore / 5) * 100;
          return (
            <Link
              key={s.ticker}
              href={`/hisseler/${s.ticker}`}
              className="group flex items-center gap-3 rounded-xl bg-primary/40 p-3 transition-all hover:bg-primary/70"
            >
              {/* Score ring */}
              <div
                className="score-ring relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full p-[3px]"
                style={{ "--ring-color": "#10B981", "--ring-pct": pct } as React.CSSProperties}
              >
                <div className="flex h-full w-full items-center justify-center rounded-full bg-primary">
                  <span className="font-mono text-sm font-bold text-score-value">{s.overallScore.toFixed(1)}</span>
                </div>
              </div>
              <div className="min-w-0">
                <div className="font-mono text-sm font-bold group-hover:text-accent transition-colors">{s.ticker}</div>
                <div className="truncate text-[10px] text-text-muted">{s.sector}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function LatestKapNews() {
  const news = MOCK_KAP_NEWS.slice(0, 6);

  const catConfig: Record<string, { color: string; label: string }> = {
    bilanco: { color: "bg-score-future/15 text-score-future", label: "Bilanço" },
    temettü: { color: "bg-score-dividend/15 text-score-dividend", label: "Temettü" },
    genel_kurul: { color: "bg-score-past/15 text-score-past", label: "Genel Kurul" },
    ortaklik: { color: "bg-score-health/15 text-score-health", label: "Ortaklık" },
    diger: { color: "bg-neutral/15 text-neutral", label: "Diğer" },
  };

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
        <h3 className="text-sm font-bold">Son KAP Bildirimleri</h3>
        <Link href="/kap" className="text-xs font-medium text-accent hover:underline">Tümü &rarr;</Link>
      </div>
      <div className="p-2">
        {news.map((n) => {
          const cat = catConfig[n.category ?? "diger"] ?? catConfig.diger;
          return (
            <div key={n.id} className="table-row-hover flex items-start gap-3 rounded-xl px-3 py-3">
              {n.ticker && (
                <span className="mt-0.5 shrink-0 rounded-lg bg-accent/8 px-2 py-0.5 font-mono text-[11px] font-bold text-accent">
                  {n.ticker}
                </span>
              )}
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-medium leading-relaxed">{n.title}</p>
                {n.summary && <p className="mt-0.5 truncate text-[11px] text-text-muted">{n.summary}</p>}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${cat.color}`}>
                  {cat.label}
                </span>
                <span className="text-[10px] text-text-muted">
                  {new Date(n.publishedAt).toLocaleDateString("tr-TR")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="hero-gradient min-h-screen">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        {/* Hero */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Piyasa Genel Bakış</h1>
          <p className="text-sm text-text-muted">
            Borsa İstanbul ve piyasa verileri &middot; Canlı
          </p>
        </div>

        <MarketTicker />
        <TopMovers />

        <div className="grid gap-6 lg:grid-cols-2">
          <LatestKapNews />
          <TopScores />
        </div>
      </div>
    </div>
  );
}

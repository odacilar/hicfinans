import { MOCK_STOCK_DETAIL, MOCK_PRICE_HISTORY, MOCK_FINANCIALS, MOCK_ANALYST_RATINGS, MOCK_STOCKS } from "@/lib/mock-data";
import { formatNumber, formatPercent, formatMarketCap, formatCurrency } from "@/lib/formatters";
import { SCORE_LABELS, SCORE_COLORS } from "@/lib/constants";
import SnowflakeChart from "@/components/charts/SnowflakeChart";
import PriceChart from "@/components/charts/PriceChart";
import FinancialBarChart from "@/components/charts/FinancialBarChart";
import AnalysisTabs from "@/components/stock/AnalysisTabs";
import Link from "next/link";

function SectionCard({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-border bg-surface p-5 ${className}`}>
      <h2 className="mb-4 text-base font-bold">{title}</h2>
      {children}
    </div>
  );
}

function StatBox({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-primary/60 p-3">
      <span className="text-[11px] text-text-muted">{label}</span>
      <span className={`font-mono text-sm font-semibold ${color ?? ""}`}>{value}</span>
      {sub && <span className="text-[10px] text-text-muted">{sub}</span>}
    </div>
  );
}

function ProgressBar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-3">
      <span className="w-12 text-right font-mono text-xs font-medium" style={{ color }}>{value.toFixed(1)}</span>
      <div className="flex-1">
        <div className="mb-0.5 flex justify-between">
          <span className="text-[11px] text-text-secondary">{label}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-border/50">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
        </div>
      </div>
    </div>
  );
}

export default async function StockDetailPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();

  const stock = MOCK_STOCKS.find((s) => s.ticker === upperTicker);
  const detail = MOCK_STOCK_DETAIL;
  const scores = detail.scores!;
  const price = detail.latestPrice!;

  const consensusTarget = MOCK_ANALYST_RATINGS.reduce((a, r) => a + r.targetPrice, 0) / MOCK_ANALYST_RATINGS.length;
  const consensusUpside = MOCK_ANALYST_RATINGS.reduce((a, r) => a + r.upside, 0) / MOCK_ANALYST_RATINGS.length;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-text-muted">
        <Link href="/hisseler" className="hover:text-accent">Hisseler</Link>
        <span>/</span>
        <span className="text-text-primary">{upperTicker}</span>
      </nav>

      {/* Hero Header */}
      <div className="flex flex-col gap-6 rounded-2xl border border-border bg-gradient-to-br from-surface to-secondary p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 font-mono text-lg font-bold text-accent">
              {upperTicker.slice(0, 2)}
            </div>
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold">
                {upperTicker}
                <span className="rounded-lg bg-primary/60 px-2.5 py-0.5 text-xs font-medium text-text-secondary">
                  {detail.sector}
                </span>
              </h1>
              <p className="text-sm text-text-secondary">{detail.name}</p>
            </div>
          </div>
        </div>
        <div className="flex items-end gap-6">
          <div className="text-right">
            <div className="font-mono text-4xl font-bold tracking-tight">
              {formatCurrency(price.close)}
            </div>
            <div className="mt-1 flex items-center justify-end gap-2">
              <span className={`font-mono text-lg font-semibold ${price.changePercent >= 0 ? "text-up" : "text-down"}`}>
                {price.change >= 0 ? "+" : ""}{formatNumber(price.change)} ({formatPercent(price.changePercent)})
              </span>
            </div>
            <div className="mt-1 text-xs text-text-muted">
              Hacim: {formatNumber(price.volume / 1e6, 1)}M &middot; {new Date(price.date).toLocaleDateString("tr-TR")}
            </div>
          </div>
        </div>
      </div>

      {/* Snowflake + Quick Stats */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Snowflake */}
        <SectionCard title="Snowflake Analizi" className="lg:col-span-5">
          <SnowflakeChart scores={scores} size="lg" />
          <div className="mt-4 space-y-2.5">
            {(Object.keys(SCORE_LABELS) as (keyof typeof SCORE_LABELS)[]).map((key) => (
              <ProgressBar
                key={key}
                value={scores[key]}
                max={5}
                color={SCORE_COLORS[key]}
                label={SCORE_LABELS[key]}
              />
            ))}
          </div>
        </SectionCard>

        {/* Right column */}
        <div className="flex flex-col gap-6 lg:col-span-7">
          {/* Quick stats grid */}
          <SectionCard title="Temel Göstergeler">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
              <StatBox label="F/K Oranı" value="8.2x" sub="Sektör ort: 12.5x" color="text-up" />
              <StatBox label="PD/DD" value="2.4x" sub="Sektör ort: 3.1x" color="text-up" />
              <StatBox label="FD/FAVÖK" value="5.1x" sub="Sektör ort: 7.8x" color="text-up" />
              <StatBox label="ROE" value="%28.4" sub="5Y ort: %24.2" />
              <StatBox label="Net Kar Marjı" value="%14.7" sub="Önceki çeyrek: %16.5" />
              <StatBox label="Borç/Özkaynak" value="0.67" sub="Sektör ort: 1.2" color="text-up" />
              <StatBox label="Cari Oran" value="1.32" sub="Min sağlıklı: 1.0" />
              <StatBox label="Temettü Verimi" value="%3.8" sub="Son 5Y ort: %3.2" color="text-score-dividend" />
            </div>
          </SectionCard>

          {/* Risk/Reward mini */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-up/20 bg-up/5 p-4">
              <h3 className="mb-2 text-xs font-semibold text-up">Olumlu Sinyaller</h3>
              <ul className="space-y-1.5 text-xs text-text-secondary">
                <li className="flex items-start gap-2"><span className="mt-0.5 text-up">+</span>F/K sektör ortalamasının altında</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-up">+</span>Son 3 yılda gelir büyümesi sürekli pozitif</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-up">+</span>Analist konsensüsü AL yönünde</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-up">+</span>Serbest nakit akışı güçlü</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-down/20 bg-down/5 p-4">
              <h3 className="mb-2 text-xs font-semibold text-down">Risk Faktörleri</h3>
              <ul className="space-y-1.5 text-xs text-text-secondary">
                <li className="flex items-start gap-2"><span className="mt-0.5 text-down">-</span>Döviz kuru dalgalanmalarına yüksek maruziyet</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-down">-</span>Yakıt maliyetleri baskısı devam ediyor</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-down">-</span>Net kar marjı bir önceki çeyrekte geriledi</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <SectionCard title="Fiyat Grafiği">
        <PriceChart data={MOCK_PRICE_HISTORY} />
      </SectionCard>

      {/* Deep Analysis Tabs */}
      <AnalysisTabs scores={scores} />

      {/* Financials */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Gelir & Kar Trendi">
          <FinancialBarChart data={MOCK_FINANCIALS} />
        </SectionCard>

        <SectionCard title="Çeyreklik Finansal Tablo">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left text-text-muted">
                  <th className="py-2 pr-3 font-medium">Dönem</th>
                  <th className="py-2 px-2 text-right font-medium">Hasılat</th>
                  <th className="py-2 px-2 text-right font-medium">FAVÖK</th>
                  <th className="py-2 px-2 text-right font-medium">Net Kar</th>
                  <th className="py-2 px-2 text-right font-medium">HBK</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_FINANCIALS.map((f) => (
                  <tr key={f.period} className="border-b border-border/40 hover:bg-surface-hover">
                    <td className="py-2.5 pr-3 font-mono font-medium">{f.period}</td>
                    <td className="py-2.5 px-2 text-right font-mono">{f.revenue ? `${(f.revenue / 1e9).toFixed(0)} Mr` : "-"}</td>
                    <td className="py-2.5 px-2 text-right font-mono">{f.ebitda ? `${(f.ebitda / 1e9).toFixed(0)} Mr` : "-"}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-up">{f.netIncome ? `${(f.netIncome / 1e9).toFixed(0)} Mr` : "-"}</td>
                    <td className="py-2.5 px-2 text-right font-mono">{f.eps ? `₺${f.eps.toFixed(2)}` : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      {/* Analyst Consensus */}
      <SectionCard title="Analist Tavsiyeleri">
        {/* Consensus summary bar */}
        <div className="mb-5 rounded-xl bg-primary/60 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-xs text-text-muted">Konsensüs</span>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-up/15 px-3 py-1 text-sm font-bold text-up">AL</span>
                  <span className="text-xs text-text-muted">
                    {MOCK_ANALYST_RATINGS.filter((r) => r.rating === "AL").length}/{MOCK_ANALYST_RATINGS.length} analist
                  </span>
                </div>
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <span className="text-xs text-text-muted">Ort. Hedef Fiyat</span>
                <div className="font-mono text-lg font-bold">{formatCurrency(consensusTarget)}</div>
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <span className="text-xs text-text-muted">Yükseliş Potansiyeli</span>
                <div className="font-mono text-lg font-bold text-up">{formatPercent(consensusUpside)}</div>
              </div>
            </div>

            {/* Visual target vs current */}
            <div className="w-full max-w-xs">
              <div className="relative h-3 rounded-full bg-border/50">
                <div className="absolute left-0 top-0 h-full rounded-full bg-accent/40" style={{ width: `${(price.close / consensusTarget) * 100}%` }} />
                <div className="absolute top-1/2 h-5 w-0.5 -translate-y-1/2 bg-text-primary" style={{ left: `${(price.close / consensusTarget) * 100}%` }} />
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-text-muted">
                <span>₺0</span>
                <span>Mevcut: {formatCurrency(price.close)}</span>
                <span>Hedef: {formatCurrency(consensusTarget)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Analyst table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-text-muted">
                <th className="px-3 py-2 font-medium">Kurum</th>
                <th className="px-3 py-2 font-medium">Tavsiye</th>
                <th className="px-3 py-2 text-right font-medium">Hedef Fiyat</th>
                <th className="px-3 py-2 text-right font-medium">Potansiyel</th>
                <th className="hidden px-3 py-2 font-medium sm:table-cell">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ANALYST_RATINGS.map((r, i) => {
                const ratingColor =
                  r.rating === "AL" ? "bg-up/15 text-up" :
                  r.rating === "TUT" ? "bg-neutral/15 text-neutral" :
                  r.rating === "SAT" ? "bg-down/15 text-down" :
                  "bg-score-future/15 text-score-future";

                return (
                  <tr key={i} className="border-b border-border/40 transition-colors hover:bg-surface-hover">
                    <td className="px-3 py-3 font-medium">{r.source}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ratingColor}`}>
                        {r.rating}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-medium">{formatCurrency(r.targetPrice)}</td>
                    <td className={`px-3 py-3 text-right font-mono font-semibold ${r.upside >= 0 ? "text-up" : "text-down"}`}>
                      {formatPercent(r.upside)}
                    </td>
                    <td className="hidden px-3 py-3 text-text-muted sm:table-cell">
                      {new Date(r.reportDate).toLocaleDateString("tr-TR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Disclaimer */}
      <div className="rounded-xl border border-border/50 bg-surface/50 p-3 text-center text-[10px] text-text-muted">
        Bu sayfa yatırım tavsiyesi niteliği taşımaz. Veriler bilgilendirme amaçlıdır ve gecikme içerebilir.
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  Legend,
} from "recharts";
import {
  MOCK_VALUATION,
  MOCK_GROWTH,
  MOCK_PROFITABILITY,
  MOCK_HEALTH,
  MOCK_DIVIDEND,
} from "@/lib/mock-data";

// ── Types ──

interface Props {
  scores: {
    valueScore: number;
    futureScore: number;
    pastScore: number;
    healthScore: number;
    dividendScore: number;
  };
}

interface TabConfig {
  id: string;
  label: string;
  scoreKey: keyof Props["scores"];
  color: string;
  glowColor: string;
  icon: string;
}

// ── Constants ──

const TABS: TabConfig[] = [
  {
    id: "valuation",
    label: "Degerleme",
    scoreKey: "valueScore",
    color: "#10B981",
    glowColor: "rgba(16, 185, 129, 0.3)",
    icon: "💎",
  },
  {
    id: "growth",
    label: "Buyume",
    scoreKey: "futureScore",
    color: "#3B82F6",
    glowColor: "rgba(59, 130, 246, 0.3)",
    icon: "📈",
  },
  {
    id: "profitability",
    label: "Karlilik",
    scoreKey: "pastScore",
    color: "#8B5CF6",
    glowColor: "rgba(139, 92, 246, 0.3)",
    icon: "🏆",
  },
  {
    id: "health",
    label: "Finansal Saglik",
    scoreKey: "healthScore",
    color: "#F59E0B",
    glowColor: "rgba(245, 158, 11, 0.3)",
    icon: "🛡️",
  },
  {
    id: "dividend",
    label: "Temettu",
    scoreKey: "dividendScore",
    color: "#EF4444",
    glowColor: "rgba(239, 68, 68, 0.3)",
    icon: "💰",
  },
];

const CHART_GRID_COLOR = "rgba(30, 38, 66, 0.8)";
const CHART_TEXT_COLOR = "#64748B";
const TOOLTIP_BG = "#1a1f35";
const TOOLTIP_BORDER = "#1e2642";

// ── Helpers ──

function formatBigNumber(n: number): string {
  if (n >= 1_000_000_000_000) return `${(n / 1_000_000_000_000).toFixed(1)} T`;
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} Mrd`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} Mn`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)} B`;
  return n.toFixed(1);
}

function ScoreRing({
  score,
  color,
  size = 72,
}: {
  score: number;
  color: string;
  size?: number;
}) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 5) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(30, 38, 66, 0.6)"
          strokeWidth={4}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 6px ${color})`,
            transition: "stroke-dasharray 0.6s ease",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-lg font-bold font-mono"
          style={{ color }}
        >
          {score.toFixed(1)}
        </span>
      </div>
    </div>
  );
}

function InsightBullet({
  positive,
  text,
}: {
  positive: boolean;
  text: string;
}) {
  return (
    <div className="flex items-start gap-2.5 py-1.5">
      <span
        className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
        style={{
          background: positive
            ? "rgba(16, 185, 129, 0.15)"
            : "rgba(239, 68, 68, 0.15)",
          color: positive ? "#10B981" : "#EF4444",
        }}
      >
        {positive ? "✓" : "!"}
      </span>
      <span className="text-sm" style={{ color: "#94A3B8" }}>
        {text}
      </span>
    </div>
  );
}

function StatBox({
  label,
  value,
  suffix,
  highlight,
  color,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  highlight?: boolean;
  color?: string;
}) {
  return (
    <div
      className="glass-card rounded-xl p-4 text-center"
      style={{
        borderColor: highlight ? color : undefined,
        boxShadow: highlight ? `0 0 20px ${color}22` : undefined,
      }}
    >
      <div className="text-xs mb-1.5 uppercase tracking-wider" style={{ color: "#64748B" }}>
        {label}
      </div>
      <div className="font-mono text-xl font-bold" style={{ color: color || "#F1F5F9" }}>
        {value}
        {suffix && (
          <span className="text-sm font-normal ml-0.5" style={{ color: "#94A3B8" }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <h3
      className="text-base font-semibold mb-4 flex items-center gap-2"
      style={{ color: color || "#F1F5F9" }}
    >
      <span
        className="w-1 h-5 rounded-full"
        style={{ background: color || "#3B82F6" }}
      />
      {children}
    </h3>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltipContent({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-xl border"
      style={{
        background: TOOLTIP_BG,
        borderColor: TOOLTIP_BORDER,
      }}
    >
      <div className="font-medium mb-1" style={{ color: "#F1F5F9" }}>
        {label}
      </div>
      {payload.map((entry: { name: string; value: number; color: string }, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: entry.color }}
          />
          <span style={{ color: "#94A3B8" }}>{entry.name}:</span>
          <span className="font-mono font-medium" style={{ color: "#F1F5F9" }}>
            {typeof entry.value === "number" ? entry.value.toFixed(1) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Tab Content Components ──

function ValuationTab({ score, color }: { score: number; color: string }) {
  const v = MOCK_VALUATION;

  const comparisonData = [
    { metric: "F/K", company: v.peRatio, sector: v.sectorAvgPE },
    { metric: "PD/DD", company: v.pbRatio, sector: v.sectorAvgPB },
    { metric: "FD/FAVOK", company: v.evToEbitda, sector: v.sectorAvgEvEbitda },
  ];

  return (
    <div className="space-y-6">
      {/* Score + Insights */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-start gap-5">
          <ScoreRing score={score} color={color} />
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-3" style={{ color: "#F1F5F9" }}>
              Degerleme Analizi
            </h3>
            <InsightBullet
              positive
              text={`F/K orani (${v.peRatio}x) sektor ortalamasinin (${v.sectorAvgPE}x) altinda - ucuz gorunuyor`}
            />
            <InsightBullet
              positive
              text={`DCF modeline gore %${v.dcfUpside.toFixed(0)} yukselis potansiyeli mevcut`}
            />
            <InsightBullet
              positive={v.evToEbitda < v.sectorAvgEvEbitda}
              text={`FD/FAVOK (${v.evToEbitda}x) sektor ortalamasi (${v.sectorAvgEvEbitda}x) ${v.evToEbitda < v.sectorAvgEvEbitda ? "altinda" : "ustunde"}`}
            />
            <InsightBullet
              positive={v.pegRatio < 1}
              text={`PEG orani ${v.pegRatio} - ${v.pegRatio < 1 ? "buyumeye gore ucuz" : "buyumeye gore pahali"}`}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatBox label="F/K" value={v.peRatio} suffix="x" highlight color={color} />
        <StatBox label="PD/DD" value={v.pbRatio} suffix="x" />
        <StatBox label="FD/FAVOK" value={v.evToEbitda} suffix="x" />
        <StatBox label="F/S" value={v.psFatio} suffix="x" />
        <StatBox label="PEG" value={v.pegRatio} suffix="x" />
      </div>

      {/* DCF Fair Value Bar */}
      <div className="glass-card rounded-2xl p-6">
        <SectionTitle color={color}>DCF Adil Deger Karsilastirmasi</SectionTitle>
        <div className="relative h-16 rounded-xl overflow-hidden" style={{ background: "rgba(30, 38, 66, 0.5)" }}>
          <div
            className="absolute top-0 left-0 h-full rounded-xl flex items-center justify-end pr-4"
            style={{
              width: `${Math.min((v.currentPrice / v.dcfFairValue) * 100, 100)}%`,
              background: `linear-gradient(90deg, ${color}33, ${color}88)`,
            }}
          >
            <span className="font-mono font-bold text-sm" style={{ color: "#F1F5F9" }}>
              {v.currentPrice.toFixed(0)} TL
            </span>
          </div>
          <div
            className="absolute top-0 h-full w-0.5 flex flex-col items-center justify-start pt-1"
            style={{
              left: "100%",
              transform: "translateX(-2px)",
              background: color,
              boxShadow: `0 0 8px ${color}`,
            }}
          >
          </div>
          <div className="absolute top-1 right-3 text-xs font-mono" style={{ color: "#94A3B8" }}>
            Adil Deger: {v.dcfFairValue} TL
          </div>
          <div className="absolute bottom-1 right-3 text-xs font-bold font-mono" style={{ color }}>
            +%{v.dcfUpside.toFixed(1)} potansiyel
          </div>
        </div>
      </div>

      {/* Historical PE Chart */}
      <div className="glass-card rounded-2xl p-6">
        <SectionTitle color={color}>Tarihsel F/K Orani</SectionTitle>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={v.historicalPE}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
            <XAxis
              dataKey="period"
              tick={{ fill: CHART_TEXT_COLOR, fontSize: 11 }}
              axisLine={{ stroke: CHART_GRID_COLOR }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: CHART_TEXT_COLOR, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltipContent />} />
            <ReferenceLine
              y={v.sectorAvgPE}
              stroke="#64748B"
              strokeDasharray="5 5"
              label={{
                value: `Sektor Ort. ${v.sectorAvgPE}x`,
                fill: "#64748B",
                fontSize: 11,
                position: "right",
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              name="F/K"
              stroke={color}
              strokeWidth={2.5}
              dot={{ fill: color, r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: color, stroke: "#1a1f35", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Peer Comparison vs Sector */}
      <div className="glass-card rounded-2xl p-6">
        <SectionTitle color={color}>Sektor Karsilastirmasi</SectionTitle>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={comparisonData} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
            <XAxis
              dataKey="metric"
              tick={{ fill: CHART_TEXT_COLOR, fontSize: 12 }}
              axisLine={{ stroke: CHART_GRID_COLOR }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: CHART_TEXT_COLOR, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend
              wrapperStyle={{ fontSize: 12, color: "#94A3B8" }}
            />
            <Bar dataKey="company" name="THYAO" fill={color} radius={[4, 4, 0, 0]} />
            <Bar dataKey="sector" name="Sektor Ort." fill="#334155" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Peer Comparison Table */}
      <div className="glass-card rounded-2xl p-6">
        <SectionTitle color={color}>Emsal Karsilastirma Tablosu</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid ${TOOLTIP_BORDER}` }}>
                <th className="text-left py-3 px-2 font-medium" style={{ color: "#64748B" }}>
                  Hisse
                </th>
                <th className="text-right py-3 px-2 font-medium" style={{ color: "#64748B" }}>
                  F/K
                </th>
                <th className="text-right py-3 px-2 font-medium" style={{ color: "#64748B" }}>
                  PD/DD
                </th>
                <th className="text-right py-3 px-2 font-medium" style={{ color: "#64748B" }}>
                  FD/FAVOK
                </th>
              </tr>
            </thead>
            <tbody>
              {v.peerComparison.map((peer) => {
                const isThyao = peer.ticker === "THYAO";
                const isAvg = peer.ticker === "Sektor Ort.";
                return (
                  <tr
                    key={peer.ticker}
                    style={{
                      borderBottom: `1px solid ${TOOLTIP_BORDER}`,
                      background: isThyao ? `${color}11` : "transparent",
                    }}
                  >
                    <td
                      className="py-3 px-2 font-medium"
                      style={{
                        color: isThyao ? color : isAvg ? "#64748B" : "#F1F5F9",
                        fontStyle: isAvg ? "italic" : "normal",
                      }}
                    >
                      {peer.ticker}
                    </td>
                    <td className="text-right py-3 px-2 font-mono" style={{ color: "#F1F5F9" }}>
                      {peer.pe.toFixed(1)}x
                    </td>
                    <td className="text-right py-3 px-2 font-mono" style={{ color: "#F1F5F9" }}>
                      {peer.pb.toFixed(1)}x
                    </td>
                    <td className="text-right py-3 px-2 font-mono" style={{ color: "#F1F5F9" }}>
                      {peer.evEbitda.toFixed(1)}x
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function GrowthTab({ score, color }: { score: number; color: string }) {
  const g = MOCK_GROWTH;

  const combinedGrowth = g.revenueGrowthYoY.map((r, i) => ({
    period: r.period,
    revenue: r.value,
    netIncome: g.netIncomeGrowthYoY[i]?.value ?? 0,
  }));

  return (
    <div className="space-y-6">
      {/* Score + Insights */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-start gap-5">
          <ScoreRing score={score} color={color} />
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-3" style={{ color: "#F1F5F9" }}>
              Buyume Analizi
            </h3>
            <InsightBullet
              positive
              text={`3 yillik gelir CAGR %${g.revenueCAGR3y} ile guclu buyume devam ediyor`}
            />
            <InsightBullet
              positive
              text={`Net kar buyumesi (%${g.netIncomeGrowthYoY[g.netIncomeGrowthYoY.length - 1].value}) pozitif seyrediyor`}
            />
            <InsightBullet
              positive={g.revenueGrowthYoY[g.revenueGrowthYoY.length - 1].value > 0}
              text={`Son donem gelir buyumesi %${g.revenueGrowthYoY[g.revenueGrowthYoY.length - 1].value} - ${g.revenueGrowthYoY[g.revenueGrowthYoY.length - 1].value > 20 ? "guclu" : "yavaslayan"} trend`}
            />
            <InsightBullet
              positive
              text={`Analist tahminlerine gore 2027 HBK ${g.forecastEps[1].value} TL bekleniyor`}
            />
          </div>
        </div>
      </div>

      {/* CAGR Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox label="Gelir CAGR (3Y)" value={`%${g.revenueCAGR3y}`} highlight color={color} />
        <StatBox label="Net Kar CAGR (3Y)" value={`%${g.netIncomeCAGR3y}`} />
        <StatBox
          label="Son Gelir Buyumesi"
          value={`%${g.revenueGrowthYoY[g.revenueGrowthYoY.length - 1].value}`}
        />
        <StatBox
          label="Son Kar Buyumesi"
          value={`%${g.netIncomeGrowthYoY[g.netIncomeGrowthYoY.length - 1].value}`}
        />
      </div>

      {/* Revenue & Net Income YoY Growth */}
      <div className="glass-card rounded-2xl p-6">
        <SectionTitle color={color}>Yillik Buyume Oranlari (%)</SectionTitle>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={combinedGrowth} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
            <XAxis
              dataKey="period"
              tick={{ fill: CHART_TEXT_COLOR, fontSize: 12 }}
              axisLine={{ stroke: CHART_GRID_COLOR }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: CHART_TEXT_COLOR, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `%${value}`}
            />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend wrapperStyle={{ fontSize: 12, color: "#94A3B8" }} />
            <Bar dataKey="revenue" name="Gelir Buyumesi" fill={color} radius={[4, 4, 0, 0]} />
            <Bar
              dataKey="netIncome"
              name="Net Kar Buyumesi"
              fill="#8B5CF6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* EPS Growth */}
      <div className="glass-card rounded-2xl p-6">
        <SectionTitle color={color}>Hisse Basina Kar (HBK) Buyumesi</SectionTitle>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={g.epsGrowthYoY}>
            <defs>
              <linearGradient id="epsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
            <XAxis
              dataKey="period"
              tick={{ fill: CHART_TEXT_COLOR, fontSize: 12 }}
              axisLine={{ stroke: CHART_GRID_COLOR }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: CHART_TEXT_COLOR, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `%${value}`}
            />
            <Tooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="value"
              name="HBK Buyumesi"
              stroke={color}
              strokeWidth={2.5}
              fill="url(#epsGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Forecast Section */}
      <div className="glass-card rounded-2xl p-6">
        <SectionTitle color={color}>Analist Tahminleri</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider mb-3" style={{ color: "#64748B" }}>
              Tahmini Gelir
            </div>
            {g.forecastRevenue.map((f) => (
              <div
                key={f.period}
                className="flex items-center justify-between py-2.5"
                style={{ borderBottom: `1px solid ${TOOLTIP_BORDER}` }}
              >
                <span
                  className="text-sm px-2 py-0.5 rounded-md"
                  style={{
                    background: `${color}15`,
                    color,
                    border: `1px solid ${color}33`,
                  }}
                >
                  {f.period}
                </span>
                <span className="font-mono font-semibold" style={{ color: "#F1F5F9" }}>
                  {formatBigNumber(f.value)} TL
                </span>
              </div>
            ))}
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider mb-3" style={{ color: "#64748B" }}>
              Tahmini HBK
            </div>
            {g.forecastEps.map((f) => (
              <div
                key={f.period}
                className="flex items-center justify-between py-2.5"
                style={{ borderBottom: `1px solid ${TOOLTIP_BORDER}` }}
              >
                <span
                  className="text-sm px-2 py-0.5 rounded-md"
                  style={{
                    background: `${color}15`,
                    color,
                    border: `1px solid ${color}33`,
                  }}
                >
                  {f.period}
                </span>
                <span className="font-mono font-semibold" style={{ color: "#F1F5F9" }}>
                  {f.value.toFixed(2)} TL
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfitabilityTab({ score, color }: { score: number; color: string }) {
  const p = MOCK_PROFITABILITY;

  return (
    <div className="space-y-6">
      {/* Score + Insights */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-start gap-5">
          <ScoreRing score={score} color={color} />
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-3" style={{ color: "#F1F5F9" }}>
              Karlilik Analizi
            </h3>
            <InsightBullet
              positive={p.roe > p.sectorAvgROE}
              text={`ROE (%${p.roe}) sektor ortalamasinin (%${p.sectorAvgROE}) ${p.roe > p.sectorAvgROE ? "ustunde" : "altinda"}`}
            />
            <InsightBullet
              positive
              text={`5 yillik ortalama ROE %${p.roe5yAvg} ile surdurulebilir seviyede`}
            />
            <InsightBullet
              positive={p.margins[p.margins.length - 1].netMargin > 10}
              text={`Net kar marji %${p.margins[p.margins.length - 1].netMargin} - ${p.margins[p.margins.length - 1].netMargin > 10 ? "saglikli" : "dusuk"} seviye`}
            />
            <InsightBullet
              positive
              text={`ROIC %${p.roic} ile sermaye maliyetinin ustunde getiri sagliyor`}
            />
          </div>
        </div>
      </div>

      {/* ROE/ROA/ROIC Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox label="ROE" value={`%${p.roe}`} highlight color={color} />
        <StatBox label="ROA" value={`%${p.roa}`} />
        <StatBox label="ROIC" value={`%${p.roic}`} />
        <StatBox label="ROE (5Y Ort.)" value={`%${p.roe5yAvg}`} />
      </div>

      {/* Margin Trend Chart */}
      <div className="glass-card rounded-2xl p-6">
        <SectionTitle color={color}>Kar Marji Trendi (%)</SectionTitle>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={p.margins}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
            <XAxis
              dataKey="period"
              tick={{ fill: CHART_TEXT_COLOR, fontSize: 11 }}
              axisLine={{ stroke: CHART_GRID_COLOR }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: CHART_TEXT_COLOR, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `%${value}`}
            />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend wrapperStyle={{ fontSize: 12, color: "#94A3B8" }} />
            <Line
              type="monotone"
              dataKey="grossMargin"
              name="Brut Kar Marji"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 3, fill: "#10B981", strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="operatingMargin"
              name="Faaliyet Marji"
              stroke={color}
              strokeWidth={2}
              dot={{ r: 3, fill: color, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="netMargin"
              name="Net Kar Marji"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={{ r: 3, fill: "#F59E0B", strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ROE History */}
      <div className="glass-card rounded-2xl p-6">
        <SectionTitle color={color}>ROE Gecmisi</SectionTitle>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={p.roeHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
            <XAxis
              dataKey="period"
              tick={{ fill: CHART_TEXT_COLOR, fontSize: 12 }}
              axisLine={{ stroke: CHART_GRID_COLOR }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: CHART_TEXT_COLOR, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `%${value}`}
            />
            <Tooltip content={<ChartTooltipContent />} />
            <ReferenceLine
              y={p.sectorAvgROE}
              stroke="#64748B"
              strokeDasharray="5 5"
              label={{
                value: `Sektor Ort. %${p.sectorAvgROE}`,
                fill: "#64748B",
                fontSize: 11,
                position: "right",
              }}
            />
            <Bar dataKey="value" name="ROE" radius={[6, 6, 0, 0]}>
              {p.roeHistory.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.value >= p.sectorAvgROE ? color : "#334155"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function HealthTab({ score, color }: { score: number; color: string }) {
  const h = MOCK_HEALTH;

  return (
    <div className="space-y-6">
      {/* Score + Insights */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-start gap-5">
          <ScoreRing score={score} color={color} />
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-3" style={{ color: "#F1F5F9" }}>
              Finansal Saglik Analizi
            </h3>
            <InsightBullet
              positive={h.debtToEquity < 1}
              text={`Borc/Ozkaynak orani ${h.debtToEquity}x - ${h.debtToEquity < 1 ? "makul seviyede" : "yuksek borc"}`}
            />
            <InsightBullet
              positive={h.currentRatio > 1}
              text={`Cari oran ${h.currentRatio} - kisa vadeli yukumlulukleri ${h.currentRatio > 1 ? "karsilayabilir" : "riskli"}`}
            />
            <InsightBullet
              positive={h.altmanZ > 1.8}
              text={`Altman Z-Skor ${h.altmanZ} - ${h.altmanZ > 2.99 ? "guvenli bolge" : h.altmanZ > 1.8 ? "gri bolge" : "tehlike bolgesi"}`}
            />
            <InsightBullet
              positive={h.piotroskiF >= 7}
              text={`Piotroski F-Skor ${h.piotroskiF}/9 - ${h.piotroskiF >= 7 ? "guclu" : h.piotroskiF >= 4 ? "orta" : "zayif"} finansal durum`}
            />
          </div>
        </div>
      </div>

      {/* Ratios Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatBox label="Borc/Ozkaynak" value={h.debtToEquity} suffix="x" highlight color={color} />
        <StatBox label="Cari Oran" value={h.currentRatio} suffix="x" />
        <StatBox label="Asit-Test Orani" value={h.quickRatio} suffix="x" />
        <StatBox label="Faiz Karsilama" value={h.interestCoverage} suffix="x" />
        <StatBox label="Net Borc/FAVOK" value={h.netDebtToEbitda} suffix="x" />
        <StatBox label="Nakit/Borc" value={`%${(h.cashToDebt * 100).toFixed(0)}`} />
      </div>

      {/* Special Scores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium" style={{ color: "#94A3B8" }}>
              Altman Z-Skor
            </span>
            <span
              className="text-xs px-2 py-1 rounded-full font-medium"
              style={{
                background:
                  h.altmanZ > 2.99
                    ? "rgba(16, 185, 129, 0.15)"
                    : h.altmanZ > 1.8
                    ? "rgba(245, 158, 11, 0.15)"
                    : "rgba(239, 68, 68, 0.15)",
                color:
                  h.altmanZ > 2.99 ? "#10B981" : h.altmanZ > 1.8 ? "#F59E0B" : "#EF4444",
              }}
            >
              {h.altmanZ > 2.99 ? "Guvenli" : h.altmanZ > 1.8 ? "Gri Bolge" : "Riskli"}
            </span>
          </div>
          <div className="font-mono text-3xl font-bold mb-2" style={{ color }}>
            {h.altmanZ.toFixed(1)}
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(30, 38, 66, 0.8)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min((h.altmanZ / 4) * 100, 100)}%`,
                background: `linear-gradient(90deg, #EF4444, #F59E0B, #10B981)`,
              }}
            />
          </div>
          <div className="flex justify-between mt-1 text-[10px]" style={{ color: "#64748B" }}>
            <span>1.8</span>
            <span>2.99</span>
            <span>4.0+</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium" style={{ color: "#94A3B8" }}>
              Piotroski F-Skor
            </span>
            <span
              className="text-xs px-2 py-1 rounded-full font-medium"
              style={{
                background:
                  h.piotroskiF >= 7
                    ? "rgba(16, 185, 129, 0.15)"
                    : h.piotroskiF >= 4
                    ? "rgba(245, 158, 11, 0.15)"
                    : "rgba(239, 68, 68, 0.15)",
                color:
                  h.piotroskiF >= 7 ? "#10B981" : h.piotroskiF >= 4 ? "#F59E0B" : "#EF4444",
              }}
            >
              {h.piotroskiF >= 7 ? "Guclu" : h.piotroskiF >= 4 ? "Orta" : "Zayif"}
            </span>
          </div>
          <div className="font-mono text-3xl font-bold mb-2" style={{ color }}>
            {h.piotroskiF}
            <span className="text-lg font-normal" style={{ color: "#64748B" }}>
              /9
            </span>
          </div>
          <div className="flex gap-1 mt-2">
            {Array.from({ length: 9 }, (_, i) => (
              <div
                key={i}
                className="flex-1 h-2.5 rounded-full transition-all duration-500"
                style={{
                  background:
                    i < h.piotroskiF
                      ? color
                      : "rgba(30, 38, 66, 0.8)",
                  boxShadow: i < h.piotroskiF ? `0 0 6px ${color}55` : "none",
                  transitionDelay: `${i * 50}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Debt Maturity */}
      <div className="glass-card rounded-2xl p-6">
        <SectionTitle color={color}>Borc Vade Yapisi</SectionTitle>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={h.debtMaturity}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
            <XAxis
              dataKey="year"
              tick={{ fill: CHART_TEXT_COLOR, fontSize: 12 }}
              axisLine={{ stroke: CHART_GRID_COLOR }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: CHART_TEXT_COLOR, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => formatBigNumber(value)}
            />
            <Tooltip
              content={<ChartTooltipContent />}
              formatter={(value) => [formatBigNumber(value as number) + " TL", "Borc"]}
            />
            <Bar dataKey="amount" name="Borc Tutari" radius={[6, 6, 0, 0]}>
              {h.debtMaturity.map((_, index) => (
                <Cell
                  key={index}
                  fill={index === 0 ? "#EF4444" : index === 1 ? color : "#334155"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cash Flow Trend */}
      <div className="glass-card rounded-2xl p-6">
        <SectionTitle color={color}>Nakit Akis Trendi (Milyar TL)</SectionTitle>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={h.cashFlowTrend}>
            <defs>
              <linearGradient id="opGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="freeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
            <XAxis
              dataKey="period"
              tick={{ fill: CHART_TEXT_COLOR, fontSize: 11 }}
              axisLine={{ stroke: CHART_GRID_COLOR }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: CHART_TEXT_COLOR, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend wrapperStyle={{ fontSize: 12, color: "#94A3B8" }} />
            <ReferenceLine y={0} stroke="#64748B" strokeDasharray="3 3" />
            <Area
              type="monotone"
              dataKey="operating"
              name="Isletme"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#opGradient)"
            />
            <Area
              type="monotone"
              dataKey="free"
              name="Serbest"
              stroke={color}
              strokeWidth={2}
              fill="url(#freeGradient)"
            />
            <Line
              type="monotone"
              dataKey="investing"
              name="Yatirim"
              stroke="#8B5CF6"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="financing"
              name="Finansman"
              stroke="#EF4444"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function DividendTab({ score, color }: { score: number; color: string }) {
  const d = MOCK_DIVIDEND;

  return (
    <div className="space-y-6">
      {/* Score + Insights */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-start gap-5">
          <ScoreRing score={score} color={color} />
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-3" style={{ color: "#F1F5F9" }}>
              Temettu Analizi
            </h3>
            <InsightBullet
              positive={d.currentYield > d.sectorAvgYield}
              text={`Temettu verimi (%${d.currentYield}) sektor ortalamasinin (%${d.sectorAvgYield}) ${d.currentYield > d.sectorAvgYield ? "ustunde" : "altinda"}`}
            />
            <InsightBullet
              positive
              text={`Ardisik ${d.consecutiveYears} yildir temettu oduyor - guvenilir odemeci`}
            />
            <InsightBullet
              positive={d.payoutRatio < 60}
              text={`Dagitim orani %${d.payoutRatio} - ${d.payoutRatio < 60 ? "surdurulebilir" : "yuksek"} seviye`}
            />
            <InsightBullet
              positive
              text={`5 yillik temettu buyume orani %${d.growthRate5y}`}
            />
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox
          label="Temettu Verimi"
          value={`%${d.currentYield}`}
          highlight
          color={color}
        />
        <StatBox label="HBT (DPS)" value={`${d.dividendPerShare} TL`} />
        <StatBox label="Dagitim Orani" value={`%${d.payoutRatio}`} />
        <StatBox label="5Y Buyume" value={`%${d.growthRate5y}`} />
      </div>

      {/* Upcoming Dates */}
      <div className="glass-card rounded-2xl p-6">
        <SectionTitle color={color}>Yaklasan Tarihler</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            className="rounded-xl p-4 flex items-center gap-4"
            style={{
              background: `linear-gradient(135deg, ${color}11, ${color}05)`,
              border: `1px solid ${color}33`,
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-lg"
              style={{ background: `${color}22` }}
            >
              📅
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider mb-0.5" style={{ color: "#64748B" }}>
                Temettusuz Islem Tarihi
              </div>
              <div className="font-mono font-semibold" style={{ color: "#F1F5F9" }}>
                {d.exDividendDate}
              </div>
            </div>
          </div>
          <div
            className="rounded-xl p-4 flex items-center gap-4"
            style={{
              background: `linear-gradient(135deg, ${color}11, ${color}05)`,
              border: `1px solid ${color}33`,
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-lg"
              style={{ background: `${color}22` }}
            >
              💸
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider mb-0.5" style={{ color: "#64748B" }}>
                Odeme Tarihi
              </div>
              <div className="font-mono font-semibold" style={{ color: "#F1F5F9" }}>
                {d.paymentDate}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dividend Yield History */}
      <div className="glass-card rounded-2xl p-6">
        <SectionTitle color={color}>Temettu Verimi Gecmisi (%)</SectionTitle>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={d.history}>
            <defs>
              <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
            <XAxis
              dataKey="year"
              tick={{ fill: CHART_TEXT_COLOR, fontSize: 12 }}
              axisLine={{ stroke: CHART_GRID_COLOR }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: CHART_TEXT_COLOR, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `%${value}`}
            />
            <Tooltip content={<ChartTooltipContent />} />
            <ReferenceLine
              y={d.sectorAvgYield}
              stroke="#64748B"
              strokeDasharray="5 5"
              label={{
                value: `Sektor Ort. %${d.sectorAvgYield}`,
                fill: "#64748B",
                fontSize: 11,
                position: "right",
              }}
            />
            <Area
              type="monotone"
              dataKey="yield"
              name="Temettu Verimi"
              stroke={color}
              strokeWidth={2.5}
              fill="url(#yieldGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* DPS Growth */}
      <div className="glass-card rounded-2xl p-6">
        <SectionTitle color={color}>Hisse Basina Temettu (TL)</SectionTitle>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={d.history}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
            <XAxis
              dataKey="year"
              tick={{ fill: CHART_TEXT_COLOR, fontSize: 12 }}
              axisLine={{ stroke: CHART_GRID_COLOR }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: CHART_TEXT_COLOR, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltipContent />} />
            <Bar dataKey="dps" name="HBT" fill={color} radius={[6, 6, 0, 0]}>
              {d.history.map((_, index) => (
                <Cell
                  key={index}
                  fill={
                    index === d.history.length - 1
                      ? color
                      : `${color}88`
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Payout Ratio History */}
      <div className="glass-card rounded-2xl p-6">
        <SectionTitle color={color}>Dagitim Orani Gecmisi (%)</SectionTitle>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={d.history}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
            <XAxis
              dataKey="year"
              tick={{ fill: CHART_TEXT_COLOR, fontSize: 12 }}
              axisLine={{ stroke: CHART_GRID_COLOR }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: CHART_TEXT_COLOR, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `%${value}`}
              domain={[0, 50]}
            />
            <Tooltip content={<ChartTooltipContent />} />
            <ReferenceLine
              y={60}
              stroke="#EF4444"
              strokeDasharray="5 5"
              label={{
                value: "Uyari Siniri",
                fill: "#EF4444",
                fontSize: 10,
                position: "right",
              }}
            />
            <Line
              type="monotone"
              dataKey="payout"
              name="Dagitim Orani"
              stroke={color}
              strokeWidth={2.5}
              dot={{ fill: color, r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: color, stroke: "#1a1f35", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Main Component ──

export default function AnalysisTabs({ scores }: Props) {
  const [activeTab, setActiveTab] = useState("valuation");
  const activeConfig = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="w-full">
      {/* Tab Bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          const tabScore = scores[tab.scoreKey];
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 flex-shrink-0"
              style={{
                background: isActive
                  ? `linear-gradient(135deg, ${tab.color}22, ${tab.color}11)`
                  : "rgba(30, 38, 66, 0.4)",
                border: `1.5px solid ${isActive ? tab.color : "transparent"}`,
                color: isActive ? tab.color : "#94A3B8",
                boxShadow: isActive ? `0 0 20px ${tab.glowColor}` : "none",
              }}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{tab.label}</span>
              <span
                className="ml-1 font-mono text-xs px-1.5 py-0.5 rounded-md"
                style={{
                  background: isActive ? `${tab.color}22` : "rgba(30, 38, 66, 0.6)",
                  color: isActive ? tab.color : "#64748B",
                }}
              >
                {tabScore.toFixed(1)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "valuation" && (
          <ValuationTab score={scores.valueScore} color={activeConfig.color} />
        )}
        {activeTab === "growth" && (
          <GrowthTab score={scores.futureScore} color={activeConfig.color} />
        )}
        {activeTab === "profitability" && (
          <ProfitabilityTab score={scores.pastScore} color={activeConfig.color} />
        )}
        {activeTab === "health" && (
          <HealthTab score={scores.healthScore} color={activeConfig.color} />
        )}
        {activeTab === "dividend" && (
          <DividendTab score={scores.dividendScore} color={activeConfig.color} />
        )}
      </div>
    </div>
  );
}

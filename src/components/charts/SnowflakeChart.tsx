"use client";

import { useState } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { SCORE_LABELS, SCORE_COLORS } from "@/lib/constants";

interface SnowflakeChartProps {
  scores: {
    valueScore: number;
    futureScore: number;
    pastScore: number;
    healthScore: number;
    dividendScore: number;
  };
  size?: "sm" | "md" | "lg";
}

const SCORE_DESCRIPTIONS: Record<string, string> = {
  valueScore: "Hisse fiyatının gerçek değerine göre ucuz/pahalı olma durumu",
  futureScore: "Gelir ve kar büyüme potansiyeli",
  pastScore: "Geçmiş yıllardaki karlılık ve büyüme performansı",
  healthScore: "Borç yönetimi ve nakit akışı sağlamlığı",
  dividendScore: "Temettü verimi ve ödeme istikrarı",
};

export default function SnowflakeChart({ scores, size = "md" }: SnowflakeChartProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const heights = { sm: 200, md: 300, lg: 380 };

  const data = (Object.keys(SCORE_LABELS) as (keyof typeof SCORE_LABELS)[]).map(
    (key) => ({
      key,
      label: SCORE_LABELS[key],
      value: scores[key],
      fullMark: 5,
      color: SCORE_COLORS[key],
    })
  );

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={heights[size]}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
          <PolarGrid stroke="#334155" strokeOpacity={0.6} />
          <PolarAngleAxis
            dataKey="label"
            tick={(props: Record<string, unknown>) => {
              const x = Number(props.x);
              const y = Number(props.y);
              const payload = props.payload as { value: string };
              const index = Number(props.index);
              const item = data[index];
              const isActive = activeKey === item?.key;
              return (
                <g>
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    fill={isActive ? item?.color : "#94A3B8"}
                    fontSize={size === "sm" ? 10 : 12}
                    fontWeight={isActive ? 700 : 500}
                    className="transition-all duration-200"
                  >
                    {payload.value}
                  </text>
                  {item && (
                    <text
                      x={x}
                      y={y + (size === "sm" ? 12 : 15)}
                      textAnchor="middle"
                      fill={item.color}
                      fontSize={size === "sm" ? 10 : 12}
                      fontWeight={700}
                      fontFamily="var(--font-mono)"
                    >
                      {item.value.toFixed(1)}
                    </text>
                  )}
                </g>
              );
            }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 5]}
            tick={false}
            axisLine={false}
            tickCount={6}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const item = data.find((d) => d.label === payload[0].payload?.label);
              if (!item) return null;
              return (
                <div className="rounded-lg border border-border bg-secondary p-3 shadow-xl">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-semibold" style={{ color: item.color }}>{item.label}</span>
                    <span className="ml-auto font-mono text-sm font-bold">{item.value.toFixed(1)}/5</span>
                  </div>
                  <p className="mt-1 text-xs text-text-muted">{SCORE_DESCRIPTIONS[item.key]}</p>
                </div>
              );
            }}
          />
          <Radar
            name="Skor"
            dataKey="value"
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.15}
            strokeWidth={2.5}
            dot={{
              r: 4,
              fill: "#3B82F6",
              stroke: "#1E293B",
              strokeWidth: 2,
            }}
            activeDot={{
              r: 6,
              fill: "#3B82F6",
              stroke: "#fff",
              strokeWidth: 2,
            }}
            /* hover handled by Tooltip */
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Center score */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="flex h-16 w-16 flex-col items-center justify-center rounded-full border-2 border-score-value/30 bg-primary/80 backdrop-blur-sm">
          <span className="font-mono text-xl font-bold text-score-value">
            {((scores.valueScore + scores.futureScore + scores.pastScore + scores.healthScore + scores.dividendScore) / 5).toFixed(1)}
          </span>
          <span className="text-[9px] text-text-muted">/ 5.0</span>
        </div>
      </div>
    </div>
  );
}

export function MiniSnowflake({ scores }: { scores: SnowflakeChartProps["scores"] }) {
  const overall = (scores.valueScore + scores.futureScore + scores.pastScore + scores.healthScore + scores.dividendScore) / 5;
  const keys = Object.keys(SCORE_COLORS) as (keyof typeof SCORE_COLORS)[];

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {keys.map((key) => (
          <div
            key={key}
            className="h-5 w-1.5 rounded-full"
            style={{
              backgroundColor: SCORE_COLORS[key],
              opacity: scores[key as keyof typeof scores] / 5,
            }}
          />
        ))}
      </div>
      <span className="font-mono text-xs font-bold text-score-value">
        {overall.toFixed(1)}
      </span>
    </div>
  );
}

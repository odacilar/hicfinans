"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { FinancialPeriod } from "@/types/financial";

interface FinancialBarChartProps {
  data: FinancialPeriod[];
}

export default function FinancialBarChart({ data }: FinancialBarChartProps) {
  const chartData = [...data].reverse().map((d) => ({
    period: d.period,
    revenue: d.revenue ? d.revenue / 1e9 : 0,
    netIncome: d.netIncome ? d.netIncome / 1e9 : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData}>
        <XAxis
          dataKey="period"
          tick={{ fill: "var(--color-text-muted)", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: "var(--color-text-muted)", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          width={50}
          tickFormatter={(v: number) => `${v}Mr`}
        />
        <Tooltip
          contentStyle={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            fontSize: 12,
            color: "var(--color-text-primary)",
          }}
          formatter={(value, name) => [
            `${Number(value).toFixed(1)} Mr₺`,
            name === "revenue" ? "Hasılat" : "Net Kar",
          ]}
        />
        <Legend
          formatter={(value: string) =>
            value === "revenue" ? "Hasılat" : "Net Kar"
          }
        />
        <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="netIncome" fill="#10B981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

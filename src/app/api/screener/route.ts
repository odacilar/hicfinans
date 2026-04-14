import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { ScreenerRequest } from "@/types/screener";

export async function POST(request: Request) {
  const body = (await request.json()) as ScreenerRequest;
  const { filters = [], sortBy = "ticker", sortOrder = "asc", page = 1, limit = 20, sectors } = body;

  const where: Record<string, unknown> = {};
  if (sectors?.length) where.sector = { in: sectors };

  const financialFilters: Record<string, unknown> = {};
  for (const f of filters) {
    const condition =
      f.operator === "gt" ? { gt: f.value }
      : f.operator === "gte" ? { gte: f.value }
      : f.operator === "lt" ? { lt: f.value }
      : f.operator === "lte" ? { lte: f.value }
      : f.operator === "between" ? { gte: f.value, lte: f.valueTo }
      : { equals: f.value };

    financialFilters[f.field] = condition;
  }

  const hasFinancialFilters = Object.keys(financialFilters).length > 0;

  if (hasFinancialFilters) {
    where.financials = { some: financialFilters };
  }

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      include: {
        financials: { orderBy: { periodEndDate: "desc" }, take: 1 },
        scores: { orderBy: { calculatedAt: "desc" }, take: 1 },
        prices: { orderBy: { date: "desc" }, take: 1 },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.company.count({ where }),
  ]);

  const results = companies.map((c) => {
    const fin = c.financials[0];
    const score = c.scores[0];
    const price = c.prices[0];

    return {
      ticker: c.ticker,
      name: c.name,
      sector: c.sector,
      price: price?.close ?? 0,
      marketCap: c.marketCap ?? 0,
      peRatio: fin?.peRatio ?? null,
      pbRatio: fin?.pbRatio ?? null,
      roe: fin?.roe ?? null,
      netMargin: fin?.netMargin ?? null,
      dividendYield: fin?.dividendYield ?? null,
      overallScore: score?.overallScore ?? 0,
    };
  });

  return NextResponse.json({ results, total, page, limit });
}

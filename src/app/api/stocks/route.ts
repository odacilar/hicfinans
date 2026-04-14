import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sector = searchParams.get("sector");
  const sortBy = searchParams.get("sortBy") || "ticker";
  const order = searchParams.get("order") === "desc" ? "desc" : "asc";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));

  const where = sector ? { sector } : {};

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      include: {
        scores: { orderBy: { calculatedAt: "desc" }, take: 1 },
        prices: { orderBy: { date: "desc" }, take: 2 },
      },
      orderBy: { [sortBy]: order },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.company.count({ where }),
  ]);

  const results = companies.map((c) => {
    const latestPrice = c.prices[0];
    const prevPrice = c.prices[1];
    const score = c.scores[0];

    const price = latestPrice?.close ?? 0;
    const prevClose = prevPrice?.close ?? price;
    const change = price - prevClose;
    const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;

    return {
      ticker: c.ticker,
      name: c.name,
      sector: c.sector,
      price,
      change,
      changePercent,
      volume: Number(latestPrice?.volume ?? 0),
      marketCap: c.marketCap ?? 0,
      overallScore: score?.overallScore ?? 0,
    };
  });

  return NextResponse.json({ results, total, page, limit });
}

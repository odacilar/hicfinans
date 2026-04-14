import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;

  const company = await prisma.company.findUnique({
    where: { ticker: ticker.toUpperCase() },
    include: {
      prices: { orderBy: { date: "desc" }, take: 30 },
      scores: { orderBy: { calculatedAt: "desc" }, take: 1 },
      financials: { orderBy: { periodEndDate: "desc" }, take: 8 },
      analystRatings: { orderBy: { reportDate: "desc" }, take: 10 },
      kapNews: { orderBy: { publishedAt: "desc" }, take: 20 },
    },
  });

  if (!company) {
    return NextResponse.json({ error: "Hisse bulunamadı" }, { status: 404 });
  }

  const latestPrice = company.prices[0];
  const prevPrice = company.prices[1];
  const score = company.scores[0];

  const price = latestPrice?.close ?? 0;
  const prevClose = prevPrice?.close ?? price;

  return NextResponse.json({
    ticker: company.ticker,
    name: company.name,
    sector: company.sector,
    subSector: company.subSector,
    marketCap: company.marketCap,
    website: company.website,
    logo: company.logo,
    listingDate: company.listingDate,
    latestPrice: latestPrice
      ? {
          close: price,
          change: price - prevClose,
          changePercent: prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : 0,
          volume: Number(latestPrice.volume),
          date: latestPrice.date,
        }
      : null,
    scores: score
      ? {
          valueScore: score.valueScore,
          futureScore: score.futureScore,
          pastScore: score.pastScore,
          healthScore: score.healthScore,
          dividendScore: score.dividendScore,
          overallScore: score.overallScore,
        }
      : null,
    priceHistory: company.prices.map((p) => ({
      date: p.date,
      close: p.close,
      volume: Number(p.volume),
    })),
    financials: company.financials,
    analystRatings: company.analystRatings,
    kapNews: company.kapNews.map((n) => ({
      id: n.id,
      kapId: n.kapId,
      title: n.title,
      summary: n.summary,
      category: n.category,
      publishedAt: n.publishedAt,
      url: n.url,
    })),
  });
}

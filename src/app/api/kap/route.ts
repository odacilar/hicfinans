import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const ticker = searchParams.get("ticker");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (ticker) where.company = { ticker: ticker.toUpperCase() };

  const [news, total] = await Promise.all([
    prisma.kapNews.findMany({
      where,
      include: { company: { select: { ticker: true, name: true } } },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.kapNews.count({ where }),
  ]);

  return NextResponse.json({
    results: news.map((n) => ({
      id: n.id,
      kapId: n.kapId,
      ticker: n.company?.ticker ?? null,
      companyName: n.company?.name ?? null,
      title: n.title,
      summary: n.summary,
      category: n.category,
      publishedAt: n.publishedAt,
      url: n.url,
    })),
    total,
    page,
    limit,
  });
}

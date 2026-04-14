import { KAP_RSS_URL, KAP_BASE_URL } from "@/lib/constants";

interface KapRssItem {
  title: string;
  link: string;
  pubDate: string;
  description?: string;
}

export async function fetchKapRss(): Promise<KapRssItem[]> {
  const res = await fetch(KAP_RSS_URL);
  if (!res.ok) throw new Error(`KAP RSS failed: ${res.status}`);

  const xml = await res.text();
  return parseRssXml(xml);
}

function parseRssXml(xml: string): KapRssItem[] {
  const items: KapRssItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const title = extractTag(itemXml, "title");
    const link = extractTag(itemXml, "link");
    const pubDate = extractTag(itemXml, "pubDate");
    const description = extractTag(itemXml, "description");

    if (title && link && pubDate) {
      items.push({ title, link, pubDate, description: description || undefined });
    }
  }

  return items;
}

function extractTag(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}><!\\[CDATA\\[(.+?)\\]\\]><\\/${tag}>|<${tag}>(.+?)<\\/${tag}>`);
  const match = regex.exec(xml);
  return match?.[1] ?? match?.[2] ?? null;
}

export function extractKapId(url: string): string | null {
  const match = /\/Bildirim\/(\d+)/.exec(url);
  return match?.[1] ?? null;
}

export function extractTickerFromTitle(title: string): string | null {
  const match = /^([A-Z]{3,5})\s/.exec(title);
  return match?.[1] ?? null;
}

export function categorizeKapNews(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes("finansal") || lower.includes("bilanço")) return "bilanco";
  if (lower.includes("temettü") || lower.includes("kâr payı")) return "temettü";
  if (lower.includes("genel kurul")) return "genel_kurul";
  if (lower.includes("ortaklık") || lower.includes("pay")) return "ortaklik";
  return "diger";
}

export function buildKapUrl(kapId: string): string {
  return `${KAP_BASE_URL}/tr/Bildirim/${kapId}`;
}

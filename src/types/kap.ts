export interface KapNewsItem {
  id: string;
  kapId: string;
  ticker: string | null;
  companyName: string | null;
  title: string;
  summary: string | null;
  category: string | null;
  publishedAt: string;
  url: string;
}

export type KapCategory =
  | "bilanco"
  | "temettü"
  | "genel_kurul"
  | "ortaklik"
  | "diger";

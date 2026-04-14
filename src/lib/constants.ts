export const SECTORS = [
  "Bankacılık",
  "Holding ve Yatırım",
  "Gıda ve İçecek",
  "Ulaştırma",
  "Demir, Çelik ve Metal",
  "Teknoloji",
  "Enerji",
  "İnşaat ve Bayındırlık",
  "Tekstil ve Deri",
  "Kimya, Petrol ve Plastik",
  "Otomotiv",
  "Telekomünikasyon",
  "Sağlık",
  "Madencilik",
  "Kağıt ve Ambalaj",
  "Turizm",
  "Perakende Ticaret",
  "Sigorta",
  "Gayrimenkul Yatırım Ortaklığı",
  "Diğer",
] as const;

export const SCORE_LABELS = {
  valueScore: "Değerleme",
  futureScore: "Gelecek",
  pastScore: "Geçmiş",
  healthScore: "Sağlık",
  dividendScore: "Temettü",
} as const;

export const SCORE_COLORS = {
  valueScore: "#10B981",
  futureScore: "#3B82F6",
  pastScore: "#8B5CF6",
  healthScore: "#F59E0B",
  dividendScore: "#EF4444",
} as const;

export const ANALYST_RATINGS = ["AL", "TUT", "SAT", "Endeks Üstü", "Endeks Altı"] as const;

export const BIGPARA_BASE_URL = "http://bigpara.hurriyet.com.tr/api/v1";
export const YAHOO_FINANCE_BASE_URL = "https://query1.finance.yahoo.com";
export const KAP_RSS_URL = "https://www.kap.org.tr/tr/rss/bildirim";
export const KAP_BASE_URL = "https://www.kap.org.tr";

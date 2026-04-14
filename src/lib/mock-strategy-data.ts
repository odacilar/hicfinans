/**
 * Pre-computed strategy scores for display on the Stratejiler page.
 * These are mock data — not calculated from the actual scoring functions.
 */

export interface StockStrategyScores {
  ticker: string;
  name: string;
  sector: string;
  price: number;

  canslim: { total: number; grade: string; recommendation: string };
  buffett: { total: number; grade: string; verdict: string };
  techRatios: { overallScore: number; grade: string; pegRatio: number; ruleOf40: number };
}

export const MOCK_STRATEGY_SCORES: StockStrategyScores[] = [
  // ── Growth Champions (CANSLIM high, Buffett moderate) ──
  {
    ticker: "THYAO",
    name: "Türk Hava Yolları A.O.",
    sector: "Ulaştırma",
    price: 312.5,
    canslim: { total: 88, grade: "A+", recommendation: "Güçlü AL sinyali — CANSLIM kriterlerinin büyük çoğunluğunu karşılıyor" },
    buffett: { total: 62, grade: "B+", verdict: "Kabul edilebilir — bazı güçlü yönler var ama eksikler de mevcut" },
    techRatios: { overallScore: 58, grade: "B", pegRatio: 0.85, ruleOf40: 42.3 },
  },
  {
    ticker: "PGSUS",
    name: "Pegasus Hava Taşımacılığı A.Ş.",
    sector: "Ulaştırma",
    price: 1125.0,
    canslim: { total: 82, grade: "A", recommendation: "Güçlü AL sinyali — CANSLIM kriterlerinin büyük çoğunluğunu karşılıyor" },
    buffett: { total: 48, grade: "C", verdict: "Zayıf — Buffett kriterleri büyük ölçüde karşılanmıyor" },
    techRatios: { overallScore: 61, grade: "B", pegRatio: 1.12, ruleOf40: 38.5 },
  },
  {
    ticker: "BIMAS",
    name: "BİM Birleşik Mağazalar A.Ş.",
    sector: "Perakende Ticaret",
    price: 540.0,
    canslim: { total: 79, grade: "A", recommendation: "Güçlü AL sinyali — CANSLIM kriterlerinin büyük çoğunluğunu karşılıyor" },
    buffett: { total: 71, grade: "B+", verdict: "Değer yatırımı için güçlü aday — çoğu kriteri karşılıyor" },
    techRatios: { overallScore: 45, grade: "C", pegRatio: 1.65, ruleOf40: 28.4 },
  },
  {
    ticker: "ASELS",
    name: "Aselsan Elektronik Sanayi ve Ticaret A.Ş.",
    sector: "Savunma",
    price: 78.9,
    canslim: { total: 76, grade: "A", recommendation: "Güçlü AL sinyali — CANSLIM kriterlerinin büyük çoğunluğunu karşılıyor" },
    buffett: { total: 55, grade: "B", verdict: "Kabul edilebilir — bazı güçlü yönler var ama eksikler de mevcut" },
    techRatios: { overallScore: 72, grade: "B+", pegRatio: 0.92, ruleOf40: 45.1 },
  },
  {
    ticker: "MAVI",
    name: "Mavi Giyim Sanayi ve Ticaret A.Ş.",
    sector: "Perakende Ticaret",
    price: 118.5,
    canslim: { total: 74, grade: "A", recommendation: "Potansiyel fırsat — takip listesine ekle, giriş noktası bekle" },
    buffett: { total: 44, grade: "C", verdict: "Zayıf — Buffett kriterleri büyük ölçüde karşılanmıyor" },
    techRatios: { overallScore: 50, grade: "B", pegRatio: 1.35, ruleOf40: 32.8 },
  },

  // ── Value Champions (Buffett high, CANSLIM moderate) ──
  {
    ticker: "GARAN",
    name: "Türkiye Garanti Bankası A.Ş.",
    sector: "Bankacılık",
    price: 132.4,
    canslim: { total: 58, grade: "B", recommendation: "Nötr — bazı kriterler karşılanıyor, dikkatle izle" },
    buffett: { total: 86, grade: "A+", verdict: "Buffett tarzı mükemmel bir hisse — güçlü moat, düşük borç, sürdürülebilir büyüme" },
    techRatios: { overallScore: 38, grade: "C", pegRatio: 1.82, ruleOf40: 22.1 },
  },
  {
    ticker: "KCHOL",
    name: "Koç Holding A.Ş.",
    sector: "Holding ve Yatırım",
    price: 188.3,
    canslim: { total: 52, grade: "B", recommendation: "Nötr — bazı kriterler karşılanıyor, dikkatle izle" },
    buffett: { total: 82, grade: "A", verdict: "Buffett tarzı mükemmel bir hisse — güçlü moat, düşük borç, sürdürülebilir büyüme" },
    techRatios: { overallScore: 32, grade: "D", pegRatio: 2.15, ruleOf40: 18.6 },
  },
  {
    ticker: "TUPRS",
    name: "Tüpraş-Türkiye Petrol Rafinerileri A.Ş.",
    sector: "Enerji",
    price: 172.8,
    canslim: { total: 45, grade: "C", recommendation: "Nötr — bazı kriterler karşılanıyor, dikkatle izle" },
    buffett: { total: 78, grade: "A", verdict: "Değer yatırımı için güçlü aday — çoğu kriteri karşılıyor" },
    techRatios: { overallScore: 29, grade: "D", pegRatio: 2.45, ruleOf40: 15.2 },
  },
  {
    ticker: "CCOLA",
    name: "Coca-Cola İçecek A.Ş.",
    sector: "Gıda ve İçecek",
    price: 780.0,
    canslim: { total: 61, grade: "B+", recommendation: "Potansiyel fırsat — takip listesine ekle, giriş noktası bekle" },
    buffett: { total: 76, grade: "A", verdict: "Değer yatırımı için güçlü aday — çoğu kriteri karşılıyor" },
    techRatios: { overallScore: 41, grade: "C", pegRatio: 1.72, ruleOf40: 26.5 },
  },
  {
    ticker: "EREGL",
    name: "Ereğli Demir ve Çelik Fabrikaları T.A.Ş.",
    sector: "Demir, Çelik ve Metal",
    price: 48.72,
    canslim: { total: 40, grade: "C", recommendation: "Zayıf — CANSLIM kriterlerine uymuyor, bekle" },
    buffett: { total: 74, grade: "A", verdict: "Değer yatırımı için güçlü aday — çoğu kriteri karşılıyor" },
    techRatios: { overallScore: 25, grade: "D", pegRatio: 2.85, ruleOf40: 12.8 },
  },
  {
    ticker: "AKBNK",
    name: "Akbank T.A.Ş.",
    sector: "Bankacılık",
    price: 62.35,
    canslim: { total: 55, grade: "B", recommendation: "Nötr — bazı kriterler karşılanıyor, dikkatle izle" },
    buffett: { total: 72, grade: "B+", verdict: "Değer yatırımı için güçlü aday — çoğu kriteri karşılıyor" },
    techRatios: { overallScore: 35, grade: "C", pegRatio: 1.95, ruleOf40: 20.3 },
  },

  // ── Tech / Growth Ratio Stars ──
  {
    ticker: "LOGO",
    name: "Logo Yazılım Sanayi ve Ticaret A.Ş.",
    sector: "Teknoloji",
    price: 312.0,
    canslim: { total: 71, grade: "B+", recommendation: "Potansiyel fırsat — takip listesine ekle, giriş noktası bekle" },
    buffett: { total: 42, grade: "C", verdict: "Zayıf — Buffett kriterleri büyük ölçüde karşılanmıyor" },
    techRatios: { overallScore: 88, grade: "A+", pegRatio: 0.68, ruleOf40: 62.4 },
  },
  {
    ticker: "ASTOR",
    name: "Astor Enerji A.Ş.",
    sector: "Teknoloji",
    price: 195.0,
    canslim: { total: 68, grade: "B+", recommendation: "Potansiyel fırsat — takip listesine ekle, giriş noktası bekle" },
    buffett: { total: 38, grade: "C", verdict: "Zayıf — Buffett kriterleri büyük ölçüde karşılanmıyor" },
    techRatios: { overallScore: 82, grade: "A", pegRatio: 0.74, ruleOf40: 55.8 },
  },
  {
    ticker: "KONTR",
    name: "Kontrolmatik Teknoloji Enerji ve Müh. A.Ş.",
    sector: "Teknoloji",
    price: 142.5,
    canslim: { total: 65, grade: "B+", recommendation: "Potansiyel fırsat — takip listesine ekle, giriş noktası bekle" },
    buffett: { total: 35, grade: "C", verdict: "Zayıf — Buffett kriterleri büyük ölçüde karşılanmıyor" },
    techRatios: { overallScore: 78, grade: "A", pegRatio: 0.81, ruleOf40: 51.2 },
  },
  {
    ticker: "INDES",
    name: "İndeks Bilgisayar Sistemleri Müh. San. ve Tic. A.Ş.",
    sector: "Teknoloji",
    price: 78.6,
    canslim: { total: 60, grade: "B+", recommendation: "Potansiyel fırsat — takip listesine ekle, giriş noktası bekle" },
    buffett: { total: 40, grade: "C", verdict: "Zayıf — Buffett kriterleri büyük ölçüde karşılanmıyor" },
    techRatios: { overallScore: 71, grade: "B+", pegRatio: 0.95, ruleOf40: 44.6 },
  },

  // ── Balanced / Mixed ──
  {
    ticker: "SAHOL",
    name: "Hacı Ömer Sabancı Holding A.Ş.",
    sector: "Holding ve Yatırım",
    price: 82.6,
    canslim: { total: 56, grade: "B", recommendation: "Nötr — bazı kriterler karşılanıyor, dikkatle izle" },
    buffett: { total: 68, grade: "B+", verdict: "Değer yatırımı için güçlü aday — çoğu kriteri karşılıyor" },
    techRatios: { overallScore: 30, grade: "D", pegRatio: 2.25, ruleOf40: 17.4 },
  },
  {
    ticker: "TCELL",
    name: "Turkcell İletişim Hizmetleri A.Ş.",
    sector: "Telekomünikasyon",
    price: 96.5,
    canslim: { total: 63, grade: "B+", recommendation: "Potansiyel fırsat — takip listesine ekle, giriş noktası bekle" },
    buffett: { total: 65, grade: "B+", verdict: "Değer yatırımı için güçlü aday — çoğu kriteri karşılıyor" },
    techRatios: { overallScore: 55, grade: "B", pegRatio: 1.28, ruleOf40: 35.2 },
  },
  {
    ticker: "SISE",
    name: "Türkiye Şişe ve Cam Fabrikaları A.Ş.",
    sector: "Cam",
    price: 53.15,
    canslim: { total: 50, grade: "B", recommendation: "Nötr — bazı kriterler karşılanıyor, dikkatle izle" },
    buffett: { total: 60, grade: "B+", verdict: "Kabul edilebilir — bazı güçlü yönler var ama eksikler de mevcut" },
    techRatios: { overallScore: 33, grade: "D", pegRatio: 2.10, ruleOf40: 19.8 },
  },
  {
    ticker: "MGROS",
    name: "Migros Ticaret A.Ş.",
    sector: "Perakende Ticaret",
    price: 480.0,
    canslim: { total: 67, grade: "B+", recommendation: "Potansiyel fırsat — takip listesine ekle, giriş noktası bekle" },
    buffett: { total: 58, grade: "B", verdict: "Kabul edilebilir — bazı güçlü yönler var ama eksikler de mevcut" },
    techRatios: { overallScore: 42, grade: "C", pegRatio: 1.55, ruleOf40: 29.1 },
  },
  {
    ticker: "ENJSA",
    name: "Enerjisa Enerji A.Ş.",
    sector: "Enerji",
    price: 48.9,
    canslim: { total: 48, grade: "C", recommendation: "Nötr — bazı kriterler karşılanıyor, dikkatle izle" },
    buffett: { total: 66, grade: "B+", verdict: "Değer yatırımı için güçlü aday — çoğu kriteri karşılıyor" },
    techRatios: { overallScore: 36, grade: "C", pegRatio: 1.88, ruleOf40: 23.5 },
  },
  {
    ticker: "DOAS",
    name: "Doğuş Otomotiv Servis ve Ticaret A.Ş.",
    sector: "Otomotiv",
    price: 268.5,
    canslim: { total: 70, grade: "B+", recommendation: "Potansiyel fırsat — takip listesine ekle, giriş noktası bekle" },
    buffett: { total: 52, grade: "B", verdict: "Kabul edilebilir — bazı güçlü yönler var ama eksikler de mevcut" },
    techRatios: { overallScore: 47, grade: "C", pegRatio: 1.42, ruleOf40: 30.6 },
  },
  {
    ticker: "AEFES",
    name: "Anadolu Efes Biracılık ve Malt Sanayii A.Ş.",
    sector: "Gıda ve İçecek",
    price: 310.0,
    canslim: { total: 46, grade: "C", recommendation: "Nötr — bazı kriterler karşılanıyor, dikkatle izle" },
    buffett: { total: 70, grade: "B+", verdict: "Değer yatırımı için güçlü aday — çoğu kriteri karşılıyor" },
    techRatios: { overallScore: 28, grade: "D", pegRatio: 2.55, ruleOf40: 14.2 },
  },
  {
    ticker: "PENTA",
    name: "Penta Teknoloji Ürünleri Dağıtım Tic. A.Ş.",
    sector: "Teknoloji",
    price: 56.4,
    canslim: { total: 62, grade: "B+", recommendation: "Potansiyel fırsat — takip listesine ekle, giriş noktası bekle" },
    buffett: { total: 33, grade: "D", verdict: "Uygun değil — değer yatırımı kriterleriyle örtüşmüyor" },
    techRatios: { overallScore: 65, grade: "B+", pegRatio: 1.05, ruleOf40: 40.2 },
  },
  {
    ticker: "TTKOM",
    name: "Türk Telekomünikasyon A.Ş.",
    sector: "Telekomünikasyon",
    price: 52.8,
    canslim: { total: 53, grade: "B", recommendation: "Nötr — bazı kriterler karşılanıyor, dikkatle izle" },
    buffett: { total: 64, grade: "B+", verdict: "Kabul edilebilir — bazı güçlü yönler var ama eksikler de mevcut" },
    techRatios: { overallScore: 48, grade: "C", pegRatio: 1.48, ruleOf40: 31.5 },
  },
];

/**
 * CANSLIM Scoring System — William O'Neil Methodology
 *
 * C = Current Quarterly EPS Growth (Çeyreklik HBK Büyümesi)
 * A = Annual Earnings Growth (Yıllık Kar Büyümesi)
 * N = New Products/Management/Price Highs (Yenilik & Fiyat Zirveleri)
 * S = Supply & Demand (Arz-Talep / Hacim Analizi)
 * L = Leader or Laggard (Sektör Liderliği)
 * I = Institutional Sponsorship (Kurumsal Sahiplik)
 * M = Market Direction (Piyasa Yönü)
 */

export interface CANSLIMInput {
  // C — Current Quarterly EPS
  currentQuarterEpsGrowth: number;     // % — son çeyrek HBK büyümesi (YoY)
  previousQuarterEpsGrowth: number;    // % — önceki çeyrek HBK büyümesi

  // A — Annual Earnings
  annualEpsGrowth3y: number;           // % — 3 yıllık yıllık HBK büyüme ortalaması
  annualEpsGrowth5y: number;           // % — 5 yıllık
  roe: number;                         // % — özkaynak karlılığı

  // N — New / Price Highs
  nearHigh52w: boolean;                // 52 hafta zirvesine yakın mı (%15 içinde)
  hasNewProduct: boolean;              // yeni ürün/yönetim/iş modeli
  priceVs52wHigh: number;             // % — 52 hafta zirvesine uzaklık

  // S — Supply & Demand
  avgVolumeIncrease: boolean;          // son dönem hacim artışı var mı
  volumeRatio: number;                 // son hacim / 50 günlük ort. hacim
  floatRatio: number;                  // halka açıklık oranı (düşük = iyi)

  // L — Leader
  relativeStrength: number;            // 0-100 — sektör içi göreceli güç
  sectorRank: number;                  // sektördeki sıralama (1 = en iyi)

  // I — Institutional
  institutionalOwnership: number;      // % — kurumsal sahiplik
  institutionalChange: number;         // % — son çeyrekte kurumsal değişim

  // M — Market
  marketTrend: "bull" | "bear" | "neutral";  // genel piyasa yönü
  bist100Above200ma: boolean;          // BIST-100, 200 günlük MA üzerinde mi
}

export interface CANSLIMScore {
  total: number;         // 0-100
  grade: "A+" | "A" | "B+" | "B" | "C" | "D" | "F";
  components: {
    C: { score: number; max: number; label: string; detail: string };
    A: { score: number; max: number; label: string; detail: string };
    N: { score: number; max: number; label: string; detail: string };
    S: { score: number; max: number; label: string; detail: string };
    L: { score: number; max: number; label: string; detail: string };
    I: { score: number; max: number; label: string; detail: string };
    M: { score: number; max: number; label: string; detail: string };
  };
  recommendation: string;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function calculateCANSLIM(input: CANSLIMInput): CANSLIMScore {
  // C — Current (max 20)
  let cScore = 0;
  let cDetail = "";
  if (input.currentQuarterEpsGrowth >= 40) { cScore = 20; cDetail = "Mükemmel: %" + input.currentQuarterEpsGrowth.toFixed(0) + " çeyreklik büyüme"; }
  else if (input.currentQuarterEpsGrowth >= 25) { cScore = 16; cDetail = "Güçlü: %" + input.currentQuarterEpsGrowth.toFixed(0) + " çeyreklik büyüme"; }
  else if (input.currentQuarterEpsGrowth >= 15) { cScore = 12; cDetail = "İyi: %" + input.currentQuarterEpsGrowth.toFixed(0) + " çeyreklik büyüme"; }
  else if (input.currentQuarterEpsGrowth >= 5) { cScore = 6; cDetail = "Orta: %" + input.currentQuarterEpsGrowth.toFixed(0) + " çeyreklik büyüme"; }
  else { cScore = 2; cDetail = "Zayıf: %" + input.currentQuarterEpsGrowth.toFixed(0) + " çeyreklik büyüme"; }
  // Acceleration bonus
  if (input.currentQuarterEpsGrowth > input.previousQuarterEpsGrowth) cScore = Math.min(20, cScore + 2);

  // A — Annual (max 15)
  let aScore = 0;
  let aDetail = "";
  if (input.annualEpsGrowth3y >= 25 && input.roe >= 17) { aScore = 15; aDetail = "3Y büyüme: %" + input.annualEpsGrowth3y.toFixed(0) + ", ROE: %" + input.roe.toFixed(0); }
  else if (input.annualEpsGrowth3y >= 15) { aScore = 11; aDetail = "3Y büyüme: %" + input.annualEpsGrowth3y.toFixed(0) + ", ROE: %" + input.roe.toFixed(0); }
  else if (input.annualEpsGrowth3y >= 8) { aScore = 7; aDetail = "3Y büyüme: %" + input.annualEpsGrowth3y.toFixed(0); }
  else { aScore = 3; aDetail = "Düşük yıllık büyüme: %" + input.annualEpsGrowth3y.toFixed(0); }

  // N — New (max 15)
  let nScore = 0;
  let nDetail = "";
  if (input.nearHigh52w) { nScore += 8; nDetail = "52 hafta zirvesine yakın"; }
  else { nScore += clamp(Math.round((1 - input.priceVs52wHigh / 100) * 8), 0, 8); nDetail = "52H zirveden %" + input.priceVs52wHigh.toFixed(0) + " uzakta"; }
  if (input.hasNewProduct) { nScore += 7; nDetail += " + yeni katalizör"; }
  nScore = Math.min(15, nScore);

  // S — Supply & Demand (max 15)
  let sScore = 0;
  let sDetail = "";
  if (input.volumeRatio >= 1.5) { sScore += 8; sDetail = "Hacim ortalamanın " + input.volumeRatio.toFixed(1) + "x üzerinde"; }
  else if (input.volumeRatio >= 1.0) { sScore += 5; sDetail = "Normal hacim"; }
  else { sScore += 2; sDetail = "Düşük hacim"; }
  if (input.floatRatio <= 0.3) { sScore += 7; sDetail += ", düşük halka açıklık"; }
  else if (input.floatRatio <= 0.5) { sScore += 4; sDetail += ", orta halka açıklık"; }
  else { sScore += 2; }
  sScore = Math.min(15, sScore);

  // L — Leader (max 15)
  let lScore = 0;
  let lDetail = "";
  if (input.relativeStrength >= 80) { lScore = 15; lDetail = "Sektör lideri (RS: " + input.relativeStrength + ")"; }
  else if (input.relativeStrength >= 60) { lScore = 11; lDetail = "Güçlü (RS: " + input.relativeStrength + ")"; }
  else if (input.relativeStrength >= 40) { lScore = 7; lDetail = "Ortalama (RS: " + input.relativeStrength + ")"; }
  else { lScore = 3; lDetail = "Geride kalan (RS: " + input.relativeStrength + ")"; }

  // I — Institutional (max 10)
  let iScore = 0;
  let iDetail = "";
  if (input.institutionalOwnership >= 30 && input.institutionalChange > 0) { iScore = 10; iDetail = "%" + input.institutionalOwnership.toFixed(0) + " kurumsal, artan ilgi"; }
  else if (input.institutionalOwnership >= 20) { iScore = 7; iDetail = "%" + input.institutionalOwnership.toFixed(0) + " kurumsal sahiplik"; }
  else if (input.institutionalOwnership >= 10) { iScore = 4; iDetail = "Düşük kurumsal ilgi"; }
  else { iScore = 2; iDetail = "Çok düşük kurumsal sahiplik"; }

  // M — Market (max 10)
  let mScore = 0;
  let mDetail = "";
  if (input.marketTrend === "bull" && input.bist100Above200ma) { mScore = 10; mDetail = "Boğa piyasası, trend yukarı"; }
  else if (input.marketTrend === "bull") { mScore = 7; mDetail = "Boğa piyasası"; }
  else if (input.marketTrend === "neutral") { mScore = 5; mDetail = "Nötr piyasa"; }
  else { mScore = 2; mDetail = "Ayı piyasası — dikkatli ol"; }

  const total = cScore + aScore + nScore + sScore + lScore + iScore + mScore;

  const grade: CANSLIMScore["grade"] =
    total >= 85 ? "A+" :
    total >= 75 ? "A" :
    total >= 65 ? "B+" :
    total >= 50 ? "B" :
    total >= 35 ? "C" :
    total >= 20 ? "D" : "F";

  const recommendation =
    total >= 75 ? "Güçlü AL sinyali — CANSLIM kriterlerinin büyük çoğunluğunu karşılıyor" :
    total >= 60 ? "Potansiyel fırsat — takip listesine ekle, giriş noktası bekle" :
    total >= 45 ? "Nötr — bazı kriterler karşılanıyor, dikkatle izle" :
    "Zayıf — CANSLIM kriterlerine uymuyor, bekle";

  return {
    total,
    grade,
    components: {
      C: { score: cScore, max: 20, label: "Çeyreklik Kar Büyümesi", detail: cDetail },
      A: { score: aScore, max: 15, label: "Yıllık Kar Büyümesi", detail: aDetail },
      N: { score: nScore, max: 15, label: "Yenilik & Fiyat Zirveleri", detail: nDetail },
      S: { score: sScore, max: 15, label: "Arz-Talep Dinamiği", detail: sDetail },
      L: { score: lScore, max: 15, label: "Sektör Liderliği", detail: lDetail },
      I: { score: iScore, max: 10, label: "Kurumsal Sahiplik", detail: iDetail },
      M: { score: mScore, max: 10, label: "Piyasa Yönü", detail: mDetail },
    },
    recommendation,
  };
}

export const CANSLIM_LABELS: Record<string, string> = {
  C: "C — Çeyreklik Kar",
  A: "A — Yıllık Büyüme",
  N: "N — Yenilik",
  S: "S — Arz-Talep",
  L: "L — Liderlik",
  I: "I — Kurumsal",
  M: "M — Piyasa",
};

export const CANSLIM_COLORS: Record<string, string> = {
  C: "#3B82F6",
  A: "#10B981",
  N: "#8B5CF6",
  S: "#F59E0B",
  L: "#EC4899",
  I: "#06B6D4",
  M: "#EF4444",
};

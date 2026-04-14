/**
 * Warren Buffett Value Investing Score
 *
 * Buffett'ın temel kriterleri:
 * 1. Sürdürülebilir rekabet avantajı (MOAT) → Yüksek & istikrarlı ROE
 * 2. Güçlü kazanç gücü → İstikrarlı kar büyümesi
 * 3. Düşük borç → Borç/Özkaynak düşük
 * 4. Yüksek kar marjları → Net marj yüksek & istikrarlı
 * 5. Makul fiyat → İçsel değere göre ucuz (F/K, PD/DD)
 * 6. Güçlü nakit üretimi → Serbest nakit akışı pozitif & büyüyen
 * 7. İyi yönetim → ROE > %15, istikrarlı temettü
 */

export interface BuffettInput {
  // Moat — Rekabet Avantajı
  roe: number;                    // %
  roe5yAvg: number;               // %
  roeStdDev: number;              // ROE'nin 5Y standart sapması (istikrar)
  grossMargin: number;            // %
  grossMargin5yAvg: number;       // %

  // Earnings Power — Kazanç Gücü
  epsGrowth5y: number;            // % CAGR
  revenueGrowth5y: number;        // % CAGR
  consecutiveProfitYears: number; // üst üste karlı yıl sayısı

  // Debt — Borç
  debtToEquity: number;
  netDebtToEbitda: number;
  interestCoverage: number;

  // Margins — Marjlar
  netMargin: number;              // %
  operatingMargin: number;        // %
  netMarginTrend: "improving" | "stable" | "declining";

  // Valuation — Değerleme
  peRatio: number;
  pbRatio: number;
  earningsYield: number;          // % (1/PE * 100)
  pegRatio: number;

  // Cash Generation — Nakit Üretimi
  freeCashFlowYield: number;      // %
  fcfPositiveYears: number;       // son kaç yıl FCF pozitif
  capexToRevenue: number;         // % — düşük = iyi (hafif sermaye)

  // Management — Yönetim
  dividendConsistency: number;    // son kaç yıl temettü ödemiş
  buybackActive: boolean;         // hisse geri alım yapıyor mu
}

export interface BuffettScore {
  total: number;         // 0-100
  grade: "A+" | "A" | "B+" | "B" | "C" | "D" | "F";
  components: {
    moat: { score: number; max: number; label: string; insights: string[] };
    earnings: { score: number; max: number; label: string; insights: string[] };
    debt: { score: number; max: number; label: string; insights: string[] };
    margins: { score: number; max: number; label: string; insights: string[] };
    valuation: { score: number; max: number; label: string; insights: string[] };
    cashflow: { score: number; max: number; label: string; insights: string[] };
    management: { score: number; max: number; label: string; insights: string[] };
  };
  verdict: string;
}

export function calculateBuffett(input: BuffettInput): BuffettScore {
  // MOAT (max 20)
  let moat = 0;
  const moatInsights: string[] = [];
  if (input.roe >= 20 && input.roe5yAvg >= 18) { moat += 10; moatInsights.push("ROE sürekli yüksek: %" + input.roe.toFixed(0)); }
  else if (input.roe >= 15) { moat += 6; moatInsights.push("ROE iyi: %" + input.roe.toFixed(0)); }
  else { moat += 2; moatInsights.push("ROE düşük: %" + input.roe.toFixed(0)); }

  if (input.roeStdDev < 5) { moat += 5; moatInsights.push("ROE istikrarlı (düşük volatilite)"); }
  else if (input.roeStdDev < 10) { moat += 3; }

  if (input.grossMargin >= 40) { moat += 5; moatInsights.push("Güçlü brüt marj: %" + input.grossMargin.toFixed(0)); }
  else if (input.grossMargin >= 25) { moat += 3; }
  else { moat += 1; }
  moat = Math.min(20, moat);

  // EARNINGS POWER (max 15)
  let earnings = 0;
  const earningsInsights: string[] = [];
  if (input.epsGrowth5y >= 15) { earnings += 8; earningsInsights.push("5Y HBK büyüme: %" + input.epsGrowth5y.toFixed(0) + " CAGR"); }
  else if (input.epsGrowth5y >= 8) { earnings += 5; earningsInsights.push("Orta HBK büyümesi"); }
  else { earnings += 2; }

  if (input.consecutiveProfitYears >= 10) { earnings += 7; earningsInsights.push(input.consecutiveProfitYears + " yıl üst üste karlı"); }
  else if (input.consecutiveProfitYears >= 5) { earnings += 4; earningsInsights.push(input.consecutiveProfitYears + " yıl üst üste karlı"); }
  else { earnings += 1; }
  earnings = Math.min(15, earnings);

  // DEBT (max 15)
  let debt = 0;
  const debtInsights: string[] = [];
  if (input.debtToEquity < 0.5) { debt += 8; debtInsights.push("Çok düşük borç: " + input.debtToEquity.toFixed(2) + "x"); }
  else if (input.debtToEquity < 1.0) { debt += 5; debtInsights.push("Kabul edilebilir borç: " + input.debtToEquity.toFixed(2) + "x"); }
  else { debt += 2; debtInsights.push("Yüksek borç: " + input.debtToEquity.toFixed(2) + "x"); }

  if (input.interestCoverage >= 8) { debt += 4; debtInsights.push("Rahat faiz karşılama: " + input.interestCoverage.toFixed(1) + "x"); }
  else if (input.interestCoverage >= 4) { debt += 2; }

  if (input.netDebtToEbitda < 2) { debt += 3; }
  else if (input.netDebtToEbitda < 3) { debt += 1; }
  debt = Math.min(15, debt);

  // MARGINS (max 15)
  let margins = 0;
  const marginInsights: string[] = [];
  if (input.netMargin >= 15) { margins += 7; marginInsights.push("Güçlü net marj: %" + input.netMargin.toFixed(1)); }
  else if (input.netMargin >= 8) { margins += 4; marginInsights.push("İyi net marj: %" + input.netMargin.toFixed(1)); }
  else { margins += 2; }

  if (input.operatingMargin >= 20) { margins += 5; }
  else if (input.operatingMargin >= 12) { margins += 3; }
  else { margins += 1; }

  if (input.netMarginTrend === "improving") { margins += 3; marginInsights.push("Marjlar iyileşiyor"); }
  else if (input.netMarginTrend === "stable") { margins += 2; }
  else { margins += 0; marginInsights.push("Marjlar daralıyor"); }
  margins = Math.min(15, margins);

  // VALUATION (max 15)
  let valuation = 0;
  const valInsights: string[] = [];
  if (input.peRatio > 0 && input.peRatio < 15) { valuation += 6; valInsights.push("Ucuz F/K: " + input.peRatio.toFixed(1) + "x"); }
  else if (input.peRatio < 25) { valuation += 3; valInsights.push("Makul F/K: " + input.peRatio.toFixed(1) + "x"); }
  else { valuation += 1; valInsights.push("Pahalı F/K: " + input.peRatio.toFixed(1) + "x"); }

  if (input.earningsYield > 8) { valuation += 5; valInsights.push("Yüksek kazanç getirisi: %" + input.earningsYield.toFixed(1)); }
  else if (input.earningsYield > 5) { valuation += 3; }
  else { valuation += 1; }

  if (input.pegRatio > 0 && input.pegRatio < 1) { valuation += 4; valInsights.push("Cazip PEG: " + input.pegRatio.toFixed(2)); }
  else if (input.pegRatio < 1.5) { valuation += 2; }
  else { valuation += 0; }
  valuation = Math.min(15, valuation);

  // CASH FLOW (max 10)
  let cashflow = 0;
  const cfInsights: string[] = [];
  if (input.freeCashFlowYield >= 8) { cashflow += 5; cfInsights.push("Güçlü FCF getirisi: %" + input.freeCashFlowYield.toFixed(1)); }
  else if (input.freeCashFlowYield >= 4) { cashflow += 3; }
  else { cashflow += 1; }

  if (input.fcfPositiveYears >= 5) { cashflow += 3; cfInsights.push(input.fcfPositiveYears + " yıl pozitif serbest nakit akışı"); }
  else if (input.fcfPositiveYears >= 3) { cashflow += 2; }

  if (input.capexToRevenue < 5) { cashflow += 2; cfInsights.push("Hafif sermaye yapısı"); }
  else if (input.capexToRevenue < 10) { cashflow += 1; }
  cashflow = Math.min(10, cashflow);

  // MANAGEMENT (max 10)
  let management = 0;
  const mgmtInsights: string[] = [];
  if (input.dividendConsistency >= 5) { management += 5; mgmtInsights.push(input.dividendConsistency + " yıl kesintisiz temettü"); }
  else if (input.dividendConsistency >= 3) { management += 3; }
  else { management += 1; }

  if (input.buybackActive) { management += 3; mgmtInsights.push("Hisse geri alım programı aktif"); }
  if (input.roe >= 15 && input.debtToEquity < 1) { management += 2; mgmtInsights.push("Sermaye tahsisi verimli"); }
  management = Math.min(10, management);

  const total = moat + earnings + debt + margins + valuation + cashflow + management;

  const grade: BuffettScore["grade"] =
    total >= 85 ? "A+" :
    total >= 75 ? "A" :
    total >= 65 ? "B+" :
    total >= 50 ? "B" :
    total >= 35 ? "C" :
    total >= 20 ? "D" : "F";

  const verdict =
    total >= 80 ? "Buffett tarzı mükemmel bir hisse — güçlü moat, düşük borç, sürdürülebilir büyüme" :
    total >= 65 ? "Değer yatırımı için güçlü aday — çoğu kriteri karşılıyor" :
    total >= 50 ? "Kabul edilebilir — bazı güçlü yönler var ama eksikler de mevcut" :
    total >= 35 ? "Zayıf — Buffett kriterleri büyük ölçüde karşılanmıyor" :
    "Uygun değil — değer yatırımı kriterleriyle örtüşmüyor";

  return {
    total,
    grade,
    components: {
      moat: { score: moat, max: 20, label: "Rekabet Avantajı (Moat)", insights: moatInsights },
      earnings: { score: earnings, max: 15, label: "Kazanç Gücü", insights: earningsInsights },
      debt: { score: debt, max: 15, label: "Borç Yapısı", insights: debtInsights },
      margins: { score: margins, max: 15, label: "Kar Marjları", insights: marginInsights },
      valuation: { score: valuation, max: 15, label: "Değerleme", insights: valInsights },
      cashflow: { score: cashflow, max: 10, label: "Nakit Üretimi", insights: cfInsights },
      management: { score: management, max: 10, label: "Yönetim Kalitesi", insights: mgmtInsights },
    },
    verdict,
  };
}

export const BUFFETT_COLORS: Record<string, string> = {
  moat: "#10B981",
  earnings: "#3B82F6",
  debt: "#F59E0B",
  margins: "#8B5CF6",
  valuation: "#EC4899",
  cashflow: "#06B6D4",
  management: "#F97316",
};

/**
 * Technology & Growth Stock Ratios
 * PEG, EV/Revenue, Rule of 40, ve ileri teknoloji rasyoları
 */

export interface TechRatiosInput {
  // Valuation
  peRatio: number;
  epsGrowthRate: number;          // % — beklenen büyüme
  evToRevenue: number;            // EV/Gelir
  evToEbitda: number;
  priceToSales: number;           // F/S
  priceToFreeCashFlow: number;    // F/FCF

  // Growth
  revenueGrowthYoY: number;      // %
  revenueGrowthQoQ: number;      // %
  revenueCAGR3y: number;          // %

  // Profitability
  grossMargin: number;            // %
  operatingMargin: number;        // %
  netMargin: number;              // %
  ebitdaMargin: number;           // %

  // Efficiency
  revenuePerEmployee: number;     // TL — çalışan başına gelir
  rAndDToRevenue: number;         // % — Ar-Ge harcaması/Gelir

  // SaaS / Subscription (varsa)
  netRevenueRetention: number | null;  // % — NRR (SaaS)
  customerGrowthRate: number | null;   // % — müşteri büyümesi
}

export interface TechRatiosResult {
  pegRatio: number;
  pegVerdict: string;
  pegColor: string;

  ruleOf40: number;
  ruleOf40Verdict: string;
  ruleOf40Color: string;

  evRevenueVerdict: string;
  evRevenueColor: string;

  efficiencyScore: number;   // 0-100
  growthScore: number;       // 0-100
  profitabilityScore: number; // 0-100
  overallScore: number;      // 0-100
  grade: string;

  insights: string[];
  warnings: string[];
}

export function calculateTechRatios(input: TechRatiosInput): TechRatiosResult {
  const insights: string[] = [];
  const warnings: string[] = [];

  // PEG Ratio
  const pegRatio = input.epsGrowthRate > 0 ? input.peRatio / input.epsGrowthRate : 99;
  let pegVerdict: string;
  let pegColor: string;
  if (pegRatio < 0.5) { pegVerdict = "Çok ucuz — büyümeye göre düşük değerleme"; pegColor = "#10B981"; insights.push("PEG < 0.5: Büyüme fiyatlanmamış"); }
  else if (pegRatio < 1.0) { pegVerdict = "Cazip — büyüme ile uyumlu fiyatlama"; pegColor = "#10B981"; insights.push("PEG < 1: Peter Lynch'in favori bölgesi"); }
  else if (pegRatio < 1.5) { pegVerdict = "Makul — tam fiyatlanmış"; pegColor = "#F59E0B"; }
  else if (pegRatio < 2.5) { pegVerdict = "Pahalı — büyüme primi yüksek"; pegColor = "#EF4444"; warnings.push("PEG > 1.5: Büyüme beklentileri fiyata yansımış"); }
  else { pegVerdict = "Çok pahalı — aşırı değerlenmiş"; pegColor = "#EF4444"; warnings.push("PEG > 2.5: Aşırı değerleme riski"); }

  // Rule of 40 (Gelir Büyümesi + EBITDA Marjı >= 40)
  const ruleOf40 = input.revenueGrowthYoY + input.ebitdaMargin;
  let ruleOf40Verdict: string;
  let ruleOf40Color: string;
  if (ruleOf40 >= 60) { ruleOf40Verdict = "Mükemmel — büyüme ve karlılık dengesi olağanüstü"; ruleOf40Color = "#10B981"; insights.push("Rule of 40 > 60: Üst düzey performans"); }
  else if (ruleOf40 >= 40) { ruleOf40Verdict = "Sağlıklı — büyüme ve karlılık dengede"; ruleOf40Color = "#10B981"; insights.push("Rule of 40 geçildi: Sağlıklı denge"); }
  else if (ruleOf40 >= 25) { ruleOf40Verdict = "Orta — iyileşme potansiyeli var"; ruleOf40Color = "#F59E0B"; }
  else { ruleOf40Verdict = "Zayıf — ne büyüyor ne de karlı"; ruleOf40Color = "#EF4444"; warnings.push("Rule of 40 altı: Büyüme-karlılık dengesi bozuk"); }

  // EV/Revenue
  let evRevenueVerdict: string;
  let evRevenueColor: string;
  if (input.evToRevenue < 1) { evRevenueVerdict = "Çok ucuz"; evRevenueColor = "#10B981"; }
  else if (input.evToRevenue < 3) { evRevenueVerdict = "Makul"; evRevenueColor = "#10B981"; }
  else if (input.evToRevenue < 8) { evRevenueVerdict = "Yüksek — büyüme gerektiriyor"; evRevenueColor = "#F59E0B"; }
  else { evRevenueVerdict = "Çok yüksek — SaaS primi"; evRevenueColor = "#EF4444"; }

  // Scores
  const growthScore = Math.min(100, Math.max(0,
    (input.revenueGrowthYoY > 0 ? Math.min(input.revenueGrowthYoY * 2, 50) : 0) +
    (input.revenueCAGR3y > 0 ? Math.min(input.revenueCAGR3y * 1.5, 30) : 0) +
    (input.revenueGrowthQoQ > 0 ? Math.min(input.revenueGrowthQoQ * 3, 20) : 0)
  ));

  const profitabilityScore = Math.min(100, Math.max(0,
    Math.min(input.grossMargin, 40) +
    Math.min(Math.max(input.operatingMargin, 0) * 1.5, 30) +
    Math.min(Math.max(input.netMargin, 0) * 2, 30)
  ));

  const efficiencyScore = Math.min(100, Math.max(0,
    (pegRatio < 1 ? 30 : pegRatio < 1.5 ? 20 : pegRatio < 2.5 ? 10 : 0) +
    (ruleOf40 >= 40 ? 30 : ruleOf40 >= 25 ? 15 : 0) +
    (input.evToRevenue < 3 ? 20 : input.evToRevenue < 8 ? 10 : 0) +
    (input.rAndDToRevenue >= 5 ? 20 : input.rAndDToRevenue >= 2 ? 10 : 0)
  ));

  const overallScore = Math.round(growthScore * 0.35 + profitabilityScore * 0.3 + efficiencyScore * 0.35);

  const grade =
    overallScore >= 85 ? "A+" :
    overallScore >= 75 ? "A" :
    overallScore >= 65 ? "B+" :
    overallScore >= 50 ? "B" :
    overallScore >= 35 ? "C" : "D";

  // Additional insights
  if (input.grossMargin >= 50) insights.push("Brüt marj > %50: Güçlü fiyatlama gücü");
  if (input.rAndDToRevenue >= 10) insights.push("Ar-Ge yoğun: Gelirin %" + input.rAndDToRevenue.toFixed(0) + "'i");
  if (input.netRevenueRetention && input.netRevenueRetention > 110) insights.push("NRR > %110: Müşteri değeri artıyor");
  if (input.priceToFreeCashFlow > 0 && input.priceToFreeCashFlow < 20) insights.push("F/FCF < 20: Makul nakit akışı değerlemesi");

  if (input.netMargin < 0) warnings.push("Negatif net marj — henüz karlı değil");
  if (input.revenueGrowthYoY < 10 && input.evToRevenue > 5) warnings.push("Düşük büyüme, yüksek EV/Gelir: Değerleme baskısı riski");

  return {
    pegRatio: Math.round(pegRatio * 100) / 100,
    pegVerdict,
    pegColor,
    ruleOf40: Math.round(ruleOf40 * 10) / 10,
    ruleOf40Verdict,
    ruleOf40Color,
    evRevenueVerdict,
    evRevenueColor,
    efficiencyScore,
    growthScore,
    profitabilityScore,
    overallScore,
    grade,
    insights,
    warnings,
  };
}

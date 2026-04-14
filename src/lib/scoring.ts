interface ScoringInput {
  peRatio: number | null;
  pbRatio: number | null;
  evToEbitda: number | null;
  revenueGrowth3y: number | null;
  netIncomeGrowth3y: number | null;
  analystUpside: number | null;
  roe5yAvg: number | null;
  revenueGrowth5y: number | null;
  profitStability: number | null;
  debtToEquity: number | null;
  currentRatio: number | null;
  interestCoverage: number | null;
  freeCashFlowPositive: boolean | null;
  dividendYield: number | null;
  dividendConsistency: number | null;
  payoutRatio: number | null;
  sectorAvgPE: number | null;
}

interface ScoreResult {
  valueScore: number;
  futureScore: number;
  pastScore: number;
  healthScore: number;
  dividendScore: number;
  overallScore: number;
}

function clamp(value: number, min = 0, max = 5): number {
  return Math.max(min, Math.min(max, value));
}

function scoreFromRange(value: number | null, low: number, high: number, invert = false): number {
  if (value === null) return 2.5;
  const normalized = (value - low) / (high - low);
  const clamped = Math.max(0, Math.min(1, normalized));
  const score = invert ? (1 - clamped) * 5 : clamped * 5;
  return clamp(Math.round(score * 10) / 10);
}

function weightedAvg(scores: number[], weights: number[]): number {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const sum = scores.reduce((acc, s, i) => acc + s * weights[i], 0);
  return clamp(Math.round((sum / totalWeight) * 10) / 10);
}

export function calculateValueScore(input: ScoringInput): number {
  const peSector = input.sectorAvgPE ?? 15;
  const peScore = input.peRatio !== null
    ? scoreFromRange(input.peRatio / peSector, 0.3, 2.0, true)
    : 2.5;
  const pbScore = scoreFromRange(input.pbRatio, 0.3, 5.0, true);
  const evScore = scoreFromRange(input.evToEbitda, 3, 20, true);

  return weightedAvg([peScore, pbScore, evScore], [0.4, 0.3, 0.3]);
}

export function calculateFutureScore(input: ScoringInput): number {
  const revenueGrowth = scoreFromRange(input.revenueGrowth3y, -0.1, 0.5);
  const profitGrowth = scoreFromRange(input.netIncomeGrowth3y, -0.1, 0.5);
  const upside = scoreFromRange(input.analystUpside, -0.1, 0.5);

  return weightedAvg([revenueGrowth, profitGrowth, upside], [0.35, 0.35, 0.3]);
}

export function calculatePastScore(input: ScoringInput): number {
  const roeScore = scoreFromRange(input.roe5yAvg, 0, 0.3);
  const growthScore = scoreFromRange(input.revenueGrowth5y, -0.05, 0.3);
  const stabilityScore = scoreFromRange(input.profitStability, 0, 1, true);

  return weightedAvg([roeScore, growthScore, stabilityScore], [0.4, 0.35, 0.25]);
}

export function calculateHealthScore(input: ScoringInput): number {
  const debtScore = scoreFromRange(input.debtToEquity, 0, 2.0, true);
  const currentScore = scoreFromRange(input.currentRatio, 0.5, 3.0);
  const interestScore = scoreFromRange(input.interestCoverage, 1, 10);
  const fcfScore = input.freeCashFlowPositive === null ? 2.5 : input.freeCashFlowPositive ? 4.5 : 1.0;

  return weightedAvg([debtScore, currentScore, interestScore, fcfScore], [0.3, 0.25, 0.25, 0.2]);
}

export function calculateDividendScore(input: ScoringInput): number {
  const yieldScore = scoreFromRange(input.dividendYield, 0, 0.1);
  const consistencyScore = scoreFromRange(input.dividendConsistency, 0, 5);
  const payoutScore = input.payoutRatio !== null
    ? (input.payoutRatio > 0 && input.payoutRatio < 0.8 ? 4.0 : input.payoutRatio >= 0.8 ? 2.0 : 1.0)
    : 2.5;

  return weightedAvg([yieldScore, consistencyScore, payoutScore], [0.4, 0.35, 0.25]);
}

export function calculateAllScores(input: ScoringInput): ScoreResult {
  const valueScore = calculateValueScore(input);
  const futureScore = calculateFutureScore(input);
  const pastScore = calculatePastScore(input);
  const healthScore = calculateHealthScore(input);
  const dividendScore = calculateDividendScore(input);
  const overallScore = clamp(
    Math.round(((valueScore + futureScore + pastScore + healthScore + dividendScore) / 5) * 10) / 10
  );

  return { valueScore, futureScore, pastScore, healthScore, dividendScore, overallScore };
}

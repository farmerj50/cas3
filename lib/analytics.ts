export type DigitStat = {
  digit: string;
  count: number;
  type: "hot" | "cold" | "neutral";
};

export type PositionStat = {
  position: 0 | 1 | 2;
  label: string;
  counts: { digit: string; count: number }[];
};

export type OverdueStat = {
  digit: string;
  drawsSince: number;
  lastSeenIndex: number;
};

export type StreakStat = {
  digit: string;
  currentStreak: number;
};

export type SumStat = {
  sum: number;
  count: number;
};

export type RecommendedPick = {
  numbers: string;
  score: number;
  reason: string;
  tier: "top" | "mid" | "low";
};

export type AnalyticsResponse = {
  history: string[];
  digitStats: DigitStat[];
  positionStats: PositionStat[];
  topPairs: { pair: string; count: number }[];
  overdueStats: OverdueStat[];
  streakStats: StreakStat[];
  sumStats: SumStat[];
  recommendedPicks: RecommendedPick[];
  exactOrderProbability: string;
  anyOrderProbability: string;
  totalDraws: number;
};

// 200-draw seeded sample history — digits 0, 2, 8 are hot; 6, 9 are cold
function generateSampleHistory(): string[] {
  // Simple LCG seeded PRNG for deterministic output
  let seed = 0xdeadbeef;
  function rand() {
    seed = Math.imul(seed ^ (seed >>> 16), 0x45d9f3b);
    seed = Math.imul(seed ^ (seed >>> 15), 0x119de1f3);
    seed = seed ^ (seed >>> 16);
    return (seed >>> 0) / 0xffffffff;
  }

  // Weights per position to create interesting position-level patterns
  const posWeights: number[][] = [
    [9, 7, 9, 6, 5, 6, 4, 5, 9, 4], // pos 0: 0,2,8 hot; 6,9 cold
    [8, 6, 8, 7, 6, 5, 4, 7, 8, 5], // pos 1: 0,2,8 hot; 3,7 warm; 6 cold
    [7, 8, 7, 6, 7, 7, 5, 6, 9, 4], // pos 2: 8 hottest; 9 cold
  ];

  function weightedDigit(pos: number): string {
    const w = posWeights[pos];
    const total = w.reduce((a, b) => a + b, 0);
    let r = rand() * total;
    for (let i = 0; i < 10; i++) {
      r -= w[i];
      if (r <= 0) return i.toString();
    }
    return "9";
  }

  const history: string[] = [];
  for (let i = 0; i < 200; i++) {
    history.push(weightedDigit(0) + weightedDigit(1) + weightedDigit(2));
  }
  return history;
}

const SAMPLE_HISTORY = generateSampleHistory();

function getDigitCounts(history: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (let i = 0; i <= 9; i++) counts[i.toString()] = 0;
  for (const draw of history) {
    for (const digit of draw.split("")) counts[digit] = (counts[digit] || 0) + 1;
  }
  return counts;
}

function getPositionCounts(history: string[]): Record<string, Record<string, number>> {
  const pos: Record<string, Record<string, number>> = { "0": {}, "1": {}, "2": {} };
  for (let i = 0; i <= 9; i++) {
    pos["0"][i] = 0;
    pos["1"][i] = 0;
    pos["2"][i] = 0;
  }
  for (const draw of history) {
    for (let p = 0; p < 3; p++) {
      const d = draw[p];
      pos[p.toString()][d] = (pos[p.toString()][d] || 0) + 1;
    }
  }
  return pos;
}

// Normalize pairs so (a,b) and (b,a) are counted as the same pair
function normPair(x: string, y: string) { return x <= y ? `${x}${y}` : `${y}${x}`; }

function getPairCounts(history: string[]): { pair: string; count: number }[] {
  const pairCounts: Record<string, number> = {};
  for (const draw of history) {
    const [a, b, c] = draw.split("");
    for (const pair of [normPair(a, b), normPair(a, c), normPair(b, c)]) {
      pairCounts[pair] = (pairCounts[pair] || 0) + 1;
    }
  }
  return Object.entries(pairCounts)
    .map(([pair, count]) => ({ pair, count }))
    .sort((x, y) => y.count - x.count)
    .slice(0, 10);
}

function getOverdueStats(history: string[]): OverdueStat[] {
  const lastSeen: Record<string, number> = {};
  for (let i = 0; i <= 9; i++) lastSeen[i.toString()] = -1;

  for (let i = 0; i < history.length; i++) {
    for (const d of history[i].split("")) lastSeen[d] = i;
  }

  const total = history.length;
  return Object.entries(lastSeen)
    .map(([digit, idx]) => ({
      digit,
      drawsSince: idx === -1 ? total : total - 1 - idx,
      lastSeenIndex: idx,
    }))
    .sort((a, b) => b.drawsSince - a.drawsSince);
}

function getStreakStats(history: string[]): StreakStat[] {
  const result: Record<string, number> = {};
  for (let d = 0; d <= 9; d++) {
    const key = d.toString();
    let streak = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].includes(key)) streak++;
      else break;
    }
    result[key] = streak;
  }
  return Object.entries(result)
    .map(([digit, currentStreak]) => ({ digit, currentStreak }))
    .sort((a, b) => b.currentStreak - a.currentStreak);
}

function getSumStats(history: string[]): SumStat[] {
  const sumCounts: Record<number, number> = {};
  for (let s = 0; s <= 27; s++) sumCounts[s] = 0;
  for (const draw of history) {
    const sum = draw.split("").reduce((acc, d) => acc + parseInt(d), 0);
    sumCounts[sum] = (sumCounts[sum] || 0) + 1;
  }
  return Object.entries(sumCounts).map(([sum, count]) => ({
    sum: parseInt(sum),
    count,
  }));
}

function scorePick(
  pick: string,
  digitCounts: Record<string, number>,
  topPairs: { pair: string; count: number }[]
): number {
  const [a, b, c] = pick.split("");
  const pairs = [`${a}${b}`, `${a}${c}`, `${b}${c}`];
  const digitScore = (digitCounts[a] || 0) + (digitCounts[b] || 0) + (digitCounts[c] || 0);
  const pairScore = pairs.reduce((sum, pair) => {
    return sum + (topPairs.find((p) => p.pair === pair)?.count || 0);
  }, 0);
  const diversityBoost = new Set([a, b, c]).size === 3 ? 2 : new Set([a, b, c]).size === 2 ? 1 : 0;
  return Number((digitScore + pairScore + diversityBoost).toFixed(2));
}

function generateRecommendations(
  digitCounts: Record<string, number>,
  topPairs: { pair: string; count: number }[]
): RecommendedPick[] {
  const all: { numbers: string; score: number }[] = [];
  for (let a = 0; a <= 9; a++) {
    for (let b = 0; b <= 9; b++) {
      for (let c = 0; c <= 9; c++) {
        const numbers = `${a}${b}${c}`;
        all.push({ numbers, score: scorePick(numbers, digitCounts, topPairs) });
      }
    }
  }

  all.sort((x, y) => y.score - x.score);
  const top = all.slice(0, 12);
  const maxScore = top[0]?.score || 1;
  const minScore = top[top.length - 1]?.score || 0;
  const range = maxScore - minScore || 1;

  return top.map((p, i) => {
    const tier: "top" | "mid" | "low" =
      i < 4 ? "top" : i < 8 ? "mid" : "low";
    const normalized = (p.score - minScore) / range;
    return {
      ...p,
      tier,
      reason:
        tier === "top"
          ? "Top-weighted — strongest digit + pair overlap"
          : tier === "mid"
          ? "Mid-tier — solid digit frequency"
          : "Backup pick — moderate score",
    };
  });
}

export function buildAnalytics(draws?: string[]): AnalyticsResponse {
  const history = draws && draws.length >= 20 ? draws : SAMPLE_HISTORY;

  const digitCounts = getDigitCounts(history);
  const entries = Object.entries(digitCounts).sort((a, b) => b[1] - a[1]);
  const hotSet = new Set(entries.slice(0, 3).map(([d]) => d));
  const coldSet = new Set(entries.slice(-3).map(([d]) => d));

  const digitStats: DigitStat[] = Object.entries(digitCounts).map(([digit, count]) => ({
    digit,
    count,
    type: hotSet.has(digit) ? "hot" : coldSet.has(digit) ? "cold" : "neutral",
  }));

  const posCounts = getPositionCounts(history);
  const positionStats: PositionStat[] = [
    { position: 0, label: "First digit", counts: Object.entries(posCounts["0"]).map(([digit, count]) => ({ digit, count })) },
    { position: 1, label: "Second digit", counts: Object.entries(posCounts["1"]).map(([digit, count]) => ({ digit, count })) },
    { position: 2, label: "Third digit", counts: Object.entries(posCounts["2"]).map(([digit, count]) => ({ digit, count })) },
  ];

  const topPairs = getPairCounts(history);
  const overdueStats = getOverdueStats(history);
  const streakStats = getStreakStats(history);
  const sumStats = getSumStats(history);
  const recommendedPicks = generateRecommendations(digitCounts, topPairs);

  return {
    history: history.slice(-50),
    digitStats,
    positionStats,
    topPairs,
    overdueStats,
    streakStats,
    sumStats,
    recommendedPicks,
    exactOrderProbability: "1 in 1,000 (0.1%)",
    anyOrderProbability: "1 in 167 for unique digits (box bet)",
    totalDraws: history.length,
  };
}

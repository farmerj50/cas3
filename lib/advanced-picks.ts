import type { DigitStat, SumStat } from "./analytics";

export type AdvancedPick = {
  numbers: string;
  score: number;
  sum: number;
  oddCount: number;
  isDouble: boolean;
  isTriple: boolean;
  pairScore: number;
  digitScore: number;
};

export type FunnelStep = {
  label: string;
  count: number;
};

export type AdvancedResult = {
  algorithm: string;
  picks: AdvancedPick[];
  funnel: FunnelStep[];
  description: string;
  hotDigits: string[];
  sumCenter: number;
  sumMin: number;
  sumMax: number;
};

// ─── shared helpers ───────────────────────────────────────────────────────────

function digitSum(n: string) {
  return n.split("").reduce((a, d) => a + parseInt(d), 0);
}

function scorePick(
  n: string,
  digitRank: Record<string, number>,   // lower rank index = hotter
  pairCounts: Record<string, number>
): { digitScore: number; pairScore: number; total: number } {
  const [a, b, c] = n.split("");
  // Invert rank so hot digits score higher (rank 0 = 10 pts, rank 9 = 1 pt)
  const ds = (10 - (digitRank[a] ?? 9)) + (10 - (digitRank[b] ?? 9)) + (10 - (digitRank[c] ?? 9));
  const ps = (pairCounts[`${a}${b}`] || 0) + (pairCounts[`${a}${c}`] || 0) + (pairCounts[`${b}${c}`] || 0);
  const diversity = new Set([a, b, c]).size === 3 ? 2 : 0;
  return { digitScore: ds, pairScore: ps, total: ds + ps + diversity };
}

function buildPairCounts(history: string[]): Record<string, number> {
  const m: Record<string, number> = {};
  for (const draw of history) {
    const [a, b, c] = draw.split("");
    for (const pair of [`${a}${b}`, `${a}${c}`, `${b}${c}`]) {
      m[pair] = (m[pair] || 0) + 1;
    }
  }
  return m;
}

function toAdvancedPick(
  numbers: string,
  digitRank: Record<string, number>,
  pairCounts: Record<string, number>
): AdvancedPick {
  const sum = digitSum(numbers);
  const odds = numbers.split("").filter((d) => parseInt(d) % 2 !== 0).length;
  const unique = new Set(numbers.split("")).size;
  const { digitScore, pairScore, total } = scorePick(numbers, digitRank, pairCounts);
  return {
    numbers,
    score: Math.round(total * 10) / 10,
    sum,
    oddCount: odds,
    isDouble: unique === 2,
    isTriple: unique === 1,
    pairScore,
    digitScore,
  };
}

// Deduplicate box plays — keep only the lexicographically smallest straight form
function deduplicateBoxPlays(picks: AdvancedPick[]): AdvancedPick[] {
  const seen = new Set<string>();
  const out: AdvancedPick[] = [];
  for (const p of picks) {
    const key = p.numbers.split("").sort().join("");
    if (!seen.has(key)) {
      seen.add(key);
      out.push(p);
    }
  }
  return out;
}

// ─── Algorithm 1: Combined Reduction System (~60 plays) ──────────────────────
//
// The professional reduction funnel (straight plays, ranked):
//   1,000 combos
//   → hot-digit filter  (top 7 digits — 7³ = 343)
//   → sum-range filter  (hottest sum ± 6 — keeps ~40-50%)
//   → balance filter    (no all-odd, no all-even — removes ~25%)
//   → ranked by composite score → top N

export function runCombinedReduction(
  digitStats: DigitStat[],
  sumStats: SumStat[],
  history: string[],
  targetCount = 60
): AdvancedResult {
  const sorted = [...digitStats].sort((a, b) => b.count - a.count);
  const hotDigits = sorted.slice(0, 7).map((d) => d.digit);
  const hotSet = new Set(hotDigits);
  const digitRank: Record<string, number> = {};
  sorted.forEach((d, i) => (digitRank[d.digit] = i));

  const hotSum = [...sumStats].sort((a, b) => b.count - a.count)[0]?.sum ?? 13;
  const sumMin = Math.max(0, hotSum - 6);
  const sumMax = Math.min(27, hotSum + 6);

  const pairCounts = buildPairCounts(history);
  const funnel: FunnelStep[] = [{ label: "All combinations", count: 1000 }];

  // Step 1: hot-digit filter (top 7 → 7³ = 343)
  let pool: string[] = [];
  for (let a = 0; a <= 9; a++)
    for (let b = 0; b <= 9; b++)
      for (let c = 0; c <= 9; c++) {
        const n = `${a}${b}${c}`;
        if (hotSet.has(a.toString()) && hotSet.has(b.toString()) && hotSet.has(c.toString()))
          pool.push(n);
      }
  funnel.push({ label: `Hot-digit filter (top 7: ${hotDigits.join(" ")})`, count: pool.length });

  // Step 2: sum range ±6
  pool = pool.filter((n) => { const s = digitSum(n); return s >= sumMin && s <= sumMax; });
  funnel.push({ label: `Sum range ${sumMin}–${sumMax} (peak ${hotSum})`, count: pool.length });

  // Step 3: odd/even balance — no all-odd or all-even
  pool = pool.filter((n) => {
    const odds = n.split("").filter((d) => parseInt(d) % 2 !== 0).length;
    return odds > 0 && odds < 3;
  });
  funnel.push({ label: "Odd/even balance (must be mixed)", count: pool.length });

  // Step 4: rank by composite score, take top N
  const picks = pool.map((n) => toAdvancedPick(n, digitRank, pairCounts));
  picks.sort((a, b) => b.score - a.score);
  const final = picks.slice(0, targetCount);
  funnel.push({ label: `Top ${targetCount} by composite score`, count: final.length });

  return {
    algorithm: "combined",
    picks: final,
    funnel,
    description:
      "Reduces 1,000 combinations using 3 mathematical filters: hot-digit containment (top 7), sum-range concentration (peak ±6), and odd/even balance. Remaining plays ranked by composite digit + pair frequency score.",
    hotDigits,
    sumCenter: hotSum,
    sumMin,
    sumMax,
  };
}

// ─── Algorithm 2: Hot Digit Wheel ─────────────────────────────────────────────
//
// Select N key digits → generate ALL 3-digit box combinations from those digits.
// With 7 digits → 84 unique box plays; with 6 → 56; with 5 → 35.
// Filter by sum range to reach target count.

export function runHotWheel(
  digitStats: DigitStat[],
  sumStats: SumStat[],
  history: string[],
  numDigits = 7,
  targetCount = 60
): AdvancedResult {
  const sorted = [...digitStats].sort((a, b) => b.count - a.count);
  const hotDigits = sorted.slice(0, numDigits).map((d) => d.digit);
  const hotSet = new Set(hotDigits);
  const digitRank: Record<string, number> = {};
  sorted.forEach((d, i) => (digitRank[d.digit] = i));
  const pairCounts = buildPairCounts(history);

  const hotSum = [...sumStats].sort((a, b) => b.count - a.count)[0]?.sum ?? 13;

  // Generate all straight plays using only wheel digits
  const pool: string[] = [];
  for (const a of hotDigits)
    for (const b of hotDigits)
      for (const c of hotDigits)
        pool.push(`${a}${b}${c}`);

  const funnel: FunnelStep[] = [
    { label: "All combinations", count: 1000 },
    { label: `Wheel ${numDigits} hot digits (${hotDigits.join("")})`, count: pool.length },
  ];

  // Rank first, then deduplicate so we keep the best-scoring straight form of each box
  const picks = pool.map((n) => toAdvancedPick(n, digitRank, pairCounts));
  picks.sort((a, b) => b.score - a.score);
  const deduped = deduplicateBoxPlays(picks);
  funnel.push({ label: "Deduplicate to unique box plays", count: deduped.length });

  // Take top N by score (no further sum filter — dedup already bounds the count)
  const final = deduped.slice(0, targetCount);
  funnel.push({ label: `Top ${final.length} by composite score`, count: final.length });

  return {
    algorithm: "wheel",
    picks: final,
    funnel,
    description: `Generates all 3-digit box combinations using the ${numDigits} most frequent digits. Every pick in this set is built entirely from high-probability digits.`,
    hotDigits,
    sumCenter: hotSum,
    sumMin: hotSum - 4,
    sumMax: hotSum + 4,
  };
}

// ─── Algorithm 3: Rundown System ─────────────────────────────────────────────
//
// Start from a seed (e.g., last draw). Apply standard rundown patterns used by
// professional players:
//   • +1 rundown  (add 1 to each digit mod 10), 10 steps
//   • +2 rundown, 5 steps
//   • Mirror rundown (0↔5, 1↔6, 2↔7, 3↔8, 4↔9)
//   • +123 addition (add 1 to pos0, 2 to pos1, 3 to pos2), 10 steps
//   • All-same rundown (+111, +222, … around seed)
// Then deduplicate and score.

const MIRROR: Record<string, string> = {
  "0": "5", "1": "6", "2": "7", "3": "8", "4": "9",
  "5": "0", "6": "1", "7": "2", "8": "3", "9": "4",
};

function addRundown(n: string, step: number[]): string {
  return n.split("").map((d, i) => ((parseInt(d) + step[i]) % 10).toString()).join("");
}

function mirrorNumber(n: string): string {
  return n.split("").map((d) => MIRROR[d]).join("");
}

export function runRundown(
  seed: string,
  digitStats: DigitStat[],
  history: string[],
  targetCount = 60
): AdvancedResult {
  if (!/^\d{3}$/.test(seed)) seed = "000";

  const sorted = [...digitStats].sort((a, b) => b.count - a.count);
  const hotDigits = sorted.slice(0, 6).map((d) => d.digit);
  const digitRank: Record<string, number> = {};
  sorted.forEach((d, i) => (digitRank[d.digit] = i));
  const pairCounts = buildPairCounts(history);

  const candidates = new Set<string>();

  // +1 rundown (10 steps)
  let cur = seed;
  for (let i = 0; i < 10; i++) {
    candidates.add(cur);
    cur = addRundown(cur, [1, 1, 1]);
  }

  // +2 rundown (5 steps from seed)
  cur = seed;
  for (let i = 0; i < 5; i++) {
    candidates.add(cur);
    cur = addRundown(cur, [2, 2, 2]);
  }

  // +123 positional rundown (10 steps)
  cur = seed;
  for (let i = 0; i < 10; i++) {
    candidates.add(cur);
    cur = addRundown(cur, [1, 2, 3]);
  }

  // +132 positional rundown
  cur = seed;
  for (let i = 0; i < 10; i++) {
    candidates.add(cur);
    cur = addRundown(cur, [1, 3, 2]);
  }

  // Mirror of seed and all +1 rundown variants from mirror
  const mirrored = mirrorNumber(seed);
  candidates.add(mirrored);
  cur = mirrored;
  for (let i = 0; i < 10; i++) {
    candidates.add(cur);
    cur = addRundown(cur, [1, 1, 1]);
  }

  // Mirror of +123 rundown
  cur = seed;
  for (let i = 0; i < 10; i++) {
    const step = addRundown(cur, [1, 2, 3]);
    candidates.add(mirrorNumber(step));
    cur = step;
  }

  // All-same steps around seed: ±111, ±222, ±333, ±444, ±555
  for (const delta of [1, 2, 3, 4, 5]) {
    candidates.add(addRundown(seed, [delta, delta, delta]));
    candidates.add(addRundown(seed, [10 - delta, 10 - delta, 10 - delta]));
  }

  const funnel: FunnelStep[] = [
    { label: "All combinations", count: 1000 },
    { label: `Rundown candidates from seed ${seed}`, count: candidates.size },
  ];

  const picks = [...candidates].map((n) => toAdvancedPick(n, digitRank, pairCounts));
  picks.sort((a, b) => b.score - a.score);
  const deduped = deduplicateBoxPlays(picks);
  funnel.push({ label: "Deduplicate box plays", count: deduped.length });

  const final = deduped.slice(0, targetCount);
  funnel.push({ label: `Top ${final.length} by composite score`, count: final.length });

  return {
    algorithm: "rundown",
    picks: final,
    funnel,
    description: `Derives candidates mathematically from seed ${seed} using six rundown patterns (+1, +2, +123, +132, mirror, mirror+rundown), then deduplicates and ranks by composite score.`,
    hotDigits,
    sumCenter: digitSum(seed),
    sumMin: 0,
    sumMax: 27,
  };
}

/**
 * Auto-fetch draw history from LotteryPost.
 * LotteryPost has a consistent URL/HTML structure for all supported states.
 * URL pattern: https://www.lotterypost.com/results/{state}/{game}
 */

const STATE_SLUGS: Record<string, string> = {
  GA: "ga/cash3",
  FL: "fl/pick3",
  TX: "tx/daily3",
  TN: "tn/cash3",
  AL: "al/cash3",
  NC: "nc/pick3",
  SC: "sc/pick3",
  VA: "va/pick3",
  MD: "md/pick3",
  OH: "oh/pick3",
  PA: "pa/pick3",
  NJ: "nj/pick3",
  NY: "ny/numbers",
  MI: "mi/daily3",
  IL: "il/pick3",
  IN: "in/daily3",
  MO: "mo/pick3",
  KY: "ky/pick3",
  MS: "ms/cash3",
  LA: "la/pick3",
};

export type FetchedDraw = {
  numbers: string;
  drawDate: string; // YYYY-MM-DD
  period: string;   // "midday" | "evening"
};

/**
 * Parse a month-name date string like "Fri, Mar 21, 2025" → "2025-03-21"
 */
function parseDateString(raw: string): string | null {
  const months: Record<string, string> = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
    Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
  };
  // e.g. "Fri, Mar 21, 2025" or "Mar 21, 2025" or "03/21/2025"
  let m = raw.match(/(\w{3}),?\s+(\w{3})\s+(\d{1,2}),?\s+(\d{4})/);
  if (m) {
    const mo = months[m[2]];
    if (!mo) return null;
    return `${m[4]}-${mo}-${m[3].padStart(2, "0")}`;
  }
  m = raw.match(/(\w{3})\s+(\d{1,2}),?\s+(\d{4})/);
  if (m) {
    const mo = months[m[1]];
    if (!mo) return null;
    return `${m[3]}-${mo}-${m[2].padStart(2, "0")}`;
  }
  // MM/DD/YYYY
  m = raw.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) return `${m[3]}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
  return null;
}

/**
 * Extract all 3-digit numbers from an HTML row block.
 * LotteryPost renders numbers as individual digit spans inside a <ul class="picks"> or
 * similar container. We capture sequences of 3 consecutive single-digit <li> or <span>.
 */
function extractNumbers(html: string): string[] {
  const results: string[] = [];
  // Match patterns like: <li>4</li><li>0</li><li>8</li>  (no gap)
  const liPattern = /(?:<li[^>]*>(\d)<\/li>\s*){3}/g;
  let m = liPattern.exec(html);
  while (m) {
    // Re-extract the 3 digits from the matched block
    const digits = [...m[0].matchAll(/<li[^>]*>(\d)<\/li>/g)].map((x) => x[1]);
    if (digits.length === 3) results.push(digits.join(""));
    m = liPattern.exec(html);
  }

  if (results.length === 0) {
    // Fallback: <span>4</span><span>0</span><span>8</span>
    const spanPattern = /(?:<span[^>]*>(\d)<\/span>\s*){3}/g;
    let sm = spanPattern.exec(html);
    while (sm) {
      const digits = [...sm[0].matchAll(/<span[^>]*>(\d)<\/span>/g)].map((x) => x[1]);
      if (digits.length === 3) results.push(digits.join(""));
      sm = spanPattern.exec(html);
    }
  }

  return results;
}

/**
 * Detect draw period from a row's HTML.
 * LotteryPost uses icons/text like "Midday" or "Evening" in each result row.
 */
function detectPeriod(rowHtml: string): string {
  const lower = rowHtml.toLowerCase();
  if (lower.includes("midday") || lower.includes("mid-day") || lower.includes("mid ")) return "midday";
  if (lower.includes("evening") || lower.includes("night") || lower.includes("eve")) return "evening";
  return "evening"; // default
}

/**
 * Fetch and parse draw history for a state from LotteryPost.
 * Returns up to `limit` most-recent draws.
 */
export async function fetchStateDraws(state: string, limit = 90): Promise<FetchedDraw[]> {
  const slug = STATE_SLUGS[state];
  if (!slug) throw new Error(`State ${state} is not supported for auto-fetch.`);

  const url = `https://www.lotterypost.com/results/${slug}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
    },
    // 10-second timeout
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) throw new Error(`LotteryPost returned HTTP ${res.status} for ${state}`);

  const html = await res.text();
  return parseResultsPage(html, limit);
}

/**
 * Parse a LotteryPost results HTML page.
 * Strategy: split into table rows, find date + period + numbers in each.
 */
function parseResultsPage(html: string, limit: number): FetchedDraw[] {
  const draws: FetchedDraw[] = [];

  // LotteryPost wraps each draw in a <tr> with a date cell.
  // Split by <tr to get candidate row blocks.
  const rows = html.split(/<tr[\s>]/i);

  for (const row of rows) {
    if (draws.length >= limit) break;

    // Must contain digit-like content
    if (!/<li|<span/i.test(row)) continue;

    // Extract date from the row
    // Dates appear in cells like: >Fri, Mar 21, 2025< or >03/21/2025<
    const dateMatch =
      row.match(/>((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s+\w{3}\s+\d{1,2},?\s+\d{4})</) ||
      row.match(/>(\w{3}\s+\d{1,2},?\s+\d{4})</) ||
      row.match(/>(\d{1,2}\/\d{1,2}\/\d{4})</);

    if (!dateMatch) continue;
    const drawDate = parseDateString(dateMatch[1]);
    if (!drawDate) continue;

    const period = detectPeriod(row);
    const nums = extractNumbers(row);

    for (const numbers of nums) {
      if (draws.length >= limit) break;
      draws.push({ numbers, drawDate, period });
    }
  }

  return draws;
}

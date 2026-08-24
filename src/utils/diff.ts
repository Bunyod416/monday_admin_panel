export type DiffChunk =
  | { type: "same"; text: string }
  | { type: "added"; text: string }
  | { type: "removed"; text: string };

export function diffChars(actual: string, expected: string): DiffChunk[] {
  if (actual === expected) return [{ type: "same", text: actual }];
  if (!actual) return [{ type: "added", text: expected }];
  if (!expected) return [{ type: "removed", text: actual }];

  const n = actual.length;
  const m = expected.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (actual[i] === expected[j]) dp[i + 1][j + 1] = dp[i][j] + 1;
      else dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const chunks: DiffChunk[] = [];
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && actual[i - 1] === expected[j - 1]) {
      chunks.unshift({ type: "same", text: actual[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      chunks.unshift({ type: "added", text: expected[j - 1] });
      j--;
    } else {
      chunks.unshift({ type: "removed", text: actual[i - 1] });
      i--;
    }
  }

  const merged: DiffChunk[] = [];
  for (const c of chunks) {
    const last = merged[merged.length - 1];
    if (last && last.type === c.type) last.text += c.text;
    else merged.push({ ...c });
  }
  return merged;
}

export function similarity(a: string, b: string): number {
  if (a === b) return 1;
  const cleanA = a.replace(/\s+/g, "");
  const cleanB = b.replace(/\s+/g, "");
  if (!cleanA && !cleanB) return 1;
  if (!cleanA || !cleanB) return 0;

  const n = cleanA.length;
  const m = cleanB.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (cleanA[i] === cleanB[j]) dp[i + 1][j + 1] = dp[i][j] + 1;
      else dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  return (2 * dp[n][m]) / (n + m);
}

/**
 * Deterministic answer checking for typed French/English answers.
 *
 * - Case, surrounding punctuation, guillemets, curly apostrophes and extra
 *   whitespace are ignored.
 * - Missing/wrong accents are accepted but flagged (`accentSlip`).
 * - A single-letter typo in one longer word (≥5 letters) is accepted but
 *   flagged (`typo`). Short words are never typo-tolerant, so gender/article
 *   errors such as "un" vs "une" or "le" vs "la" are always marked wrong.
 */

export interface CheckResult {
  correct: boolean;
  /** Matched answer (canonical form to display). */
  expected: string;
  accentSlip?: boolean;
  typo?: boolean;
}

export function normalize(input: string): string {
  return input
    .normalize('NFC')
    .toLowerCase()
    .replace(/[’‘ʼ`´]/g, "'")
    .replace(/[«»“”"()\[\]¡¿…]/g, ' ')
    .replace(/[.,!?;:]/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s*'\s*/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function stripAccents(input: string): string {
  return input
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

function oneLongWordTypo(a: string, b: string): boolean {
  const ta = a.split(' ');
  const tb = b.split(' ');
  if (ta.length !== tb.length) return false;
  let diffs = 0;
  for (let i = 0; i < ta.length; i++) {
    if (ta[i] === tb[i]) continue;
    diffs++;
    if (diffs > 1) return false;
    if (Math.min(ta[i].length, tb[i].length) < 5) return false;
    if (levenshtein(ta[i], tb[i]) > 1) return false;
  }
  return diffs === 1;
}

export function checkAnswer(input: string, answers: string[]): CheckResult {
  const canonical = answers[0] ?? '';
  const n = normalize(input);
  if (!n) return { correct: false, expected: canonical };

  for (const a of answers) if (normalize(a) === n) return { correct: true, expected: a };

  const ns = stripAccents(n);
  for (const a of answers) {
    if (stripAccents(normalize(a)) === ns) return { correct: true, expected: a, accentSlip: true };
  }
  for (const a of answers) {
    const as = stripAccents(normalize(a));
    if (oneLongWordTypo(ns, as)) return { correct: true, expected: a, typo: true };
  }
  return { correct: false, expected: canonical };
}

/** Compare a built word-order sentence with the expected order(s). */
export function checkOrder(built: string[], words: string[], alternatives: string[][] = []): boolean {
  const target = normalize(built.join(' '));
  return [words, ...alternatives].some((w) => normalize(w.join(' ')) === target);
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Returns true when `text` contains `needle` (accent/case-insensitive, word-ish match). */
export function containsPhrase(text: string, needle: string): boolean {
  if (!needle.trim()) return false;
  return stripAccents(normalize(text)).includes(stripAccents(normalize(needle)));
}

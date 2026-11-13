// Subtitle per frasa, menempel ke jeda nyata (klausa) hasil scripts/retime.mjs.
// Dipakai episode yang sudah disinkronkan: SEGS = toSegs(SYNC_SEGS), CUES = makeCues(SYNC_SEGS).
export type Clause = { text: string; a: number; b: number; anchored?: boolean };
export type SyncSegLike = { n: number; text: string; a: number; b: number; clauses: Clause[] };
export type Seg = { a: number; b: number; text: string };
export type Cue = { a: number; b: number; text: string };

export const toSegs = (s: SyncSegLike[]): Seg[] => s.map((x) => ({ a: x.a, b: x.b, text: x.text }));

// pecah satu klausa jadi potongan <= maxChars (waktu dibagi proporsional per karakter, hanya di dalam klausa)
const splitClause = (c: Clause, maxChars: number): Cue[] => {
  const words = c.text.split(' ');
  const n = Math.max(1, Math.ceil(c.text.length / maxChars));
  const target = c.text.length / n;
  const parts: string[] = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? cur + ' ' + w : w;
    if (cur && next.length > target + 4 && parts.length < n - 1) {
      parts.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) parts.push(cur);
  const total = parts.reduce((s, p) => s + p.length, 0);
  let t = c.a;
  return parts.map((p) => {
    const d = ((c.b - c.a) * p.length) / total;
    const cue = { a: t, b: t + d, text: p };
    t += d;
    return cue;
  });
};

export const makeCues = (segs: SyncSegLike[], maxChars = 36): Cue[] =>
  segs.flatMap((s) => s.clauses.flatMap((c) => splitClause(c, maxChars)));

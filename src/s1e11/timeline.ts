// Episode S1E11: "Kapan waktu terbaik untuk tes HIV?"
// Timing disinkronkan per kalimat/klausa dari mp3 (scripts/retime.mjs) + jeda kontekstual (holds.json).
// Waktu per kata (scripts/wordsync.mjs -> words.ts) dipakai untuk subtitle dan untuk mematok aksi visual ke kata yang diucapkan. Teks = narasi_final persis.
import { SYNC_SEGS, SYNC_DUR } from './sync';
import { WORDS } from './words';
import { toSegs } from '../shared/cues';
export type { Seg } from '../shared/cues';

export const EP_DUR = SYNC_DUR; // suara + jeda + ekor diam 6 dtk
export const SEGS = toSegs(SYNC_SEGS);
export const CLOSE = SEGS[SEGS.length - 1].a; // kalimat terakhir: tampil logo + referensi + Dukung dan follow kami

// awal kalimat ke-n (1-based)
export const T = (n: number) => SEGS[n - 1].a;
// awal klausa ke-k (0-based) dari kalimat ke-n
export const CL = (n: number, k: number) => SYNC_SEGS[n - 1].clauses[k].a;

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9–]/g, '');
const find = (n: number, pat: string, occ: number) => {
  const m = WORDS.filter((w) => w.n === n && norm(w.text) === norm(pat));
  if (!m[occ]) throw new Error(`kata "${pat}" (#${occ}) tidak ada di kalimat ${n}`);
  return m[occ];
};
// waktu mulai / selesai ucap kata `pat` di kalimat n (occ = kemunculan ke-berapa, 0-based)
export const WA = (n: number, pat: string, occ = 0) => find(n, pat, occ).a;
export const WB = (n: number, pat: string, occ = 0) => find(n, pat, occ).b;

// subtitle per frasa: tiap klausa (batas dari jeda nyata, retime) dipecah di antara kata, <= 36 karakter,
// diutamakan di celah jeda nyata (>= 0,1 dtk) dan tidak memutus angka dari satuannya (13–64 | tahun).
export type Cue = { a: number; b: number; text: string; n?: number };
const UNIT = new Set(['tahun', 'persen', 'jam', 'bulan', 'hari', 'dtk']);
const MAXC = 36;
export const CUES: Cue[] = (() => {
  const out: Cue[] = [];
  for (const s of SYNC_SEGS) {
    s.clauses.forEach((_, k) => {
      const ws = WORDS.filter((w) => w.n === s.n && w.k === k);
      const n = ws.length;
      const len = (i: number, j: number) => ws.slice(i, j).reduce((x, w) => x + w.text.length + 1, -1);
      const total = len(0, n);
      const parts = Math.max(1, Math.ceil(total / MAXC));
      const ideal = total / parts;
      // DP: best[j] = biaya terbaik memecah kata [0,j)
      const best: number[] = Array(n + 1).fill(Infinity);
      const from: number[] = Array(n + 1).fill(0);
      best[0] = 0;
      for (let j = 1; j <= n; j++) {
        for (let i = 0; i < j; i++) {
          const L = len(i, j);
          if (L > MAXC + 4 && j - i > 1) continue;
          let c = best[i] + (L - ideal) ** 2 / 10 + 25; // 25 = biaya tiap potongan
          if (i > 0) {
            const gap = ws[i].a - ws[i - 1].b;
            if (gap >= 0.1) c -= 60; // potong di jeda nyata
            if (UNIT.has(ws[i].text.toLowerCase().replace(/[^a-z]/g, '')) && /\d/.test(ws[i - 1].text)) c += 200;
          }
          if (c < best[j]) { best[j] = c; from[j] = i; }
        }
      }
      const cuts: number[] = [];
      for (let j = n; j > 0; j = from[j]) cuts.unshift(from[j]);
      cuts.push(n);
      for (let c = 0; c + 1 < cuts.length; c++) {
        const seg = ws.slice(cuts[c], cuts[c + 1]);
        out.push({ a: seg[0].a, b: seg[seg.length - 1].b, text: seg.map((w) => w.text).join(' '), n: s.n });
      }
    });
  }
  // potongan yang terlalu singkat (< 0,3 dtk, mis. "Jadi,") digabung ke potongan berikutnya di kalimat yang sama
  const merged: Cue[] = [];
  for (let i = 0; i < out.length; i++) {
    const c = out[i];
    const nx = out[i + 1];
    if (c.b - c.a < 0.3 && nx && nx.n === c.n) out[i + 1] = { a: c.a, b: nx.b, text: c.text + ' ' + nx.text, n: c.n };
    else merged.push(c);
  }
  return merged;
})();

// batas adegan (12 adegan + penutup)
export const SCENE_T = [0, T(2), T(5), T(7), T(8), T(10), T(11), T(13), T(14), T(16), T(17), T(18), CLOSE];

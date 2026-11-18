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

// subtitle per frasa: kata-kata tiap klausa dikelompokkan <= 36 karakter, waktu dari waktu kata
export type Cue = { a: number; b: number; text: string };
export const CUES: Cue[] = (() => {
  const out: Cue[] = [];
  for (const s of SYNC_SEGS) {
    s.clauses.forEach((_, k) => {
      const ws = WORDS.filter((w) => w.n === s.n && w.k === k);
      const nChunks = Math.max(1, Math.ceil(ws.map((w) => w.text).join(' ').length / 36));
      const total = ws.reduce((x, w) => x + w.text.length + 1, 0);
      const chunks: typeof ws[] = [];
      let cur: typeof ws = [];
      let acc = 0;
      for (const w of ws) {
        cur.push(w);
        acc += w.text.length + 1;
        if (chunks.length < nChunks - 1 && acc >= (total / nChunks) * (chunks.length + 1) - 3 && cur.length) { chunks.push(cur); cur = []; }
      }
      if (cur.length) chunks.push(cur);
      chunks.forEach((c, i) => {
        const nxt = chunks[i + 1];
        out.push({ a: c[0].a, b: nxt ? nxt[0].a : c[c.length - 1].b, text: c.map((w) => w.text).join(' ') });
      });
    });
  }
  return out;
})();

// batas adegan (12 adegan + penutup)
export const SCENE_T = [0, T(2), T(5), T(7), T(8), T(10), T(11), T(13), T(14), T(16), T(17), T(18), CLOSE];

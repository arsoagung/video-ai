// Episode S2E5: "Makan sepiring dengan ODHIV, tertular nggak ya?"
// Timing disinkronkan per kalimat/klausa dari mp3 (scripts/retime.mjs) + jeda kontekstual (holds.json). Teks = narasi_final persis.
import { SYNC_SEGS as RAW, SYNC_DUR } from './sync';
import { toSegs, makeCues } from '../shared/cues';
export type { Seg, Cue } from '../shared/cues';

// Koreksi klausa kalimat 4 dan 8 (hasil cek jeda nyata mp3: daftar cairan bergeser satu item di retime)
const fixClauses = (n: number, cl: [string, number, number][]) => cl.map(([text, a, b]) => ({ text, a, b, anchored: true }));
export const SYNC_SEGS = RAW.map((s) =>
  s.n === 4
    ? { ...s, clauses: fixClauses(4, [['HIV hanya menular lewat lima cairan:', 6.61, 9.32], ['darah,', 9.78, 10.38], ['air mani,', 10.58, 11.31], ['cairan vagina,', 11.49, 12.46], ['cairan dubur,', 12.68, 13.7], ['dan ASI.', 13.74, 14.54]]) }
    : s.n === 8
      ? { ...s, clauses: fixClauses(8, [['Keringat,', 31.91, 32.38], ['air mata,', 32.67, 33.35], ['dan urine pun bukan.', 33.4, 34.48]]) }
      : s,
);

export const EP_DUR = SYNC_DUR; // suara + jeda + ekor diam 8 dtk
export const SEGS = toSegs(SYNC_SEGS);
export const CUES = makeCues(SYNC_SEGS);
export const CLOSE = SEGS[SEGS.length - 1].b + 0.9; // penutup tampil SETELAH narasi dan animasi selesai

// awal kalimat ke-n (1-based)
export const T = (n: number) => SEGS[n - 1].a;
// akhir ucapan kalimat ke-n
export const TE = (n: number) => SEGS[n - 1].b;
// awal klausa ke-k (0-based) dari kalimat ke-n
export const CL = (n: number, k: number) => SYNC_SEGS[n - 1].clauses[k].a;
// batas adegan (12 adegan; adegan 2 = kalimat 2-3, adegan 10 = kalimat 11-12, adegan 12 = kalimat 14-15) + penutup
export const SCENE_T = [0, T(2), T(4), T(5), T(6), T(7), T(8), T(9), T(10), T(11), T(13), T(14), CLOSE];

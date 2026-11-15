// Episode S1E4: "Bagaimana HIV memperbanyak diri?"
// Timing disinkronkan per kalimat/klausa dari mp3 (scripts/retime.mjs) + jeda kontekstual (holds.json). Teks = narasi persis.
import { SYNC_SEGS, SYNC_DUR } from './sync';
import { toSegs, makeCues } from '../shared/cues';
export type { Seg, Cue } from '../shared/cues';

export const EP_DUR = SYNC_DUR; // suara + jeda + ekor diam 6 dtk
export const SEGS = toSegs(SYNC_SEGS);
export const CUES = makeCues(SYNC_SEGS);
// Penutup dimulai di kalimat 23 ("HIV memang licik dan cepat berubah."), pasangan dua kalimat penutup, sama seperti versi awal.
export const CLOSE = SEGS[22].a;

export const T = (n: number) => SEGS[n - 1].a;
export const CL = (n: number, k: number) => SYNC_SEGS[n - 1].clauses[k].a;

// Animasi adegan ditulis dalam waktu mp3 asli (detik). WARP memetakan waktu VIDEO -> waktu mp3 asli:
// di dalam kalimat laju 1:1, di dalam jeda hasil aksi ditahan sampai kalimat berikutnya.
const KN: [number, number][] = [];
for (const s of SYNC_SEGS) KN.push([s.a, s.sa], [s.b, s.sb]);
export const WARP = (t: number): number => {
  if (t <= KN[0][0]) return KN[0][1];
  for (let i = 0; i < KN.length - 1; i++) {
    const [v0, o0] = KN[i];
    const [v1, o1] = KN[i + 1];
    if (t < v1) return v1 === v0 ? o1 : o0 + ((t - v0) / (v1 - v0)) * (o1 - o0);
  }
  return KN[KN.length - 1][1] + (t - KN[KN.length - 1][0]);
};

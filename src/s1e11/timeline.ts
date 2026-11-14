// Episode S1E11: "Kapan waktu terbaik untuk tes HIV?"
// Timing disinkronkan per kalimat/klausa dari mp3 (scripts/retime.mjs) + jeda kontekstual (holds.json). Teks = narasi_final persis.
import { SYNC_SEGS, SYNC_DUR } from './sync';
import { toSegs, makeCues } from '../shared/cues';
export type { Seg, Cue } from '../shared/cues';

export const EP_DUR = SYNC_DUR; // suara + jeda + ekor diam 6 dtk
export const SEGS = toSegs(SYNC_SEGS);
export const CUES = makeCues(SYNC_SEGS);
export const CLOSE = SEGS[SEGS.length - 1].a; // kalimat terakhir: tampil logo + referensi + Dukung dan follow kami

// awal kalimat ke-n (1-based)
export const T = (n: number) => SEGS[n - 1].a;
// awal klausa ke-k (0-based) dari kalimat ke-n
export const CL = (n: number, k: number) => SYNC_SEGS[n - 1].clauses[k].a;
// batas adegan (12 adegan + penutup)
export const SCENE_T = [0, T(2), T(5), T(7), T(8), T(10), T(11), T(13), T(14), T(16), T(17), T(18), CLOSE];

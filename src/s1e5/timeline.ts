// Episode S1E5: "Kenapa ARV harus diminum rutin?"
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
// batas adegan (6 adegan + penutup)
export const SCENE_T = [0, T(3), T(5), T(8), T(11), T(13), CLOSE];

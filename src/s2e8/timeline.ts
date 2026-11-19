// Episode S2E8: "Kenapa HIV belum bisa benar-benar disembuhkan?"
// Timing disinkronkan per kalimat/klausa dari mp3 (scripts/retime.mjs) + jeda kontekstual (holds.json). Teks = narasi_final persis.
import { SYNC_SEGS, SYNC_DUR } from './sync';
import { toSegs, makeCues } from '../shared/cues';
export type { Seg, Cue } from '../shared/cues';

export { SYNC_SEGS };
export const EP_DUR = SYNC_DUR; // suara + jeda + ekor diam 8 dtk
export const SEGS = toSegs(SYNC_SEGS);
export const CUES = makeCues(SYNC_SEGS);
export const CLOSE = SEGS[SEGS.length - 1].b + 0.9; // penutup tampil SETELAH narasi dan animasi selesai

export const T = (n: number) => SEGS[n - 1].a;
export const TE = (n: number) => SEGS[n - 1].b;
export const CL = (n: number, k: number) => SYNC_SEGS[n - 1].clauses[k].a;
// batas adegan (13 adegan) + penutup
export const SCENE_T = [0, T(3), T(4), T(5), T(6), T(7), T(8), T(9), T(10), T(11), CL(11, 1), T(12), T(13), CLOSE];

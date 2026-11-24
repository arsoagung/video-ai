// S2E1 versi alternatif (karakter modular). Suara dan sinkron SAMA dengan src/s2e1 (sync.ts dipakai bersama).
import { SYNC_SEGS, SYNC_DUR } from '../s2e1/sync';
import { toSegs, makeCues } from '../shared/cues';
export type { Seg, Cue } from '../shared/cues';

export const EP_DUR = SYNC_DUR;
export const SEGS = toSegs(SYNC_SEGS);
export const CUES = makeCues(SYNC_SEGS);
export const CLOSE = SEGS[SEGS.length - 1].b + 0.9;
export const T = (n: number) => SEGS[n - 1].a;
export const CL = (n: number, k: number) => SYNC_SEGS[n - 1].clauses[k].a;
// 11 adegan: 1 konsultasi, 2 hasil, 3 pikiran penuh, 4+5 jarak & kehilangan penerimaan (satu gerak kamera), 6 bukan akhir, 7 ARV, 8 viral load, 9 tidak menular, 10 hidup normal, 11 pengobatan bukan menghakimi, 12 lawan virus
export const SCENE_T = [0, CL(2, 1), T(3), T(5), T(8), T(9), T(10), CL(11, 1), T(12), T(13), T(14), CLOSE];

// Episode S1E3: "Bagaimana ARV menghentikan replikasi HIV?"
// Waktu disinkronkan lewat scripts/retime.mjs (analyze -> holds.json -> build): suara disusun ulang per kalimat
// dengan jeda sesuai cerita (src/s1e3/holds.json), waktu VIDEO ada di sync.ts (otomatis, jangan diedit tangan).
// Kalimat 8: klausa dikoreksi manual di segments.json ke 5 jeda nyata (Nah, | TLD...obat: | tenofovir, | lamivudin, | dan dolutegravir.).
import { SYNC_SEGS, SYNC_DUR } from './sync';
import { toSegs, makeCues } from '../shared/cues';

export const SEGS = toSegs(SYNC_SEGS);
export const CUES = makeCues(SYNC_SEGS);
export const EP_DUR = SYNC_DUR;
export const T = (n: number) => SEGS[n - 1].a; // awal kalimat ke-n
export const E = (n: number) => SEGS[n - 1].b; // akhir ucapan kalimat ke-n
export const CLOSE = SEGS[SEGS.length - 1].a; // kalimat penutup terakhir: logo + referensi + Dukung dan follow kami

// 13 adegan, tiap adegan menempel ke kalimat narasi; adegan 12 (minum obat teratur) masuk di jeda sebelum kalimat penutup
export const SCENE_T = [T(1), T(2), T(4), T(5), T(6), T(7), T(8), T(9), T(10), T(11), T(12), T(13), E(14) + 0.2, CLOSE];

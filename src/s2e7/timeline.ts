// Episode S2E7: "Nyamuk gigit ODHIV, lalu gigit kamu. Bisa ketularan?"
// Timing disinkronkan per kalimat/klausa dari mp3 (scripts/retime.mjs) + jeda kontekstual (holds.json). Teks = narasi_final persis.
import { SYNC_SEGS as RAW, SYNC_DUR } from './sync';
import { toSegs, makeCues } from '../shared/cues';
export type { Seg, Cue } from '../shared/cues';

// Koreksi klausa kalimat 7 (retime menghasilkan klausa 'Ketiga,' terbalik; dicek dengan jeda nyata mp3: jeda hanya setelah 'Ketiga,' dan sebelum 'bukan langsung')
export const SYNC_SEGS = RAW.map((s) =>
  s.n === 7
    ? {
        ...s,
        clauses: [
          { text: 'Ketiga,', a: 20.44, b: 20.98, anchored: true },
          { text: 'setelah makan, serangga biasanya istirahat dulu untuk mencerna,', a: 21.25, b: 25.01, anchored: true },
          { text: 'bukan langsung menggigit orang lain.', a: 25.33, b: 27.07, anchored: true },
        ],
      }
    : s,
);

export const EP_DUR = SYNC_DUR; // suara + jeda + ekor diam 8 dtk
export const SEGS = toSegs(SYNC_SEGS);
export const CUES = makeCues(SYNC_SEGS);
export const CLOSE = SEGS[SEGS.length - 1].b + 0.9; // penutup tampil SETELAH narasi dan animasi selesai

export const T = (n: number) => SEGS[n - 1].a;
export const TE = (n: number) => SEGS[n - 1].b;
export const CL = (n: number, k: number) => SYNC_SEGS[n - 1].clauses[k].a;
// batas adegan (12 adegan) + penutup
export const SCENE_T = [0, T(2), T(4), T(6), T(7), T(8), T(9), T(10), T(11), T(12), T(13), T(14), CLOSE];

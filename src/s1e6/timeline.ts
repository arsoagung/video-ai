// Episode S1E6: "Apa itu viral load? Bagaimana diukurnya?"
// Timing disinkronkan per kalimat/klausa dari mp3 (scripts/retime.mjs) + jeda kontekstual (holds.json). Teks = narasi persis.
import { SYNC_SEGS, SYNC_DUR } from './sync';
import { toSegs, makeCues } from '../shared/cues';
export type { Seg, Cue } from '../shared/cues';

export const EP_DUR = SYNC_DUR; // suara + jeda + ekor diam 6 dtk
export const SEGS = toSegs(SYNC_SEGS);
// Angka yang diucapkan dengan huruf tampil sebagai angka di subtitle (suara tetap membaca huruf)
const DISPLAY_MAP: [string, string][] = [
  ['seribu sembilan ratus sembilan puluh enam', '1996'],
  ['seratus delapan puluh', '180'],
];
const NB = ' ';
const protect = (s: string) => DISPLAY_MAP.reduce((o, [k]) => o.split(k).join(k.split(' ').join(NB)), s);
const display = (s: string) => DISPLAY_MAP.reduce((o, [k, v]) => o.split(k.split(' ').join(NB)).join(v), s);
export const CUES = makeCues(
  SYNC_SEGS.map((s) => ({ ...s, text: protect(s.text), clauses: s.clauses.map((c) => ({ ...c, text: protect(c.text) })) })),
).map((c) => ({ ...c, text: display(c.text) }));
export const CLOSE = SEGS[SEGS.length - 1].b + 0.5; // penutup (logo, referensi, medsos) tampil setelah dubbing selesai

export const T = (n: number) => SEGS[n - 1].a;

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

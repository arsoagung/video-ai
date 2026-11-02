import {
  Item, Stroke, Text, INK, RED, ORANGE, BLUE, TEAL, GRAY,
} from './Board';
import {
  toPath, circleSub, ellipseSub, lineSub, waveSub, arrowSubs, crossSubs, checkSub,
  virusSubs, helixSubs, capsule, Sub,
} from './geom';

// Semua waktu dalam detik, selaras dengan segmen audio (lihat SEGS di captions.ts)
const S = (d: Sub[], color: string, w: number, t0: number, dur: number, extra: Partial<Stroke> = {}): Stroke => ({
  k: 's', d: toPath(d), color, w, t0, dur, ...extra,
});
const T = (text: string, x: number, y: number, size: number, color: string, t0: number, dur: number, erase?: number, weight = 800): Text => ({
  k: 't', text, x, y, size, color, weight, t0, dur, erase,
});

const virus = (cx: number, cy: number, r: number, color: string, t0: number, dur: number, erase?: number): Item[] => {
  const v = virusSubs(cx, cy, r);
  return [
    S(v.body, color, 7, t0, dur * 0.55, { fill: { color, op: 0.14 }, erase }),
    S(v.spikes, color, 6, t0 + dur * 0.5, dur * 0.5, { erase }),
  ];
};

const capsuleItems = (cx: number, cy: number, len: number, w: number, deg: number, t0: number, dur: number, erase?: number): Item[] => {
  const c = capsule(cx, cy, len, w, deg);
  return [
    S(c.outline, TEAL, 8, t0, dur, { fill: { d: c.leftFill, color: TEAL, op: 0.9 }, erase }),
    S(c.divider, TEAL, 7, t0 + dur * 0.8, dur * 0.2, { erase }),
  ];
};

const X = (cx: number, cy: number, s: number, t0: number, erase?: number): Item =>
  S(crossSubs(cx, cy, s), RED, 16, t0, 0.5, { erase });

const CELL = { cx: 540, cy: 800, rx: 370, ry: 465 };
const NUC = { cx: 540, cy: 1010, r: 140 };

export const ITEMS: Item[] = [
  // ---------- A: hook (0 – 4.1) ----------
  ...virus(540, 480, 115, RED, 0.2, 1.5, 4.4),
  T('HIV', 540, 720, 92, RED, 1.7, 0.6, 4.4),
  ...capsuleItems(540, 980, 330, 150, -25, 2.1, 1.4, 4.4),
  T('ARV', 540, 1195, 92, TEAL, 3.4, 0.6, 4.4),

  // ---------- B: sel CD4 (4.59 – 7.6) ----------
  S([ellipseSub(CELL.cx, CELL.cy, CELL.rx, CELL.ry, 1)], BLUE, 8, 4.7, 1.5, { fill: { color: '#D9E8F8', op: 0.55 }, erase: 29.7 }),
  T('Sel CD4', 540, 300, 70, BLUE, 6.0, 0.8, 29.7),
  S([circleSub(NUC.cx, NUC.cy, NUC.r, 2)], BLUE, 7, 6.3, 0.9, { fill: { color: '#BCD5F1', op: 0.7 }, erase: 29.7 }),
  S(arrowSubs(110, 360, 450, 520, 30, 14), RED, 8, 6.5, 0.6, { erase: 8.2 }),
  ...virus(540, 580, 46, RED, 6.9, 0.8, 8.2),

  // ---------- C: transkripsi balik (8.03 – 16.1) ----------
  T('RNA virus', 540, 440, 44, RED, 9.4, 0.6, 16.9),
  S([waveSub(390, 690, 490, 16, 3.5)], RED, 8, 8.4, 1.0, { erase: 16.9 }),
  S(arrowSubs(540, 515, 540, 565, 22, 0), INK, 6, 10.0, 0.4, { erase: 16.9 }),
  S([ellipseSub(540, 615, 225, 60, 3)], TEAL, 7, 10.3, 0.8, { fill: { color: TEAL, op: 0.22 }, erase: 16.9 }),
  T('reverse transcriptase', 540, 628, 34, TEAL, 11.0, 1.0, 16.9),
  S(arrowSubs(540, 670, 540, 720, 22, 0), INK, 6, 12.0, 0.4, { erase: 16.9 }),
  S(helixSubs(400, 680, 790, 30, 2), ORANGE, 7, 12.5, 2.6, { erase: 19.4 }),
  T('DNA virus', 540, 858, 44, ORANGE, 15.0, 0.7, 19.4),

  // ---------- D: integrasi (16.48 – 21.46) ----------
  S([waveSub(430, 650, NUC.cy + 12, 18, 2.5)], BLUE, 8, 17.0, 0.9, { erase: 29.7 }),
  T('DNA sel', 540, 1075, 32, BLUE, 17.9, 0.5, 29.7),
  S(arrowSubs(540, 880, 540, 950, 24, 0), ORANGE, 8, 17.4, 0.5, { erase: 20.9 }),
  S([waveSub(500, 580, NUC.cy - 18, 16, 1.25, 0.3)], ORANGE, 11, 18.6, 0.7, { erase: 29.7 }),
  T('integrase', 540, 1210, 46, TEAL, 19.5, 0.8, 29.7),

  // ---------- E: produksi virus baru (21.81 – 29.5) ----------
  S(arrowSubs(540, 885, 540, 850, 22, 0), RED, 8, 22.2, 0.5, { erase: 29.7 }),
  S([waveSub(330, 440, 770, 12, 2.5)], RED, 7, 22.8, 0.7, { erase: 29.7 }),
  S([waveSub(640, 750, 770, 12, 2.5, 1)], RED, 7, 23.2, 0.7, { erase: 29.7 }),
  S([circleSub(400, 670, 16), circleSub(480, 730, 16), circleSub(600, 720, 16), circleSub(680, 670, 16)], INK, 6, 23.8, 1.2, { erase: 29.7 }),
  T('RNA + protein baru', 540, 830, 40, INK, 24.4, 1.0, 29.7, 600),
  ...virus(540, 480, 56, RED, 26.0, 1.8, 29.7),
  T('virus baru', 540, 625, 46, RED, 27.7, 0.8, 29.7),

  // ---------- F: ARV (29.94 – 33) ----------
  ...capsuleItems(540, 760, 460, 210, -18, 30.2, 1.6, 33.2),
  T('ARV memotong siklus ini', 540, 1080, 56, TEAL, 31.6, 1.2, 33.2),

  // ---------- G+H: NRTI/NNRTI (33.34 – 41.08) ----------
  T('NRTI & NNRTI', 540, 380, 84, TEAL, 33.4, 1.0, 41.3),
  S([waveSub(340, 740, 540, 20, 4)], RED, 9, 34.4, 0.8, { erase: 41.3 }),
  T('RNA', 250, 555, 40, RED, 34.6, 0.4, 41.3),
  S(arrowSubs(540, 580, 540, 640, 24, 0), INK, 7, 35.1, 0.4, { erase: 41.3 }),
  S([ellipseSub(540, 700, 250, 62, 3)], TEAL, 8, 35.4, 0.7, { fill: { color: TEAL, op: 0.22 }, erase: 41.3 }),
  X(540, 700, 80, 36.9, 41.3),
  T('reverse transcriptase', 540, 818, 40, TEAL, 36.0, 0.8, 41.3),
  S(arrowSubs(540, 850, 540, 910, 24, 0), GRAY, 7, 37.9, 0.4, { erase: 41.3 }),
  S([waveSub(340, 740, 1000, 34, 3)], GRAY, 8, 38.5, 0.9, { dashed: true, erase: 41.3 }),
  T('DNA tidak terbentuk', 540, 1120, 58, RED, 39.2, 1.2, 41.3),

  // ---------- I: integrase inhibitor (41.43 – 48.25) ----------
  T('Integrase inhibitor', 540, 360, 76, TEAL, 41.6, 1.2, 48.8),
  S([circleSub(660, 780, 190, 2)], BLUE, 8, 42.4, 1.0, { fill: { color: '#BCD5F1', op: 0.7 }, erase: 48.8 }),
  S([waveSub(560, 760, 780, 18, 2.2)], BLUE, 8, 43.3, 0.7, { erase: 48.8 }),
  S([waveSub(150, 270, 780, 16, 1.5, 0.3)], ORANGE, 11, 43.9, 0.7, { erase: 48.8 }),
  S(arrowSubs(300, 780, 440, 780, 26, 0), ORANGE, 8, 44.5, 0.5, { erase: 48.8 }),
  X(470, 780, 60, 45.2, 48.8),
  T('DNA virus tidak bisa menyisip', 540, 1090, 46, RED, 46.0, 1.8, 48.8),

  // ---------- J: protease inhibitor (48.62 – 56.35) ----------
  T('Protease inhibitor', 540, 360, 76, TEAL, 48.8, 1.2, 56.9),
  S(virusSubs(540, 740, 140).body, GRAY, 8, 49.8, 1.0, { fill: { color: GRAY, op: 0.18 }, erase: 56.9 }),
  S(virusSubs(540, 740, 140).spikes, GRAY, 6, 50.6, 0.8, { erase: 56.9, dashed: true }),
  S([waveSub(430, 650, 700, 10, 3), waveSub(430, 650, 745, 10, 3, 1), waveSub(430, 650, 790, 10, 3, 2)], GRAY, 6, 51.2, 1.0, { erase: 56.9 }),
  T('protease', 540, 990, 44, TEAL, 52.2, 0.6, 56.9),
  X(540, 740, 60, 52.8, 56.9),
  T('belum matang, tidak infeksius', 540, 1130, 46, RED, 53.6, 1.8, 56.9),

  // ---------- K: kombinasi (56.71 – 61.8) ----------
  S([circleSub(210, 650, 120, 1)], TEAL, 8, 56.9, 0.7, { fill: { color: TEAL, op: 0.2 }, erase: 62.4 }),
  S([circleSub(540, 650, 120, 2)], TEAL, 8, 57.6, 0.7, { fill: { color: TEAL, op: 0.2 }, erase: 62.4 }),
  S([circleSub(870, 650, 120, 3)], TEAL, 8, 58.3, 0.7, { fill: { color: TEAL, op: 0.2 }, erase: 62.4 }),
  T('RT', 210, 686, 80, TEAL, 57.0, 0.5, 62.4),
  T('INT', 540, 686, 80, TEAL, 57.7, 0.5, 62.4),
  T('PR', 870, 686, 80, TEAL, 58.4, 0.5, 62.4),
  T('+', 375, 676, 80, INK, 58.0, 0.3, 62.4),
  T('+', 705, 676, 80, INK, 58.7, 0.3, 62.4),
  S(arrowSubs(540, 800, 540, 900, 30, 0), INK, 8, 59.2, 0.5, { erase: 62.4 }),
  ...capsuleItems(540, 1030, 380, 160, -12, 59.7, 1.2, 62.4),
  T('kombinasi', 540, 1215, 60, TEAL, 60.9, 0.7, 62.4),

  // ---------- L: viral load turun (62.16 – 68.7) ----------
  T('jumlah HIV di darah', 540, 330, 54, INK, 62.4, 1.0, 69.3),
  S([lineSub(150, 1130, 150, 440), lineSub(150, 1130, 960, 1130)], INK, 6, 62.6, 0.8, { erase: 69.3 }),
  S([lineSub(150, 1050, 960, 1050)], GRAY, 5, 63.5, 0.4, { dashed: true, erase: 69.3 }),
  T('tidak terdeteksi', 740, 1020, 44, GRAY, 63.9, 0.7, 69.3, 600),
  (() => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 60; i++) {
      const t = i / 60;
      pts.push([180 + t * 760, 480 + (1 - Math.exp(-4.2 * t)) * 640]);
    }
    return S([pts], RED, 10, 64.4, 3.6, { erase: 69.3 });
  })(),

  // ---------- M: belum hilang (69.1 – 71.5) ----------
  S([ellipseSub(540, 780, 270, 320, 2)], BLUE, 8, 69.4, 0.9, { fill: { color: '#D9E8F8', op: 0.55 }, erase: 74.9 }),
  S([circleSub(380, 660, 20), circleSub(710, 640, 20), circleSub(700, 940, 20), circleSub(390, 930, 20)], RED, 9, 70.0, 0.9, { fill: { color: RED, op: 0.55 }, erase: 74.9 }),
  T('masih ada', 540, 420, 56, RED, 70.1, 0.8, 74.9),

  // ---------- N: replikasi ditekan (71.86 – 74.2) ----------
  T('replikasi ditekan', 540, 1170, 60, TEAL, 72.3, 1.0, 74.9),
  S([circleSub(540, 780, 150, 1)], TEAL, 10, 71.9, 0.7, { fill: { color: '#F8F5EE', op: 1 }, erase: 74.9 }),
  S([lineSub(500, 725, 500, 835), lineSub(580, 725, 580, 835)], TEAL, 22, 72.5, 0.6, { erase: 74.9 }),

  // ---------- O: penutup (74.7 – 80) ----------
  ...capsuleItems(540, 640, 460, 200, -15, 75.0, 1.4),
  S([checkSub(540, 900, 70)], TEAL, 18, 76.5, 0.7),
  T('Minum ARV teratur', 540, 1140, 82, TEAL, 76.9, 1.2),
];
